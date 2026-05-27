'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/shared/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Input } from '@/components/ui/input';
import { getHubInventory } from '@/services/cars';
import { Car } from '@/types';
import { carStatusLabel, carStatusColor, formatDate } from '@/lib/utils';
import { Search, Box } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_GROUPS = [
  { key: 'ready_for_rental', label: 'Ready for Rental', color: 'bg-green-50 border-green-200' },
  { key: 'at_hub', label: 'At Hub (Processing)', color: 'bg-blue-50 border-blue-200' },
  { key: 'maintenance', label: 'Under Maintenance', color: 'bg-red-50 border-red-200' },
  { key: 'pending_inspection', label: 'Pending Inspection', color: 'bg-orange-50 border-orange-200' },
  { key: 'returned', label: 'Recently Returned', color: 'bg-purple-50 border-purple-200' },
];

export default function InventoryPage() {
  const [inventory, setInventory] = useState<Car[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try { setInventory(await getHubInventory()); }
    catch { toast.error('Failed to load inventory'); }
    finally { setLoading(false); }
  }

  const filtered = search
    ? inventory.filter(c =>
        `${c.brand} ${c.model} ${c.plateNumber}`.toLowerCase().includes(search.toLowerCase())
      )
    : inventory;

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Header title="Hub Inventory" subtitle={`${inventory.length} vehicles at CarGo Hub`} />
      <div className="p-6 space-y-5">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search vehicles…"
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {inventory.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm">
            <Box className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Hub is empty</p>
          </div>
        ) : (
          STATUS_GROUPS.map(group => {
            const groupCars = filtered.filter(c => c.status === group.key);
            if (groupCars.length === 0) return null;
            return (
              <div key={group.key}>
                <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
                  {group.label} <span className="text-gray-400 font-normal">({groupCars.length})</span>
                </h2>
                <div className="grid gap-3">
                  {groupCars.map(car => (
                    <div
                      key={car.carId}
                      className={`rounded-xl border p-4 ${group.color}`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                          <div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Vehicle</p>
                            <p className="font-semibold text-gray-800 mt-0.5">{car.brand} {car.model}</p>
                            <p className="text-xs text-gray-500">{car.plateNumber || '—'} · {car.color}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Owner</p>
                            <p className="text-sm text-gray-700 mt-0.5">{car.ownerName || car.ownerId.slice(0, 8)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Status</p>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold mt-0.5 ${carStatusColor(car.status)}`}>
                              {carStatusLabel(car.status)}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Hub Verified</p>
                            <p className="text-sm mt-0.5">
                              {car.isVerifiedAtHub
                                ? <span className="text-green-600 font-medium">✓ Verified</span>
                                : <span className="text-gray-400">Not verified</span>
                              }
                            </p>
                            {car.verifiedAt && (
                              <p className="text-xs text-gray-400">{formatDate(car.verifiedAt)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
