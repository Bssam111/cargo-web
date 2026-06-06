'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/shared/Header';
import StatCard from '@/components/shared/StatCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  DollarSign, Car, Users, CalendarCheck, Warehouse, Wallet, TrendingUp, CheckCircle,
} from 'lucide-react';
import { formatCurrency, bookingStatusLabel } from '@/lib/utils';
import { getUserRole } from '@/lib/roleUtils';
import { getRecentBookings } from '@/services/bookings';
import { isCarAtHub } from '@/services/cars';
import { getPlatformRevenue } from '@/services/payouts';
import { Booking } from '@/types';

const PIE_COLORS = ['#004B09', '#3B82F6', '#8B5CF6', '#10B981', '#EF4444', '#F59E0B'];

interface Stats {
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  pendingBookings: number;
  totalCars: number;
  carsAtHub: number;
  carsInTrip: number;
  totalOwners: number;
  totalRenters: number;
  totalRevenue: number;
  pendingPayouts: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [bookingsByStatus, setBookingsByStatus] = useState<{ name: string; value: number }[]>([]);
  const [carsByStatus, setCarsByStatus] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const [bookingsSnap, carsSnap, usersSnap, rev, payoutsSnap, recent] = await Promise.all([
        getDocs(collection(db, 'bookings')),
        getDocs(collection(db, 'cars')),
        getDocs(collection(db, 'users')),
        getPlatformRevenue(),
        getDocs(query(collection(db, 'payouts'), where('status', '==', 'pending'))),
        getRecentBookings(8),
      ]);

      const bookingCounts: Record<string, number> = {};
      bookingsSnap.docs.forEach(d => {
        const s = d.data().status as string;
        bookingCounts[s] = (bookingCounts[s] ?? 0) + 1;
      });

      const carCounts: Record<string, number> = {};
      let carsAtHubCount = 0;
      carsSnap.docs.forEach(d => {
        const s = d.data().status as string;
        carCounts[s] = (carCounts[s] ?? 0) + 1;
        if (isCarAtHub(s)) carsAtHubCount++;
      });

      const roleCounts: Record<string, number> = {};
      usersSnap.docs.forEach(d => {
        const r = getUserRole(d.data() as Record<string, unknown>);
        if (r) roleCounts[r] = (roleCounts[r] ?? 0) + 1;
      });

      setStats({
        totalBookings: bookingsSnap.size,
        activeBookings: (bookingCounts['confirmed'] ?? 0) + (bookingCounts['in_trip'] ?? 0),
        completedBookings: bookingCounts['completed'] ?? 0,
        pendingBookings: bookingCounts['pending'] ?? 0,
        totalCars: carsSnap.size,
        carsAtHub: carsAtHubCount,
        carsInTrip: carCounts['in_trip'] ?? 0,
        totalOwners: roleCounts['owner'] ?? 0,
        totalRenters: roleCounts['renter'] ?? 0,
        totalRevenue: rev.total,
        pendingPayouts: payoutsSnap.size,
      });

      setBookingsByStatus(
        Object.entries(bookingCounts).map(([name, value]) => ({
          name: bookingStatusLabel(name),
          value,
        }))
      );

      setCarsByStatus(
        Object.entries(carCounts).map(([name, count]) => ({ name, count }))
      );

      setRecentBookings(recent);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Header title="Dashboard" subtitle="Platform overview at a glance" />
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Platform Revenue"
            value={formatCurrency(stats?.totalRevenue ?? 0)}
            icon={DollarSign}
            iconBg="bg-green-50"
            iconColor="text-green-600"
          />
          <StatCard
            title="Total Bookings"
            value={stats?.totalBookings ?? 0}
            subtitle={`${stats?.activeBookings ?? 0} active`}
            icon={CalendarCheck}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatCard
            title="Total Cars"
            value={stats?.totalCars ?? 0}
            subtitle={`${stats?.carsAtHub ?? 0} at hub`}
            icon={Car}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
          />
          <StatCard
            title="Pending Payouts"
            value={stats?.pendingPayouts ?? 0}
            icon={Wallet}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Completed Bookings"
            value={stats?.completedBookings ?? 0}
            icon={CheckCircle}
            iconBg="bg-green-50"
            iconColor="text-green-600"
          />
          <StatCard
            title="Cars in Trip"
            value={stats?.carsInTrip ?? 0}
            icon={TrendingUp}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
          />
          <StatCard
            title="Total Owners"
            value={stats?.totalOwners ?? 0}
            icon={Users}
            iconBg="bg-teal-50"
            iconColor="text-teal-600"
          />
          <StatCard
            title="Total Renters"
            value={stats?.totalRenters ?? 0}
            icon={Users}
            iconBg="bg-sky-50"
            iconColor="text-sky-600"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cars by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={carsByStatus} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#004B09" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bookings by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={bookingsByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {bookingsByStatus.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Booking ID', 'Renter', 'Car', 'Status', 'Amount'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map(b => (
                    <tr key={b.bookingId} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{b.bookingId.slice(0, 8)}…</td>
                      <td className="px-4 py-3 font-medium">{b.renterName ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{b.carBrand} {b.carModel}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          b.status === 'completed' ? 'bg-green-100 text-green-700' :
                          b.status === 'in_trip' ? 'bg-purple-100 text-purple-700' :
                          b.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {bookingStatusLabel(b.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        {formatCurrency(b.totalAmount)}
                      </td>
                    </tr>
                  ))}
                  {recentBookings.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No bookings yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
