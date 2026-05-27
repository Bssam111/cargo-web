import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Inspection, InspectionType, FuelLevel, Condition, DamageReport } from '@/types';

function tsMillis(v: unknown): number {
  if (!v) return 0;
  if (typeof v === 'object' && 'toDate' in (v as object))
    return (v as { toDate(): Date }).toDate().getTime();
  if (v instanceof Date) return v.getTime();
  return 0;
}

export interface InspectionFormData {
  carId: string;
  bookingId?: string;
  type: InspectionType;
  employeeId: string;
  odometer: number;
  fuelLevel: FuelLevel;
  exteriorCondition: Condition;
  interiorCondition: Condition;
  tireCondition: Condition;
  cleanliness: Condition;
  damageNotes: string;
  photos: File[];
}

export async function uploadInspectionPhotos(
  carId: string,
  photos: File[]
): Promise<string[]> {
  const urls: string[] = [];
  for (const photo of photos) {
    const path = `inspections/${carId}/${Date.now()}_${photo.name}`;
    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, photo);
    const url = await getDownloadURL(fileRef);
    urls.push(url);
  }
  return urls;
}

export async function createInspection(data: InspectionFormData): Promise<string> {
  const photoUrls = data.photos.length > 0
    ? await uploadInspectionPhotos(data.carId, data.photos)
    : [];

  const docRef = await addDoc(collection(db, 'inspections'), {
    carId: data.carId,
    bookingId: data.bookingId ?? null,
    type: data.type,
    employeeId: data.employeeId,
    odometer: data.odometer,
    fuelLevel: data.fuelLevel,
    exteriorCondition: data.exteriorCondition,
    interiorCondition: data.interiorCondition,
    tireCondition: data.tireCondition,
    cleanliness: data.cleanliness,
    damageNotes: data.damageNotes,
    photos: photoUrls,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

// Single equality filter only — no composite index required; sort client-side
export async function getInspectionsForCar(carId: string): Promise<Inspection[]> {
  const snap = await getDocs(
    query(collection(db, 'inspections'), where('carId', '==', carId))
  );
  const inspections = snap.docs.map(d => ({ inspectionId: d.id, ...d.data() } as Inspection));
  inspections.sort((a, b) => tsMillis(b.createdAt) - tsMillis(a.createdAt));
  return inspections;
}

// Fetch all damage reports, filter and sort client-side
export async function getDamageReports(status?: 'open' | 'resolved'): Promise<DamageReport[]> {
  const snap = await getDocs(collection(db, 'damage_reports'));
  let reports = snap.docs.map(d => ({ reportId: d.id, ...d.data() } as DamageReport));
  if (status) reports = reports.filter(r => r.status === status);
  reports.sort((a, b) => tsMillis(b.createdAt) - tsMillis(a.createdAt));
  return reports;
}

export async function createDamageReport(data: {
  carId: string;
  bookingId: string;
  inspectionId: string;
  employeeId: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe';
  photos: string[];
  estimatedCost?: number;
}): Promise<string> {
  const docRef = await addDoc(collection(db, 'damage_reports'), {
    ...data,
    status: 'open',
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}
