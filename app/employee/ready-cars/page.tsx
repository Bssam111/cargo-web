'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/shared/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { getCars, updateCarStatus } from '@/services/cars';
import { useAuth } from '@/contexts/AuthContext';
import { Car } from '@/types';
import { carStatusLabel, carStatusColor, formatDate, formatCurrency } from '@/lib/utils';
import { CheckSquare, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReadyCarsPage() {
  const { user } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      // Show at_hub cars (inspected, waiting to be marked ready)
      const data = await getCars('at_hub');
      setCars(data);
    } catch { toast.error('Failed to load cars'); }
    finally { setLoading(false); }
  }

  async function markReady(carId: string) {
    if (!user) return;
    setUpdating(carId);
    try {
      await updateCarStatus(carId, 'ready_for_rental', user.uid);
      toast.success('Car marked as ready for rental');
      loadData();
    } catch { toast.error('Failed to update status'); }
    finally { setUpdating(null); }
  }

  async function sendToMaintenance(carId: string) {
    setUpdating(carId);
    try {
      await updateCarStatus(carId, 'maintenance');
      toast.success('Car sent to maintenance');
      loadData();
    } catch { toast.error('Failed to update status'); }
    finally { setUpdating(null); }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Header title="Cars at Hub" subtitle="Inspected vehicles awaiting ready status" />
      <div className="p-6">
        {cars.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm">
            <CheckSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No cars waiting</p>
            <p className="text-sm text-gray-400 mt-1">All inspected cars have been processed</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {cars.map(car => (
              <div key={car.carId} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Vehicle</p>
                      <p className="font-semibold text-gray-800 mt-0.5">{car.brand} {car.model}</p>
                      <p className="text-xs text-gray-400">{car.plateNumber || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Owner</p>
                      <p className="text-sm font-medium mt-0.5">{car.ownerName || car.ownerId.slice(0, 8)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Status</p>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold mt-0.5 ${carStatusColor(car.status)}`}>
                        {carStatusLabel(car.status)}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Verified</p>
                      <p className="text-sm text-gray-500 mt-0.5">{formatDate(car.verifiedAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sendToMaintenance(car.carId)}
                      disabled={updating === car.carId}
                    >
                      <Wrench className="w-4 h-4" /> Maintenance
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => markReady(car.carId)}
                      disabled={updating === car.carId}
                    >
                      <CheckSquare className="w-4 h-4" /> Mark Ready
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
