'use client';

import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setContactInfo } from '@/lib/store/features/booking/bookingSlice';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, User, Users, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const isFormValid = form.formState.isValid;

  // Update state immediately when form has valid values (including on mount)
  useEffect(() => {
    const validateAndUpdate = async () => {
      const isValid = await form.trigger();
      if (isValid) {
        const values = form.getValues();
        if (values.email && values.phone) {
          dispatch(
            setContactInfo({
              email: values.email,
              phone: values.phone,
            })
          );
        }
      }
    };

    validateAndUpdate();
  }, []);

  // Watch for changes and update state
  useEffect(() => {
    const subscription = form.watch(async (value) => {
      const isValid = await form.trigger();
      if (isValid && value.email && value.phone) {
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
    <Card className="border-2 overflow-hidden">
      <CardHeader className="bg-linear-to-r from-muted/50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Contact & Passenger Info</CardTitle>
              <CardDescription>Booking confirmation will be sent to your email</CardDescription>
            </div>
          </div>
          {isFormValid && passengers.length > 0 && (
            <Badge className="bg-green-500/10 text-green-600 border-green-200">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Complete
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Contact Information */}
        <div>
          <h4 className="font-semibold mb-4 flex items-center gap-2 text-sm">📧 Contact Information</h4>
          <Form {...form}>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        className="border-2 focus:ring-2 focus:ring-primary/20"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">Booking confirmation sent here</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+84 xxx xxx xxx"
                        className="border-2 focus:ring-2 focus:ring-primary/20"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">For trip updates & emergencies</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <Separator />

        {/* Passengers List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold flex items-center gap-2 text-sm">👥 Passengers</h4>
            <Badge variant="outline">
              {passengers.length} passenger{passengers.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {passengers.length === 0 ? (
            <div className="text-center py-8 bg-muted/30 rounded-lg border-2 border-dashed">
              <User className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Passenger details will appear here after seat selection</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {passengers.map((passenger, index) => (
                <div
                  key={index}
                  className={cn(
                    'p-4 rounded-lg border-2 bg-linear-to-r from-muted/30 to-transparent',
                    'hover:border-primary/30 transition-colors'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{passenger.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {passenger.age} years • {passenger.gender}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="font-mono">
                      Seat {passenger.seatNumber}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
