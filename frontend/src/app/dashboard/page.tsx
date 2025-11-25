'use client';

import { BookingHistory, UpcomingTrips, ProfileSettings } from '@/containers/user-dashboard';
import { useAppSelector } from '@/lib/hooks';

export default function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Welcome back, {user?.name || 'User'}!</h1>
        <p className="text-gray-600 mt-1">Manage your bookings and profile settings</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <UpcomingTrips />
        <ProfileSettings />
      </div>
      <BookingHistory />
    </main>
  );
}
