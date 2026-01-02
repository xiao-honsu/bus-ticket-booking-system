'use client';

import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useExtendLocksMutation } from '@/lib/store/services/api';
import { setLockExpiresAt } from '@/lib/store/features/booking/bookingSlice';
import { toast } from 'sonner';
import { Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SeatLockTimer() {
  const dispatch = useAppDispatch();
  const lockExpiresAt = useAppSelector((state) => state.booking.lockExpiresAt);
  const sessionId = useAppSelector((state) => state.booking.sessionId);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [extendLocks, { isLoading: isExtending }] = useExtendLocksMutation();

  useEffect(() => {
    if (!lockExpiresAt) {
      setTimeLeft(0);
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(lockExpiresAt).getTime();
      const diff = expiry - now;
      setTimeLeft(Math.max(0, Math.floor(diff / 1000)));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [lockExpiresAt]);

  const handleExtendLock = async () => {
    if (!sessionId) {
      toast.error('No active session found');
      return;
    }

    try {
      const response = await extendLocks({ sessionId, minutes: 3 }).unwrap();
      dispatch(setLockExpiresAt(response.newExpiresAt));
      toast.success(`Lock extended by 3 minutes (${response.extendedCount} locks)`);
    } catch (error: any) {
      const errorMsg =
        error?.data?.message ||
        error?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.error?.message ||
        error?.message ||
        'Unable to extend lock time';

      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ Extend lock failed:', {
          message: errorMsg,
          statusCode: error?.status || error?.data?.statusCode || error?.statusCode || 0,
        });
      }

      if (errorMsg && errorMsg !== 'Unable to extend lock time') {
        toast.error(errorMsg, {
          description: 'Your seat lock could not be extended.',
          duration: 4000,
        });
      } else {
        toast.error('Unable to extend lock time', {
          description: 'Please complete your booking before time runs out.',
          duration: 4000,
        });
      }
    }
  };

  if (!lockExpiresAt || timeLeft <= 0) {
    // Auto-cleanup: When timer expires, user should see seats released
    // Backend TTL index will auto-delete, frontend just hides timer
    return null;
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLowTime = timeLeft < 120; // Less than 2 minutes

  return (
    <Card
      className={cn(
        'border py-0 gap-0',
        isLowTime ? 'border-destructive bg-destructive/10' : 'border-primary/50 bg-primary/5'
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          {isLowTime ? (
            <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
          ) : (
            <Clock className="h-4 w-4 text-primary shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className={cn('text-xs font-medium truncate', isLowTime ? 'text-destructive' : '')}>
              {isLowTime ? 'Hurry! Seats releasing soon' : 'Seats locked for you'}
            </p>
            <p className={cn('text-lg font-bold', isLowTime ? 'text-destructive' : '')}>
              {minutes}:{seconds.toString().padStart(2, '0')}
            </p>
          </div>
          <Button
            variant={isLowTime ? 'destructive' : 'outline'}
            size="sm"
            onClick={handleExtendLock}
            disabled={isExtending || timeLeft > 120} // Disable if > 2 minutes (only allow extend in last minute)
            className="text-xs h-7 px-2 shrink-0"
          >
            {isExtending ? '...' : '+3min'}
          </Button>
        </div>
        {timeLeft < 60 && <p className="text-[10px] text-destructive mt-1">⚠️ Less than 1 min! Complete now.</p>}
      </CardContent>
    </Card>
  );
}
