'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Search, User, Calendar, FileText } from 'lucide-react';

export default function QuickActions() {
  const actions = [
    {
      label: 'Book New Trip',
      href: '/search',
      icon: Search,
      description: 'Search for available trips',
      variant: 'default' as const,
    },
    {
      label: 'View Profile',
      href: '/dashboard/profile',
      icon: User,
      description: 'Manage your account',
      variant: 'outline' as const,
    },
    {
      label: 'My Bookings',
      href: '/dashboard/bookings',
      icon: Calendar,
      description: 'View all your bookings',
      variant: 'outline' as const,
    },
    {
      label: 'Help & Support',
      href: '/support',
      icon: FileText,
      description: 'Get help or contact us',
      variant: 'outline' as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.label} href={action.href} className="block">
              <Button variant={action.variant} className="w-full justify-start" size="lg">
                <Icon className="mr-2 h-4 w-4" />
                <div className="flex flex-col items-start">
                  <span>{action.label}</span>
                  <span className="text-xs font-normal text-muted-foreground">{action.description}</span>
                </div>
              </Button>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
