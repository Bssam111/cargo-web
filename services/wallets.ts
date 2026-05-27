import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { safeNumber } from '@/lib/utils';

/**
 * Credit an owner's earnings after a trip completes.
 * - Creates or increments the owner's wallet document.
 * - Creates a transaction record for audit / analytics.
 */
export async function creditOwnerEarning(
  ownerId: string,
  bookingId: string,
  ownerEarning: number,
): Promise<void> {
  if (!ownerId || ownerEarning <= 0) return;

  // Write transaction record
  const txRef = doc(collection(db, 'transactions'));
  await setDoc(txRef, {
    transactionId: txRef.id,
    type: 'booking_earning',
    amount: ownerEarning,
    ownerId,
    bookingId,
    description: `Earning from booking ${bookingId.slice(0, 8)}`,
    status: 'completed',
    createdAt: serverTimestamp(),
  });

  // Upsert owner wallet
  const walletRef = doc(db, 'wallets', ownerId);
  const walletSnap = await getDoc(walletRef);

  if (walletSnap.exists()) {
    await updateDoc(walletRef, {
      balance: increment(ownerEarning),
      totalEarned: increment(ownerEarning),
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(walletRef, {
      ownerId,
      balance: ownerEarning,
      pendingBalance: 0,
      totalEarned: ownerEarning,
      updatedAt: serverTimestamp(),
    });
  }
}

/**
 * Deduct from owner wallet when a payout is processed.
 */
export async function debitOwnerPayout(
  ownerId: string,
  payoutId: string,
  amount: number,
): Promise<void> {
  if (!ownerId || amount <= 0) return;

  const walletRef = doc(db, 'wallets', ownerId);
  await updateDoc(walletRef, {
    balance: increment(-amount),
    updatedAt: serverTimestamp(),
  });

  const txRef = doc(collection(db, 'transactions'));
  await setDoc(txRef, {
    transactionId: txRef.id,
    type: 'withdrawal',
    amount,
    ownerId,
    payoutId,
    description: `Payout ${payoutId.slice(0, 8)}`,
    status: 'completed',
    createdAt: serverTimestamp(),
  });
}

export async function getOwnerWallet(
  ownerId: string,
): Promise<{ balance: number; totalEarned: number; pendingBalance: number } | null> {
  const snap = await getDoc(doc(db, 'wallets', ownerId));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    balance: safeNumber(d.balance),
    totalEarned: safeNumber(d.totalEarned),
    pendingBalance: safeNumber(d.pendingBalance),
  };
}
