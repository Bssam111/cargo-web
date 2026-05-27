import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { PortalUser, UserRole } from '@/types';

function tsMillis(v: unknown): number {
  if (!v) return 0;
  if (typeof v === 'object' && 'toDate' in (v as object))
    return (v as { toDate(): Date }).toDate().getTime();
  if (v instanceof Date) return v.getTime();
  return 0;
}

// Fetch all users then filter/sort client-side to avoid composite index requirements
export async function getUsers(role?: UserRole): Promise<PortalUser[]> {
  const snap = await getDocs(collection(db, 'users'));
  let users = snap.docs.map(d => ({ uid: d.id, ...d.data() } as PortalUser));
  if (role) users = users.filter(u => u.role === role);
  users.sort((a, b) => tsMillis(b.createdAt) - tsMillis(a.createdAt));
  return users;
}

export async function getUser(uid: string): Promise<PortalUser | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return { uid: snap.id, ...snap.data() } as PortalUser;
}

export async function updateUserStatus(uid: string, isActive: boolean): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { isActive, updatedAt: serverTimestamp() });
}

export async function getUserCountByRole(): Promise<Record<string, number>> {
  const snap = await getDocs(collection(db, 'users'));
  const counts: Record<string, number> = {};
  snap.docs.forEach(d => {
    const r = d.data().role as string;
    counts[r] = (counts[r] ?? 0) + 1;
  });
  return counts;
}

export async function createEmployee(data: {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  employeeId: string;
  hubLocation: string;
}): Promise<string> {
  const credential = await createUserWithEmailAndPassword(auth, data.email, data.password);
  const uid = credential.user.uid;
  await setDoc(doc(db, 'users', uid), {
    email: data.email,
    fullName: data.fullName,
    phone: data.phone,
    role: 'employee',
    employeeId: data.employeeId,
    hubLocation: data.hubLocation,
    isActive: true,
    createdAt: serverTimestamp(),
  });
  return uid;
}
