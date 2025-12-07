'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldCheck, Ticket } from 'lucide-react';
import { useRouter } from 'next/navigation';

const mockBookings = [
  {
    id: 'BK-10231',
    user: 'Nguyen Van A',
    trip: 'Hanoi → Hai Phong',
    seats: 2,
    amount: 320000,
    status: 'paid',
    risk: 'low',
  },
  {
    id: 'BK-10212',
    user: 'Tran Thi B',
    trip: 'HCM → Da Lat',
    seats: 1,
    amount: 220000,
    status: 'pending',
    risk: 'medium',
  },
  {
    id: 'BK-10205',
    user: 'Hoang Van C',
    trip: 'Da Nang → Hue',
    seats: 3,
    amount: 450000,
    status: 'cancelled',
    risk: 'low',
  },
  {
    id: 'BK-10199',
    user: 'Le Thi D',
    trip: 'Hue → Quang Tri',
    seats: 1,
    amount: 150000,
    status: 'paid',
    risk: 'low',
  },
  {
    id: 'BK-10188',
    user: 'Pham Van E',
    trip: 'HCM → Can Tho',
    seats: 2,
    amount: 360000,
    status: 'review',
    risk: 'high',
  },
];

export default function BookingMonitoringPage() {
  const router = useRouter();

  const statusColor = (status: string) => {
    if (status === 'paid') return 'bg-emerald-100 text-emerald-700';
    if (status === 'pending') return 'bg-amber-100 text-amber-700';
    if (status === 'review') return 'bg-indigo-100 text-indigo-700';
    return 'bg-rose-100 text-rose-700';
  };

  const riskColor = (risk: string) => {
    if (risk === 'high') return 'bg-rose-100 text-rose-700';
    if (risk === 'medium') return 'bg-amber-100 text-amber-700';
    return 'bg-emerald-100 text-emerald-700';
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Booking Monitoring</p>
            <h1 className="text-2xl font-bold">Bookings</h1>
            <p className="text-slate-600">Monitor payments, risk, and status</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/admin')} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-500">Paid today</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">24</p>
              <p className="text-xs text-slate-600 mt-1">Tickets completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-500">Pending approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">7</p>
              <p className="text-xs text-slate-600 mt-1">Waiting for payment confirmation</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-500">At risk</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-rose-600">3</p>
              <p className="text-xs text-slate-600 mt-1">Flagged for manual review</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-blue-600" /> Recent bookings ({mockBookings.length})
            </CardTitle>
            <Button size="sm" variant="outline" disabled className="gap-2">
              <ShieldCheck className="w-4 h-4" /> Bulk review
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="text-left px-4 py-2">Booking</th>
                    <th className="text-left px-4 py-2">User</th>
                    <th className="text-left px-4 py-2">Trip</th>
                    <th className="text-left px-4 py-2">Seats</th>
                    <th className="text-left px-4 py-2">Amount</th>
                    <th className="text-left px-4 py-2">Status</th>
                    <th className="text-left px-4 py-2">Risk</th>
                    <th className="text-left px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockBookings.map((bk) => (
                    <tr key={bk.id} className="border-b last:border-none">
                      <td className="px-4 py-3 font-medium">{bk.id}</td>
                      <td className="px-4 py-3">{bk.user}</td>
                      <td className="px-4 py-3">{bk.trip}</td>
                      <td className="px-4 py-3">{bk.seats}</td>
                      <td className="px-4 py-3">{bk.amount.toLocaleString('en-US')} đ</td>
                      <td className="px-4 py-3">
                        <Badge className={statusColor(bk.status)}>{bk.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={riskColor(bk.risk)}>{bk.risk}</Badge>
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        <Button size="sm" variant="outline" disabled>
                          View
                        </Button>
                        <Button size="sm" variant="destructive" disabled>
                          Cancel
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-500 mt-4">Mock data only. Connect API to enable review actions.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
