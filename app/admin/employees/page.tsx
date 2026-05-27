'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/shared/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getUsers, createEmployee, updateUserStatus } from '@/services/users';
import { PortalUser } from '@/types';
import { formatDate } from '@/lib/utils';
import { Plus, UserX, UserCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<PortalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', phone: '', employeeId: '', hubLocation: 'CarGo Hub — Al Yasmin, Riyadh',
  });

  useEffect(() => { loadEmployees(); }, []);

  async function loadEmployees() {
    try { setEmployees(await getUsers('employee')); }
    catch { toast.error('Failed to load employees'); }
    finally { setLoading(false); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password || !form.employeeId) {
      toast.error('Please fill in all required fields');
      return;
    }
    setCreating(true);
    try {
      await createEmployee(form);
      toast.success('Employee account created');
      setOpen(false);
      setForm({ fullName: '', email: '', password: '', phone: '', employeeId: '', hubLocation: 'CarGo Hub — Al Yasmin, Riyadh' });
      loadEmployees();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create employee';
      toast.error(msg);
    } finally { setCreating(false); }
  }

  async function toggleStatus(uid: string, isActive: boolean) {
    try {
      await updateUserStatus(uid, !isActive);
      setEmployees(prev => prev.map(e => e.uid === uid ? { ...e, isActive: !isActive } : e));
      toast.success(isActive ? 'Employee deactivated' : 'Employee activated');
    } catch { toast.error('Failed to update status'); }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Header title="Employee Management" subtitle={`${employees.length} employees`} />
      <div className="p-6 space-y-5">
        <div className="flex justify-end">
          <Button onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4" /> Add Employee
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Hub Location</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map(e => (
                <TableRow key={e.uid}>
                  <TableCell className="font-medium">{e.fullName}</TableCell>
                  <TableCell className="text-gray-500">{e.email}</TableCell>
                  <TableCell className="text-gray-500">{e.phone || '—'}</TableCell>
                  <TableCell className="font-mono text-sm">{(e as { employeeId?: string }).employeeId || '—'}</TableCell>
                  <TableCell className="text-gray-600 text-sm">{(e as { hubLocation?: string }).hubLocation || '—'}</TableCell>
                  <TableCell className="text-gray-400 text-sm">{formatDate(e.createdAt)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${e.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {e.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleStatus(e.uid, e.isActive !== false)}
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-md ${e.isActive !== false ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                    >
                      {e.isActive !== false ? <><UserX className="w-3.5 h-3.5" /> Deactivate</> : <><UserCheck className="w-3.5 h-3.5" /> Activate</>}
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              {employees.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-10 text-gray-400">No employees yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add New Employee</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                <Input value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Employee ID *</label>
                <Input value={form.employeeId} onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
              <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
              <Input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required minLength={6} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <Input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Hub Location</label>
              <Input value={form.hubLocation} onChange={e => setForm(p => ({ ...p, hubLocation: e.target.value }))} />
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={creating}>
                {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : 'Create Employee'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
