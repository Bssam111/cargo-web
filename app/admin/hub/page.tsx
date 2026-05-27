'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/shared/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import StatCard from '@/components/shared/StatCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getHubInventory } from '@/services/cars';
import { Car } from '@/types';
import { carStatusLabel, carStatusColor, formatDate } from '@/lib/utils';
import { Warehouse, CheckCircle2, Wrench, RotateCcw, Car as CarIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HubOverviewPage() {
  const [inventory, setInventory] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try { setInventory(await getHubInventory()); }
    catch { toast.error('Failed to load hub inventory'); }
    finally { setLoading(false); }
  }

  const counts = {
    at_hub: inventory.filter(c => c.status === 'at_hub').length,
    ready_for_rental: inventory.filter(c => c.status === 'ready_for_rental').length,
    maintenance: inventory.filter(c => c.status === 'maintenance').length,
    returned: inventory.filter(c => c.status === 'returned').length,
    pending_inspection: inventory.filter(c => c.status === 'pending_inspection').length,
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Header title="Hub Operations Overview" subtitle="CarGo Hub — Al Yasmin, Riyadh" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Ready for Rental" value={counts.ready_for_rental} icon={CheckCircle2} iconBg="bg-green-50" iconColor="text-green-600" />
          <StatCard title="At Hub" value={counts.at_hub} icon={Warehouse} iconBg="bg-blue-50" iconColor="text-blue-600" />
          <StatCard title="Under Maintenance" value={counts.maintenance} icon={Wrench} iconBg="bg-red-50" iconColor="text-red-600" />
          <StatCard title="Returned (Pending)" value={counts.returned} icon={RotateCcw} iconBg="bg-amber-50" iconColor="text-amber-600" />
        </div>

        {/* Status lifecycle guide */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Hub Vehicle Lifecycle</h3>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: 'Awaiting Drop-Off', color: 'bg-amber-100 text-amber-700' },
              { label: '→', color: '' },
              { label: 'Pending Inspection', color: 'bg-orange-100 text-orange-700' },
              { label: '→', color: '' },
              { label: 'At Hub', color: 'bg-blue-100 text-blue-700' },
              { label: '→', color: '' },
              { label: 'Ready for Rental', color: 'bg-green-100 text-green-700' },
              { label: '→', color: '' },
              { label: 'In Trip', color: 'bg-purple-100 text-purple-700' },
              { label: '→', color: '' },
              { label: 'Returned', color: 'bg-teal-100 text-teal-700' },
              { label: '→', color: '' },
              { label: 'Ready / Maintenance', color: 'bg-green-100 text-green-700' },
            ].map((step, i) =>
              step.color ? (
                <span key={i} className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${step.color}`}>
                  {step.label}
                </span>
              ) : (
                <span key={i} className="text-gray-400 font-medium">{step.label}</span>
              )
            )}
          </div>
        </div>

        {/* Inventory table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <CarIcon className="w-5 h-5 text-brand" />
            <h3 className="font-semibold text-gray-800">Hub Inventory ({inventory.length} vehicles)</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Car</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Hub Verified</TableHead>
                <TableHead>Verified By</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map(c => (
                <TableRow key={c.carId}>
                  <TableCell>
                    <p className="font-semibold">{c.brand} {c.model}</p>
                    <p className="text-xs text-gray-400">{c.plateNumber || c.carId.slice(0, 8)}</p>
                  </TableCell>
                  <TableCell className="text-gray-600">{c.ownerName || c.ownerId.slice(0, 8)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${carStatusColor(c.status)}`}>
                      {carStatusLabel(c.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${c.isVerifiedAtHub ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.isVerifiedAtHub ? 'Yes' : 'No'}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-400 text-sm font-mono">
                    {c.verifiedByEmployeeId ? c.verifiedByEmployeeId.slice(0, 8) + '…' : '—'}
                  </TableCell>
                  <TableCell className="text-gray-400 text-sm">{formatDate(c.updatedAt)}</TableCell>
                </TableRow>
              ))}
              {inventory.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-10 text-gray-400">No vehicles at hub</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
