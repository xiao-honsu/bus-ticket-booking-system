'use client';

import { BookingSummary, PaymentMethods, PassengerDetails } from '@/containers/checkout-page';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { useCreateBookingMutation, useCreateGuestBookingMutation, useGetTripQuery } from '@/lib/store/services/api';
import { setPayment } from '@/lib/store/features/booking/bookingSlice';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import SeatLockTimer from '@/components/SeatLockTimer';
import { createPaymentLink } from '@/lib/services/payment.service';
import type { CreateBookingRequest, CreateGuestBookingRequest } from '@/lib/types';
import { ArrowLeft, ShieldCheck, CreditCard, Loader2, CheckCircle2, MapPin, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const tripId = useAppSelector((state) => state.booking.tripId);
  const selectedSeats = useAppSelector((state) => state.booking.selectedSeats);
  const selectedSeatDetails = useAppSelector((state) => state.booking.selectedSeatDetails);
  const passengers = useAppSelector((state) => state.booking.passengers);
  const payment = useAppSelector((state) => state.booking.payment);
  const contactInfo = useAppSelector((state) => state.booking.contactInfo);
  const promotion = useAppSelector((state) => state.booking.promotion);
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const { data: trip } = useGetTripQuery(tripId || '', {
    skip: !tripId,
  });

  // Calculate total amount from actual seat prices
  const totalAmount = selectedSeatDetails.reduce((sum, seat) => sum + seat.price, 0);
  const discountAmount = promotion?.discountAmount || 0;
  const finalAmount = totalAmount - discountAmount;

  // Check form completeness
  const isContactComplete = contactInfo?.email && contactInfo?.phone;
  const isPassengersComplete =
    passengers.length === selectedSeats.length && passengers.every((p) => p.name && p.age && p.gender);

  // Update current step based on completion
  useEffect(() => {
    if (isContactComplete && isPassengersComplete) {
      setCurrentStep(3);
    } else if (isContactComplete) {
      setCurrentStep(2);
    } else {
      setCurrentStep(1);
    }
  }, [isContactComplete, isPassengersComplete]);

  // Set PayOS as default payment method
  useEffect(() => {
    if (!payment?.method) {
      dispatch(
        setPayment({
          method: 'payos',
          amount: 0,
        })
      );
    }
  }, [payment, dispatch]);

  const [createBooking, { isLoading: isCreatingBooking }] = useCreateBookingMutation();
  const [createGuestBooking, { isLoading: isCreatingGuestBooking }] = useCreateGuestBookingMutation();

  // Determine if user is authenticated
  const isAuthenticated = !!accessToken;

  // Redirect if no trip selected
  useEffect(() => {
    if (!tripId || selectedSeats.length === 0) {
      toast.error('No booking data found. Please start a new booking.');
      router.push('/search');
    }
  }, [tripId, selectedSeats, router]);

  const handleCompletePayment = async () => {
    // Validation
    if (!contactInfo?.email || !contactInfo?.phone) {
      toast.error('Please provide contact information');
      return;
    }

    if (passengers.length !== selectedSeats.length) {
      toast.error('Please provide passenger details for all seats');
      return;
    }

    if (!trip) {
      toast.error('Trip information not available');
      return;
    }

    setIsProcessing(true);

    try {
      // Ensure tripId is not null
      if (!tripId) {
        toast.error('Trip ID is missing');
        return;
      }

      // Validate total amount from selected seat details
      if (selectedSeatDetails.length === 0) {
        toast.error('No seat information available');
        return;
      }

      // Validate totalAmount is a valid number
      if (isNaN(finalAmount) || finalAmount <= 0) {
        toast.error('Invalid total amount calculated');
        console.error('Invalid finalAmount:', {
          totalAmount,
          selectedSeats,
          discountAmount,
          finalAmount,
        });
        return;
      }

      // Prepare booking data based on authentication state
      let bookingResult;

      // Helper to get seat price from selectedSeatDetails
      const getSeatPrice = (seatNumber: string): number => {
        const seatDetail = selectedSeatDetails.find((s) => s.seatNumber === seatNumber);
        return seatDetail?.price || 0;
      };

      if (isAuthenticated) {
        // Authenticated user booking
        const bookingData: CreateBookingRequest = {
          trip: tripId,
          passengers: passengers.map((p) => ({
            name: p.name,
            age: p.age,
            gender: p.gender,
            seatNumber: p.seatNumber,
            seatPrice: getSeatPrice(p.seatNumber),
          })),
          contactEmail: contactInfo.email,
          contactPhone: contactInfo.phone,
          totalAmount: finalAmount,
        };

        console.log('Creating authenticated booking with data:', bookingData);
        bookingResult = await createBooking(bookingData).unwrap();
      } else {
        // Guest booking (no authentication)
        const guestBookingData: CreateGuestBookingRequest = {
          trip: tripId,
          guestEmail: contactInfo.email,
          guestPhone: contactInfo.phone,
          passengers: passengers.map((p) => ({
            name: p.name,
            age: p.age,
            gender: p.gender as 'male' | 'female' | 'other',
            seatNumber: p.seatNumber,
            seatPrice: getSeatPrice(p.seatNumber),
          })),
          contactEmail: contactInfo.email,
          contactPhone: contactInfo.phone,
          totalAmount: finalAmount,
        };

        console.log('Creating guest booking with data:', guestBookingData);
        bookingResult = await createGuestBooking(guestBookingData).unwrap();
      }

      console.log('Booking result:', bookingResult);

      // Validate booking result
      if (!bookingResult || !bookingResult.id) {
        console.error('Invalid booking result:', bookingResult);
        throw new Error('Invalid booking response from server');
      }

      toast.success('Booking created successfully!');

      // Step 2: Create payment link with PayOS
      const paymentResult = await createPaymentLink(bookingResult.id, accessToken || undefined);

      // Step 3: Redirect to PayOS checkout page
      if (paymentResult.checkoutUrl) {
        localStorage.setItem('pendingBookingId', bookingResult.id);
        window.location.href = paymentResult.checkoutUrl;
      } else {
        throw new Error('Không thể tạo link thanh toán');
      }
    } catch (error: unknown) {
      console.error('Payment error:', error);
      const err = error as { data?: { message?: string }; message?: string };
      toast.error(err?.data?.message || err?.message || 'Failed to process payment. Please try again.');
      setIsProcessing(false);
    }
  };

  const steps = [
    { id: 1, title: 'Contact Info', icon: '📧' },
    { id: 2, title: 'Passengers', icon: '👥' },
    { id: 3, title: 'Payment', icon: '💳' },
  ];

  return (
    <main className="min-h-screen bg-linear-to-b from-background via-muted/30 to-background">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.back()} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <h1 className="text-xl md:text-2xl font-bold">Secure Checkout</h1>
            <Badge variant="outline" className="gap-1">
              <ShieldCheck className="h-3 w-3" />
              <span className="hidden sm:inline">SSL Secured</span>
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Progress Steps - Mobile */}
        <div className="mb-6 md:hidden">
          <div className="flex items-center justify-between bg-muted/50 rounded-xl p-3">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all',
                    currentStep >= step.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted-foreground/20 text-muted-foreground'
                  )}
                >
                  {currentStep > step.id ? <CheckCircle2 className="h-4 w-4" /> : step.id}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={cn('w-8 h-0.5 mx-1', currentStep > step.id ? 'bg-primary' : 'bg-muted-foreground/20')}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Progress Steps - Desktop */}
        <div className="hidden md:block mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-full text-lg font-semibold transition-all',
                      currentStep >= step.id
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {currentStep > step.id ? <CheckCircle2 className="h-5 w-5" /> : step.icon}
                  </div>
                  <span
                    className={cn('font-medium', currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground')}
                  >
                    {step.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={cn(
                      'w-24 h-0.5 mx-4 transition-colors',
                      currentStep > step.id ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trip Summary Card - Mobile */}
            {trip && (
              <Card className="lg:hidden border-2 border-primary/20 bg-linear-to-r from-primary/5 to-transparent">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">🚌</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <MapPin className="h-3 w-3 text-primary" />
                        <span className="truncate">{trip.route?.origin?.city}</span>
                        <span>→</span>
                        <span className="truncate">{trip.route?.destination?.city}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(trip.departureTime).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <PassengerDetails />
            <PaymentMethods />
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-4">
            {/* Timer */}
            <div className="lg:sticky lg:top-24 space-y-4">
              <SeatLockTimer />

              <BookingSummary />

              {/* Payment Button */}
              <Card className="border-2 border-primary/20 overflow-hidden">
                <CardHeader className="bg-linear-to-r from-primary/10 to-transparent pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Complete Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  {/* Total */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{totalAmount.toLocaleString()}₫</span>
                    </div>
                    {promotion && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount ({promotion.code})</span>
                        <span>-{discountAmount.toLocaleString()}₫</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">{finalAmount.toLocaleString()}₫</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleCompletePayment}
                    disabled={isCreatingBooking || isProcessing || !isContactComplete || !isPassengersComplete}
                    className={cn(
                      'w-full h-12 font-bold text-base transition-all',
                      isContactComplete && isPassengersComplete
                        ? 'bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl'
                        : ''
                    )}
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Redirecting to PayOS...
                      </>
                    ) : isCreatingBooking ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Booking...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay {finalAmount.toLocaleString()}₫
                      </>
                    )}
                  </Button>

                  {(!isContactComplete || !isPassengersComplete) && (
                    <p className="text-xs text-center text-muted-foreground">
                      Please complete all required information above
                    </p>
                  )}

                  {/* Trust Badges */}
                  <div className="flex items-center justify-center gap-4 pt-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ShieldCheck className="h-3 w-3 text-green-500" />
                      Secure
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CreditCard className="h-3 w-3 text-blue-500" />
                      PayOS
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
