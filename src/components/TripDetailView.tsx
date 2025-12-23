'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import {
  AlertCircle,
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
  ChevronUp,
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
  const [expandedPolicy, setExpandedPolicy] = useState<string | null>(null);

  const departureDate = new Date(trip.departureTime);
  const arrivalDate = new Date(trip.arrivalTime);
  const durationHours = trip.route.estimatedDuration / 60;

  // Use date-fns for consistent formatting on server and client
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
    {
      key: 'cancellation',
      label: 'Cancellation Policy',
      icon: <AlertTriangle className="w-4 h-4" />,
    },
    {
      key: 'refund',
      label: 'Refund Policy',
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    {
      key: 'rescheduling',
      label: 'Rescheduling',
      icon: <Clock className="w-4 h-4" />,
    },
    {
      key: 'baggage',
      label: 'Baggage Policy',
      icon: <Package className="w-4 h-4" />,
    },
    {
      key: 'petPolicy',
      label: 'Pet Policy',
      icon: <AlertCircle className="w-4 h-4" />,
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4 hover:bg-white/80 backdrop-blur-sm transition-all duration-300 hover:scale-105"
      >
        ← Back to Search
      </Button>

      {/* Header Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main Trip Info */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden bg-white/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.01]">
            <CardHeader className="pb-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white relative">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
              <div className="space-y-4 relative z-10">
                {/* Trip Title & Status */}
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-4xl font-black mb-3 flex items-center gap-3 drop-shadow-lg">
                      <span className="text-5xl">🚌</span>
                      {trip.route.origin.city} <span className="text-yellow-300 animate-pulse">→</span>{' '}
                      {trip.route.destination.city}
                    </h1>
                    <p className="text-white/90 text-lg font-medium flex items-center gap-2">
                      <span className="text-xl">📍</span>
                      {trip.route.routeName}
                    </p>
                  </div>
                  <Badge
                    variant={trip.status === 'scheduled' ? 'default' : 'secondary'}
                    className="mt-1 bg-white/20 backdrop-blur-sm text-white border-white/40 px-4 py-2 text-sm font-bold"
                  >
                    {trip.status === 'scheduled' ? '✅' : '⏸️'}{' '}
                    {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                  </Badge>
                </div>

                <Separator className="bg-white/30" />

                {/* Journey Timeline */}
                <div className="space-y-4">
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="text-3xl font-black text-white drop-shadow-md">{formatTime(departureDate)}</div>
                        <div className="text-sm text-white/90 font-semibold">{formatDate(departureDate)}</div>
                        <div className="text-sm text-white/80 mt-2 flex items-center gap-1">
                          <span className="text-lg">📍</span>
                          {trip.route.origin.landmark}
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-2 px-6">
                        <div className="bg-white/30 backdrop-blur-sm p-3 rounded-full">
                          <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-xs text-white font-bold whitespace-nowrap">
                          {durationHours.toFixed(1)}h
                        </div>
                        <div className="w-24 h-2 bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 rounded-full shadow-md animate-pulse" />
                        <div className="text-xs text-white font-bold bg-white/20 px-3 py-1 rounded-full">
                          {trip.route.distance}km
                        </div>
                      </div>

                      <div className="flex-1 text-right">
                        <div className="text-3xl font-black text-white drop-shadow-md">{formatTime(arrivalDate)}</div>
                        <div className="text-sm text-white/90 font-semibold">{formatDate(arrivalDate)}</div>
                        <div className="text-sm text-white/80 mt-2 flex items-center gap-1 justify-end">
                          <span className="text-lg">🏯</span>
                          {trip.route.destination.landmark}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stops Info */}
                  {trip.route.stops && trip.route.stops.length > 0 && (
                    <div className="bg-white/20 backdrop-blur-md p-5 rounded-xl border border-white/30 shadow-md">
                      <p className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <span className="text-lg">🛑</span>
                        Stops on the way:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {trip.route.stops.map((stop, idx) => (
                          <Badge
                            key={idx}
                            className="text-xs bg-white/30 backdrop-blur-sm text-white border-white/40 hover:bg-white/40 transition-all px-3 py-1.5 font-semibold"
                          >
                            📌 {stop.city} ({stop.minutesFromStart}m)
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>

            {/* Bus & Driver Info */}
            <CardContent className="space-y-6 pt-6">
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  <span className="text-2xl">🚍</span>
                  Bus Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl shadow-md border border-blue-200 hover:shadow-lg transition-all transform hover:scale-105">
                    <p className="text-xs text-blue-600 mb-2 font-semibold">🔖 Bus Type</p>
                    <p className="font-bold text-blue-900 capitalize">{trip.bus.busType}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl shadow-md border border-purple-200 hover:shadow-lg transition-all transform hover:scale-105">
                    <p className="text-xs text-purple-600 mb-2 font-semibold">💺 Total Seats</p>
                    <p className="font-bold text-purple-900">{trip.bus.totalSeats}</p>
                  </div>
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-xl shadow-md border border-pink-200 hover:shadow-lg transition-all transform hover:scale-105">
                    <p className="text-xs text-pink-600 mb-2 font-semibold">🔢 Bus Number</p>
                    <p className="font-bold text-pink-900">{trip.bus.busNumber}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl shadow-md border border-green-200 hover:shadow-lg transition-all transform hover:scale-105">
                    <p className="text-xs text-green-600 mb-2 font-semibold">🏷️ Model</p>
                    <p className="font-bold text-green-900 text-sm">{trip.bus.busModel || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                  <span className="text-2xl">✨</span>
                  Amenities & Features
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {trip.bus.amenities.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-4 bg-gradient-to-br from-teal-50 to-green-50 rounded-xl border border-teal-200 shadow-md hover:shadow-lg transition-all transform hover:scale-105 hover:bg-gradient-to-br hover:from-teal-100 hover:to-green-100"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className="text-teal-600 bg-white p-2 rounded-lg">
                        {amenitiesIconMap[amenity] || <CheckCircle2 className="w-5 h-5" />}
                      </div>
                      <span className="text-sm font-bold text-teal-900">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Driver Info */}
              {trip.driver && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      <span className="text-2xl">👨‍✈️</span>
                      Driver Information
                    </h3>
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border-2 border-orange-200 shadow-lg space-y-3">
                      <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm p-3 rounded-lg">
                        <span className="text-2xl">👤</span>
                        <div>
                          <span className="text-xs text-gray-600 block">Name:</span>
                          <span className="font-bold text-gray-900">{trip.driver.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm p-3 rounded-lg">
                        <Phone className="w-5 h-5 text-orange-600" />
                        <div>
                          <span className="text-xs text-gray-600 block">Contact:</span>
                          <span className="font-bold text-gray-900">{trip.driver.phone}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm p-3 rounded-lg">
                        <span className="text-2xl">🪪</span>
                        <div>
                          <span className="text-xs text-gray-600 block">License:</span>
                          <span className="font-bold text-gray-900">{trip.driver.licenseNumber}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Price & Booking */}
        <div className="lg:col-span-1 space-y-4">
          {/* Price Card */}
          <Card className="sticky top-4 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white border-0 shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <span className="text-3xl">💰</span>
                Price & Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div className="bg-white/20 backdrop-blur-md p-5 rounded-xl border border-white/30">
                <p className="text-sm text-white/80 mb-2 font-semibold">💵 Price per seat</p>
                <p className="text-4xl font-black text-white drop-shadow-lg">{formatPrice(trip.pricePerSeat)}</p>
              </div>

              <Separator className="bg-white/30" />

              <div className="space-y-3 bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                <div className="flex justify-between text-sm">
                  <span className="text-white/80 font-semibold flex items-center gap-1">
                    <span>✅</span> Available seats:
                  </span>
                  <span className="font-bold text-white text-lg">{trip.availableSeats}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/80 font-semibold flex items-center gap-1">
                    <span>🎫</span> Booked seats:
                  </span>
                  <span className="font-bold text-white text-lg">{trip.bus.totalSeats - trip.availableSeats}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/80 font-semibold flex items-center gap-1">
                    <span>📊</span> Occupancy:
                  </span>
                  <span className="font-bold text-white text-lg">{occupancyPercentage.toFixed(0)}%</span>
                </div>
              </div>

              {/* Occupancy Bar */}
              <div className="w-full bg-white/20 rounded-full h-3 shadow-inner">
                <div
                  className="bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 h-3 rounded-full transition-all shadow-lg"
                  style={{ width: `${occupancyPercentage}%` }}
                />
              </div>

              <Button
                onClick={handleBookNow}
                disabled={trip.availableSeats === 0 || trip.status !== 'scheduled'}
                className={`w-full font-bold text-lg py-7 rounded-xl shadow-2xl transition-all transform hover:scale-105 ${
                  trip.availableSeats === 0 || trip.status !== 'scheduled'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-900 animate-pulse hover:animate-none'
                }`}
                size="lg"
              >
                {trip.availableSeats === 0 ? (
                  <span className="flex items-center gap-2">❌ Fully Booked</span>
                ) : trip.status !== 'scheduled' ? (
                  <span className="flex items-center gap-2">⏸️ Unavailable</span>
                ) : (
                  <span className="flex items-center gap-2">🎉 Book Now</span>
                )}
              </Button>

              {trip.availableSeats === 0 && (
                <p className="text-xs text-white bg-red-500/30 backdrop-blur-sm px-3 py-2 rounded-lg text-center font-semibold border border-red-300/50">
                  ⚠️ No seats available for this trip
                </p>
              )}
            </CardContent>
          </Card>

          {/* Operator Card */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
            <CardHeader className="bg-gradient-to-r from-indigo-100 to-purple-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-2xl">🏢</span>
                Operator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex items-center gap-4">
                {trip.operator.logoUrl && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-md opacity-50" />
                    <Image
                      src={trip.operator.logoUrl}
                      alt={trip.operator.companyName}
                      width={56}
                      height={56}
                      className="rounded-full bg-white shadow-lg relative z-10 border-2 border-white"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-bold text-base text-gray-900">{trip.operator.companyName}</p>
                  {trip.operator.rating && (
                    <div className="flex items-center gap-2 mt-2 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-200">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-black text-sm">{trip.operator.rating.overall.toFixed(1)}</span>
                      {trip.operator.rating.totalReviews && (
                        <span className="text-xs text-gray-600 font-semibold">
                          ({trip.operator.rating.totalReviews} reviews)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-xl border border-blue-200">
                <Phone className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-gray-900">{trip.operator.phoneNumber}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Rating Details */}
      {trip.operator.rating && (
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl transform hover:scale-105 transition-all">
          <CardHeader className="bg-gradient-to-r from-yellow-100 via-orange-100 to-amber-100">
            <CardTitle className="flex items-center gap-2 text-xl">
              <span className="text-2xl">⭐</span>
              Operator Rating
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center p-8 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border-2 border-yellow-200 shadow-lg">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Star className="w-12 h-12 fill-yellow-400 text-yellow-400 animate-pulse" />
                <span className="text-6xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  {trip.operator.rating.overall.toFixed(1)}
                </span>
                <span className="text-2xl text-gray-600 font-bold">/ 5.0</span>
              </div>
              {trip.operator.rating.totalReviews && (
                <p className="text-sm text-gray-600 font-semibold mb-4 bg-white/70 py-2 px-4 rounded-full inline-block">
                  📊 Based on {trip.operator.rating.totalReviews} reviews
                </p>
              )}
              <div className="w-full bg-gray-200 rounded-full h-3 mt-4 shadow-inner">
                <div
                  className="bg-gradient-to-r from-yellow-400 via-orange-400 to-amber-400 h-3 rounded-full shadow-lg transition-all"
                  style={{ width: `${(trip.operator.rating.overall / 5) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Policies Section */}
      {trip.policies && (
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100">
            <CardTitle className="flex items-center gap-2 text-xl">
              <span className="text-2xl">📋</span>
              Trip Policies & Terms
            </CardTitle>
            <CardDescription className="text-gray-700 font-medium">
              Important information about this trip
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            {policyItems.map((policy, index) => (
              <button
                key={policy.key}
                onClick={() => setExpandedPolicy(expandedPolicy === policy.key ? null : policy.key)}
                className="w-full text-left"
              >
                <div
                  className={`flex items-center justify-between p-5 border-2 rounded-xl transition-all transform hover:scale-102 ${
                    expandedPolicy === policy.key
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 shadow-lg'
                      : 'bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-gray-200 hover:border-blue-200 shadow-md hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-full ${
                        expandedPolicy === policy.key ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'
                      } transition-all`}
                    >
                      {policy.icon}
                    </div>
                    <span className="font-bold text-gray-900">{policy.label}</span>
                  </div>
                  {expandedPolicy === policy.key ? (
                    <ChevronUp className="w-5 h-5 text-blue-600 font-bold" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                {expandedPolicy === policy.key && (
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 border-t-0 rounded-b-xl shadow-inner animate-in slide-in-from-top-2">
                    <p className="text-sm text-gray-800 leading-relaxed font-medium">
                      {trip.policies[policy.key as keyof typeof trip.policies]}
                    </p>
                  </div>
                )}
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Footer CTA */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center py-8">
        <Button
          size="lg"
          onClick={handleBookNow}
          disabled={trip.availableSeats === 0 || trip.status !== 'scheduled'}
          className={`font-bold text-lg px-12 py-7 rounded-xl shadow-2xl transition-all transform hover:scale-110 ${
            trip.availableSeats === 0 || trip.status !== 'scheduled'
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white animate-pulse hover:animate-none'
          }`}
        >
          {trip.availableSeats === 0 ? (
            <span className="flex items-center gap-2">❌ Fully Booked</span>
          ) : (
            <span className="flex items-center gap-2">🎉 Book This Trip Now</span>
          )}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="font-bold text-lg px-12 py-7 rounded-xl shadow-xl border-2 border-purple-300 hover:bg-purple-50 hover:border-purple-500 transition-all transform hover:scale-110 bg-white/80 backdrop-blur-sm"
        >
          <span className="flex items-center gap-2">📤 Share Trip</span>
        </Button>
      </div>
    </div>
  );
}
