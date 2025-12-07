'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, BarChart3, DollarSign, LineChart, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const revenueSeries = [
  { label: 'Mon', value: 12 },
  { label: 'Tue', value: 15 },
  { label: 'Wed', value: 18 },
  { label: 'Thu', value: 20 },
  { label: 'Fri', value: 26 },
  { label: 'Sat', value: 30 },
  { label: 'Sun', value: 28 },
];

const statusBreakdown = [
  { label: 'Paid', value: 62, color: 'bg-green-500' },
  { label: 'Pending', value: 24, color: 'bg-amber-500' },
  { label: 'Cancelled', value: 9, color: 'bg-rose-500' },
  { label: 'Refunded', value: 5, color: 'bg-slate-400' },
];

export default function AnalyticsPage() {
  const router = useRouter();

  const summary = {
    mtdRevenue: 128_500_000,
    totalBookings: 1240,
    conversion: 4.7,
    avgTicket: 142_000,
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Analytics</p>
            <h1 className="text-2xl font-bold">Analytics & Revenue</h1>
            <p className="text-slate-600">Traffic, revenue, and booking performance</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => router.push('/admin')}>
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">MTD Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{summary.mtdRevenue.toLocaleString('en-US')} đ</p>
              <div className="text-xs text-emerald-700 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +12% vs last week
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Bookings</CardTitle>
              <BarChart3 className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{summary.totalBookings}</p>
              <p className="text-xs text-slate-600 mt-1">MTD total tickets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Conversion</CardTitle>
              <LineChart className="w-4 h-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{summary.conversion}%</p>
              <p className="text-xs text-slate-600 mt-1">Visitors to booking</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Avg Ticket</CardTitle>
              <DollarSign className="w-4 h-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{summary.avgTicket.toLocaleString('en-US')} đ</p>
              <p className="text-xs text-slate-600 mt-1">Per booking</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" /> Revenue trend (last 7 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-3 items-end">
                {revenueSeries.map((item) => (
                  <div key={item.label} className="text-center">
                    <div className="bg-blue-500 rounded-t-md w-full" style={{ height: `${item.value * 6}px` }} />
                    <p className="text-xs text-slate-600 mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" /> Booking status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {statusBreakdown.map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{item.label}</span>
                    <Badge className="bg-slate-100 text-slate-700" variant="secondary">
                      {item.value}%
                    </Badge>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className={`${item.color} h-2`} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
              <Separator />
              <div className="text-xs text-slate-500">Data from the last 30 days (mock)</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
