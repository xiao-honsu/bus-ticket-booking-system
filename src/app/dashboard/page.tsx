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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useGetBookingsQuery, useGetBusesQuery, useGetRoutesQuery } from '@/lib/store/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { LayoutDashboard, Bus, Route, Ticket, TrendingUp, Users, Calendar } from 'lucide-react';

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
    <main className="min-h-screen bg-linear-to-b from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="mb-8">
          {mounted ? (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-linear-to-br from-primary/20 to-primary/10 shadow-lg">
                  <LayoutDashboard className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">
                    {isAdmin ? 'Admin Dashboard' : `Welcome back, ${user?.name || 'User'}!`}
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    {isAdmin ? 'Manage your bus booking system' : 'Manage your bookings and profile settings'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
                    <Users className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}
                <Badge variant="outline" className="px-3 py-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-xl" />
              <div>
                <Skeleton className="h-8 w-80" />
                <Skeleton className="h-5 w-60 mt-2" />
              </div>
            </div>
          )}
        </div>

        {/* Summary Cards Widget */}
        <div className="mb-8">
          <SummaryCards />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <RecentBookingsTable />
          </div>
          <div>
            <QuickActions />
          </div>
        </div>

        {/* Admin-only Statistics Section */}
        {isAdmin && mounted && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold">System Statistics</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="border-2 border-blue-200 dark:border-blue-900 bg-linear-to-br from-blue-50/50 to-transparent dark:from-blue-950/20 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-blue-500" />
                    System-wide Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{allBookingsData?.totalResults || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">All users combined</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-green-200 dark:border-green-900 bg-linear-to-br from-green-50/50 to-transparent dark:from-green-950/20 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Bus className="h-4 w-4 text-green-500" />
                    Total Buses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{busesData?.totalResults || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Active fleet</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-purple-200 dark:border-purple-900 bg-linear-to-br from-purple-50/50 to-transparent dark:from-purple-950/20 overflow-hidden sm:col-span-2 md:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Route className="h-4 w-4 text-purple-500" />
                    Total Routes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">{routesData?.totalResults || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Available routes</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <Separator className="my-8" />

        {/* User Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <UpcomingTrips />
          <ProfileSettings />
        </div>

        <div>
          <BookingHistory />
        </div>
      </div>
    </main>
  );
}
