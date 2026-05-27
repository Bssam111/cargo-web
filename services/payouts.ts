import {
  collection,
  doc,
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Payout, PayoutStatus, Transaction, Wallet } from '@/types';
import { safeNumber } from '@/lib/utils';

function tsMillis(v: unknown): number {
  if (!v) return 0;
  if (typeof v === 'object' && 'toDate' in (v as object))
    return (v as { toDate(): Date }).toDate().getTime();
  if (v instanceof Date) return v.getTime();
  return 0;
}

export async function getPayouts(status?: PayoutStatus): Promise<Payout[]> {
  const snap = await getDocs(collection(db, 'payouts'));
  let payouts = snap.docs.map(d => ({ payoutId: d.id, ...d.data() } as Payout));
  if (status) payouts = payouts.filter(p => p.status === status);
  payouts.sort((a, b) => tsMillis(b.requestedAt) - tsMillis(a.requestedAt));
  return payouts;
}

export async function updatePayoutStatus(
  payoutId: string,
  status: PayoutStatus,
  adminId: string,
  notes?: string
): Promise<void> {
  await updateDoc(doc(db, 'payouts', payoutId), {
    status,
    processedBy: adminId,
    processedAt: serverTimestamp(),
    notes: notes ?? '',
  });
}

export async function getTransactions(): Promise<Transaction[]> {
  const snap = await getDocs(collection(db, 'transactions'));
  const txns = snap.docs.map(d => ({ transactionId: d.id, ...d.data() } as Transaction));
  txns.sort((a, b) => tsMillis(b.createdAt) - tsMillis(a.createdAt));
  return txns;
}

export async function getOwnerWallet(ownerId: string): Promise<Wallet | null> {
  const snap = await getDoc(doc(db, 'wallets', ownerId));
  if (!snap.exists()) return null;
  return { ownerId: snap.id, ...snap.data() } as Wallet;
}

export async function getPlatformRevenue(): Promise<{
  total: number;
  thisMonth: number;
  lastMonth: number;
}> {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  let total = 0;
  let thisMonth = 0;
  let lastMonth = 0;

  // Try platform_fee transactions first
  const txSnap = await getDocs(
    query(collection(db, 'transactions'), where('type', '==', 'platform_fee'))
  );

  txSnap.docs.forEach(d => {
    const data = d.data();
    const amount = safeNumber(data.amount);
    total += amount;
    const createdAt = tsMillis(data.createdAt);
    const date = createdAt ? new Date(createdAt) : new Date(0);
    if (date >= thisMonthStart) thisMonth += amount;
    else if (date >= lastMonthStart) lastMonth += amount;
  });

  // If no transaction records yet, calculate from completed bookings
  if (total === 0) {
    const bookingsSnap = await getDocs(
      query(collection(db, 'bookings'), where('status', '==', 'completed'))
    );
    bookingsSnap.docs.forEach(d => {
      const data = d.data();
      const bookingTotal = safeNumber(
        data.totalAmount ?? data.totalPrice ?? data.amount
      );
      const fee =
        data.platformFee !== undefined
          ? safeNumber(data.platformFee)
          : Math.round(bookingTotal * 0.1);
      total += fee;
      const dateMs = tsMillis(data.createdAt) || tsMillis(data.updatedAt);
      const date = dateMs ? new Date(dateMs) : new Date(0);
      if (date >= thisMonthStart) thisMonth += fee;
      else if (date >= lastMonthStart) lastMonth += fee;
    });
  }

  return { total, thisMonth, lastMonth };
}
