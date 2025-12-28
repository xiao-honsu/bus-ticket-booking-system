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
      const response = await extendLocks({ sessionId, minutes: 10 }).unwrap();

      // Use newExpiresAt from response (matches new API)
      const newExpiryTime = new Date(response.newExpiresAt);
      dispatch(setLockExpiresAt(newExpiryTime.toISOString()));

      toast.success(`Lock extended by 10 minutes (${response.extendedCount} locks)`);
    } catch (error: any) {
      console.error('Failed to extend lock:', error);
      toast.error(error?.data?.message || 'Failed to extend lock time');
    }
  };

  if (!lockExpiresAt || timeLeft <= 0) {
    return null;
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLowTime = timeLeft < 120; // Less than 2 minutes

  return (
    <Card className={cn('border-2', isLowTime ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-blue-50')}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {isLowTime ? <AlertCircle className="h-5 w-5 text-red-600" /> : <Clock className="h-5 w-5 text-blue-600" />}
          <div className="flex-1">
            <p className={cn('text-sm font-medium', isLowTime ? 'text-red-900' : 'text-blue-900')}>
              {isLowTime ? 'Hurry up! Your seats will be released soon' : 'Seats locked for you'}
            </p>
            <p className={cn('text-2xl font-bold', isLowTime ? 'text-red-600' : 'text-blue-600')}>
              {minutes}:{seconds.toString().padStart(2, '0')}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExtendLock}
            disabled={isExtending || timeLeft > 480} // Can't extend if more than 8 minutes left
            className="whitespace-nowrap"
          >
            {isExtending ? 'Extending...' : 'Extend +10min'}
          </Button>
        </div>
        {timeLeft < 60 && (
          <p className="text-xs text-red-600 mt-2">⚠️ Less than 1 minute remaining! Complete your booking now.</p>
        )}
      </CardContent>
    </Card>
  );
}
