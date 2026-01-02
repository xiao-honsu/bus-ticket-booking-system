'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingCountdownTimerProps {
  tripId: string;
  durationMinutes?: number; // Default: 3 minutes
}

export default function BookingCountdownTimer({ tripId, durationMinutes = 3 }: BookingCountdownTimerProps) {
  const router = useRouter();
  const totalSeconds = durationMinutes * 60;
  const [timeLeft, setTimeLeft] = useState<number>(totalSeconds);
  const [isActive, setIsActive] = useState(true);
  const hasRedirected = useRef(false);

  // Countdown logic
  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    console.log(`⏱️ [Countdown] Starting ${durationMinutes}-minute timer`);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;

        // Show warning at 1 minute
        if (newTime === 60) {
          toast.warning('1 minute remaining!', {
            description: 'Please complete your booking soon.',
            duration: 5000,
          });
        }

        // Show warning at 30 seconds
        if (newTime === 30) {
          toast.warning('30 seconds remaining!', {
            description: 'Hurry! Page will reload soon.',
            duration: 5000,
          });
        }

        // When timer reaches 0
        if (newTime <= 0 && !hasRedirected.current) {
          hasRedirected.current = true;
          setIsActive(false);

          toast.error('Time expired! Reloading booking page...', {
            description: 'All locked seats will be released.',
            duration: 3000,
          });

          // Reload page after 2 seconds
          setTimeout(() => {
            window.location.href = `/booking/${tripId}`;
          }, 2000);

          return 0;
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeLeft, tripId, durationMinutes]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLowTime = timeLeft <= 60; // Less than 1 minute
  const isCritical = timeLeft <= 30; // Less than 30 seconds

  return (
    <Card
      className={cn(
        'border-2 py-0 gap-0',
        isCritical
          ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
          : isLowTime
            ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
            : 'border-primary/50 bg-primary/5'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {isCritical ? (
            <AlertCircle className="h-6 w-6 text-red-600 shrink-0 animate-pulse" />
          ) : isLowTime ? (
            <AlertCircle className="h-6 w-6 text-orange-600 shrink-0" />
          ) : (
            <Clock className="h-6 w-6 text-primary shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                'text-xs font-semibold uppercase tracking-wide truncate',
                isCritical ? 'text-red-700' : isLowTime ? 'text-orange-700' : 'text-muted-foreground'
              )}
            >
              {isCritical ? '🚨 Critical! Complete now!' : isLowTime ? '⚠️ Time running out' : '⏱️ Booking Time Limit'}
            </p>
            <p
              className={cn(
                'text-3xl font-bold tabular-nums mt-1',
                isCritical ? 'text-red-600 animate-pulse' : isLowTime ? 'text-orange-600' : 'text-primary'
              )}
            >
              {minutes}:{seconds.toString().padStart(2, '0')}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-1000 ease-linear',
              isCritical ? 'bg-red-600' : isLowTime ? 'bg-orange-500' : 'bg-primary'
            )}
            style={{ width: `${(timeLeft / totalSeconds) * 100}%` }}
          />
        </div>

        {isLowTime && (
          <p className="text-xs font-medium mt-2 text-center" style={{ color: isCritical ? '#dc2626' : '#ea580c' }}>
            {isCritical ? '🔴 Auto-reload in ' + timeLeft + ' seconds!' : '⚠️ Less than 1 minute remaining!'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
