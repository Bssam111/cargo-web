'use client';

import { useState, useRef } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { confirmPickup } from '@/services/bookings';
import { uploadInspectionPhotos } from '@/services/inspections';
import { useAuth } from '@/contexts/AuthContext';
import { Booking } from '@/types';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { CheckCircle, Loader2, Upload } from 'lucide-react';

interface PickupModalProps {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
  onConfirmed: () => void;
}

export default function PickupModal({ booking, open, onClose, onConfirmed }: PickupModalProps) {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [identityChecked, setIdentityChecked] = useState(false);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (!booking || !user) return;
    if (!identityChecked) { toast.error('Please confirm renter identity was checked'); return; }

    setLoading(true);
    try {
      // Upload handover photos to Firebase Storage (stored independently from the booking)
      if (photos.length > 0) {
        await uploadInspectionPhotos(booking.carId, photos);
      }

      await confirmPickup(booking.bookingId, booking.carId, user.uid, notes);
      toast.success('Pickup confirmed — booking is now in trip');
      onConfirmed();
      onClose();
    } catch (err) {
      toast.error('Failed to confirm pickup');
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
          <DialogTitle>Confirm Renter Pickup</DialogTitle>
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
              <span className="text-gray-500">Car</span>
              <span className="font-medium">{booking.carBrand} {booking.carModel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Pickup Date</span>
              <span className="font-medium">{formatDate(booking.startDate)}</span>
            </div>
          </div>

          {/* Identity check */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={identityChecked}
              onChange={e => setIdentityChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-brand rounded"
            />
            <span className="text-sm text-gray-700">
              I have verified the renter's identity (National ID / Driver's License)
            </span>
          </label>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
            <textarea
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand resize-none"
              rows={2}
              placeholder="Any notes about the handover..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          {/* Photo upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Handover Photos (optional)
            </label>
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
          <Button onClick={handleConfirm} disabled={loading || !identityChecked}>
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Confirming…</>
              : <><CheckCircle className="w-4 h-4" /> Confirm Pickup</>
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
