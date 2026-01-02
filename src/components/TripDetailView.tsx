'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Clock,
  Star,
  Phone,
  Wifi,
  Droplet,
  Wind,
  Zap,
  Armchair,
  Package,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  MapPin,
  Share2,
  Bus,
  ArrowRight,
} from 'lucide-react';
import { mockTripData, MockTrip } from '@/mock/tripData';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface TripDetailViewProps {
  trip?: MockTrip;
}

const amenitiesIconMap: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="w-4 h-4" />,
  Toilet: <Droplet className="w-4 h-4" />,
  'Air Conditioning': <Wind className="w-4 h-4" />,
  'USB Charging': <Zap className="w-4 h-4" />,
  'Reclining Seats': <Armchair className="w-4 h-4" />,
  'Blankets & Pillows': <Package className="w-4 h-4" />,
};

export default function TripDetailView({ trip = mockTripData }: TripDetailViewProps) {
  const router = useRouter();

  const departureDate = new Date(trip.departureTime);
  const arrivalDate = new Date(trip.arrivalTime);
  const durationHours = trip.route.estimatedDuration / 60;

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm');
  };

  const formatDate = (date: Date) => {
    return format(date, 'EEE, MMM d');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const occupancyPercentage = ((trip.bus.totalSeats - trip.availableSeats) / trip.bus.totalSeats) * 100;

  const handleBookNow = () => {
    router.push(`/booking/${trip._id || trip.id}`);
  };

  const policyItems = [
    { key: 'cancellation', label: 'Cancellation Policy', icon: AlertTriangle },
    { key: 'refund', label: 'Refund Policy', icon: CheckCircle2 },
    { key: 'rescheduling', label: 'Rescheduling', icon: Clock },
    { key: 'baggage', label: 'Baggage Policy', icon: Package },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-3 py-4 md:px-4 md:py-6 space-y-4">
      {/* Back Button */}
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2 h-8">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back
      </Button>

      {/* Header Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Trip Info */}
        <div className="lg:col-span-2">
          <Card className="py-0 gap-0">
            <CardHeader className="p-4 pb-3">
              <div className="space-y-3">
                {/* Trip Title & Status */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div className="min-w-0">
                    <h1 className="text-lg md:text-xl font-bold mb-1 flex items-center gap-2 flex-wrap">
                      <Bus className="w-5 h-5 text-primary shrink-0" />
                      <span className="truncate">{trip.route.origin.city}</span>
                      <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                      <span className="truncate">{trip.route.destination.city}</span>
                    </h1>
                    <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{trip.route.routeName}</span>
                    </p>
                  </div>
                  <Badge
                    variant={trip.status === 'scheduled' ? 'default' : 'secondary'}
                    className="w-fit shrink-0 text-xs"
                  >
                    {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                  </Badge>
                </div>

                <Separator />

                {/* Journey Timeline - Compact */}
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center justify-between gap-2">
                    {/* Departure */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] md:text-xs text-muted-foreground font-medium mb-0.5">Departure</p>
                      <p className="text-xl md:text-2xl font-bold">{formatTime(departureDate)}</p>
                      <p className="text-xs font-medium">{formatDate(departureDate)}</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{trip.route.origin.landmark}</span>
                      </p>
                    </div>

                    {/* Duration */}
                    <div className="flex flex-col items-center gap-1 shrink-0 px-2">
                      <div className="bg-background p-1.5 rounded-full border">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <p className="text-[10px] md:text-xs font-bold whitespace-nowrap">{durationHours.toFixed(1)}h</p>
                      <div className="w-12 md:w-16 h-px bg-border" />
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {trip.route.distance}km
                      </Badge>
                    </div>

                    {/* Arrival */}
                    <div className="flex-1 text-right min-w-0">
                      <p className="text-[10px] md:text-xs text-muted-foreground font-medium mb-0.5">Arrival</p>
                      <p className="text-xl md:text-2xl font-bold">{formatTime(arrivalDate)}</p>
                      <p className="text-xs font-medium">{formatDate(arrivalDate)}</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground mt-1 flex items-center gap-1 justify-end">
                        <MapPin className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{trip.route.destination.landmark}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stops Info - Inline */}
                {trip.route.stops && trip.route.stops.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs font-medium mb-1.5 text-muted-foreground">
                      Stops ({trip.route.stops.length}):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {trip.route.stops.map((stop, idx) => (
                        <Badge key={idx} variant="outline" className="text-[10px] px-2 py-0.5">
                          {stop.city} ({stop.minutesFromStart}m)
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>

            {/* Bus & Driver Info */}
            <CardContent className="p-4 pt-0 space-y-4">
              {/* Bus Info */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Bus Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    {
                      label: 'Type',
                      value: trip.bus.busType,
                      transform: (v: string) => v.charAt(0).toUpperCase() + v.slice(1),
                    },
                    { label: 'Seats', value: trip.bus.totalSeats },
                    { label: 'Number', value: trip.bus.busNumber },
                    { label: 'Model', value: trip.bus.busModel || 'N/A' },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-muted/50 rounded-lg p-2">
                      <p className="text-[10px] text-muted-foreground">{item.label}</p>
                      <p className="font-medium text-xs truncate">
                        {item.transform ? item.transform(String(item.value)) : item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {trip.bus.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded-md border text-xs">
                      <span className="text-muted-foreground">
                        {amenitiesIconMap[amenity] || <CheckCircle2 className="w-3 h-3" />}
                      </span>
                      <span className="font-medium">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Driver Info */}
              {trip.driver && (
                <div className="pt-3 border-t">
                  <h3 className="text-sm font-semibold mb-2">Driver</h3>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground text-xs">Name:</span>
                      <span className="font-medium text-xs">{trip.driver.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground text-xs flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Contact:
                      </span>
                      <span className="font-medium text-xs">{trip.driver.phone}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground text-xs">License:</span>
                      <span className="font-medium text-xs">{trip.driver.licenseNumber}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Price & Booking */}
        <div className="lg:col-span-1 space-y-3">
          {/* Price Card */}
          <Card className="sticky top-4 py-0 gap-0">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm font-semibold">Price & Availability</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-3">
              <div className="bg-primary/10 rounded-lg p-3 text-center">
                <p className="text-[10px] text-muted-foreground mb-0.5">Price per seat</p>
                <p className="text-xl md:text-2xl font-bold">{formatPrice(trip.pricePerSeat)}</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available:</span>
                  <span className="font-semibold">{trip.availableSeats} seats</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Booked:</span>
                  <span className="font-semibold">{trip.bus.totalSeats - trip.availableSeats} seats</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Occupancy:</span>
                  <span className="font-semibold">{occupancyPercentage.toFixed(0)}%</span>
                </div>
              </div>

              <Progress value={occupancyPercentage} className="w-full h-2" />

              <Button
                onClick={handleBookNow}
                disabled={trip.availableSeats === 0 || trip.status !== 'scheduled'}
                className="w-full font-semibold"
                size="sm"
              >
                {trip.availableSeats === 0 ? 'Fully Booked' : trip.status !== 'scheduled' ? 'Unavailable' : 'Book Now'}
              </Button>

              {trip.availableSeats === 0 && (
                <p className="text-[10px] text-muted-foreground text-center">No seats available</p>
              )}
            </CardContent>
          </Card>

          {/* Operator Card */}
          <Card className="py-0 gap-0">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm font-semibold">Operator</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-3">
              <div className="flex items-center gap-3">
                {trip.operator.logoUrl && (
                  <Image
                    src={trip.operator.logoUrl}
                    alt={trip.operator.companyName}
                    width={36}
                    height={36}
                    className="rounded-full border"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{trip.operator.companyName}</p>
                  {trip.operator.rating && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 fill-current text-yellow-500" />
                      <span className="font-medium text-xs">{trip.operator.rating.overall.toFixed(1)}</span>
                      {trip.operator.rating.totalReviews && (
                        <span className="text-[10px] text-muted-foreground">({trip.operator.rating.totalReviews})</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-muted rounded-lg text-xs">
                <Phone className="w-3 h-3 text-muted-foreground" />
                <span className="font-medium">{trip.operator.phoneNumber}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Rating Details - Compact */}
      {trip.operator.rating && (
        <Card className="py-0 gap-0">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Star className="w-4 h-4" />
              Operator Rating
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 fill-current text-yellow-500" />
                <span className="text-2xl md:text-3xl font-bold">{trip.operator.rating.overall.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">/ 5.0</span>
              </div>
              <div className="flex-1">
                <Progress value={(trip.operator.rating.overall / 5) * 100} className="h-2" />
                {trip.operator.rating.totalReviews && (
                  <p className="text-[10px] text-muted-foreground mt-1">{trip.operator.rating.totalReviews} reviews</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Policies Section - Compact */}
      {trip.policies && (
        <Card className="py-0 gap-0">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm font-semibold">Policies & Terms</CardTitle>
            <CardDescription className="text-xs">Important information</CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3 space-y-2">
            {policyItems.map((policy) => {
              const Icon = policy.icon;
              return (
                <Collapsible key={policy.key}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-between h-8 text-xs">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3 h-3" />
                        <span className="font-medium">{policy.label}</span>
                      </div>
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-1.5">
                    <div className="bg-muted/50 rounded-md p-2.5">
                      <p className="text-xs text-muted-foreground">
                        {trip.policies[policy.key as keyof typeof trip.policies]}
                      </p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Footer CTA */}
      <div className="flex flex-col sm:flex-row gap-2 justify-center py-4">
        <Button
          size="sm"
          onClick={handleBookNow}
          disabled={trip.availableSeats === 0 || trip.status !== 'scheduled'}
          className="font-semibold px-8"
        >
          {trip.availableSeats === 0 ? 'Fully Booked' : 'Book This Trip'}
        </Button>
        <Button size="sm" variant="outline" className="font-medium px-8">
          <Share2 className="w-3.5 h-3.5 mr-1.5" />
          Share
        </Button>
      </div>
    </div>
  );
}
