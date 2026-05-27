'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/shared/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getBookings } from '@/services/bookings';
import { Booking } from '@/types';
import { formatDate, formatCurrency, bookingStatusLabel, bookingStatusColor } from '@/lib/utils';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filtered, setFiltered] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { loadBookings(); }, []);

  useEffect(() => {
    let result = bookings;
    if (statusFilter !== 'all') result = result.filter(b => b.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(b =>
        b.renterName?.toLowerCase().includes(q) ||
        b.carBrand?.toLowerCase().includes(q) ||
        b.bookingId?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [bookings, search, statusFilter]);

  async function loadBookings() {
    try {
      const data = await getBookings();
      setBookings(data);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Header title="Bookings Management" subtitle={`${bookings.length} total bookings`} />
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-52">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search bookings…"
              className="pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="w-44">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_trip">In Trip</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Renter</TableHead>
                <TableHead>Car</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Platform Fee</TableHead>
                <TableHead>Owner Earning</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(b => (
                <TableRow key={b.bookingId}>
                  <TableCell className="font-mono text-xs text-gray-500">{b.bookingId.slice(0, 8)}…</TableCell>
                  <TableCell className="font-medium">{b.renterName || '—'}</TableCell>
                  <TableCell className="text-gray-600">{b.carBrand} {b.carModel}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(b.startDate)} → {formatDate(b.endDate)}
                  </TableCell>
                  <TableCell className="font-semibold">{formatCurrency(b.totalAmount)}</TableCell>
                  <TableCell className="text-red-600">{formatCurrency(b.platformFee)}</TableCell>
                  <TableCell className="text-green-700 font-medium">{formatCurrency(b.ownerEarning)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${bookingStatusColor(b.status)}`}>
                      {bookingStatusLabel(b.status)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-gray-400">No bookings found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
