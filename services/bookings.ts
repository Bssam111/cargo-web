import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Booking, BookingStatus } from '@/types';
import { safeNumber, normalizeFirestoreDate, isSameLocalDay } from '@/lib/utils';
import { creditOwnerEarning } from './wallets';

function tsMillis(v: unknown): number {
  if (!v) return 0;
  if (typeof v === 'object' && 'toDate' in (v as object))
    return (v as { toDate(): Date }).toDate().getTime();
  if (v instanceof Date) return v.getTime();
  return 0;
}

// Map a raw Firestore document to a Booking, normalizing Flutter field name differences
function mapBookingDoc(id: string, data: Record<string, unknown>): Booking {
  const totalAmount = safeNumber(
    data.totalAmount ?? data.totalPrice ?? data.amount ?? data.price
  );
  const platformFee =
    data.platformFee !== undefined
      ? safeNumber(data.platformFee)
      : safeNumber(data.commission ?? data.serviceFee ?? Math.round(totalAmount * 0.1));
  const ownerEarning =
    data.ownerEarning !== undefined
      ? safeNumber(data.ownerEarning)
      : safeNumber(data.ownerAmount ?? data.payoutAmount ?? totalAmount - platformFee);

  return {
    bookingId: id,
    carId: (data.carId as string) ?? '',
    ownerId: (data.ownerId as string) ?? '',
    // Flutter stores the renter as userId, portal expects renterId
    renterId: (data.renterId as string) ?? (data.userId as string) ?? '',
    renterName: (data.renterName as string) ?? undefined,
    ownerName: (data.ownerName as string) ?? undefined,
    carBrand: (data.carBrand as string) ?? undefined,
    carModel: (data.carModel as string) ?? undefined,
    carImage: (data.carImage as string) ?? undefined,
    status: (data.status as BookingStatus) ?? 'pending',
    pickupStatus: (data.pickupStatus as Booking['pickupStatus']) ?? undefined,
    returnStatus: (data.returnStatus as Booking['returnStatus']) ?? undefined,
    startDate: data.startDate as Booking['startDate'],
    endDate: data.endDate as Booking['endDate'],
    totalAmount,
    platformFee,
    ownerEarning,
    notes: (data.notes as string) ?? undefined,
    createdAt: data.createdAt as Booking['createdAt'],
    updatedAt: (data.updatedAt as Booking['updatedAt']) ?? undefined,
  };
}

// Batch-fetch users and cars to fill in renterName / ownerName / carBrand / carModel / carImage
async function enrichBookings(bookings: Booking[]): Promise<Booking[]> {
  if (bookings.length === 0) return bookings;

  const renterIds = [...new Set(bookings.map(b => b.renterId).filter(Boolean))];
  const carIds = [...new Set(bookings.map(b => b.carId).filter(Boolean))];

  const [renterResults, carResults] = await Promise.all([
    Promise.allSettled(renterIds.map(id => getDoc(doc(db, 'users', id)))),
    Promise.allSettled(carIds.map(id => getDoc(doc(db, 'cars', id)))),
  ]);

  const renters: Record<string, string> = {};
  renterResults.forEach((res, i) => {
    if (res.status === 'fulfilled' && res.value.exists()) {
      const d = res.value.data();
      renters[renterIds[i]] = (d?.fullName ?? d?.name ?? '') as string;
    }
  });

  const cars: Record<string, { brand: string; model: string; ownerId: string; image?: string }> = {};
  carResults.forEach((res, i) => {
    if (res.status === 'fulfilled' && res.value.exists()) {
      const d = res.value.data();
      const images = d?.images as string[] | undefined;
      cars[carIds[i]] = {
        brand: (d?.brand ?? '') as string,
        model: (d?.model ?? '') as string,
        ownerId: (d?.ownerId ?? '') as string,
        image: images?.[0],
      };
    }
  });

  // Fetch owner names via car's ownerId for bookings that don't already have ownerName
  const ownerIds = [
    ...new Set(
      bookings
        .filter(b => !b.ownerName && cars[b.carId]?.ownerId)
        .map(b => cars[b.carId]?.ownerId)
        .filter(Boolean)
    ),
  ];

  const owners: Record<string, string> = {};
  if (ownerIds.length > 0) {
    const ownerResults = await Promise.allSettled(
      ownerIds.map(id => getDoc(doc(db, 'users', id)))
    );
    ownerResults.forEach((res, i) => {
      if (res.status === 'fulfilled' && res.value.exists()) {
        const d = res.value.data();
        owners[ownerIds[i]] = (d?.fullName ?? d?.name ?? '') as string;
      }
    });
  }

  return bookings.map(b => {
    const car = cars[b.carId];
    const ownerName =
      b.ownerName || (car?.ownerId ? owners[car.ownerId] : undefined) || '—';
    return {
      ...b,
      renterName: b.renterName || renters[b.renterId] || '—',
      ownerName,
      carBrand: b.carBrand || car?.brand || '—',
      carModel: b.carModel || car?.model || '',
      carImage: b.carImage || car?.image,
    };
  });
}

// Statuses Flutter may write when a booking is accepted/confirmed
const CONFIRMED_STATUSES = new Set(['confirmed', 'accepted', 'paid', 'approved']);
// Statuses that mean a trip is currently active
const IN_TRIP_STATUSES = new Set(['in_trip', 'active', 'picked_up']);

// Fetch all bookings then filter/sort client-side to avoid composite index requirements
export async function getBookings(status?: BookingStatus): Promise<Booking[]> {
  const snap = await getDocs(collection(db, 'bookings'));
  let bookings = snap.docs.map(d =>
    mapBookingDoc(d.id, d.data() as Record<string, unknown>)
  );
  if (status) bookings = bookings.filter(b => b.status === status);
  bookings.sort((a, b) => tsMillis(b.createdAt) - tsMillis(a.createdAt));
  return enrichBookings(bookings);
}

export async function getBooking(bookingId: string): Promise<Booking | null> {
  const snap = await getDoc(doc(db, 'bookings', bookingId));
  if (!snap.exists()) return null;
  const b = mapBookingDoc(snap.id, snap.data() as Record<string, unknown>);
  const [enriched] = await enrichBookings([b]);
  return enriched;
}

export async function getBookingsForCar(carId: string): Promise<Booking[]> {
  const snap = await getDocs(
    query(collection(db, 'bookings'), where('carId', '==', carId))
  );
  const bookings = snap.docs.map(d =>
    mapBookingDoc(d.id, d.data() as Record<string, unknown>)
  );
  bookings.sort((a, b) => tsMillis(b.createdAt) - tsMillis(a.createdAt));
  return enrichBookings(bookings);
}

export async function confirmPickup(
  bookingId: string,
  carId: string,
  employeeId: string,
  notes?: string
): Promise<void> {
  await updateDoc(doc(db, 'bookings', bookingId), {
    status: 'in_trip',
    pickupStatus: 'confirmed',
    pickupConfirmedBy: employeeId,
    pickupConfirmedAt: serverTimestamp(),
    notes: notes ?? '',
    updatedAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'cars', carId), {
    status: 'in_trip',
    hubStatus: 'in_trip',
    updatedAt: serverTimestamp(),
  });
}

export async function confirmReturn(
  bookingId: string,
  carId: string,
  employeeId: string,
  hasDamage: boolean,
  returnNotes?: string
): Promise<void> {
  // Fetch booking first to get earnings data
  const bookingSnap = await getDoc(doc(db, 'bookings', bookingId));
  let ownerId: string | undefined;
  let ownerEarning = 0;
  if (bookingSnap.exists()) {
    const d = bookingSnap.data();
    ownerId = (d.ownerId as string) || undefined;
    ownerEarning = safeNumber(
      d.ownerEarning ?? d.ownerAmount ??
      (safeNumber(d.totalAmount ?? d.totalPrice) * 0.9)
    );
  }

  const carStatus = hasDamage ? 'maintenance' : 'ready_for_rental';

  await updateDoc(doc(db, 'bookings', bookingId), {
    status: 'completed',
    returnStatus: 'confirmed',
    returnConfirmedBy: employeeId,
    returnConfirmedAt: serverTimestamp(),
    completedAt: serverTimestamp(),
    returnNotes: returnNotes ?? '',
    updatedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, 'cars', carId), {
    status: carStatus,
    hubStatus: carStatus,
    available: carStatus === 'ready_for_rental',
    updatedAt: serverTimestamp(),
  });

  // Credit owner earnings now that the trip is complete
  if (ownerId && ownerEarning > 0) {
    await creditOwnerEarning(ownerId, bookingId, ownerEarning);
  }
}

export async function getBookingCountByStatus(): Promise<Record<string, number>> {
  const snap = await getDocs(collection(db, 'bookings'));
  const counts: Record<string, number> = {};
  snap.docs.forEach(d => {
    const s = d.data().status as string;
    counts[s] = (counts[s] ?? 0) + 1;
  });
  return counts;
}

export async function getTodayBookings(type: 'pickup' | 'return'): Promise<Booking[]> {
  const today = new Date();

  // Fetch all bookings with any relevant status, then filter by date client-side
  const snap = await getDocs(collection(db, 'bookings'));
  const bookings = snap.docs
    .map(d => mapBookingDoc(d.id, d.data() as Record<string, unknown>))
    .filter(b => {
      if (type === 'pickup') {
        if (!CONFIRMED_STATUSES.has(b.status)) return false;
        // Exclude already confirmed pickups
        if (b.pickupStatus === 'confirmed') return false;
        const d = normalizeFirestoreDate(b.startDate);
        return d ? isSameLocalDay(d, today) : false;
      } else {
        if (!IN_TRIP_STATUSES.has(b.status)) return false;
        if (b.returnStatus === 'confirmed') return false;
        const d = normalizeFirestoreDate(b.endDate);
        return d ? isSameLocalDay(d, today) : false;
      }
    });

  return enrichBookings(bookings);
}

export async function getRecentBookings(n = 10): Promise<Booking[]> {
  const snap = await getDocs(collection(db, 'bookings'));
  const bookings = snap.docs.map(d =>
    mapBookingDoc(d.id, d.data() as Record<string, unknown>)
  );
  bookings.sort((a, b) => tsMillis(b.createdAt) - tsMillis(a.createdAt));
  return enrichBookings(bookings.slice(0, n));
}

// Bookings where the renter should pick up today or any day (employee hasn't confirmed pickup yet)
export async function getPendingPickups(): Promise<Booking[]> {
  const snap = await getDocs(collection(db, 'bookings'));
  const bookings = snap.docs
    .map(d => mapBookingDoc(d.id, d.data() as Record<string, unknown>))
    .filter(b => {
      // Accept any Flutter-confirmed status
      if (!CONFIRMED_STATUSES.has(b.status)) return false;
      // Exclude bookings already handed to renter
      if (b.pickupStatus === 'confirmed') return false;
      // Only include bookings whose startDate is today or in the past (overdue)
      const d = normalizeFirestoreDate(b.startDate);
      if (!d) return false;
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return d <= today;
    });
  bookings.sort((a, b) => tsMillis(a.startDate) - tsMillis(b.startDate));
  return enrichBookings(bookings);
}

// Bookings where the renter is currently on a trip and vehicle hasn't been returned yet
export async function getPendingReturns(): Promise<Booking[]> {
  const snap = await getDocs(collection(db, 'bookings'));
  const bookings = snap.docs
    .map(d => mapBookingDoc(d.id, d.data() as Record<string, unknown>))
    .filter(b => {
      if (!IN_TRIP_STATUSES.has(b.status)) return false;
      if (b.returnStatus === 'confirmed') return false;
      return true;
    });
  bookings.sort((a, b) => tsMillis(a.endDate) - tsMillis(b.endDate));
  return enrichBookings(bookings);
}

export async function getPlatformRevenue(): Promise<number> {
  const snap = await getDocs(collection(db, 'bookings'));
  let total = 0;
  snap.docs.forEach(d => {
    const data = d.data();
    const status = data.status as string;
    if (status === 'completed' || status === 'in_trip') {
      total += safeNumber(
        data.platformFee ?? data.commission ?? data.serviceFee ??
        Math.round(safeNumber(data.totalAmount ?? data.totalPrice ?? data.amount) * 0.1)
      );
    }
  });
  return total;
}
