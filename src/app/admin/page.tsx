'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, Bus, MapPin, Navigation, UserCheck, LogOut, BarChart3, Tag } from 'lucide-react';
import {
  useGetBookingsQuery,
  useGetBusesQuery,
  useGetRoutesQuery,
  useGetOperatorsQuery,
  useGetTodayBookingsQuery,
} from '@/lib/store/services/api';

export default function AdminPage() {
  const router = useRouter();
  const { data: bookingsData } = useGetBookingsQuery({ page: 1, limit: 1 });
  const { data: todayBookings } = useGetTodayBookingsQuery();
  const { data: busesData } = useGetBusesQuery({ page: 1, limit: 1 });
  const { data: routesData } = useGetRoutesQuery({ page: 1, limit: 1 });
  const { data: operatorsData } = useGetOperatorsQuery({ page: 1, limit: 1 });

  const menuItems = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Analytics & Revenue',
      description: 'View system revenue, traffic metrics, performance',
      href: '/admin/dashboard/analytics',
      color: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-300',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'User Management',
      description: 'Manage users, admins, and control account access',
      href: '/admin/dashboard/users',
      color: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-300',
    },
    {
      icon: <Bus className="w-6 h-6" />,
      title: 'Bus Management',
      description: 'CRUD buses, manage fleet, configure seat maps',
      href: '/admin/buses',
      color: 'from-orange-50 to-orange-100',
      borderColor: 'border-orange-300',
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Route Management',
      description: 'Create and manage travel routes and stops',
      href: '/admin/routes',
      color: 'from-green-50 to-green-100',
      borderColor: 'border-green-300',
    },
    {
      icon: <Navigation className="w-6 h-6" />,
      title: 'Trip Management',
      description: 'Schedule trips, set prices, manage departures',
      href: '/admin/trips',
      color: 'from-cyan-50 to-cyan-100',
      borderColor: 'border-cyan-300',
    },
    {
      icon: <UserCheck className="w-6 h-6" />,
      title: 'Operator Management',
      description: 'Manage bus operators and approve applications',
      href: '/admin/operators',
      color: 'from-indigo-50 to-indigo-100',
      borderColor: 'border-indigo-300',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Booking Monitoring',
      description: 'View all bookings, handle fraud reports',
      href: '/admin/dashboard/bookings',
      color: 'from-rose-50 to-rose-100',
      borderColor: 'border-rose-300',
    },
    {
      icon: <Tag className="w-6 h-6" />,
      title: 'Promotions Management',
      description: 'Create and manage discount codes and offers',
      href: '/admin/dashboard/promotions',
      color: 'from-pink-50 to-pink-100',
      borderColor: 'border-pink-300',
    },
  ];

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-sm border-b border-border sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">Bus Ticket Booking System Management</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="inline-flex p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-2">
                  <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">Today's Bookings</p>
                <p className="text-2xl font-bold text-foreground">{todayBookings?.count || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="inline-flex p-3 rounded-full bg-green-100 dark:bg-green-900/30 mb-2">
                  <Bus className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">Total Buses</p>
                <p className="text-2xl font-bold text-foreground">{busesData?.totalResults || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="inline-flex p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-2">
                  <MapPin className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">Total Routes</p>
                <p className="text-2xl font-bold text-foreground">{routesData?.totalResults || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="inline-flex p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-2">
                  <UserCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">Total Operators</p>
                <p className="text-2xl font-bold text-foreground">{operatorsData?.totalResults || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <Card
              key={index}
              className={`border-l-4 ${item.borderColor} dark:${item.borderColor} hover:shadow-lg transition-all cursor-pointer group`}
              onClick={() => router.push(item.href)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-card to-muted shadow-md group-hover:scale-110 transition-transform border border-border">
                    <div className="text-foreground">{item.icon}</div>
                  </div>
                </div>
                <CardTitle className="mt-4">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(item.href);
                  }}
                >
                  Open →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-12 p-6 bg-card rounded-lg border border-border shadow-sm">
          <h3 className="font-semibold text-foreground mb-2">System Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">API Status</p>
              <p>🟢 Online</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Database</p>
              <p>🟢 Connected</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Last Updated</p>
              <p>2 minutes ago</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Version</p>
              <p>1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
