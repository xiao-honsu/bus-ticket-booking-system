'use client';

import RegisterForm from '@/containers/auth/RegisterForm';
import LogoutConfirmDialog from '@/components/auth/LogoutConfirmDialog';
import { useAuthGuard } from '@/lib/hooks';

export default function RegisterPage() {
  const { showLogoutDialog, setShowLogoutDialog, handleLogout, handleCancel, targetPage } = useAuthGuard({
    redirectIfAuthenticated: true,
    targetPage: 'register',
  });

  return (
    <>
      <main className="container mx-auto px-4 py-16">
        <RegisterForm />
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
