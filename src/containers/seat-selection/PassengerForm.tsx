'use client';

import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setPassengers } from '@/lib/store/features/booking/bookingSlice';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

const passengerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().min(1, 'Age must be at least 1').max(120, 'Invalid age'),
  gender: z.enum(['male', 'female', 'other']),
  documentId: z.string().optional(),
  phoneNumber: z.string().optional(),
});

interface PassengerFormProps {
  seatNumber: string;
  onUpdate: (data: z.infer<typeof passengerSchema>) => void;
  initialData?: z.infer<typeof passengerSchema>;
  index: number;
}

function SinglePassengerForm({ seatNumber, onUpdate, initialData, index }: PassengerFormProps) {
  const form = useForm<z.infer<typeof passengerSchema>>({
    resolver: zodResolver(passengerSchema),
    defaultValues: initialData || {
      name: '',
      age: 18,
      gender: 'male',
      documentId: '',
      phoneNumber: '',
    },
  });

  // Update state immediately when form has valid values (including on mount)
  useEffect(() => {
    const validateAndUpdate = async () => {
      const isValid = await form.trigger();
      if (isValid) {
        const values = form.getValues();
        onUpdate(values);
      }
    };
    validateAndUpdate();
  }, []);

  // Watch for changes and update state
  useEffect(() => {
    const subscription = form.watch(async (value) => {
      const isValid = await form.trigger();
      if (isValid && value.name && value.age && value.gender) {
        onUpdate(value as z.infer<typeof passengerSchema>);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, onUpdate]);

  return (
    <Card className="py-0 gap-0">
      <CardHeader className="p-3 pb-2 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">Passenger {index + 1}</CardTitle>
        <Badge variant="outline" className="text-xs font-medium">
          Seat {seatNumber}
        </Badge>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <Form {...form}>
          <form className="space-y-3">
            {/* Row 1: Name, Age, Gender */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-xs">Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} className="h-8 text-sm" />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Age *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Age"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                        className="h-8 text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Gender *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 2: Phone & Document ID (Optional) */}
            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} className="h-8 text-sm" />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="documentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">ID/Passport</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} className="h-8 text-sm" />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default function PassengerForm() {
  const dispatch = useAppDispatch();
  const selectedSeats = useAppSelector((state) => state.booking.selectedSeats);
  const passengers = useAppSelector((state) => state.booking.passengers);

  const handlePassengerUpdate = (seatNumber: string) => (data: z.infer<typeof passengerSchema>) => {
    const updatedPassengers = [...passengers];
    const existingIndex = updatedPassengers.findIndex((p) => p.seatNumber === seatNumber);

    const passengerData = {
      ...data,
      seatNumber,
    };

    if (existingIndex >= 0) {
      updatedPassengers[existingIndex] = passengerData;
    } else {
      updatedPassengers.push(passengerData);
    }

    dispatch(setPassengers(updatedPassengers));
  };

  if (selectedSeats.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        Please select seats to enter passenger details
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {selectedSeats.map((seatNumber, index) => {
        const existingPassenger = passengers.find((p) => p.seatNumber === seatNumber);
        return (
          <SinglePassengerForm
            key={seatNumber}
            seatNumber={seatNumber}
            onUpdate={handlePassengerUpdate(seatNumber)}
            initialData={existingPassenger}
            index={index}
          />
        );
      })}
    </div>
  );
}
