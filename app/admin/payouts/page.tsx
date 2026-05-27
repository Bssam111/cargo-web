'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/shared/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { getPayouts, updatePayoutStatus } from '@/services/payouts';
import { useAuth } from '@/contexts/AuthContext';
import { Payout, PayoutStatus } from '@/types';
import { formatCurrency, formatDate, payoutStatusColor } from '@/lib/utils';
import { CheckCircle, XCircle, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PayoutsPage() {
  const { user } = useAuth();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [filtered, setFiltered] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<Payout | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | 'paid' | null>(null);
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { loadPayouts(); }, []);
  useEffect(() => {
    setFiltered(statusFilter === 'all' ? payouts : payouts.filter(p => p.status === statusFilter));
  }, [payouts, statusFilter]);

  async function loadPayouts() {
    try { setPayouts(await getPayouts()); }
    catch { toast.error('Failed to load payouts'); }
    finally { setLoading(false); }
  }

  async function handleAction() {
    if (!selected || !action || !user) return;
    const statusMap: Record<string, PayoutStatus> = { approve: 'approved', reject: 'rejected', paid: 'paid' };
    setActionLoading(true);
    try {
      await updatePayoutStatus(selected.payoutId, statusMap[action], user.uid, notes);
      toast.success(`Payout ${action}d successfully`);
      setSelected(null);
      setAction(null);
      setNotes('');
      loadPayouts();
    } catch { toast.error('Failed to update payout'); }
    finally { setActionLoading(false); }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Header title="Payout Management" subtitle="Review and process owner withdrawal requests" />
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-44">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payouts</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <span className="text-sm text-gray-500 ml-2">{filtered.length} results</span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Owner</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Processed</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => (
                <TableRow key={p.payoutId}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{p.ownerName || '—'}</p>
                      <p className="text-xs text-gray-400">{p.ownerEmail || p.ownerId}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-gray-800">{formatCurrency(p.amount)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${payoutStatusColor(p.status)}`}>
                      {p.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-500">{formatDate(p.requestedAt)}</TableCell>
                  <TableCell className="text-gray-400 text-sm">
                    {p.processedAt ? formatDate(p.processedAt) : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {p.status === 'pending' && (
                        <>
                          <button
                            onClick={() => { setSelected(p); setAction('approve'); }}
                            className="flex items-center gap-1 text-xs text-green-600 hover:bg-green-50 px-2 py-1.5 rounded-md font-medium"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => { setSelected(p); setAction('reject'); }}
                            className="flex items-center gap-1 text-xs text-red-600 hover:bg-red-50 px-2 py-1.5 rounded-md font-medium"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      )}
                      {p.status === 'approved' && (
                        <button
                          onClick={() => { setSelected(p); setAction('paid'); }}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded-md font-medium"
                        >
                          <Banknote className="w-3.5 h-3.5" /> Mark Paid
                        </button>
                      )}
                      {(p.status === 'paid' || p.status === 'rejected') && (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-gray-400">No payouts found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Action Dialog */}
      <Dialog open={!!selected} onOpenChange={v => !v && setSelected(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' ? 'Approve Payout' : action === 'reject' ? 'Reject Payout' : 'Mark as Paid'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            {selected && (
              <p className="text-sm text-gray-600">
                {action === 'approve' && `Approve payout of ${formatCurrency(selected.amount)} for ${selected.ownerName}?`}
                {action === 'reject' && `Reject payout request from ${selected.ownerName}?`}
                {action === 'paid' && `Confirm payment of ${formatCurrency(selected.amount)} to ${selected.ownerName}?`}
              </p>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
              <textarea
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            <Button
              onClick={handleAction}
              disabled={actionLoading}
              variant={action === 'reject' ? 'destructive' : 'default'}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
