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
    // Socket.IO connects to BASE server URL only (no /api/v1 path)
    // Backend runs Socket.IO on default namespace (/)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

    // Extract base URL: http://localhost:4000/api/v1 -> http://localhost:4000
    // Also handles: https://api.dsa-bus-booking.io.vn/api/v1 -> https://api.dsa-bus-booking.io.vn
    const backendUrl = apiUrl.replace(/\/api\/v\d+\/?$/, '').replace(/\/$/, '');

    // Validation: Ensure we have a valid URL
    if (!backendUrl.startsWith('http')) {
      console.error('❌ [Socket.IO] Invalid backend URL:', backendUrl);
      throw new Error('Invalid Socket.IO backend URL');
    }

    // Log for debugging
    console.log('[Socket.IO] ENV API URL:', process.env.NEXT_PUBLIC_API_URL);
    console.log('[Socket.IO] Stripped Base URL:', backendUrl);
    console.log('[Socket.IO] ✅ Connecting to default namespace (/)');

    socketInstance = io(backendUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      autoConnect: true,
      // Additional options for production
      path: '/socket.io/', // Default Socket.IO path (backend must serve here)
    });

    // Global connection event listeners
    socketInstance.on(SOCKET_EVENTS.CONNECT, () => {
      console.log('✅ [Socket.IO] Connected:', socketInstance?.id);
      console.log('✅ [Socket.IO] Transport:', socketInstance?.io.engine.transport.name);
    });

    socketInstance.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      console.log('❌ [Socket.IO] Disconnected:', reason);
      if (reason === 'io server disconnect') {
        console.log('⚠️ [Socket.IO] Server disconnected, attempting reconnect...');
        socketInstance?.connect();
      }
    });

    socketInstance.on(SOCKET_EVENTS.CONNECT_ERROR, (error) => {
      console.error('❌ [Socket.IO] Connection error:', error.message);
      console.error('❌ [Socket.IO] Error details:', error);
    });

    socketInstance.on(SOCKET_EVENTS.CONNECTED, (data: SocketConnectedEvent) => {
      console.log('✅ [Socket.IO] Server handshake complete');
      console.log('   Socket ID:', data.socketId);
      console.log('   Server time:', data.serverTime);
    });

    // Debug: Listen to ALL seat events at global level
    socketInstance.on(SOCKET_EVENTS.SEAT_LOCKED, (data) => {
      console.log('🔔 [Global Listener] SEAT_LOCKED event received:', data);
    });

    socketInstance.on(SOCKET_EVENTS.SEAT_RELEASED, (data) => {
      console.log('🔔 [Global Listener] SEAT_RELEASED event received:', data);
    });

    socketInstance.on(SOCKET_EVENTS.SEAT_BOOKED, (data) => {
      console.log('🔔 [Global Listener] SEAT_BOOKED event received:', data);
    });

    // Catch-all for debugging
    socketInstance.onAny((eventName, ...args) => {
      if (!['connect', 'disconnect', 'ping', 'pong'].includes(eventName)) {
        console.log('📨 [Socket.IO] Received event:', eventName, args);
      }
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
// Debug Utilities (Development Only)
// ============================================

/**
 * Debug utility: Manually emit a test seat locked event
 * Usage in browser console: window.__testSeatLocked('trip123', ['A1', 'A2'])
 */
if (typeof window !== 'undefined') {
  (window as any).__testSeatLocked = (tripId: string, seatNumbers: string[]) => {
    const socket = getSocket();
    const testEvent = {
      tripId,
      seatNumbers,
      sessionId: 'test-session-' + Date.now(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      lockedBy: 'guest' as const,
      timestamp: new Date().toISOString(),
    };
    console.log('🧪 [Test] Manually emitting seatLocked event:', testEvent);
    socket.emit(SOCKET_EVENTS.SEAT_LOCKED, testEvent);
  };

  (window as any).__getSocket = () => {
    const socket = getSocket();
    console.log('🔌 [Debug] Socket instance:', {
      id: socket.id,
      connected: socket.connected,
      listeners: socket.listeners(SOCKET_EVENTS.SEAT_LOCKED).length,
    });
    return socket;
  };
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
    if (!socket || !tripId) {
      console.warn('⚠️ [Socket.IO] Cannot join trip: missing socket or tripId');
      return;
    }

    if (!socket.connected) {
      console.warn('⚠️ [Socket.IO] Cannot join trip: socket not connected');
      return;
    }

    const payload: JoinTripPayload = {
      tripId,
      sessionId: sessionId || undefined,
    };

    console.log('📤 [Socket.IO] Joining trip room:', payload);

    socket.emit(SOCKET_EVENTS.JOIN_TRIP, payload, (response: JoinTripResponse) => {
      if (response.success) {
        console.log('✅ [Socket.IO] Joined trip room:', response.tripId);
        if (response.currentStatus) {
          console.log('   Current status:', response.currentStatus);
        }
        setIsInRoom(true);

        // Verify listeners are ready
        console.log('📌 [Socket.IO] Room joined, listeners should be active now');
      } else {
        console.error('❌ [Socket.IO] Failed to join trip room:', response.message);
      }
    });
  }, [socket, tripId, sessionId]);

  // Leave trip room
  const leaveTrip = useCallback(() => {
    if (!socket || !tripId) return;

    const payload: LeaveTripPayload = { tripId };

    console.log('📤 [Socket.IO] Leaving trip room:', tripId);

    socket.emit(SOCKET_EVENTS.LEAVE_TRIP, payload, (response: LeaveTripResponse) => {
      if (response.success) {
        console.log('✅ [Socket.IO] Left trip room');
        setIsInRoom(false);
      } else {
        console.warn('⚠️ [Socket.IO] Failed to leave trip room');
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
    if (!socket) {
      console.warn('⚠️ [Socket.IO] Cannot setup listeners: socket not available');
      return;
    }

    if (!socket.connected) {
      console.warn('⚠️ [Socket.IO] Cannot setup listeners: socket not connected');
      return;
    }

    const { onSeatLocked, onSeatReleased, onSeatBooked } = handlers;

    console.log('🎯 [Socket.IO] Setting up event listeners for trip:', tripId);

    if (onSeatLocked) {
      console.log('   ✅ Registered listener: seatLocked');
      socket.on(SOCKET_EVENTS.SEAT_LOCKED, onSeatLocked);
    }

    if (onSeatReleased) {
      console.log('   ✅ Registered listener: seatReleased');
      socket.on(SOCKET_EVENTS.SEAT_RELEASED, onSeatReleased);
    }

    if (onSeatBooked) {
      console.log('   ✅ Registered listener: seatBooked');
      socket.on(SOCKET_EVENTS.SEAT_BOOKED, onSeatBooked);
    }

    // Test listener is working
    const testListener = (eventName: string) => {
      console.log(`✅ [Socket.IO] Test: ${eventName} listener is active`);
    };

    socket.once('connect', () => testListener('connect'));

    return () => {
      console.log('🧹 [Socket.IO] Cleaning up event listeners for trip:', tripId);

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
  }, [socket, tripId, handlers.onSeatLocked, handlers.onSeatReleased, handlers.onSeatBooked]);

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
