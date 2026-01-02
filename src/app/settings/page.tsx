'use client';

import { useState } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { User, Mail, Phone, Lock } from 'lucide-react';

export default function SettingsPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = () => {
    // TODO: Implement password change logic with API call
    console.log('Changing password...', passwordData);
    setIsPasswordDialogOpen(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account information and preferences</p>
        </div>

        {/* Profile Information */}
        <Card className="border-border bg-card mb-6">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">
                  Full Name
                </Label>
                {isEditing ? (
                  <Input id="name" defaultValue={user?.name} className="bg-background" />
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-md bg-muted/50">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{user?.name || 'N/A'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email Address
                </Label>
                <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-md bg-muted/50">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{user?.email || 'N/A'}</span>
                </div>
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">
                  Phone Number
                </Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    defaultValue={user?.phone || ''}
                    placeholder="Enter phone number"
                    className="bg-background"
                  />
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-md bg-muted/50">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{user?.phone || 'Not provided'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Account Type</Label>
                <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-md bg-muted/50">
                  <Badge variant="outline" className="capitalize">
                    {user?.role || 'user'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsEditing(false)}>Save Changes</Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-border bg-card mb-6">
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your password and account security</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">Password</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Last changed 2 months ago</p>
                </div>
                <Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)}>
                  Change Password
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Account Status</span>
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                  Active
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Member Since</span>
                <span className="text-foreground">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    : 'N/A'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Update your account password. Make sure it's strong and secure.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePasswordChange}>Update Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
