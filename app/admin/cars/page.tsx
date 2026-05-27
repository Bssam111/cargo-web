'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Header from '@/components/shared/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCars } from '@/services/cars';
import { Car, CarStatus } from '@/types';
import { carStatusLabel, carStatusColor, formatDate, formatCurrency } from '@/lib/utils';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';

const statusOptions: { value: string; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'awaiting_employee_verification', label: 'Awaiting Verification' },
  { value: 'delivery_rejected', label: 'Delivery Rejected' },
  { value: 'awaiting_owner_dropoff', label: 'Awaiting Drop-Off' },
  { value: 'pending_inspection', label: 'Pending Inspection' },
  { value: 'at_hub', label: 'At Hub' },
  { value: 'ready_for_rental', label: 'Ready for Rental' },
  { value: 'in_trip', label: 'In Trip' },
  { value: 'maintenance', label: 'Under Maintenance' },
];

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [filtered, setFiltered] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { loadCars(); }, []);

  useEffect(() => {
    let result = cars;
    if (statusFilter !== 'all') result = result.filter(c => c.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.brand?.toLowerCase().includes(q) ||
        c.model?.toLowerCase().includes(q) ||
        c.plateNumber?.toLowerCase().includes(q) ||
        c.ownerName?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [cars, search, statusFilter]);

  async function loadCars() {
    try {
      const data = await getCars();
      setCars(data);
    } catch { toast.error('Failed to load cars'); }
    finally { setLoading(false); }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Header title="Cars Management" subtitle={`${cars.length} total cars`} />
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-52">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by brand, model, plate…"
              className="pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {statusOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Car</TableHead>
                <TableHead>Plate</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Price/Day</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Hub Verified</TableHead>
                <TableHead>Added</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(c => (
                <TableRow key={c.carId}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {c.images?.[0] ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          <Image src={c.images[0]} alt={c.brand} width={40} height={40} className="object-cover w-full h-full" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                          No img
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-800">{c.brand} {c.model}</p>
                        <p className="text-xs text-gray-400">{c.year} · {c.color}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{c.plateNumber || '—'}</TableCell>
                  <TableCell className="text-gray-600">{c.ownerName || c.ownerId.slice(0, 8)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(c.pricePerDay)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${carStatusColor(c.status)}`}>
                      {carStatusLabel(c.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${c.isVerifiedAtHub ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.isVerifiedAtHub ? 'Verified' : 'Not verified'}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-400 text-sm">{formatDate(c.createdAt)}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-gray-400">No cars found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
