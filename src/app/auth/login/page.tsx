'use client';

import LoginForm from '@/containers/auth/LoginForm';
import LogoutConfirmDialog from '@/components/auth/LogoutConfirmDialog';
import { useAuthGuard } from '@/lib/hooks';

export default function LoginPage() {
  const { showLogoutDialog, setShowLogoutDialog, handleLogout, handleCancel, targetPage } = useAuthGuard({
    redirectIfAuthenticated: true,
    targetPage: 'login',
  });

  return (
    <>
      <main className="container mx-auto px-4 py-16">
        <LoginForm />
      </main>
      <LogoutConfirmDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={handleLogout}
        targetPage={targetPage}
      />
    </>
  );
}
