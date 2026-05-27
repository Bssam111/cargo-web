'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/shared/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getDamageReports } from '@/services/inspections';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DamageReport } from '@/types';
import { formatDate } from '@/lib/utils';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DamageReportsPage() {
  const [reports, setReports] = useState<DamageReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'open' | 'resolved' | 'all'>('open');

  useEffect(() => { loadData(); }, [filter]);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getDamageReports(filter === 'all' ? undefined : filter);
      setReports(data);
    } catch { toast.error('Failed to load damage reports'); }
    finally { setLoading(false); }
  }

  async function resolveReport(reportId: string) {
    try {
      await updateDoc(doc(db, 'damage_reports', reportId), {
        status: 'resolved',
        resolvedAt: serverTimestamp(),
      });
      toast.success('Report marked as resolved');
      loadData();
    } catch { toast.error('Failed to resolve report'); }
  }

  const severityColor: Record<string, string> = {
    minor: 'bg-amber-100 text-amber-700',
    moderate: 'bg-orange-100 text-orange-700',
    severe: 'bg-red-100 text-red-700',
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Header title="Damage Reports" subtitle="Vehicle damage records from inspections" />
      <div className="p-6 space-y-5">
        <div className="flex gap-2">
          {(['open', 'resolved', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-brand text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {reports.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm">
            <AlertTriangle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No damage reports</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Car ID</TableHead>
                  <TableHead>Booking</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Photos</TableHead>
                  <TableHead>Reported</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map(r => (
                  <TableRow key={r.reportId}>
                    <TableCell className="font-mono text-xs text-gray-500">{r.carId.slice(0, 8)}…</TableCell>
                    <TableCell className="font-mono text-xs text-gray-500">{r.bookingId.slice(0, 8)}…</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${severityColor[r.severity]}`}>
                        {r.severity}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-48 truncate text-gray-600">{r.description}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${r.status === 'open' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {r.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{r.photos.length} photo(s)</TableCell>
                    <TableCell className="text-gray-400 text-sm">{formatDate(r.createdAt)}</TableCell>
                    <TableCell>
                      {r.status === 'open' && (
                        <button
                          onClick={() => resolveReport(r.reportId)}
                          className="flex items-center gap-1 text-xs text-green-600 hover:bg-green-50 px-2 py-1.5 rounded-md font-medium"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Resolve
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
}
