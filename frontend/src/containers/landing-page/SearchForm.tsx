'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/lib/hooks';
import { setSearchParams } from '@/lib/store/features/trip/tripSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';

const searchSchema = z.object({
  origin: z.string().min(2, 'Origin must be at least 2 characters'),
  destination: z.string().min(2, 'Destination must be at least 2 characters'),
  date: z.string().min(1, 'Date is required'),
});

type SearchFormValues = z.infer<typeof searchSchema>;

export default function SearchForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      origin: '',
      destination: '',
      date: '',
    },
  });

  const onSubmit = (data: SearchFormValues) => {
    try {
      dispatch(setSearchParams({
        origin: data.origin,
        destination: data.destination,
        date: data.date,
      }));
      
      const searchParams = new URLSearchParams({
        origin: data.origin,
        destination: data.destination,
        date: data.date,
      });
      
      router.push(`/search?${searchParams.toString()}`);
      toast.success('Searching for trips...');
    } catch (error) {
      toast.error('Failed to search trips. Please try again.');
    }
  };

  // Get today's date for min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 -mt-10 relative z-10 max-w-4xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="origin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>From</FormLabel>
                <FormControl>
                  <Input placeholder="Origin city" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="destination"
            render={({ field }) => (
              <FormItem>
                <FormLabel>To</FormLabel>
                <FormControl>
                  <Input placeholder="Destination city" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" min={today} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-end">
            <Button type="submit" className="w-full">
              Search
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
