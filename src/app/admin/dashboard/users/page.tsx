'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetUsersQuery, useResetUserPasswordMutation, useBlockUserMutation } from '@/lib/store/services/api';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function UserManagementPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Dialog states
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Fetch users
  const { data: usersData, isLoading } = useGetUsersQuery({ page: 1, limit: 100 });

  const [resetPassword] = useResetUserPasswordMutation();
  const [blockUser] = useBlockUserMutation();

  const filtered = useMemo(() => {
    const users = usersData?.results || [];
    return users.filter((u: any) => {
      const matchText = (u.name + u.email).toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'all' ? true : u.role === roleFilter;
      return matchText && matchRole;
    });
  }, [usersData?.results, search, roleFilter]);

  const statusColor = (status: string) => {
    if (status === 'active') return 'bg-emerald-100 text-emerald-700';
    if (status === 'pending') return 'bg-amber-100 text-amber-700';
    return 'bg-rose-100 text-rose-700';
  };

  const handleResetPasswordClick = (userId: string) => {
    setSelectedUserId(userId);
    setNewPassword('');
    setConfirmPassword('');
    setShowResetPasswordDialog(true);
  };

  const handleConfirmResetPassword = async () => {
    if (!selectedUserId) return;
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in both password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      await resetPassword({ userId: selectedUserId, password: newPassword }).unwrap();
      toast.success('Password reset successfully');
      setShowResetPasswordDialog(false);
      setSelectedUserId(null);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to reset password');
    }
  };

  const handleBlockClick = (userId: string) => {
    setSelectedUserId(userId);
    setShowBlockConfirm(true);
  };

  const handleConfirmBlock = async () => {
    if (!selectedUserId) return;
    try {
      await blockUser(selectedUserId).unwrap();
      toast.success('User blocked successfully');
      setShowBlockConfirm(false);
      setSelectedUserId(null);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to block user');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">User Management</p>
            <h1 className="text-2xl font-bold">Users & Roles</h1>
            <p className="text-slate-600">Manage accounts and access state</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/admin')} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-4 h-4" /> Users ({filtered.length})
            </CardTitle>
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
            {isLoading ? (
              <div className="text-center py-8 text-slate-500">Loading users...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No users found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="text-left px-4 py-2">User</th>
                      <th className="text-left px-4 py-2">Email</th>
                      <th className="text-left px-4 py-2">Role</th>
                      <th className="text-left px-4 py-2">Status</th>
                      <th className="text-left px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((user: any) => (
                      <tr key={user.id} className="border-b last:border-none hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium">{user.name}</td>
                        <td className="px-4 py-3 text-sm">{user.email}</td>
                        <td className="px-4 py-3 capitalize text-sm">{user.role}</td>
                        <td className="px-4 py-3">
                          <Badge className={statusColor(user.status)}>{user.status}</Badge>
                        </td>
                        <td className="px-4 py-3 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResetPasswordClick(user.id)}
                            disabled={user.status === 'suspended'}
                          >
                            Reset pwd
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleBlockClick(user.id)}
                            disabled={user.status === 'suspended'}
                          >
                            Block
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reset Password Dialog */}
      <Dialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset User Password</DialogTitle>
            <DialogDescription>Enter a new password for this user account</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmResetPassword}>Reset Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block Confirmation Dialog */}
      <AlertDialog open={showBlockConfirm} onOpenChange={setShowBlockConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block User Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to block this user? Their account status will change to suspended and they won't be
              able to log in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Keep Active</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmBlock}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Block User
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
