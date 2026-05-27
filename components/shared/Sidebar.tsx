'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Car,
  CalendarCheck,
  DollarSign,
  Wallet,
  Warehouse,
  UserCog,
  BarChart3,
  PackageCheck,
  ClipboardList,
  Truck,
  RotateCcw,
  AlertTriangle,
  Box,
  LogOut,
  CheckSquare,
} from 'lucide-react';

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/cars', label: 'Cars', icon: Car },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { href: '/admin/earnings', label: 'Earnings', icon: DollarSign },
  { href: '/admin/payouts', label: 'Payouts', icon: Wallet },
  { href: '/admin/hub', label: 'Hub Overview', icon: Warehouse },
  { href: '/admin/employees', label: 'Employees', icon: UserCog },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
];

const employeeNav = [
  { href: '/employee', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/employee/dropoffs', label: 'Pending Drop-Offs', icon: Truck },
  { href: '/employee/ready-cars', label: 'Ready Cars', icon: CheckSquare },
  { href: '/employee/pickups', label: "Today's Pickups", icon: PackageCheck },
  { href: '/employee/returns', label: "Today's Returns", icon: RotateCcw },
  { href: '/employee/damage-reports', label: 'Damage Reports', icon: AlertTriangle },
  { href: '/employee/inventory', label: 'Hub Inventory', icon: Box },
];

export default function Sidebar() {
  const { user, signOut, isAdmin } = useAuth();
  const pathname = usePathname();
  const navItems = isAdmin ? adminNav : employeeNav;

  return (
    <aside className="flex h-screen w-64 flex-col bg-brand text-white fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
          <Car className="w-5 h-5 text-brand" />
        </div>
        <div>
          <p className="font-bold text-lg leading-none">CarGo</p>
          <p className="text-xs text-white/60 mt-0.5">
            {isAdmin ? 'Admin Portal' : 'Employee Portal'}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === (isAdmin ? '/admin' : '/employee')
                ? pathname === href
                : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User + Signout */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-semibold">
            {user?.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.fullName}</p>
            <p className="text-xs text-white/50 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
