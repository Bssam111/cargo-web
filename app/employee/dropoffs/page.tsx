'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Header from '@/components/shared/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { createInspection } from '@/services/inspections';
import { getPendingDeliveries, approveDelivery, rejectDelivery } from '@/services/cars';
import { useAuth } from '@/contexts/AuthContext';
import { Car, Condition, FuelLevel } from '@/types';
import { formatDate, formatDateTime } from '@/lib/utils';
import { Truck, ClipboardCheck, XCircle, Camera, Upload, Loader2, Clock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const REJECTION_REASONS = [
  'Vehicle not found at hub',
  'Wrong vehicle delivered',
  'Vehicle has significant damage',
  'Missing documents or registration',
  'Failed safety inspection',
  'Vehicle does not match listing',
  'Other',
];

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

export default function DropoffsPage() {
  const { user } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  // Approve flow state
  const [approveTarget, setApproveTarget] = useState<Car | null>(null);
  const [approveLoading, setApproveLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [inspectionForm, setInspectionForm] = useState({
    odometer: '',
    fuelLevel: 'full' as FuelLevel,
    exteriorCondition: 'good' as Condition,
    interiorCondition: 'good' as Condition,
    tireCondition: 'good' as Condition,
    cleanliness: 'good' as Condition,
    damageNotes: '',
  });

  // Reject flow state
  const [rejectTarget, setRejectTarget] = useState<Car | null>(null);
  const [rejectReason, setRejectReason] = useState(REJECTION_REASONS[0]);
  const [rejectCustom, setRejectCustom] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      setCars(await getPendingDeliveries());
    } catch { toast.error('Failed to load pending deliveries'); }
    finally { setLoading(false); }
  }

  // ── Approve handlers ──────────────────────────────────────────────────────

  function openApprove(car: Car) {
    setApproveTarget(car);
    setPhotos([]);
    setInspectionForm({
      odometer: '',
      fuelLevel: 'full',
      exteriorCondition: 'good',
      interiorCondition: 'good',
      tireCondition: 'good',
      cleanliness: 'good',
      damageNotes: '',
    });
  }

  async function handleApprove(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !approveTarget) return;
    if (!inspectionForm.odometer) { toast.error('Odometer reading is required'); return; }

    setApproveLoading(true);
    try {
      await createInspection({
        carId: approveTarget.carId,
        type: 'dropoff_inspection',
        employeeId: user.uid,
        odometer: Number(inspectionForm.odometer),
        fuelLevel: inspectionForm.fuelLevel,
        exteriorCondition: inspectionForm.exteriorCondition,
        interiorCondition: inspectionForm.interiorCondition,
        tireCondition: inspectionForm.tireCondition,
        cleanliness: inspectionForm.cleanliness,
        damageNotes: inspectionForm.damageNotes,
        photos,
      });
      await approveDelivery(approveTarget.carId, user.uid);
      toast.success(`${approveTarget.brand} ${approveTarget.model} approved — now at hub`);
      setApproveTarget(null);
      loadData();
    } catch { toast.error('Failed to approve delivery'); }
    finally { setApproveLoading(false); }
  }

  // ── Reject handlers ───────────────────────────────────────────────────────

  async function handleReject() {
    if (!user || !rejectTarget) return;
    const reason = rejectReason === 'Other'
      ? (rejectCustom.trim() || 'Other')
      : rejectReason;

    setRejectLoading(true);
    try {
      await rejectDelivery(rejectTarget.carId, user.uid, reason);
      toast.success(`Delivery rejected — owner has been notified`);
      setRejectTarget(null);
      setRejectReason(REJECTION_REASONS[0]);
      setRejectCustom('');
      loadData();
    } catch { toast.error('Failed to reject delivery'); }
    finally { setRejectLoading(false); }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Header
        title="Pending Vehicle Deliveries"
        subtitle={`${cars.length} vehicle${cars.length !== 1 ? 's' : ''} awaiting employee verification`}
      />
      <div className="p-6">
        {cars.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm">
            <CheckCircle2 className="w-12 h-12 text-green-300 mx-auto mb-3" />
            <p className="text-gray-700 font-semibold">No pending deliveries</p>
            <p className="text-sm text-gray-400 mt-1">All owner submissions have been processed</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {cars.map(car => (
              <DeliveryCard
                key={car.carId}
                car={car}
                onApprove={() => openApprove(car)}
                onReject={() => setRejectTarget(car)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Approve / Inspection Dialog ─────────────────────────────────────── */}
      <Dialog open={!!approveTarget} onOpenChange={v => !v && setApproveTarget(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-green-600" />
              Approve Delivery — {approveTarget?.brand} {approveTarget?.model}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleApprove} className="space-y-5 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Odometer (km) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 45000"
                  value={inspectionForm.odometer}
                  onChange={e => setInspectionForm(p => ({ ...p, odometer: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Fuel Level</label>
                <Select
                  value={inspectionForm.fuelLevel}
                  onValueChange={v => setInspectionForm(p => ({ ...p, fuelLevel: v as FuelLevel }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {fuelOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

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
                    value={inspectionForm[field]}
                    onValueChange={v => setInspectionForm(p => ({ ...p, [field]: v as Condition }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {conditionOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Inspection Notes</label>
              <textarea
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                rows={3}
                placeholder="Note any scratches, dents, or observations..."
                value={inspectionForm.damageNotes}
                onChange={e => setInspectionForm(p => ({ ...p, damageNotes: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Inspection Photos</label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-brand transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                <p className="text-sm text-gray-500">Click to upload photos</p>
                <p className="text-xs text-gray-400">{photos.length} photo(s) selected</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => e.target.files && setPhotos(prev => [...prev, ...Array.from(e.target.files!)])}
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

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setApproveTarget(null)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={approveLoading}>
                {approveLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Approving…</>
                  : <><CheckCircle2 className="w-4 h-4" /> Approve Delivery</>}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Reject Dialog ────────────────────────────────────────────────────── */}
      <Dialog open={!!rejectTarget} onOpenChange={v => !v && setRejectTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Reject Delivery — {rejectTarget?.brand} {rejectTarget?.model}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-600">
              Select a rejection reason. The owner will see this message and can resubmit after resolving the issue.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Rejection Reason</label>
              <Select value={rejectReason} onValueChange={setRejectReason}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REJECTION_REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {rejectReason === 'Other' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Custom Reason</label>
                <Input
                  placeholder="Describe the rejection reason..."
                  value={rejectCustom}
                  onChange={e => setRejectCustom(e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleReject}
              disabled={rejectLoading || (rejectReason === 'Other' && !rejectCustom.trim())}
            >
              {rejectLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Rejecting…</>
                : <><XCircle className="w-4 h-4" /> Reject Delivery</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Delivery Card ─────────────────────────────────────────────────────────────

function DeliveryCard({
  car,
  onApprove,
  onReject,
}: {
  car: Car;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Car image */}
        <div className="sm:w-40 sm:shrink-0 bg-gray-100">
          {car.images?.[0] ? (
            <div className="relative w-full h-36 sm:h-full">
              <Image
                src={car.images[0]}
                alt={`${car.brand} ${car.model}`}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-36 sm:h-full flex items-center justify-center text-gray-300">
              <Truck className="w-10 h-10" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">
                {car.brand} {car.model} {car.year ? `(${car.year})` : ''}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {car.plateNumber ? `Plate: ${car.plateNumber}` : 'No plate on record'}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-orange-100 text-orange-800">
              <Clock className="w-3 h-3" />
              Awaiting Verification
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Owner</p>
              <p className="text-gray-700 font-medium mt-0.5">
                {car.ownerName || car.ownerId.slice(0, 8) + '…'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Hub Location</p>
              <p className="text-gray-700 mt-0.5">{car.hubLocation || 'CarGo Hub'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Available From</p>
              <p className="text-gray-700 mt-0.5">{formatDate(car.availableFrom)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Submitted</p>
              <p className="text-gray-700 mt-0.5">
                {formatDateTime(car.deliveryRequestedAt ?? car.updatedAt)}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
              onClick={onApprove}
            >
              <ClipboardCheck className="w-4 h-4" />
              Approve & Inspect
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={onReject}
            >
              <XCircle className="w-4 h-4" />
              Reject Delivery
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
