'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/shared/Header';
import StatCard from '@/components/shared/StatCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Truck, CheckSquare, PackageCheck, RotateCcw, AlertTriangle, Box } from 'lucide-react';
import { getTodayBookings } from '@/services/bookings';
import { formatDate } from '@/lib/utils';
import { Booking } from '@/types';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Stats {
  pendingDropoffs: number;
  pendingInspections: number;
  readyCars: number;
  todayPickups: number;
  todayReturns: number;
  openDamageReports: number;
  totalInventory: number;
}

export default function EmployeeDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [todayPickups, setTodayPickups] = useState<Booking[]>([]);
  const [todayReturns, setTodayReturns] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [carsSnap, dmgSnap, pickups, returns] = await Promise.all([
        getDocs(collection(db, 'cars')),
        getDocs(query(collection(db, 'damage_reports'), where('status', '==', 'open'))),
        getTodayBookings('pickup'),
        getTodayBookings('return'),
      ]);

      const carCounts: Record<string, number> = {};
      carsSnap.docs.forEach(d => {
        const s = d.data().status as string;
        carCounts[s] = (carCounts[s] ?? 0) + 1;
      });

      setStats({
        pendingDropoffs: (carCounts['awaiting_employee_verification'] ?? 0) +
          (carCounts['awaiting_owner_dropoff'] ?? 0) +
          (carCounts['awaiting_dropoff'] ?? 0),
        pendingInspections: carCounts['pending_inspection'] ?? 0,
        readyCars: carCounts['ready_for_rental'] ?? 0,
        todayPickups: pickups.length,
        todayReturns: returns.length,
        openDamageReports: dmgSnap.size,
        totalInventory: (carCounts['at_hub'] ?? 0) + (carCounts['ready_for_rental'] ?? 0) + (carCounts['maintenance'] ?? 0),
      });

      setTodayPickups(pickups);
      setTodayReturns(returns);
    } catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Header title="Employee Dashboard" subtitle="Hub operations — CarGo Hub Al Yasmin, Riyadh" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Pending Drop-Offs"
            value={stats?.pendingDropoffs ?? 0}
            icon={Truck}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          />
          <StatCard
            title="Ready for Rental"
            value={stats?.readyCars ?? 0}
            icon={CheckSquare}
            iconBg="bg-green-50"
            iconColor="text-green-600"
          />
          <StatCard
            title="Today's Pickups"
            value={stats?.todayPickups ?? 0}
            icon={PackageCheck}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatCard
            title="Today's Returns"
            value={stats?.todayReturns ?? 0}
            icon={RotateCcw}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatCard
            title="Open Damage Reports"
            value={stats?.openDamageReports ?? 0}
            icon={AlertTriangle}
            iconBg="bg-red-50"
            iconColor="text-red-600"
          />
          <StatCard
            title="Hub Inventory"
            value={stats?.totalInventory ?? 0}
            icon={Box}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
          />
        </div>

        {/* Quick action cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { href: '/employee/dropoffs', label: 'Confirm Drop-Off', desc: 'Verify owner vehicle arrival', icon: Truck, color: 'text-amber-600 bg-amber-50' },
            { href: '/employee/pickups', label: 'Confirm Pickup', desc: "Hand over keys to renter", icon: PackageCheck, color: 'text-blue-600 bg-blue-50' },
            { href: '/employee/returns', label: 'Confirm Return', desc: 'Process vehicle return', icon: RotateCcw, color: 'text-purple-600 bg-purple-50' },
            { href: '/employee/ready-cars', label: 'Mark Ready', desc: 'Set inspected car as ready', icon: CheckSquare, color: 'text-green-600 bg-green-50' },
            { href: '/employee/damage-reports', label: 'Damage Reports', desc: 'View and manage damage', icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
            { href: '/employee/inventory', label: 'Hub Inventory', desc: 'View all vehicles at hub', icon: Box, color: 'text-indigo-600 bg-indigo-50' },
          ].map(({ href, label, desc, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-brand/20 transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="font-semibold text-gray-800 group-hover:text-brand transition-colors">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </Link>
          ))}
        </div>

        {/* Today's schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-blue-500" /> Today&apos;s Pickups
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {todayPickups.length > 0 ? todayPickups.map(b => (
                <div key={b.bookingId} className="flex items-center justify-between px-5 py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{b.renterName || '—'}</p>
                    <p className="text-xs text-gray-400">{b.carBrand} {b.carModel}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{formatDate(b.startDate)}</p>
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-blue-100 text-blue-700 font-medium">
                      Pickup
                    </span>
                  </div>
                </div>
              )) : (
                <div className="px-5 py-6 text-center text-sm text-gray-400">No pickups scheduled for today</div>
              )}
              {todayPickups.length > 0 && (
                <div className="px-5 py-3">
                  <Link href="/employee/pickups">
                    <Button variant="ghost" size="sm" className="w-full text-brand">View All Pickups</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-purple-500" /> Today&apos;s Returns
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {todayReturns.length > 0 ? todayReturns.map(b => (
                <div key={b.bookingId} className="flex items-center justify-between px-5 py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{b.renterName || '—'}</p>
                    <p className="text-xs text-gray-400">{b.carBrand} {b.carModel}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{formatDate(b.endDate)}</p>
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-purple-100 text-purple-700 font-medium">
                      Return
                    </span>
                  </div>
                </div>
              )) : (
                <div className="px-5 py-6 text-center text-sm text-gray-400">No returns scheduled for today</div>
              )}
              {todayReturns.length > 0 && (
                <div className="px-5 py-3">
                  <Link href="/employee/returns">
                    <Button variant="ghost" size="sm" className="w-full text-brand">View All Returns</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
