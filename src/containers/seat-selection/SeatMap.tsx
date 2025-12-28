'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { toggleSeat, setSessionId, setLockExpiresAt } from '@/lib/store/features/booking/bookingSlice';
import { cn } from '@/lib/utils';
import { useGetTripSeatMapQuery, useLockSeatsMutation } from '@/lib/store/services/api';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useTripRoom } from '@/lib/services/socket';
import { SocketSeatLockedEvent, SocketSeatReleasedEvent, SocketSeatBookedEvent } from '@/lib/types/socket';

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

  // Fetch seat map with sessionId
  const {
    data: seatMapData,
    isLoading,
    refetch,
  } = useGetTripSeatMapQuery(sessionId ? { tripId, sessionId } : tripId, {
    // No polling - rely on Socket.IO for real-time updates
    pollingInterval: 0,
  });

  const [lockSeats, { isLoading: isLocking }] = useLockSeatsMutation();

  // Socket.IO: Real-time seat updates
  const handleSeatLocked = useCallback(
    (data: SocketSeatLockedEvent) => {
      console.log('🔒 Seat locked event:', data);

      // Check if it's our lock
      if (data.sessionId === sessionId) {
        console.log('✅ Our seats locked successfully');
        return; // Already handled in local state
      }

      // Someone else locked seats - refresh UI
      toast.info(`Seats ${data.seatNumbers.join(', ')} locked by another user`);
      refetch();
    },
    [sessionId, refetch]
  );

  const handleSeatReleased = useCallback(
    (data: SocketSeatReleasedEvent) => {
      console.log('🔓 Seat released event:', data);

      if (data.reason === 'booked') {
        // Seats were booked - show as booked
        toast.info(`Seats ${data.seatNumbers.join(', ')} have been booked`);
      } else {
        // Seats released - back to available
        toast.success(`Seats ${data.seatNumbers.join(', ')} are now available`);
      }

      refetch();
    },
    [refetch]
  );

  const handleSeatBooked = useCallback(
    (data: SocketSeatBookedEvent) => {
      console.log('🎫 Seat booked event:', data);

      toast.info(`Seats ${data.seatNumbers.join(', ')} just got booked`);
      refetch();
    },
    [refetch]
  );

  // Join trip room and listen to events
  const { isConnected, isInRoom } = useTripRoom(tripId, sessionId, {
    onSeatLocked: handleSeatLocked,
    onSeatReleased: handleSeatReleased,
    onSeatBooked: handleSeatBooked,
  });

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
      // Deselect seat - remove from selection
      const newSelection = localSelectedSeats.filter((s) => s !== seat.seatNumber);
      setLocalSelectedSeats(newSelection);
      dispatch(toggleSeat(seat.seatNumber));

      // If no seats left, don't call lock API
      if (newSelection.length === 0) {
        toast.info('All seats deselected');
        return;
      }

      // Lock remaining seats
      try {
        const response = await lockSeats({
          tripId,
          seatNumbers: newSelection,
          sessionId: sessionId || undefined,
        }).unwrap();

        // Save session ID
        const newSessionId = response.sessionId;
        if (newSessionId && newSessionId !== sessionId) {
          localStorage.setItem('seatlock_session', newSessionId);
          dispatch(setSessionId(newSessionId));
        }

        // Save expiration time
        dispatch(setLockExpiresAt(new Date(response.expiresAt)));
        refetch();
      } catch (error: any) {
        console.error('Failed to update lock:', error);
        toast.error(error?.data?.message || 'Failed to update seat selection');
        // Revert selection
        setLocalSelectedSeats([...newSelection, seat.seatNumber]);
      }
    } else {
      // Select seat - add to selection
      const newSelection = [...localSelectedSeats, seat.seatNumber];
      setLocalSelectedSeats(newSelection);
      dispatch(toggleSeat(seat.seatNumber));

      // Lock seats
      try {
        const response = await lockSeats({
          tripId,
          seatNumbers: newSelection,
          sessionId: sessionId || undefined,
        }).unwrap();

        // Save session ID (first time)
        const newSessionId = response.sessionId;
        if (newSessionId && newSessionId !== sessionId) {
          localStorage.setItem('seatlock_session', newSessionId);
          dispatch(setSessionId(newSessionId));
        }

        // Save expiration time
        dispatch(setLockExpiresAt(new Date(response.expiresAt)));
        toast.success(`Seat ${seat.seatNumber} locked for you`);
        refetch();
      } catch (error: any) {
        console.error('Failed to lock seat:', error);
        const errorMsg = error?.data?.message || 'Failed to lock seat';

        if (error?.status === 409) {
          toast.error('This seat was just locked by another user');
        } else {
          toast.error(errorMsg);
        }

        // Revert selection
        setLocalSelectedSeats(newSelection.filter((s) => s !== seat.seatNumber));
        dispatch(toggleSeat(seat.seatNumber));
        refetch();
      }
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
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
          <span className="text-lg">💡</span>
          <span>Click on available seats to reserve your perfect spot</span>
        </p>
      </div>

      {/* Driver Section - Front Left Position (Like Real Bus) */}
      <div className="mb-8">
        <div className="flex items-center gap-6 max-w-3xl mx-auto">
          {/* Driver Seat - Left Side */}
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg shadow-lg flex items-center justify-center border-2 border-slate-500">
              <span className="text-3xl">👨‍✈️</span>
            </div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-full">Driver</span>
            </div>
          </div>

          {/* Front of Bus Indicator */}
          <div className="flex-1 border-t-2 border-dashed border-gray-300 relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 -top-3 bg-white px-3 py-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">← Front of Bus →</span>
            </div>
          </div>
        </div>
      </div>

      {/* Seat Grid - Matches Reference UI */}
      <div className="space-y-8">
        {layout?.decks?.includes('lower') && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-gray-700 uppercase flex items-center gap-2">
                <span className="text-lg">⬇️</span>
                Lower Deck
              </h4>
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
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
              <h4 className="text-sm font-semibold text-gray-700 uppercase flex items-center gap-2">
                <span className="text-lg">⬆️</span>
                Upper Deck
              </h4>
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
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
