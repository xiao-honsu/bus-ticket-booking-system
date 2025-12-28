/**
 * Socket.IO Service - Real-time Seat Reservation
 * Manages WebSocket connection and provides React hooks
 */

import { io, Socket } from 'socket.io-client';
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  SOCKET_EVENTS,
  JoinTripPayload,
  JoinTripResponse,
  LeaveTripPayload,
  LeaveTripResponse,
  SocketSeatLockedEvent,
  SocketSeatReleasedEvent,
  SocketSeatBookedEvent,
  SocketConnectedEvent,
} from '@/lib/types/socket';

// ============================================
// Socket Instance (Singleton)
// ============================================

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (!socketInstance) {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    socketInstance = io(backendUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      autoConnect: true,
    });

    // Global connection event listeners
    socketInstance.on(SOCKET_EVENTS.CONNECT, () => {
      console.log('✅ Socket connected:', socketInstance?.id);
    });

    socketInstance.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    socketInstance.on(SOCKET_EVENTS.CONNECT_ERROR, (error) => {
      console.error('Socket connection error:', error.message);
    });

    socketInstance.on(SOCKET_EVENTS.CONNECTED, (data: SocketConnectedEvent) => {
      console.log('✅ Socket.IO Connected:', data.socketId);
      console.log('Server time:', data.serverTime);
    });
  }

  return socketInstance;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

// ============================================
// React Hooks
// ============================================

/**
 * useSocket - Main hook for Socket.IO connection
 */
export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = getSocket();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socketRef.current.on(SOCKET_EVENTS.CONNECT, onConnect);
    socketRef.current.on(SOCKET_EVENTS.DISCONNECT, onDisconnect);

    // Set initial state
    if (socketRef.current.connected) {
      setIsConnected(true);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off(SOCKET_EVENTS.CONNECT, onConnect);
        socketRef.current.off(SOCKET_EVENTS.DISCONNECT, onDisconnect);
      }
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
  };
}

/**
 * useTripRoom - Join/leave trip room + listen to seat events
 */
export function useTripRoom(
  tripId: string | null,
  sessionId: string | null,
  handlers: {
    onSeatLocked?: (data: SocketSeatLockedEvent) => void;
    onSeatReleased?: (data: SocketSeatReleasedEvent) => void;
    onSeatBooked?: (data: SocketSeatBookedEvent) => void;
  }
) {
  const { socket, isConnected } = useSocket();
  const [isInRoom, setIsInRoom] = useState(false);

  // Join trip room
  const joinTrip = useCallback(() => {
    if (!socket || !tripId) return;

    const payload: JoinTripPayload = {
      tripId,
      sessionId: sessionId || undefined,
    };

    socket.emit(SOCKET_EVENTS.JOIN_TRIP, payload, (response: JoinTripResponse) => {
      if (response.success) {
        console.log('✅ Joined trip room:', response.tripId);
        if (response.currentStatus) {
          console.log('Current status:', response.currentStatus);
        }
        setIsInRoom(true);
      } else {
        console.error('❌ Failed to join trip room:', response.message);
      }
    });
  }, [socket, tripId, sessionId]);

  // Leave trip room
  const leaveTrip = useCallback(() => {
    if (!socket || !tripId) return;

    const payload: LeaveTripPayload = { tripId };

    socket.emit(SOCKET_EVENTS.LEAVE_TRIP, payload, (response: LeaveTripResponse) => {
      if (response.success) {
        console.log('✅ Left trip room');
        setIsInRoom(false);
      }
    });
  }, [socket, tripId]);

  // Auto join when tripId changes
  useEffect(() => {
    if (isConnected && tripId) {
      joinTrip();
    }

    return () => {
      if (tripId) {
        leaveTrip();
      }
    };
  }, [isConnected, tripId, joinTrip, leaveTrip]);

  // Listen to seat events
  useEffect(() => {
    if (!socket) return;

    const { onSeatLocked, onSeatReleased, onSeatBooked } = handlers;

    if (onSeatLocked) {
      socket.on(SOCKET_EVENTS.SEAT_LOCKED, onSeatLocked);
    }

    if (onSeatReleased) {
      socket.on(SOCKET_EVENTS.SEAT_RELEASED, onSeatReleased);
    }

    if (onSeatBooked) {
      socket.on(SOCKET_EVENTS.SEAT_BOOKED, onSeatBooked);
    }

    return () => {
      if (onSeatLocked) {
        socket.off(SOCKET_EVENTS.SEAT_LOCKED, onSeatLocked);
      }
      if (onSeatReleased) {
        socket.off(SOCKET_EVENTS.SEAT_RELEASED, onSeatReleased);
      }
      if (onSeatBooked) {
        socket.off(SOCKET_EVENTS.SEAT_BOOKED, onSeatBooked);
      }
    };
  }, [socket, handlers]);

  return {
    socket,
    isConnected,
    isInRoom,
    joinTrip,
    leaveTrip,
  };
}

/**
 * useSeatEvents - Simplified hook for seat event listeners
 */
export function useSeatEvents(handlers: {
  onSeatLocked?: (data: SocketSeatLockedEvent) => void;
  onSeatReleased?: (data: SocketSeatReleasedEvent) => void;
  onSeatBooked?: (data: SocketSeatBookedEvent) => void;
}) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const { onSeatLocked, onSeatReleased, onSeatBooked } = handlers;

    if (onSeatLocked) {
      socket.on(SOCKET_EVENTS.SEAT_LOCKED, onSeatLocked);
    }

    if (onSeatReleased) {
      socket.on(SOCKET_EVENTS.SEAT_RELEASED, onSeatReleased);
    }

    if (onSeatBooked) {
      socket.on(SOCKET_EVENTS.SEAT_BOOKED, onSeatBooked);
    }

    return () => {
      if (onSeatLocked) {
        socket.off(SOCKET_EVENTS.SEAT_LOCKED, onSeatLocked);
      }
      if (onSeatReleased) {
        socket.off(SOCKET_EVENTS.SEAT_RELEASED, onSeatReleased);
      }
      if (onSeatBooked) {
        socket.off(SOCKET_EVENTS.SEAT_BOOKED, onSeatBooked);
      }
    };
  }, [socket, handlers]);
}
