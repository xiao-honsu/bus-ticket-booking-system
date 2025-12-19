'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { toggleSeat, setSessionId, setLockExpiresAt } from '@/lib/store/features/booking/bookingSlice';
import { cn } from '@/lib/utils';
import {
  useGetTripSeatMapQuery,
  useLockSeatsMutation,
  useCheckSeatAvailabilityMutation,
} from '@/lib/store/services/api';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface Seat {
  seatNumber: string;
  row: number;
  column: number;
  deck?: 'upper' | 'lower';
  seatType: 'window' | 'aisle' | 'standard' | 'vip' | 'sleeper';
  type: 'standard' | 'vip' | 'sleeper';
  price: number;
  status: 'available' | 'booked' | 'locked' | 'selected';
  position: {
    x: number;
    y: number;
    isWindow: boolean;
    isAisle: boolean;
  };
  selectable: boolean;
  lockedUntil?: string;
  lockedBy?: string;
}

interface SeatMapProps {
  tripId: string;
  totalSeats?: number;
  occupiedSeats?: string[];
}

export default function SeatMap({ tripId, totalSeats = 40, occupiedSeats = [] }: SeatMapProps) {
  const dispatch = useAppDispatch();
  const [localSelectedSeats, setLocalSelectedSeats] = useState<string[]>([]);
  const sessionId = useAppSelector((state) => state.booking.sessionId);
  const reduxSelectedSeats = useAppSelector((state) => state.booking.selectedSeats);

  // Fetch seat map with sessionId to get user's locked seats
  const queryParams = sessionId ? `?sessionId=${sessionId}` : '';
  const [checkAvailability] = useCheckSeatAvailabilityMutation();

  const {
    data: seatMapData,
    isLoading,
    refetch,
  } = useGetTripSeatMapQuery(`${tripId}${queryParams}`, {
    pollingInterval: 30000, // Poll every 30 seconds for real-time updates
  });

  const [lockSeats, { isLoading: isLocking }] = useLockSeatsMutation();

  // API response structure: { tripId, busType, totalSeats, availableSeats, layout, seats }
  const seatData = (seatMapData as any)?.data || seatMapData;
  const seats: Seat[] = seatData?.seats || [];
  const layout = seatData?.layout;
  const busType = seatData?.busType;
  const availableSeatsCount = seatData?.availableSeats;

  // Initialize session ID from localStorage or wait for API to generate
  useEffect(() => {
    const storedSessionId = localStorage.getItem('seatlock_session');
    if (storedSessionId && !sessionId) {
      dispatch(setSessionId(storedSessionId));
    }
  }, [sessionId, dispatch]);

  // Extract selected seats from API response (status === 'selected')
  useEffect(() => {
    const selectedFromAPI = seats.filter((s) => s.status === 'selected').map((s) => s.seatNumber);

    if (selectedFromAPI.length > 0) {
      setLocalSelectedSeats(selectedFromAPI);
      // Sync with Redux
      selectedFromAPI.forEach((seatNum) => {
        if (!reduxSelectedSeats.includes(seatNum)) {
          dispatch(toggleSeat(seatNum));
        }
      });
    }
  }, [seats, dispatch, reduxSelectedSeats]);

  const handleSeatClick = async (seat: Seat) => {
    // Check if seat is selectable
    if (!seat.selectable || seat.status === 'booked') {
      toast.error('This seat is not available');
      return;
    }

    if (seat.status === 'locked') {
      toast.error('This seat is temporarily locked by another user');
      return;
    }

    const isCurrentlySelected = seat.status === 'selected' || localSelectedSeats.includes(seat.seatNumber);

    if (isCurrentlySelected) {
      // Deselect seat
      dispatch(toggleSeat(seat.seatNumber));
      setLocalSelectedSeats(localSelectedSeats.filter((s) => s !== seat.seatNumber));
    } else {
      // Select seat (simple selection without backend locking for now)
      dispatch(toggleSeat(seat.seatNumber));
      setLocalSelectedSeats([...localSelectedSeats, seat.seatNumber]);
      toast.success(`Seat ${seat.seatNumber} selected`);
    }
  };

  const getSeatClassName = (seat: Seat) => {
    const isSelected = localSelectedSeats.includes(seat.seatNumber);
    const status = isSelected ? 'selected' : seat.status;

    return cn(
      'w-14 h-14 rounded-md font-semibold text-sm transition-all relative flex items-center justify-center border-2',
      {
        // Available - white with green border (matches reference UI)
        'bg-white border-green-500 hover:bg-green-50 cursor-pointer text-gray-800': status === 'available',
        // Selected - orange/yellow (matches reference UI)
        'bg-orange-400 border-orange-500 text-white cursor-pointer': status === 'selected',
        // Booked - red (matches reference UI)
        'bg-red-500 border-red-600 text-white cursor-not-allowed': status === 'booked',
        // Locked - yellow (locked by others)
        'bg-yellow-400 border-yellow-500 text-gray-800 cursor-not-allowed': status === 'locked',
      }
    );
  };

  const getSeatTooltip = (seat: Seat) => {
    const isSelected = localSelectedSeats.includes(seat.seatNumber);
    const status = isSelected ? 'selected' : seat.status;

    if (status === 'booked') return 'Already booked';
    if (status === 'locked' && seat.lockedUntil) {
      const lockTime = new Date(seat.lockedUntil).toLocaleTimeString();
      return `Locked until ${lockTime}`;
    }
    if (status === 'selected') return `Selected - ${seat.price.toLocaleString()} ₫`;
    return `${seat.seatNumber} - ${seat.price.toLocaleString()} ₫${seat.position?.isWindow ? ' (Window)' : ''}`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-12 w-full mb-6" />
        <div className="grid gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-12 w-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!seatMapData || (!seatData && seats.length === 0)) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-600 mb-2">Seat map not available for this trip</p>
        <p className="text-sm text-gray-500">Trip ID: {tripId}</p>
      </div>
    );
  }

  // Group seats by row and deck (if applicable)
  const groupedSeats = seats.reduce(
    (acc, seat) => {
      const key = seat.deck ? `${seat.deck}-${seat.row}` : seat.row.toString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(seat);
      return acc;
    },
    {} as Record<string, Seat[]>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-3">Click on available seats to reserve your seat.</p>
      </div>

      {/* Driver Section */}
      <div className="mb-6">
        <div className="bg-gray-800 text-white py-3 px-4 rounded-lg text-center font-medium flex items-center justify-center gap-2">
          <span className="text-2xl">🚗</span>
          <span>Driver</span>
        </div>
      </div>

      {/* Seat Grid - Matches Reference UI */}
      <div className="space-y-8">
        {layout?.decks?.includes('lower') && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-gray-700 uppercase">Lower Deck</h4>
              <Badge variant="outline" className="text-xs">
                {seats.filter((s) => s.deck === 'lower' && s.status === 'available').length} available
              </Badge>
            </div>
            <div className="space-y-3">
              {Object.entries(groupedSeats)
                .filter(([key]) => key.startsWith('lower'))
                .sort(([a], [b]) => parseInt(a.split('-')[1]) - parseInt(b.split('-')[1]))
                .map(([key, rowSeats]) => (
                  <div key={key} className="flex items-center gap-3 justify-center">
                    {rowSeats
                      .sort((a, b) => a.column - b.column)
                      .map((seat) => (
                        <div key={seat.seatNumber} className="relative">
                          <button
                            onClick={() => handleSeatClick(seat)}
                            disabled={seat.status === 'booked' || seat.status === 'locked' || isLocking}
                            className={getSeatClassName(seat)}
                            title={getSeatTooltip(seat)}
                          >
                            <span className="font-bold">{seat.seatNumber}</span>
                          </button>
                          {seat.position?.isWindow && (
                            <div
                              className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"
                              title="Window seat"
                            />
                          )}
                        </div>
                      ))}
                  </div>
                ))}
            </div>
          </div>
        )}

        {layout?.decks?.includes('upper') && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-gray-700 uppercase">Upper Deck</h4>
              <Badge variant="outline" className="text-xs">
                {seats.filter((s) => s.deck === 'upper' && s.status === 'available').length} available
              </Badge>
            </div>
            <div className="space-y-3">
              {Object.entries(groupedSeats)
                .filter(([key]) => key.startsWith('upper'))
                .sort(([a], [b]) => parseInt(a.split('-')[1]) - parseInt(b.split('-')[1]))
                .map(([key, rowSeats]) => (
                  <div key={key} className="flex items-center gap-3 justify-center">
                    {rowSeats
                      .sort((a, b) => a.column - b.column)
                      .map((seat) => (
                        <div key={seat.seatNumber} className="relative">
                          <button
                            onClick={() => handleSeatClick(seat)}
                            disabled={seat.status === 'booked' || seat.status === 'locked' || isLocking}
                            className={getSeatClassName(seat)}
                            title={getSeatTooltip(seat)}
                          >
                            <span className="font-bold">{seat.seatNumber}</span>
                          </button>
                          {seat.position?.isWindow && (
                            <div
                              className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"
                              title="Window seat"
                            />
                          )}
                        </div>
                      ))}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Single deck layout */}
        {!layout?.decks && (
          <div className="space-y-3">
            {Object.entries(groupedSeats)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([row, rowSeats]) => (
                <div key={row} className="flex items-center gap-3 justify-center">
                  {rowSeats
                    .sort((a, b) => a.column - b.column)
                    .map((seat, idx) => (
                      <React.Fragment key={seat.seatNumber}>
                        <div className="relative">
                          <button
                            onClick={() => handleSeatClick(seat)}
                            disabled={seat.status === 'booked' || seat.status === 'locked' || isLocking}
                            className={getSeatClassName(seat)}
                            title={getSeatTooltip(seat)}
                          >
                            <span className="font-bold">{seat.seatNumber}</span>
                          </button>
                          {seat.position?.isWindow && (
                            <div
                              className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"
                              title="Window seat"
                            />
                          )}
                        </div>
                        {/* Add aisle gap after 2nd column */}
                        {seat.column === 2 && idx < rowSeats.length - 1 && <div className="w-8" />}
                      </React.Fragment>
                    ))}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Selection Summary */}
      <div className="mt-6 pt-4 border-t">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">
            Selected: {localSelectedSeats.length} seat{localSelectedSeats.length !== 1 ? 's' : ''}
          </span>
          {localSelectedSeats.length > 0 && (
            <span className="font-bold text-blue-600">
              Total:{' '}
              {seats
                .filter((s) => localSelectedSeats.includes(s.seatNumber))
                .reduce((sum, s) => sum + s.price, 0)
                .toLocaleString()}{' '}
              ₫
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
