'use client';

import { useState, useRef } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { confirmReturn } from '@/services/bookings';
import { createInspection } from '@/services/inspections';
import { uploadInspectionPhotos } from '@/services/inspections';
import { useAuth } from '@/contexts/AuthContext';
import { Booking, Condition, FuelLevel } from '@/types';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Loader2, RotateCcw, Upload, AlertTriangle } from 'lucide-react';

interface ReturnModalProps {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
  onConfirmed: () => void;
}

const fuelOptions: { value: FuelLevel; label: string }[] = [
  { value: 'full', label: 'Full' },
  { value: 'three_quarters', label: '3/4' },
  { value: 'half', label: '1/2' },
  { value: 'quarter', label: '1/4' },
  { value: 'empty', label: 'Empty' },
];

const conditionOptions: { value: Condition; label: string }[] = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

export default function ReturnModal({ booking, open, onClose, onConfirmed }: ReturnModalProps) {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [hasDamage, setHasDamage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [form, setForm] = useState({
    odometer: '',
    fuelLevel: 'full' as FuelLevel,
    exteriorCondition: 'good' as Condition,
    damageNotes: '',
  });

  async function handleConfirm() {
    if (!booking || !user) return;
    if (!form.odometer) { toast.error('Odometer reading is required'); return; }

    setLoading(true);
    try {
      let photoUrls: string[] = [];
      if (photos.length > 0) {
        photoUrls = await uploadInspectionPhotos(booking.carId, photos);
      }

      const inspectionId = await createInspection({
        carId: booking.carId,
        bookingId: booking.bookingId,
        type: 'return_inspection',
        employeeId: user.uid,
        odometer: Number(form.odometer),
        fuelLevel: form.fuelLevel,
        exteriorCondition: form.exteriorCondition,
        interiorCondition: 'good',
        tireCondition: 'good',
        cleanliness: 'good',
        damageNotes: form.damageNotes,
        photos,
      });

      await confirmReturn(
        booking.bookingId,
        booking.carId,
        user.uid,
        hasDamage,
        form.damageNotes
      );

      toast.success(
        hasDamage
          ? 'Return confirmed — car sent to maintenance'
          : 'Return confirmed — car is ready for rental'
      );
      onConfirmed();
      onClose();
    } catch (err) {
      toast.error('Failed to confirm return');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Vehicle Return</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Booking info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Booking ID</span>
              <span className="font-mono font-medium">{booking.bookingId.slice(0, 8)}…</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Renter</span>
              <span className="font-medium">{booking.renterName ?? booking.renterId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Due Date</span>
              <span className="font-medium">{formatDate(booking.endDate)}</span>
            </div>
          </div>

          {/* Return inspection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Odometer (km) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                placeholder="e.g. 46200"
                value={form.odometer}
                onChange={e => setForm(p => ({ ...p, odometer: e.target.value }))}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Exterior Condition</label>
            <Select value={form.exteriorCondition} onValueChange={v => setForm(p => ({ ...p, exteriorCondition: v as Condition }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {conditionOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Damage toggle */}
          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
            <input
              type="checkbox"
              checked={hasDamage}
              onChange={e => setHasDamage(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-red-500 rounded"
            />
            <span className="text-sm text-gray-700 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Vehicle has damage — send to maintenance
            </span>
          </label>

          {hasDamage && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Damage Description</label>
              <textarea
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                rows={2}
                placeholder="Describe the damage in detail..."
                value={form.damageNotes}
                onChange={e => setForm(p => ({ ...p, damageNotes: e.target.value }))}
              />
            </div>
          )}

          {/* Photos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Return Photos</label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:border-brand transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500">{photos.length} photo(s) selected</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => e.target.files && setPhotos(Array.from(e.target.files))}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Confirming…</>
              : <><RotateCcw className="w-4 h-4" /> Confirm Return</>
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
