'use client';

import { useState, useEffect } from 'react';
import {
  BookingHistory,
  UpcomingTrips,
  ProfileSettings,
  SummaryCards,
  RecentBookingsTable,
  QuickActions,
} from '@/containers/user-dashboard';
import { useAppSelector } from '@/lib/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetBookingsQuery, useGetBusesQuery, useGetRoutesQuery } from '@/lib/store/services/api';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = user?.role === 'admin';

  // Force client-only rendering to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Admin-specific queries
  const { data: allBookingsData } = useGetBookingsQuery({ page: 1, limit: 1 }, { skip: !isAdmin });
  const { data: busesData } = useGetBusesQuery({ page: 1, limit: 1 }, { skip: !isAdmin });
  const { data: routesData } = useGetRoutesQuery({ page: 1, limit: 1 }, { skip: !isAdmin });

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        {mounted ? (
          <>
            <h1 className="text-3xl font-bold">
              {isAdmin ? 'Admin Dashboard' : `Welcome back, ${user?.name || 'User'}!`}
            </h1>
            <p className="text-gray-600 mt-1">
              {isAdmin ? 'Manage your bus booking system' : 'Manage your bookings and profile settings'}
            </p>
          </>
        ) : (
          <>
            <Skeleton className="h-9 w-80" />
            <Skeleton className="h-5 w-60 mt-1" />
          </>
        )}
      </div>

      {/* Summary Cards Widget */}
      <div className="mb-6">
        <SummaryCards />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <RecentBookingsTable />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Admin-only Statistics Section */}
      {isAdmin && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-4">System Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">System-wide Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{allBookingsData?.totalResults || 0}</div>
                <p className="text-xs text-muted-foreground">All users combined</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Buses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{busesData?.totalResults || 0}</div>
                <p className="text-xs text-muted-foreground">Active fleet</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Routes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{routesData?.totalResults || 0}</div>
                <p className="text-xs text-muted-foreground">Available routes</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Existing Widgets (kept for continuity) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <UpcomingTrips />
        <ProfileSettings />
      </div>
      <div className="mt-6">
        <BookingHistory />
      </div>
    </main>
  );
}
