'use client';

import BookingOverview from '@/containers/admin-dashboard/BookingOverview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useGetBookingsQuery, useGetBusesQuery, useGetRoutesQuery } from '@/lib/store/services/api';

export default function AdminPage() {
  const { data: bookingsData } = useGetBookingsQuery({ page: 1, limit: 1 });
  const { data: busesData } = useGetBusesQuery({ page: 1, limit: 1 });
  const { data: routesData } = useGetRoutesQuery({ page: 1, limit: 1 });

  const stats = [
    {
      title: 'Total Bookings',
      value: bookingsData?.totalResults || 0,
      link: '/admin',
      color: 'text-blue-600',
    },
    {
      title: 'Total Buses',
      value: busesData?.totalResults || 0,
      link: '/admin/buses',
      color: 'text-green-600',
    },
    {
      title: 'Total Routes',
      value: routesData?.totalResults || 0,
      link: '/admin/routes',
      color: 'text-purple-600',
    },
  ];

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your bus booking system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              <Link href={stat.link}>
                <Button variant="link" className="p-0 h-auto mt-2">
                  View Details →
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Link href="/admin/buses">
            <Button>Manage Buses</Button>
          </Link>
          <Link href="/admin/routes">
            <Button variant="outline">Manage Routes</Button>
          </Link>
          <Link href="/admin/trips">
            <Button variant="outline">Manage Trips</Button>
          </Link>
          <Link href="/admin/operators">
            <Button variant="outline">Manage Operators</Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Bookings */}
      <BookingOverview />
    </main>
  );
}
