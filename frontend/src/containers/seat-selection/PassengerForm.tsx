'use client';

import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setPassengers } from '@/lib/store/features/booking/bookingSlice';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect } from 'react';

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
}

function SinglePassengerForm({ seatNumber, onUpdate, initialData }: PassengerFormProps) {
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

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (form.formState.isValid) {
        onUpdate(value as z.infer<typeof passengerSchema>);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, onUpdate]);

  return (
    <div className="mb-6 p-4 border rounded-lg">
      <h4 className="font-medium mb-3">Seat {seatNumber}</h4>
      <Form {...form}>
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age *</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Age" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="documentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document ID</FormLabel>
                <FormControl>
                  <Input placeholder="Passport/ID Card (optional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}

export default function PassengerForm() {
  const dispatch = useAppDispatch();
  const selectedSeats = useAppSelector((state) => state.booking.selectedSeats);
  const passengers = useAppSelector((state) => state.booking.passengers);

  const handlePassengerUpdate = (seatNumber: string) => (
    data: z.infer<typeof passengerSchema>
  ) => {
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Passenger Details</h3>
        <p className="text-gray-500 text-center py-8">Please select seats to enter passenger details</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Passenger Details</h3>
      {selectedSeats.map((seatNumber) => {
        const existingPassenger = passengers.find((p) => p.seatNumber === seatNumber);
        return (
          <SinglePassengerForm
            key={seatNumber}
            seatNumber={seatNumber}
            onUpdate={handlePassengerUpdate(seatNumber)}
            initialData={existingPassenger}
          />
        );
      })}
    </div>
  );
}
