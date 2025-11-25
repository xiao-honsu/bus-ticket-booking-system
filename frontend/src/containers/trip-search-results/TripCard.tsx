'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Users, Bus } from 'lucide-react';

interface TripCardProps {
  trip: any;
}

export default function TripCard({ trip }: TripCardProps) {
  const router = useRouter();

  const handleBookNow = () => {
    router.push(`/booking/${trip.id}`);
  };

  const departureTime = new Date(trip.departureTime);
  const arrivalTime = new Date(trip.arrivalTime);
  const availableSeats = trip.bus?.totalSeats - (trip.bookedSeats?.length || 0);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Route and Time Info */}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                  <MapPin className="h-4 w-4" />
                  <span>{trip.route?.origin || 'Origin'}</span>
                </div>
                <div className="text-2xl font-bold">
                  {departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              
              <div className="flex flex-col items-center px-4">
                <div className="text-gray-400 text-sm mb-1">
                  {Math.round((arrivalTime.getTime() - departureTime.getTime()) / (1000 * 60 * 60))}h
                </div>
                <div className="w-24 h-0.5 bg-gray-300 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-400 rounded-full" />
                </div>
              </div>

              <div className="flex-1 text-right">
                <div className="flex items-center justify-end gap-2 text-gray-600 text-sm mb-1">
                  <MapPin className="h-4 w-4" />
                  <span>{trip.route?.destination || 'Destination'}</span>
                </div>
                <div className="text-2xl font-bold">
                  {arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {/* Bus Info */}
            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Bus className="h-4 w-4" />
                <span>{trip.bus?.type || 'Standard'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{availableSeats} seats available</span>
              </div>
              {trip.bus?.plateNumber && (
                <Badge variant="outline">{trip.bus.plateNumber}</Badge>
              )}
            </div>
          </div>

          {/* Price and Action */}
          <div className="flex flex-col items-end gap-3 md:min-w-40">
            <div className="text-right">
              <div className="text-sm text-gray-600">From</div>
              <div className="text-3xl font-bold text-blue-600">${trip.price}</div>
              <div className="text-xs text-gray-500">per seat</div>
            </div>
            <Button 
              onClick={handleBookNow} 
              className="w-full md:w-auto"
              disabled={availableSeats === 0}
            >
              {availableSeats === 0 ? 'Sold Out' : 'Book Now'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
