'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, BarChart3, DollarSign, LineChart, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useGetAnalyticsQuery, useGetPopularRoutesQuery, useGetBookingsByStatusQuery } from '@/lib/store/services/api';
import { format, parseISO } from 'date-fns';

export default function AnalyticsPage() {
  const router = useRouter();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d');

  // Fetch real analytics data
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useGetAnalyticsQuery(period);
  const { data: popularRoutes, isLoading: routesLoading } = useGetPopularRoutesQuery(5);
  const { data: bookingsByStatus, isLoading: statusLoading } = useGetBookingsByStatusQuery(period);

  // Debug logging
  console.log('Analytics data:', analytics);
  console.log('Analytics error:', analyticsError);
  console.log('Is loading:', analyticsLoading);

  if (analyticsLoading) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8 dark:text-gray-300">Loading analytics...</div>
        </div>
      </main>
    );
  }

  if (analyticsError) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8 text-red-600 dark:text-red-400">
            Error loading analytics: {JSON.stringify(analyticsError)}
          </div>
        </div>
      </main>
    );
  }

  const summary = analytics?.summary || {
    totalRevenue: 0,
    totalBookings: 0,
    avgTicketPrice: 0,
    conversionRate: 0,
  };

  const revenueByDay = analytics?.revenueByDay || [];
  const statusBreakdown = analytics?.statusBreakdown || {
    pending: 0,
    confirmed: 0,
    cancelled: 0,
  };

  const total = statusBreakdown.pending + statusBreakdown.confirmed + statusBreakdown.cancelled;
  const statusPercentages = {
    pending: total > 0 ? Math.round((statusBreakdown.pending / total) * 100) : 0,
    confirmed: total > 0 ? Math.round((statusBreakdown.confirmed / total) * 100) : 0,
    cancelled: total > 0 ? Math.round((statusBreakdown.cancelled / total) * 100) : 0,
  };

  // Find max revenue for chart scaling
  const maxRevenue = Math.max(...revenueByDay.map((d: any) => d.revenue), 1);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Analytics</p>
            <h1 className="text-2xl font-bold dark:text-gray-100">Analytics & Revenue</h1>
            <p className="text-slate-600 dark:text-slate-400">Traffic, revenue, and booking performance</p>
          </div>
          <div className="flex gap-3">
            <Select value={period} onValueChange={(val: any) => setPeriod(val)}>
              <SelectTrigger className="w-[150px]">
                <Calendar className="w-4 h-4 mr-2 dark:text-gray-300" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2" onClick={() => router.push('/admin')}>
              <ArrowLeft className="w-4 h-4 dark:text-gray-300" /> Back
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Revenue</CardTitle>
              <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold dark:text-gray-200">
                {summary.totalRevenue.toLocaleString('vi-VN')} đ
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {period === '7d' ? 'Last 7 days' : period === '30d' ? 'Last 30 days' : 'Last 90 days'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Bookings</CardTitle>
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold dark:text-gray-200">{summary.totalBookings}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Total tickets sold</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Conversion Rate</CardTitle>
              <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                <LineChart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold dark:text-gray-200">{summary.conversionRate}%</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Completed bookings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg Ticket Price</CardTitle>
              <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold dark:text-gray-200">
                {summary.avgTicketPrice.toLocaleString('vi-VN')} đ
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Per booking</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-48">
                <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line
                    x1="0"
                    y1="0"
                    x2="800"
                    y2="0"
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-700"
                    strokeWidth="1"
                  />
                  <line
                    x1="0"
                    y1="50"
                    x2="800"
                    y2="50"
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-700"
                    strokeWidth="1"
                  />
                  <line
                    x1="0"
                    y1="100"
                    x2="800"
                    y2="100"
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-700"
                    strokeWidth="1"
                  />
                  <line
                    x1="0"
                    y1="150"
                    x2="800"
                    y2="150"
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-700"
                    strokeWidth="1"
                  />
                  <line
                    x1="0"
                    y1="200"
                    x2="800"
                    y2="200"
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-700"
                    strokeWidth="1"
                  />

                  {/* Line chart */}
                  {revenueByDay.length > 0 && (
                    <>
                      <polyline
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        points={revenueByDay
                          .map((item: any, index: number) => {
                            const x = (index / (revenueByDay.length - 1)) * 800;
                            const y = 200 - (item.revenue / maxRevenue) * 180;
                            return `${x},${y}`;
                          })
                          .join(' ')}
                      />
                      {/* Data points */}
                      {revenueByDay.map((item: any, index: number) => {
                        const x = (index / (revenueByDay.length - 1)) * 800;
                        const y = 200 - (item.revenue / maxRevenue) * 180;
                        return (
                          <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="4"
                            fill="#3b82f6"
                            className="hover:r-6 transition-all cursor-pointer"
                          >
                            <title>{`${format(parseISO(item.date), 'MMM dd')}: ${item.revenue.toLocaleString('vi-VN')} đ`}</title>
                          </circle>
                        );
                      })}
                    </>
                  )}
                </svg>
                {/* X-axis labels */}
                <div className="flex justify-between mt-2 px-1">
                  {revenueByDay.map((item: any, index: number) => {
                    // Show only first, middle, and last labels to avoid crowding
                    if (
                      index === 0 ||
                      index === Math.floor(revenueByDay.length / 2) ||
                      index === revenueByDay.length - 1
                    ) {
                      return (
                        <p key={index} className="text-xs text-slate-600 dark:text-slate-400">
                          {format(parseISO(item.date), 'MMM dd')}
                        </p>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                Booking Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-700 dark:text-slate-300">Confirmed</span>
                  <Badge
                    className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    variant="secondary"
                  >
                    {statusPercentages.confirmed}%
                  </Badge>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-2" style={{ width: `${statusPercentages.confirmed}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-700 dark:text-slate-300">Pending</span>
                  <Badge
                    className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    variant="secondary"
                  >
                    {statusPercentages.pending}%
                  </Badge>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-2" style={{ width: `${statusPercentages.pending}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-700 dark:text-slate-300">Cancelled</span>
                  <Badge
                    className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                    variant="secondary"
                  >
                    {statusPercentages.cancelled}%
                  </Badge>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-2" style={{ width: `${statusPercentages.cancelled}%` }} />
                </div>
              </div>

              <Separator />
              <div className="text-xs text-slate-500 dark:text-slate-400">Total bookings: {total}</div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings by Status Over Time */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-gray-100">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <LineChart className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              Bookings by Status Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusLoading ? (
              <div className="text-center py-4 text-muted-foreground">Loading data...</div>
            ) : !bookingsByStatus || bookingsByStatus.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No data available</div>
            ) : (
              <div className="space-y-3">
                <div className="relative h-64 mb-2">
                  <svg className="w-full h-full" viewBox="0 0 800 250" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line
                      x1="0"
                      y1="0"
                      x2="800"
                      y2="0"
                      stroke="currentColor"
                      className="text-slate-200 dark:text-slate-700"
                      strokeWidth="1"
                    />
                    <line
                      x1="0"
                      y1="62.5"
                      x2="800"
                      y2="62.5"
                      stroke="currentColor"
                      className="text-slate-200 dark:text-slate-700"
                      strokeWidth="1"
                    />
                    <line
                      x1="0"
                      y1="125"
                      x2="800"
                      y2="125"
                      stroke="currentColor"
                      className="text-slate-200 dark:text-slate-700"
                      strokeWidth="1"
                    />
                    <line
                      x1="0"
                      y1="187.5"
                      x2="800"
                      y2="187.5"
                      stroke="currentColor"
                      className="text-slate-200 dark:text-slate-700"
                      strokeWidth="1"
                    />
                    <line
                      x1="0"
                      y1="250"
                      x2="800"
                      y2="250"
                      stroke="currentColor"
                      className="text-slate-200 dark:text-slate-700"
                      strokeWidth="1"
                    />

                    {(() => {
                      const maxCount = Math.max(
                        ...bookingsByStatus.map((d: any) => Math.max(d.pending, d.confirmed, d.cancelled)),
                        1
                      );

                      return (
                        <>
                          {/* Confirmed line */}
                          <polyline
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2"
                            points={bookingsByStatus
                              .map((item: any, index: number) => {
                                const x = (index / (bookingsByStatus.length - 1)) * 800;
                                const y = 250 - (item.confirmed / maxCount) * 230;
                                return `${x},${y}`;
                              })
                              .join(' ')}
                          />

                          {/* Confirmed points */}
                          {bookingsByStatus.map((item: any, index: number) => {
                            const x = (index / (bookingsByStatus.length - 1)) * 800;
                            const y = 250 - (item.confirmed / maxCount) * 230;
                            return (
                              <g key={`confirmed-${index}`}>
                                <circle cx={x} cy={y} r="4" fill="#10b981" className="cursor-pointer">
                                  <title>
                                    {format(parseISO(item.date), 'dd/MM/yyyy')}: {item.confirmed} confirmed
                                  </title>
                                </circle>
                              </g>
                            );
                          })}

                          {/* Pending line */}
                          <polyline
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="2"
                            points={bookingsByStatus
                              .map((item: any, index: number) => {
                                const x = (index / (bookingsByStatus.length - 1)) * 800;
                                const y = 250 - (item.pending / maxCount) * 230;
                                return `${x},${y}`;
                              })
                              .join(' ')}
                          />

                          {/* Pending points */}
                          {bookingsByStatus.map((item: any, index: number) => {
                            const x = (index / (bookingsByStatus.length - 1)) * 800;
                            const y = 250 - (item.pending / maxCount) * 230;
                            return (
                              <g key={`pending-${index}`}>
                                <circle cx={x} cy={y} r="4" fill="#f59e0b" className="cursor-pointer">
                                  <title>
                                    {format(parseISO(item.date), 'dd/MM/yyyy')}: {item.pending} pending
                                  </title>
                                </circle>
                              </g>
                            );
                          })}

                          {/* Cancelled line */}
                          <polyline
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="2"
                            points={bookingsByStatus
                              .map((item: any, index: number) => {
                                const x = (index / (bookingsByStatus.length - 1)) * 800;
                                const y = 250 - (item.cancelled / maxCount) * 230;
                                return `${x},${y}`;
                              })
                              .join(' ')}
                          />

                          {/* Cancelled points */}
                          {bookingsByStatus.map((item: any, index: number) => {
                            const x = (index / (bookingsByStatus.length - 1)) * 800;
                            const y = 250 - (item.cancelled / maxCount) * 230;
                            return (
                              <g key={`cancelled-${index}`}>
                                <circle cx={x} cy={y} r="4" fill="#ef4444" className="cursor-pointer">
                                  <title>
                                    {format(parseISO(item.date), 'dd/MM/yyyy')}: {item.cancelled} cancelled
                                  </title>
                                </circle>
                              </g>
                            );
                          })}
                        </>
                      );
                    })()}
                  </svg>
                </div>

                {/* Legend */}
                <div className="flex justify-center gap-6 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-green-500" />
                    <span className="text-xs text-muted-foreground">Confirmed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-amber-500" />
                    <span className="text-xs text-muted-foreground">Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-red-500" />
                    <span className="text-xs text-muted-foreground">Cancelled</span>
                  </div>
                </div>

                {/* Date labels */}
                <div className="flex justify-between px-2 text-xs text-muted-foreground pt-2 border-t dark:border-slate-700">
                  <span>{format(parseISO(bookingsByStatus[0].date), 'dd/MM/yyyy')}</span>
                  {bookingsByStatus.length > 2 && (
                    <span>
                      {format(parseISO(bookingsByStatus[Math.floor(bookingsByStatus.length / 2)].date), 'dd/MM/yyyy')}
                    </span>
                  )}
                  <span>{format(parseISO(bookingsByStatus[bookingsByStatus.length - 1].date), 'dd/MM/yyyy')}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Popular Routes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-gray-100">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              Popular Routes (Top 5 by Confirmed Bookings)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {routesLoading ? (
              <div className="text-center py-4 text-muted-foreground">Loading routes...</div>
            ) : !popularRoutes || popularRoutes.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No route data available</div>
            ) : (
              <div className="space-y-3">
                {popularRoutes.map((route: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-foreground">{route.routeName}</p>
                        <p className="text-xs text-muted-foreground">{route.bookings} confirmed bookings</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm text-foreground">{route.revenue.toLocaleString('vi-VN')} đ</p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
