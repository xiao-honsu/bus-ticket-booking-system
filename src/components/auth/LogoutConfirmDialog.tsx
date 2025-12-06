'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface LogoutConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  targetPage: 'login' | 'register';
}

export default function LogoutConfirmDialog({ open, onOpenChange, onConfirm, targetPage }: LogoutConfirmDialogProps) {
  const pageName = targetPage === 'login' ? 'Login' : 'Register';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Already Logged In</AlertDialogTitle>
          <AlertDialogDescription>
            You are currently logged in. To access the {pageName.toLowerCase()} page, you need to log out first. Do you
            want to log out and continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Logout and Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
