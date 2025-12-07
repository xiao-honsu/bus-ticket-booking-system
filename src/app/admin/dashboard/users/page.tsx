'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const mockUsers = [
  {
    id: 'u-001',
    name: 'Nguyen Van A',
    email: 'a@example.com',
    role: 'admin',
    status: 'active',
    lastActive: '2h ago',
  },
  {
    id: 'u-002',
    name: 'Tran Thi B',
    email: 'b@example.com',
    role: 'operator',
    status: 'active',
    lastActive: '5h ago',
  },
  {
    id: 'u-003',
    name: 'Le Van C',
    email: 'c@example.com',
    role: 'user',
    status: 'blocked',
    lastActive: '1d ago',
  },
  {
    id: 'u-004',
    name: 'Pham Thi D',
    email: 'd@example.com',
    role: 'user',
    status: 'pending',
    lastActive: '3d ago',
  },
  {
    id: 'u-005',
    name: 'Hoang Van E',
    email: 'e@example.com',
    role: 'user',
    status: 'active',
    lastActive: '20m ago',
  },
];

export default function UserManagementPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filtered = useMemo(() => {
    return mockUsers.filter((u) => {
      const matchText = (u.name + u.email).toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'all' ? true : u.role === roleFilter;
      return matchText && matchRole;
    });
  }, [search, roleFilter]);

  const statusColor = (status: string) => {
    if (status === 'active') return 'bg-emerald-100 text-emerald-700';
    if (status === 'pending') return 'bg-amber-100 text-amber-700';
    return 'bg-rose-100 text-rose-700';
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">User Management</p>
            <h1 className="text-2xl font-bold">Users & Roles</h1>
            <p className="text-slate-600">Manage accounts, roles, and access state</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push('/admin')} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <Button className="gap-2" disabled>
              <UserPlus className="w-4 h-4" /> Add User
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-lg">Users ({filtered.length})</CardTitle>
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <Input
                placeholder="Search name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="md:w-64"
              />
              <select
                className="border rounded-md px-3 py-2 text-sm bg-white"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All roles</option>
                <option value="admin">Admin</option>
                <option value="operator">Operator</option>
                <option value="user">User</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="text-left px-4 py-2">User</th>
                    <th className="text-left px-4 py-2">Email</th>
                    <th className="text-left px-4 py-2">Role</th>
                    <th className="text-left px-4 py-2">Status</th>
                    <th className="text-left px-4 py-2">Last Active</th>
                    <th className="text-left px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr key={user.id} className="border-b last:border-none">
                      <td className="px-4 py-3 font-medium">{user.name}</td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3 capitalize">{user.role}</td>
                      <td className="px-4 py-3">
                        <Badge className={statusColor(user.status)}>{user.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{user.lastActive}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <Button size="sm" variant="outline" disabled>
                          Set role
                        </Button>
                        <Button size="sm" variant="outline" disabled>
                          Reset pwd
                        </Button>
                        <Button size="sm" variant="destructive" disabled>
                          Disable
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-500 mt-4">All actions are demo only. Integrate API to enable.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
