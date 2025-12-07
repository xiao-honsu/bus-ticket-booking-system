'use client';

import { Suspense } from 'react';
import ResetPasswordForm from '@/containers/auth/ResetPasswordForm';

function ResetPasswordContent() {
  return <ResetPasswordForm />;
}

export default function ResetPasswordPage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </main>
  );
}
