'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/shared/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import StatCard from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatCurrency, safeNumber } from '@/lib/utils';
import { getPlatformRevenue } from '@/services/payouts';
import { TrendingUp, Car, Users, CalendarCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#004B09', '#3B82F6', '#8B5CF6', '#10B981', '#EF4444', '#F59E0B'];

interface ReportData {
  monthlyBookings: { month: string; bookings: number; revenue: number }[];
  carUtilization: { car: string; trips: number }[];
  topOwners: { name: string; earnings: number }[];
  bookingStatusDist: { name: string; value: number }[];
  summary: {
    totalRevenue: number;
    avgBookingValue: number;
    completionRate: number;
    totalCars: number;
    activeCars: number;
  };
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadReports(); }, []);

  async function loadReports() {
    try {
      const [bookingsSnap, carsSnap, rev] = await Promise.all([
        getDocs(collection(db, 'bookings')),
        getDocs(collection(db, 'cars')),
        getPlatformRevenue(),
      ]);

      // Monthly breakdown (6 months)
      const now = new Date();
      const monthMap: Record<string, { bookings: number; revenue: number }> = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        monthMap[key] = { bookings: 0, revenue: 0 };
      }

      let totalBookingValue = 0;
      let paidBookingCount = 0;
      const bookingCounts: Record<string, number> = {};
      const carTrips: Record<string, { car: string; trips: number }> = {};
      const ownerEarnings: Record<string, { name: string; earnings: number }> = {};

      const PAID_STATUSES = new Set(['confirmed', 'in_trip', 'completed']);

      bookingsSnap.docs.forEach(d => {
        const b = d.data();
        const status = b.status as string;
        bookingCounts[status] = (bookingCounts[status] ?? 0) + 1;
        const bookingTotal = safeNumber(b.totalPrice ?? b.totalAmount);
        if (PAID_STATUSES.has(status)) {
          totalBookingValue += bookingTotal;
          paidBookingCount += 1;
        }

        const createdAt = b.createdAt?.toDate?.() ?? new Date(0);
        const key = createdAt.toLocaleString('default', { month: 'short', year: '2-digit' });
        if (key in monthMap) {
          monthMap[key].bookings += 1;
          const fee = safeNumber(b.platformFee) || Math.round(bookingTotal * 0.1);
          monthMap[key].revenue += fee;
        }

        if (b.carId) {
          if (!carTrips[b.carId]) carTrips[b.carId] = { car: `${b.carBrand ?? ''} ${b.carModel ?? ''}`.trim() || b.carId.slice(0, 8), trips: 0 };
          carTrips[b.carId].trips += 1;
        }

        if (status === 'completed' && b.ownerId) {
          if (!ownerEarnings[b.ownerId]) ownerEarnings[b.ownerId] = { name: b.ownerName ?? b.ownerId.slice(0, 8), earnings: 0 };
          ownerEarnings[b.ownerId].earnings += b.ownerEarning ?? 0;
        }
      });

      const totalBookings = bookingsSnap.size;
      const completed = bookingCounts['completed'] ?? 0;
      const activeCars = carsSnap.docs.filter(d => ['ready_for_rental', 'in_trip', 'at_hub'].includes(d.data().status)).length;

      setData({
        monthlyBookings: Object.entries(monthMap).map(([month, v]) => ({ month, ...v })),
        carUtilization: Object.values(carTrips).sort((a, b) => b.trips - a.trips).slice(0, 8),
        topOwners: Object.values(ownerEarnings).sort((a, b) => b.earnings - a.earnings).slice(0, 8),
        bookingStatusDist: Object.entries(bookingCounts).map(([name, value]) => ({ name, value })),
        summary: {
          totalRevenue: rev.total,
          avgBookingValue: paidBookingCount > 0 ? Math.round(totalBookingValue / paidBookingCount) : 0,
          completionRate: totalBookings > 0 ? Math.round((completed / totalBookings) * 100) : 0,
          totalCars: carsSnap.size,
          activeCars,
        },
      });
    } catch { toast.error('Failed to load reports'); }
    finally { setLoading(false); }
  }

  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  return (
    <>
      <Header title="Reports & Analytics" subtitle="Platform performance insights" />
      <div className="p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Platform Revenue" value={formatCurrency(data.summary.totalRevenue)} icon={TrendingUp} iconBg="bg-green-50" iconColor="text-green-600" />
          <StatCard title="Avg Booking Value" value={formatCurrency(data.summary.avgBookingValue)} icon={CalendarCheck} iconBg="bg-blue-50" iconColor="text-blue-600" />
          <StatCard title="Completion Rate" value={`${data.summary.completionRate}%`} icon={CalendarCheck} iconBg="bg-purple-50" iconColor="text-purple-600" />
          <StatCard title="Active Cars" value={`${data.summary.activeCars} / ${data.summary.totalCars}`} icon={Car} iconBg="bg-amber-50" iconColor="text-amber-600" />
        </div>

        {/* Monthly bookings + revenue */}
        <Card>
          <CardHeader><CardTitle className="text-base">Monthly Bookings & Revenue (6 months)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.monthlyBookings} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={v => `${v} SAR`} />
                <Tooltip formatter={(v: number, name: string) => name === 'revenue' ? formatCurrency(v) : v} />
                <Legend />
                <Bar yAxisId="left" dataKey="bookings" fill="#004B09" radius={[4, 4, 0, 0]} name="Bookings" />
                <Bar yAxisId="right" dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} name="revenue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Booking status distribution */}
          <Card>
            <CardHeader><CardTitle className="text-base">Booking Status Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={data.bookingStatusDist} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                    {data.bookingStatusDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top rented cars */}
          <Card>
            <CardHeader><CardTitle className="text-base">Top Rented Cars</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.carUtilization} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="car" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="trips" fill="#004B09" radius={[0, 4, 4, 0]} name="Trips" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top earning owners */}
        <Card>
          <CardHeader><CardTitle className="text-base">Top Earning Owners</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rank</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Owner</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Earnings</th>
                </tr>
              </thead>
              <tbody>
                {data.topOwners.map((o, i) => (
                  <tr key={o.name} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-200 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-800">{o.name}</td>
                    <td className="px-5 py-3 text-right font-semibold text-green-700">{formatCurrency(o.earnings)}</td>
                  </tr>
                ))}
                {data.topOwners.length === 0 && (
                  <tr><td colSpan={3} className="px-5 py-8 text-center text-gray-400">No completed bookings yet</td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
