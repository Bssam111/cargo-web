'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Header from '@/components/shared/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import ReturnModal from '@/components/employee/ReturnModal';
import { getPendingReturns } from '@/services/bookings';
import { Booking } from '@/types';
import { formatDate, formatCurrency, normalizeFirestoreDate, isSameLocalDay } from '@/lib/utils';
import { RotateCcw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReturnsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Booking | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try { setBookings(await getPendingReturns()); }
    catch { toast.error('Failed to load pending returns'); }
    finally { setLoading(false); }
  }

  if (loading) return <LoadingSpinner />;

  const today = new Date();

  return (
    <>
      <Header
        title="Pending Returns"
        subtitle={`${bookings.length} vehicle${bookings.length !== 1 ? 's' : ''} out with renters`}
      />
      <div className="p-6">
        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm">
            <RotateCcw className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No active trips</p>
            <p className="text-sm text-gray-400 mt-1">No vehicles are currently out with renters</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookings.map(b => {
              const endDate = normalizeFirestoreDate(b.endDate);
              const isDueToday = endDate ? isSameLocalDay(endDate, today) : false;
              const isOverdue = endDate ? endDate < today && !isSameLocalDay(endDate, today) : false;

              return (
                <div
                  key={b.bookingId}
                  className={`bg-white rounded-xl border shadow-sm p-5 ${isOverdue ? 'border-red-200' : 'border-gray-200'}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Car image */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {b.carImage ? (
                        <Image
                          src={b.carImage}
                          alt={`${b.carBrand} ${b.carModel}`}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                          No img
                        </div>
                      )}
                    </div>

                    <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Renter</p>
                        <p className="font-semibold text-gray-800 mt-0.5">{b.renterName || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Car</p>
                        <p className="text-sm text-gray-600 mt-0.5">{b.carBrand} {b.carModel}</p>
                        <p className="text-xs text-gray-400">{b.ownerName ? `Owner: ${b.ownerName}` : ''}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Trip Start</p>
                        <p className="text-sm text-gray-600 mt-0.5">{formatDate(b.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Due Back</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {(isOverdue || isDueToday) && (
                            <AlertCircle className={`w-3.5 h-3.5 shrink-0 ${isOverdue ? 'text-red-500' : 'text-amber-500'}`} />
                          )}
                          <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' : isDueToday ? 'text-amber-600' : 'text-gray-600'}`}>
                            {isOverdue ? 'Overdue · ' : isDueToday ? 'Today · ' : ''}{formatDate(b.endDate)}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Total</p>
                        <p className="font-semibold text-gray-800 mt-0.5">{formatCurrency(b.totalAmount)}</p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant={isOverdue ? 'destructive' : 'default'}
                      onClick={() => setSelected(b)}
                    >
                      <RotateCcw className="w-4 h-4 mr-1" /> Confirm Return
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ReturnModal
        booking={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onConfirmed={loadData}
      />
    </>
  );
}
