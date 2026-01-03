'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  toggleSeat,
  setSessionId,
  setLockExpiresAt,
  addSeatDetail,
  removeSeatDetail,
} from '@/lib/store/features/booking/bookingSlice';
import { cn } from '@/lib/utils';
import { useGetTripSeatMapQuery, useLockSeatsMutation, useReleaseLocksMutation } from '@/lib/store/services/api';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false); // Track if user has clicked any seat
  const sessionId = useAppSelector((state) => state.booking.sessionId);
  const reduxSelectedSeats = useAppSelector((state) => state.booking.selectedSeats);
  const lockExpiresAt = useAppSelector((state) => state.booking.lockExpiresAt); // Get current timer state

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
  const [releaseLocks] = useReleaseLocksMutation();

  // Socket.IO: Real-time seat updates
  const handleSeatLocked = useCallback(
    (data: SocketSeatLockedEvent) => {
      console.log('🔒 [Seat Event] Seat locked event received:', data);
      console.log('   Locked seats:', data.seatNumbers);
      console.log('   Session ID:', data.sessionId);
      console.log('   Current user session:', sessionId);

      // Check if it's our lock
      if (data.sessionId === sessionId) {
        console.log('✅ [Seat Event] Our seats locked successfully (skipping UI update)');
        return; // Already handled in local state
      }

      // Someone else locked seats - refresh UI
      console.log('⚠️ [Seat Event] Another user locked seats, refreshing...');
      toast.info(`Seats ${data.seatNumbers.join(', ')} locked by another user`);
      refetch();
    },
    [sessionId, refetch]
  );

  const handleSeatReleased = useCallback(
    (data: SocketSeatReleasedEvent) => {
      console.log('🔓 [Seat Event] Seat released event received:', data);

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
      console.log('🎫 [Seat Event] Seat booked event received:', data);

      toast.info(`Seats ${data.seatNumbers.join(', ')} just got booked`);
      refetch();
    },
    [refetch]
  );

  // Join trip room and listen to events
  const socketHandlers = {
    onSeatLocked: handleSeatLocked,
    onSeatReleased: handleSeatReleased,
    onSeatBooked: handleSeatBooked,
  };

  // Debug: Log handlers setup
  useEffect(() => {
    console.log('🎯 [SeatMap] Socket handlers configured:', {
      hasLockHandler: !!socketHandlers.onSeatLocked,
      hasReleaseHandler: !!socketHandlers.onSeatReleased,
      hasBookedHandler: !!socketHandlers.onSeatBooked,
    });
  }, [socketHandlers.onSeatLocked, socketHandlers.onSeatReleased, socketHandlers.onSeatBooked]);

  const { isConnected, isInRoom } = useTripRoom(tripId, sessionId, socketHandlers);

  // Debug: Log connection status
  useEffect(() => {
    console.log('🔌 [WebSocket] Connection status:', {
      isConnected,
      isInRoom,
      tripId,
      sessionId,
    });

    if (!isConnected) {
      console.warn('⚠️ [WebSocket] Not connected! Events will not be received.');
    }

    if (isConnected && !isInRoom) {
      console.warn('⚠️ [WebSocket] Connected but not in room! Events will not be received.');
    }

    if (isConnected && isInRoom) {
      console.log('✅ [WebSocket] Ready to receive events!');
    }
  }, [isConnected, isInRoom, tripId, sessionId]);

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

  // Extract selected seats from API response on initial load
  useEffect(() => {
    const selectedFromAPI = seats.filter((s) => s.status === 'selected').map((s) => s.seatNumber);

    // Only sync on initial load (before user has interacted with seats)
    if (selectedFromAPI.length > 0 && localSelectedSeats.length === 0 && !isProcessing && !hasUserInteracted) {
      console.log('📥 [Init] Loading selected seats from API:', selectedFromAPI);
      setLocalSelectedSeats(selectedFromAPI);

      // Sync with Redux
      selectedFromAPI.forEach((seatNum) => {
        if (!reduxSelectedSeats.includes(seatNum)) {
          dispatch(toggleSeat(seatNum));
          const seatInfo = seats.find((s) => s.seatNumber === seatNum);
          if (seatInfo) {
            dispatch(
              addSeatDetail({
                seatNumber: seatInfo.seatNumber,
                price: seatInfo.price,
                seatType: seatInfo.seatType,
                position: seatInfo.position,
              })
            );
          }
        }
      });
    }
  }, [seats, isProcessing]);

  const handleSeatClick = async (seat: Seat) => {
    // Mark that user has interacted
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
    }

    // Prevent double click/concurrent operations
    if (isProcessing) {
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ [BLOCKED] Operation in progress, ignoring click');
      }
      return;
    }

    console.log('👆 [CLICK] Seat clicked:', seat.seatNumber);

    // Check if seat is selectable
    if (!seat.selectable || seat.status === 'booked') {
      toast.error('This seat is not available');
      return;
    }

    if (seat.status === 'locked' && !localSelectedSeats.includes(seat.seatNumber)) {
      toast.error('This seat is temporarily locked by another user');
      return;
    }

    // Check if seat is currently selected by this user (prioritize local state)
    const isCurrentlySelected = localSelectedSeats.includes(seat.seatNumber);

    if (isCurrentlySelected) {
      // Deselect seat - remove from selection
      console.log('🔄 [START] Deselecting seat:', seat.seatNumber);
      setIsProcessing(true);

      const newSelection = localSelectedSeats.filter((s) => s !== seat.seatNumber);
      setLocalSelectedSeats(newSelection);
      dispatch(toggleSeat(seat.seatNumber));
      dispatch(removeSeatDetail(seat.seatNumber));

      // If no seats left, release all locks
      if (newSelection.length === 0) {
        if (sessionId) {
          try {
            console.log('📤 [API] Calling releaseLocks for session:', sessionId);
            await releaseLocks(sessionId).unwrap();
            console.log('✅ [DONE] All locks released');
            toast.info('All seats deselected');
            dispatch(setLockExpiresAt(null));
            // No need to refetch - local state already updated
          } catch (error: any) {
            // Silent fail - locks will auto-expire anyway
            if (process.env.NODE_ENV === 'development') {
              console.log('⚠️ Release locks failed (will auto-expire):', error?.data?.message);
            }
            toast.info('All seats deselected');
            dispatch(setLockExpiresAt(null));
          } finally {
            setIsProcessing(false);
          }
        } else {
          toast.info('All seats deselected');
          setIsProcessing(false);
        }
        return;
      }

      // Lock remaining seats
      try {
        console.log('📤 [API] Updating lock for remaining seats:', newSelection);
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
        dispatch(setLockExpiresAt(response.expiresAt));
        console.log('✅ [DONE] Lock updated successfully');
        // No need to refetch - local state already updated
      } catch (error: any) {
        console.error('Failed to update lock:', error);

        // RTK Query error structure: { status, data }
        const errorMsg =
          error?.data?.message || // RTK Query: error.data.message
          error?.data?.error?.message || // Backend nested error
          error?.response?.data?.message || // Axios format (fallback)
          error?.error?.message ||
          error?.message ||
          'Failed to update seat selection';

        const statusCode = error?.status || error?.data?.statusCode || error?.statusCode || 0;

        // Debug logging (only in development)
        if (process.env.NODE_ENV === 'development') {
          console.log('⚠️ Seat update failed:', {
            remainingSeats: newSelection,
            message: errorMsg,
            statusCode: statusCode,
          });
        }

        // User-friendly notification
        if (errorMsg && errorMsg !== 'Failed to update seat selection') {
          toast.error(errorMsg, {
            description: 'Your seat selection could not be updated.',
            duration: 3000,
          });
        } else {
          toast.error('Unable to update selection', {
            description: 'Please try selecting your seats again.',
            duration: 3000,
          });
        }

        // Revert selection
        setLocalSelectedSeats([...newSelection, seat.seatNumber]);
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Select seat - add to selection
      console.log('➕ [START] Selecting seat:', seat.seatNumber);
      setIsProcessing(true);
      const newSelection = [...localSelectedSeats, seat.seatNumber];
      setLocalSelectedSeats(newSelection);
      dispatch(toggleSeat(seat.seatNumber));

      // Add seat detail with price
      dispatch(
        addSeatDetail({
          seatNumber: seat.seatNumber,
          price: seat.price,
          seatType: seat.seatType,
          position: seat.position,
        })
      );

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

        // Save expiration time - only on first seat selection
        // If we already have a timer running, don't reset it when adding more seats
        if (!lockExpiresAt) {
          dispatch(setLockExpiresAt(response.expiresAt));
          console.log('⏱️ [Timer] Started 3-minute countdown');
        } else {
          console.log('⏱️ [Timer] Keeping existing countdown (not resetting)');
        }

        console.log('✅ [DONE] Seat locked successfully');
        toast.success(`Seat ${seat.seatNumber} locked for you`);
        // No need to refetch - local state already updated
      } catch (error: any) {
        // RTK Query error structure: { status, data }
        // Backend response in error.data: { success, statusCode, message, error: {...} }
        const errorMsg =
          error?.data?.message || // RTK Query: error.data.message
          error?.data?.error?.message || // Backend nested error
          error?.response?.data?.message || // Axios format (fallback)
          error?.error?.message || // Alternative format
          error?.message || // Generic error
          'Unable to lock seat. Please try another seat.';

        const statusCode = error?.status || error?.data?.statusCode || error?.statusCode || 0;

        // Debug logging (only in development)
        if (process.env.NODE_ENV === 'development') {
          console.log('⚠️ Seat lock failed:', {
            seat: seat.seatNumber,
            message: errorMsg,
            statusCode: statusCode,
          });
        }

        // User-friendly notifications
        if (statusCode === 409) {
          toast.error(`Seat ${seat.seatNumber} is already taken`, {
            description: 'Another user just locked this seat. Please choose a different one.',
            duration: 4000,
          });
        } else if (errorMsg && errorMsg !== 'Unable to lock seat. Please try another seat.') {
          toast.error(errorMsg, {
            description: 'Please try selecting another seat.',
            duration: 3000,
          });
        } else {
          toast.error('Unable to lock this seat', {
            description: 'This seat may have been taken. Please choose another one.',
            duration: 3000,
          });
        }

        // Revert selection
        setLocalSelectedSeats(newSelection.filter((s) => s !== seat.seatNumber));
        dispatch(toggleSeat(seat.seatNumber));
        // Refetch to get updated seat status from server
        refetch();
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const getSeatClassName = (seat: Seat) => {
    // Priority: local state > server state
    const isSelected = localSelectedSeats.includes(seat.seatNumber);

    // Determine actual status
    let status: 'available' | 'booked' | 'locked' | 'selected';
    if (isSelected) {
      status = 'selected';
    } else if (seat.status === 'booked') {
      status = 'booked';
    } else if (seat.status === 'locked') {
      status = 'locked';
    } else {
      status = 'available';
    }

    return cn(
      'w-10 h-10 md:w-12 md:h-12 rounded-md font-semibold text-xs md:text-sm transition-all relative flex items-center justify-center border-2',
      {
        // Available - white with primary border
        'bg-background border-primary/50 hover:bg-primary/10 cursor-pointer': status === 'available',
        // Selected - primary color
        'bg-primary border-primary text-primary-foreground cursor-pointer hover:bg-primary/90 hover:scale-105':
          status === 'selected',
        // Booked - destructive
        'bg-destructive border-destructive text-destructive-foreground cursor-not-allowed': status === 'booked',
        // Locked - secondary
        'bg-secondary border-secondary text-secondary-foreground cursor-not-allowed': status === 'locked',
      }
    );
  };

  const getSeatTooltip = (seat: Seat) => {
    const isSelected = localSelectedSeats.includes(seat.seatNumber);
    const status = isSelected ? 'selected' : seat.status;

    if (status === 'selected') return 'Click to deselect';
    if (status === 'booked') return 'Already booked';
    if (status === 'locked' && seat.lockedUntil) {
      const lockTime = new Date(seat.lockedUntil).toLocaleTimeString();
      return `Locked until ${lockTime}`;
    }
    return `${seat.seatNumber} - ${seat.price.toLocaleString()} ₫${seat.position?.isWindow ? ' (Window)' : ''}`;
  };

  if (isLoading) {
    return (
      <div className="rounded-lg p-4 md:p-6 border bg-card">
        <Skeleton className="h-6 w-40 mb-3" />
        <Skeleton className="h-10 w-full mb-4" />
        <div className="grid gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-10 w-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!seatMapData || (!seatData && seats.length === 0)) {
    return (
      <div className="rounded-lg p-4 md:p-6 text-center border bg-card">
        <p className="text-muted-foreground text-sm mb-1">Seat map not available for this trip</p>
        <p className="text-xs text-muted-foreground">Trip ID: {tripId}</p>
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
    <div className="rounded-xl p-4 md:p-6 border bg-card">
      {/* Header with connection status */}
      <div className="mb-3 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {isConnected && isInRoom ? (
            <>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-[10px] md:text-xs font-medium text-primary">Live</span>
            </>
          ) : isConnected && !isInRoom ? (
            <>
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
              <span className="text-[10px] md:text-xs text-secondary-foreground font-medium">Connecting...</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-destructive rounded-full" />
              <span className="text-[10px] md:text-xs text-destructive font-medium">Offline</span>
            </>
          )}
        </div>
        <Badge variant="outline" className="text-[10px] md:text-xs font-medium">
          {availableSeatsCount}/{totalSeats} available
        </Badge>
      </div>

      {/* Instructions */}
      <p className="text-xs text-muted-foreground mb-4">💡 Click on available seats to select</p>

      {/* Driver Section - Compact */}
      <div className="mb-6">
        <div className="flex items-center gap-4 max-w-2xl mx-auto">
          <div className="relative shrink-0">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-secondary rounded-lg flex items-center justify-center border-2">
              <span className="text-xl md:text-2xl">👨‍✈️</span>
            </div>
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] md:text-[10px] font-medium text-muted-foreground whitespace-nowrap">
              Driver
            </span>
          </div>
          <div className="flex-1 border-t-2 border-dashed border-muted-foreground/30 relative">
            <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-card px-2 text-[9px] md:text-[10px] font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
              Front
            </span>
          </div>
        </div>
      </div>

      {/* Seat Grid */}
      <div className="space-y-6">
        {layout?.decks?.includes('lower') && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold uppercase flex items-center gap-1.5 text-muted-foreground">
                ⬇️ Lower Deck
              </h4>
              <Badge
                variant="outline"
                className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800"
              >
                {seats.filter((s) => s.deck === 'lower' && s.status === 'available').length} available
              </Badge>
            </div>
            <div className="space-y-2">
              {Object.entries(groupedSeats)
                .filter(([key]) => key.startsWith('lower'))
                .sort(([a], [b]) => parseInt(a.split('-')[1]) - parseInt(b.split('-')[1]))
                .map(([key, rowSeats]) => (
                  <div key={key} className="flex items-center gap-2 justify-center">
                    {rowSeats
                      .sort((a, b) => a.column - b.column)
                      .map((seat) => (
                        <div key={seat.seatNumber} className="relative">
                          <button
                            onClick={() => handleSeatClick(seat)}
                            disabled={seat.status === 'booked' || seat.status === 'locked' || isLocking || isProcessing}
                            className={getSeatClassName(seat)}
                            title={getSeatTooltip(seat)}
                          >
                            <span className="font-bold">{seat.seatNumber}</span>
                          </button>
                          {seat.position?.isWindow && (
                            <div
                              className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full border border-white"
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
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold uppercase flex items-center gap-1.5 text-muted-foreground">
                ⬆️ Upper Deck
              </h4>
              <Badge
                variant="outline"
                className="text-[10px] bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800"
              >
                {seats.filter((s) => s.deck === 'upper' && s.status === 'available').length} available
              </Badge>
            </div>
            <div className="space-y-2">
              {Object.entries(groupedSeats)
                .filter(([key]) => key.startsWith('upper'))
                .sort(([a], [b]) => parseInt(a.split('-')[1]) - parseInt(b.split('-')[1]))
                .map(([key, rowSeats]) => (
                  <div key={key} className="flex items-center gap-2 justify-center">
                    {rowSeats
                      .sort((a, b) => a.column - b.column)
                      .map((seat) => (
                        <div key={seat.seatNumber} className="relative">
                          <button
                            onClick={() => handleSeatClick(seat)}
                            disabled={seat.status === 'booked' || seat.status === 'locked' || isLocking || isProcessing}
                            className={getSeatClassName(seat)}
                            title={getSeatTooltip(seat)}
                          >
                            <span className="font-bold">{seat.seatNumber}</span>
                          </button>
                          {seat.position?.isWindow && (
                            <div
                              className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full border border-white"
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
          <div className="space-y-2">
            {Object.entries(groupedSeats)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([row, rowSeats]) => (
                <div key={row} className="flex items-center gap-2 justify-center">
                  {rowSeats
                    .sort((a, b) => a.column - b.column)
                    .map((seat, idx) => (
                      <React.Fragment key={seat.seatNumber}>
                        <div className="relative">
                          <button
                            onClick={() => handleSeatClick(seat)}
                            disabled={seat.status === 'booked' || seat.status === 'locked' || isLocking || isProcessing}
                            className={getSeatClassName(seat)}
                            title={getSeatTooltip(seat)}
                          >
                            <span className="font-bold">{seat.seatNumber}</span>
                          </button>
                          {seat.position?.isWindow && (
                            <div
                              className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full border border-white"
                              title="Window seat"
                            />
                          )}
                        </div>
                        {/* Add aisle gap after 2nd column */}
                        {seat.column === 2 && idx < rowSeats.length - 1 && <div className="w-4 md:w-6" />}
                      </React.Fragment>
                    ))}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Seat Legend - Inline at bottom */}
      <div className="mt-6 pt-4 border-t">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] md:text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 md:w-6 md:h-6 bg-background border-2 border-primary/50 rounded flex items-center justify-center text-[8px] md:text-[10px] font-semibold">
              A1
            </div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 md:w-6 md:h-6 bg-primary border-2 border-primary text-primary-foreground rounded flex items-center justify-center text-[8px] md:text-[10px] font-semibold">
              A2
            </div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 md:w-6 md:h-6 bg-destructive border-2 border-destructive text-destructive-foreground rounded flex items-center justify-center text-[8px] md:text-[10px] font-semibold">
              A3
            </div>
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 md:w-6 md:h-6 bg-secondary border-2 border-secondary text-secondary-foreground rounded flex items-center justify-center text-[8px] md:text-[10px] font-semibold">
              A4
            </div>
            <span>Locked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span>Window</span>
          </div>
        </div>
      </div>
    </div>
  );
}
