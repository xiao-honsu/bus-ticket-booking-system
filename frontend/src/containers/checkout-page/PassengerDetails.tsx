'use client';

import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setContactInfo } from '@/lib/store/features/booking/bookingSlice';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const contactSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
});

export default function PassengerDetails() {
  const dispatch = useAppDispatch();
  const contactInfo = useAppSelector((state) => state.booking.contactInfo);
  const passengers = useAppSelector((state) => state.booking.passengers);
  const user = useAppSelector((state) => state.auth.user);

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      email: contactInfo?.email || user?.email || '',
      phone: contactInfo?.phone || user?.phone || '',
    },
  });

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (form.formState.isValid && value.email && value.phone) {
        dispatch(
          setContactInfo({
            email: value.email,
            phone: value.phone,
          })
        );
      }
    });
    return () => subscription.unsubscribe();
  }, [form, dispatch]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact & Passenger Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-3">Contact Information</h4>
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Booking confirmation will be sent to this email
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+84 xxx xxx xxx" {...field} />
                    </FormControl>
                    <FormDescription>
                      For important updates about your trip
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <Separator />

        <div>
          <h4 className="font-medium mb-3">Passengers ({passengers.length})</h4>
          <div className="space-y-3">
            {passengers.map((passenger, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{passenger.name}</div>
                    <div className="text-sm text-gray-600">
                      Age: {passenger.age} • {passenger.gender}
                    </div>
                  </div>
                  <Badge>Seat {passenger.seatNumber}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
