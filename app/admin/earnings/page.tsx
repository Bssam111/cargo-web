'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/shared/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import StatCard from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { getTransactions, getPlatformRevenue } from '@/services/payouts';
import { Transaction } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DollarSign, TrendingUp, CreditCard, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EarningsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [revenue, setRevenue] = useState({ total: 0, thisMonth: 0, lastMonth: 0 });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<{ month: string; revenue: number }[]>([]);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [txns, rev] = await Promise.all([getTransactions(), getPlatformRevenue()]);
      setTransactions(txns);
      setRevenue(rev);

      // Build 6-month chart data from transactions
      const monthMap: Record<string, number> = {};
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        monthMap[key] = 0;
      }
      txns.filter(t => t.type === 'platform_fee').forEach(t => {
        const d = t.createdAt instanceof Date ? t.createdAt : (t.createdAt as { toDate(): Date }).toDate?.();
        if (!d) return;
        const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        if (key in monthMap) monthMap[key] += t.amount;
      });
      setChartData(Object.entries(monthMap).map(([month, revenue]) => ({ month, revenue })));
    } catch { toast.error('Failed to load earnings data'); }
    finally { setLoading(false); }
  }

  const growthPct = revenue.lastMonth > 0
    ? Math.round(((revenue.thisMonth - revenue.lastMonth) / revenue.lastMonth) * 100)
    : 0;

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Header title="Earnings & Revenue" subtitle="Platform commission and financial overview" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Platform Revenue"
            value={formatCurrency(revenue.total)}
            icon={DollarSign}
            iconBg="bg-green-50"
            iconColor="text-green-600"
          />
          <StatCard
            title="This Month"
            value={formatCurrency(revenue.thisMonth)}
            icon={TrendingUp}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            trend={revenue.lastMonth > 0 ? { value: growthPct, label: 'vs last month' } : undefined}
          />
          <StatCard
            title="Last Month"
            value={formatCurrency(revenue.lastMonth)}
            icon={CreditCard}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue Trend (6 months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#004B09" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#004B09" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v} SAR`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Area type="monotone" dataKey="revenue" stroke="#004B09" fill="url(#revenueGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Transaction History</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.slice(0, 50).map(t => (
                  <TableRow key={t.transactionId}>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        t.type === 'platform_fee' ? 'bg-green-100 text-green-700' :
                        t.type === 'booking_earning' ? 'bg-blue-100 text-blue-700' :
                        t.type === 'withdrawal' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {t.type.replace(/_/g, ' ')}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-600">{t.description}</TableCell>
                    <TableCell className={`font-semibold ${t.type === 'withdrawal' ? 'text-red-600' : 'text-green-700'}`}>
                      {t.type === 'withdrawal' ? '-' : '+'}{formatCurrency(t.amount)}
                    </TableCell>
                    <TableCell className="text-gray-400 text-sm">{formatDate(t.createdAt)}</TableCell>
                  </TableRow>
                ))}
                {transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-gray-400">No transactions yet</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
