'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/shared/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getUsers, updateUserStatus } from '@/services/users';
import { PortalUser, UserRole } from '@/types';
import { formatDate } from '@/lib/utils';
import { Search, UserCheck, UserX } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const [users, setUsers] = useState<PortalUser[]>([]);
  const [filtered, setFiltered] = useState<PortalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => { loadUsers(); }, []);

  useEffect(() => {
    let result = users;
    if (roleFilter !== 'all') result = result.filter(u => u.role === roleFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.includes(q)
      );
    }
    setFiltered(result);
  }, [users, search, roleFilter]);

  async function loadUsers() {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }

  async function toggleStatus(uid: string, isActive: boolean) {
    try {
      await updateUserStatus(uid, !isActive);
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, isActive: !isActive } : u));
      toast.success(isActive ? 'User deactivated' : 'User activated');
    } catch { toast.error('Failed to update user status'); }
  }

  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-700',
    employee: 'bg-purple-100 text-purple-700',
    owner: 'bg-blue-100 text-blue-700',
    renter: 'bg-green-100 text-green-700',
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Header title="Users Management" subtitle={`${users.length} total users`} />
      <div className="p-6 space-y-5">
        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-52">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, phone…"
              className="pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="w-40">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger><SelectValue placeholder="All Roles" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="owner">Owners</SelectItem>
                <SelectItem value="renter">Renters</SelectItem>
                <SelectItem value="employee">Employees</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(u => (
                <TableRow key={u.uid}>
                  <TableCell className="font-medium">{u.fullName || '—'}</TableCell>
                  <TableCell className="text-gray-500">{u.email}</TableCell>
                  <TableCell className="text-gray-500">{u.phone || '—'}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${u.role ? roleColors[u.role] ?? 'bg-gray-100 text-gray-600' : 'bg-gray-100 text-gray-600'}`}>
                      {u.role ?? '—'}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-500">{formatDate(u.createdAt)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${u.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleStatus(u.uid, u.isActive !== false)}
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors ${
                        u.isActive !== false
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {u.isActive !== false
                        ? <><UserX className="w-3.5 h-3.5" /> Deactivate</>
                        : <><UserCheck className="w-3.5 h-3.5" /> Activate</>
                      }
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-gray-400">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
