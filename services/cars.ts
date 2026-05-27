import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Car, CarStatus } from '@/types';

function tsMillis(v: unknown): number {
  if (!v) return 0;
  if (typeof v === 'object' && 'toDate' in (v as object))
    return (v as { toDate(): Date }).toDate().getTime();
  if (v instanceof Date) return v.getTime();
  return 0;
}

// Statuses that mean the car is physically present at the hub
export const HUB_STATUSES: string[] = [
  'at_hub',
  'ready_for_rental',
  'pending_inspection',
  'returned',
  'maintenance',
  'available',       // legacy Flutter status
  'delivered_to_hub',
];

export function isCarAtHub(status: string): boolean {
  return HUB_STATUSES.includes(status);
}

// Fetch all cars then filter/sort client-side to avoid composite Firestore index requirements
export async function getCars(status?: CarStatus | string): Promise<Car[]> {
  const snap = await getDocs(collection(db, 'cars'));
  let cars = snap.docs.map(d => ({ carId: d.id, ...d.data() } as Car));
  if (status) cars = cars.filter(c => c.status === status);
  cars.sort((a, b) => {
    const at = tsMillis(a.updatedAt) || tsMillis(a.createdAt);
    const bt = tsMillis(b.updatedAt) || tsMillis(b.createdAt);
    return bt - at;
  });
  return cars;
}

export async function getCar(carId: string): Promise<Car | null> {
  const snap = await getDoc(doc(db, 'cars', carId));
  if (!snap.exists()) return null;
  return { carId: snap.id, ...snap.data() } as Car;
}

export async function updateCarStatus(
  carId: string,
  status: CarStatus,
  employeeId?: string
): Promise<void> {
  const update: Record<string, unknown> = { status, updatedAt: serverTimestamp() };
  if ((status === 'at_hub' || status === 'ready_for_rental') && employeeId) {
    update.isVerifiedAtHub = true;
    update.verifiedByEmployeeId = employeeId;
    update.verifiedAt = serverTimestamp();
  }
  await updateDoc(doc(db, 'cars', carId), update);
}

export async function getCarCountByStatus(): Promise<Record<string, number>> {
  const snap = await getDocs(collection(db, 'cars'));
  const counts: Record<string, number> = {};
  snap.docs.forEach(d => {
    const s = d.data().status as string;
    counts[s] = (counts[s] ?? 0) + 1;
  });
  return counts;
}

export async function getHubInventory(): Promise<Car[]> {
  const snap = await getDocs(collection(db, 'cars'));
  const cars = snap.docs
    .map(d => ({ carId: d.id, ...d.data() } as Car))
    .filter(c => isCarAtHub(c.status));
  cars.sort((a, b) => {
    const at = tsMillis(a.updatedAt) || tsMillis(a.createdAt);
    const bt = tsMillis(b.updatedAt) || tsMillis(b.createdAt);
    return bt - at;
  });
  return cars;
}

// ── Delivery verification workflow ────────────────────────────────────────────

/** Cars where the owner has tapped "Delivered" but an employee hasn't yet verified. */
export async function getPendingDeliveries(): Promise<Car[]> {
  const snap = await getDocs(collection(db, 'cars'));
  const cars = snap.docs
    .map(d => ({ carId: d.id, ...d.data() } as Car))
    .filter(c => {
      const s = c.status || (c as unknown as Record<string, string>).hubStatus;
      return s === 'awaiting_employee_verification';
    });
  // Sort oldest first so employees handle them in order
  cars.sort((a, b) => {
    const at = tsMillis(a.deliveryRequestedAt) || tsMillis(a.updatedAt) || tsMillis(a.createdAt);
    const bt = tsMillis(b.deliveryRequestedAt) || tsMillis(b.updatedAt) || tsMillis(b.createdAt);
    return at - bt;
  });
  return cars;
}

/** Employee approves the delivery — car moves to at_hub and is marked verified. */
export async function approveDelivery(
  carId: string,
  employeeId: string,
): Promise<void> {
  await updateDoc(doc(db, 'cars', carId), {
    status: 'at_hub',
    hubStatus: 'at_hub',
    isVerifiedAtHub: true,
    verifiedByEmployeeId: employeeId,
    verifiedAt: serverTimestamp(),
    rejectionReason: null,
    updatedAt: serverTimestamp(),
  });
}

/** Employee rejects the delivery — owner sees rejection reason and can resubmit. */
export async function rejectDelivery(
  carId: string,
  employeeId: string,
  reason: string,
): Promise<void> {
  await updateDoc(doc(db, 'cars', carId), {
    status: 'delivery_rejected',
    hubStatus: 'delivery_rejected',
    isVerifiedAtHub: false,
    available: false,
    rejectionReason: reason,
    verifiedByEmployeeId: employeeId,
    updatedAt: serverTimestamp(),
  });
}

export async function getRecentCars(n = 10): Promise<Car[]> {
  const snap = await getDocs(collection(db, 'cars'));
  const cars = snap.docs.map(d => ({ carId: d.id, ...d.data() } as Car));
  cars.sort((a, b) => {
    const at = tsMillis(a.createdAt) || tsMillis(a.updatedAt);
    const bt = tsMillis(b.createdAt) || tsMillis(b.updatedAt);
    return bt - at;
  });
  return cars.slice(0, n);
}
