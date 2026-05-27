'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createInspection, InspectionFormData } from '@/services/inspections';
import { updateCarStatus } from '@/services/cars';
import { useAuth } from '@/contexts/AuthContext';
import { Condition, FuelLevel, InspectionType } from '@/types';
import toast from 'react-hot-toast';
import { Camera, Loader2, Upload } from 'lucide-react';

interface InspectionFormProps {
  carId: string;
  bookingId?: string;
  type: InspectionType;
  onComplete: (inspectionId: string) => void;
}

const conditionOptions: { value: Condition; label: string }[] = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

const fuelOptions: { value: FuelLevel; label: string }[] = [
  { value: 'full', label: 'Full' },
  { value: 'three_quarters', label: '3/4' },
  { value: 'half', label: '1/2' },
  { value: 'quarter', label: '1/4' },
  { value: 'empty', label: 'Empty' },
];

export default function InspectionForm({ carId, bookingId, type, onComplete }: InspectionFormProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [form, setForm] = useState({
    odometer: '',
    fuelLevel: 'full' as FuelLevel,
    exteriorCondition: 'good' as Condition,
    interiorCondition: 'good' as Condition,
    tireCondition: 'good' as Condition,
    cleanliness: 'good' as Condition,
    damageNotes: '',
  });

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setPhotos(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!form.odometer) { toast.error('Odometer reading is required'); return; }

    setLoading(true);
    try {
      const data: InspectionFormData = {
        carId,
        bookingId,
        type,
        employeeId: user.uid,
        odometer: Number(form.odometer),
        fuelLevel: form.fuelLevel,
        exteriorCondition: form.exteriorCondition,
        interiorCondition: form.interiorCondition,
        tireCondition: form.tireCondition,
        cleanliness: form.cleanliness,
        damageNotes: form.damageNotes,
        photos,
      };

      const inspectionId = await createInspection(data);

      if (type === 'dropoff_inspection') {
        await updateCarStatus(carId, 'at_hub', user.uid);
      }

      toast.success('Inspection recorded successfully');
      onComplete(inspectionId);
    } catch (err) {
      toast.error('Failed to save inspection');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Odometer & Fuel */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Odometer (km) <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            placeholder="e.g. 45000"
            value={form.odometer}
            onChange={e => setForm(p => ({ ...p, odometer: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Fuel Level</label>
          <Select value={form.fuelLevel} onValueChange={v => setForm(p => ({ ...p, fuelLevel: v as FuelLevel }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {fuelOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Conditions */}
      <div className="grid grid-cols-2 gap-4">
        {([
          ['exteriorCondition', 'Exterior Condition'],
          ['interiorCondition', 'Interior Condition'],
          ['tireCondition', 'Tire Condition'],
          ['cleanliness', 'Cleanliness'],
        ] as const).map(([field, label]) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            <Select
              value={form[field]}
              onValueChange={v => setForm(p => ({ ...p, [field]: v as Condition }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {conditionOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      {/* Damage notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Damage Notes</label>
        <textarea
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand resize-none"
          rows={3}
          placeholder="Describe any damage, scratches, dents..."
          value={form.damageNotes}
          onChange={e => setForm(p => ({ ...p, damageNotes: e.target.value }))}
        />
      </div>

      {/* Photos */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Inspection Photos
        </label>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-brand transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
          <p className="text-sm text-gray-500">Click to upload photos</p>
          <p className="text-xs text-gray-400">{photos.length} photo(s) selected</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handlePhotoChange}
        />
        {photos.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {photos.map((p, i) => (
              <div key={i} className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1 text-xs text-gray-600">
                <Camera className="w-3 h-3" />
                {p.name.length > 15 ? p.name.slice(0, 15) + '…' : p.name}
              </div>
            ))}
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving Inspection…</> : 'Save Inspection'}
      </Button>
    </form>
  );
}
