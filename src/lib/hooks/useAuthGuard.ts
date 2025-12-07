'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { logout } from '@/lib/store/features/auth/authSlice';
import { useLogoutMutation } from '@/lib/store/services/api';
import { toast } from 'sonner';
import { clearAuthCookies } from '@/lib/utils/cookies';

interface UseAuthGuardOptions {
  redirectIfAuthenticated?: boolean;
  targetPage?: 'login' | 'register';
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const { redirectIfAuthenticated = false, targetPage = 'login' } = options;
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [logoutApi] = useLogoutMutation();

  useEffect(() => {
    if (redirectIfAuthenticated && isAuthenticated) {
      // Show modal instead of auto-redirect
      setShowLogoutDialog(true);
    }
  }, [redirectIfAuthenticated, isAuthenticated]);

  const handleLogout = async () => {
    try {
      // Call logout API to clear httpOnly cookies on backend
      await logoutApi({}).unwrap();
    } catch (error) {
      // Continue logout even if API call fails
      console.error('Logout API error:', error);
    }

    // Clear Redux state
    dispatch(logout());

    // Clear client-side cookies
    clearAuthCookies();

    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }

    setShowLogoutDialog(false);
    toast.success('Logged out successfully');

    // Now safe to stay on the page, form will be accessible
  };

  const handleCancel = () => {
    setShowLogoutDialog(false);
    // Redirect back to previous page or home
    router.back();
  };

  return {
    isAuthenticated,
    user,
    showLogoutDialog,
    setShowLogoutDialog,
    handleLogout,
    handleCancel,
    targetPage,
  };
}
