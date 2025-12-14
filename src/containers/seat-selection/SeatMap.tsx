'use client';

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

interface Seat {
  seatNumber: string;
  row: number;
  column: number;
  deck?: string;
  type: string;
  price: number;
  status: 'available' | 'booked' | 'locked' | 'selected';
  position: {
    isWindow: boolean;
    isAisle: boolean;
  };
  lockedUntil?: string;
}

interface SeatMapProps {
  tripId: string;
  totalSeats?: number;
  occupiedSeats?: string[];
}

export default function SeatMap({ tripId, totalSeats = 40, occupiedSeats = [] }: SeatMapProps) {
  const dispatch = useAppDispatch();
  const selectedSeats = useAppSelector((state) => state.booking.selectedSeats);
  const sessionId = useAppSelector((state) => state.booking.sessionId);

  // Fetch seat map with real-time status
  const {
    data: seatMapData,
    isLoading,
    refetch,
  } = useGetTripSeatMapQuery(tripId, {
    pollingInterval: 10000, // Poll every 10 seconds for updates
  });

  const [lockSeats, { isLoading: isLocking }] = useLockSeatsMutation();
  const [checkAvailability] = useCheckSeatAvailabilityMutation();

  // Backend may wrap response in 'data' field
  const seatData = (seatMapData as any)?.data || seatMapData;
  const seats: Seat[] = seatData?.seats || [];
  const layout = seatData?.layout;

  // Generate or retrieve session ID
  useEffect(() => {
    if (!sessionId) {
      const storedSessionId = localStorage.getItem('bookingSessionId');
      if (storedSessionId) {
        dispatch(setSessionId(storedSessionId));
      } else {
        const newSessionId = crypto.randomUUID();
        localStorage.setItem('bookingSessionId', newSessionId);
        dispatch(setSessionId(newSessionId));
      }
    }
  }, [sessionId, dispatch]);

  const handleSeatClick = async (seat: Seat) => {
    // Can't select booked or locked seats
    if (seat.status === 'booked' || seat.status === 'locked') {
      toast.error(seat.status === 'booked' ? 'This seat is already booked' : 'This seat is locked by another user');
      return;
    }

    const isCurrentlySelected = seat.status === 'selected';

    if (isCurrentlySelected) {
      // Deselect seat
      dispatch(toggleSeat(seat.seatNumber));
      // Note: We don't release locks immediately, they'll expire or be released on page exit
    } else {
      // Check availability first
      try {
        const availabilityCheck = await checkAvailability({
          tripId,
          seatNumbers: [seat.seatNumber],
        }).unwrap();

        if (!availabilityCheck.available) {
          toast.error(`Seat ${seat.seatNumber} is no longer available`);
          refetch(); // Refresh seat map
          return;
        }

        // Select seat optimistically
        dispatch(toggleSeat(seat.seatNumber));

        // Lock the seat
        const currentSessionId = sessionId || localStorage.getItem('bookingSessionId');
        const response: any = await lockSeats({
          tripId,
          seatNumbers: [...selectedSeats, seat.seatNumber],
          sessionId: currentSessionId!,
        }).unwrap();

        // Backend wraps response in 'data' field
        const lockData = response.data || response;

        // Store session data
        const returnedSessionId = response.sessionId || lockData.sessionId;
        if (returnedSessionId && !sessionId) {
          dispatch(setSessionId(returnedSessionId));
          localStorage.setItem('bookingSessionId', returnedSessionId);
        }
        const expiresAt = lockData.expiresAt || response.expiresAt;
        if (expiresAt) {
          dispatch(setLockExpiresAt(new Date(expiresAt)));
        }

        toast.success(`Seat ${seat.seatNumber} locked for 10 minutes`);
      } catch (error: any) {
        // Revert selection if lock fails
        dispatch(toggleSeat(seat.seatNumber));
        console.error('Failed to lock seat:', error);
        toast.error(error?.data?.message || 'Failed to lock seat. Please try again.');
        refetch(); // Refresh to get current status
      }
    }
  };

  const getSeatClassName = (seat: Seat) => {
    const isSelected = selectedSeats.includes(seat.seatNumber);
    const status = isSelected ? 'selected' : seat.status;

    return cn('rounded-lg p-3 font-medium transition-all relative', {
      'border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer': status === 'available',
      'bg-blue-500 text-white cursor-pointer hover:bg-blue-600': status === 'selected',
      'bg-gray-300 text-gray-500 cursor-not-allowed': status === 'booked',
      'bg-yellow-300 text-yellow-800 cursor-not-allowed': status === 'locked',
      'ring-2 ring-green-500': seat.position.isWindow,
    });
  };

  const getSeatTooltip = (seat: Seat) => {
    const isSelected = selectedSeats.includes(seat.seatNumber);
    const status = isSelected ? 'selected' : seat.status;

    if (status === 'booked') return 'Already booked';
    if (status === 'locked' && seat.lockedUntil) {
      const lockTime = new Date(seat.lockedUntil).toLocaleTimeString();
      return `Locked until ${lockTime}`;
    }
    if (status === 'selected') return `Selected - ${seat.price.toLocaleString()} ₫`;
    return `${seat.seatNumber} - ${seat.price.toLocaleString()} ₫${seat.position.isWindow ? ' (Window)' : ''}`;
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Select Your Seats</h3>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="w-3 h-3 rounded border-2 border-green-500"></div>
          <span>Window Seat</span>
        </div>
      </div>

      {/* Driver Section */}
      <div className="mb-6">
        <div className="bg-gray-800 text-white py-2 px-4 rounded-t-lg text-center font-medium">🚗 Driver</div>
      </div>

      {/* Seat Grid */}
      <div className="space-y-6">
        {layout?.decks?.includes('lower') && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Lower Deck</h4>
            <div className="grid gap-2">
              {Object.entries(groupedSeats)
                .filter(([key]) => key.startsWith('lower'))
                .sort(([a], [b]) => parseInt(a.split('-')[1]) - parseInt(b.split('-')[1]))
                .map(([key, rowSeats]) => (
                  <div key={key} className="grid grid-cols-4 gap-2">
                    {rowSeats
                      .sort((a, b) => a.column - b.column)
                      .map((seat) => (
                        <button
                          key={seat.seatNumber}
                          onClick={() => handleSeatClick(seat)}
                          disabled={seat.status === 'booked' || seat.status === 'locked' || isLocking}
                          className={getSeatClassName(seat)}
                          title={getSeatTooltip(seat)}
                        >
                          <span className="text-xs">{seat.seatNumber}</span>
                          {seat.status === 'locked' && <span className="absolute top-1 right-1 text-xs">🔒</span>}
                        </button>
                      ))}
                  </div>
                ))}
            </div>
          </div>
        )}

        {layout?.decks?.includes('upper') && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Upper Deck</h4>
            <div className="grid gap-2">
              {Object.entries(groupedSeats)
                .filter(([key]) => key.startsWith('upper'))
                .sort(([a], [b]) => parseInt(a.split('-')[1]) - parseInt(b.split('-')[1]))
                .map(([key, rowSeats]) => (
                  <div key={key} className="grid grid-cols-4 gap-2">
                    {rowSeats
                      .sort((a, b) => a.column - b.column)
                      .map((seat) => (
                        <button
                          key={seat.seatNumber}
                          onClick={() => handleSeatClick(seat)}
                          disabled={seat.status === 'booked' || seat.status === 'locked' || isLocking}
                          className={getSeatClassName(seat)}
                          title={getSeatTooltip(seat)}
                        >
                          <span className="text-xs">{seat.seatNumber}</span>
                          {seat.status === 'locked' && <span className="absolute top-1 right-1 text-xs">🔒</span>}
                        </button>
                      ))}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Single deck layout */}
        {!layout?.decks && (
          <div className="grid gap-2">
            {Object.entries(groupedSeats)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([row, rowSeats]) => (
                <div key={row} className="grid grid-cols-4 gap-2">
                  {rowSeats
                    .sort((a, b) => a.column - b.column)
                    .map((seat) => (
                      <button
                        key={seat.seatNumber}
                        onClick={() => handleSeatClick(seat)}
                        disabled={seat.status === 'booked' || seat.status === 'locked' || isLocking}
                        className={getSeatClassName(seat)}
                        title={getSeatTooltip(seat)}
                      >
                        <span className="text-xs">{seat.seatNumber}</span>
                        {seat.status === 'locked' && <span className="absolute top-1 right-1 text-xs">🔒</span>}
                      </button>
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
            Selected: {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''}
          </span>
          {selectedSeats.length > 0 && (
            <span className="font-bold text-blue-600">
              Total:{' '}
              {seats
                .filter((s) => selectedSeats.includes(s.seatNumber))
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
