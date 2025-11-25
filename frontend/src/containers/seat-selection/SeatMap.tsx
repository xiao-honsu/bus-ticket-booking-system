'use client';

import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { toggleSeat } from '@/lib/store/features/booking/bookingSlice';
import { cn } from '@/lib/utils';

interface SeatMapProps {
  tripId: string;
  totalSeats?: number;
  occupiedSeats?: string[];
}

export default function SeatMap({ tripId, totalSeats = 40, occupiedSeats = [] }: SeatMapProps) {
  const dispatch = useAppDispatch();
  const selectedSeats = useAppSelector((state) => state.booking.selectedSeats);

  const rows = Math.ceil(totalSeats / 4);
  const columns = 4;

  const handleSeatClick = (seatNumber: string) => {
    if (occupiedSeats.includes(seatNumber)) {
      return; // Can't select occupied seats
    }
    dispatch(toggleSeat(seatNumber));
  };

  const getSeatStatus = (seatNumber: string) => {
    if (occupiedSeats.includes(seatNumber)) return 'occupied';
    if (selectedSeats.includes(seatNumber)) return 'selected';
    return 'available';
  };

  const getSeatClassName = (seatNumber: string) => {
    const status = getSeatStatus(seatNumber);
    return cn(
      'rounded-lg p-3 font-medium transition-all',
      {
        'border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer':
          status === 'available',
        'bg-blue-500 text-white cursor-pointer hover:bg-blue-600': status === 'selected',
        'bg-gray-300 text-gray-500 cursor-not-allowed': status === 'occupied',
      }
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Select Your Seats</h3>
      <div className="mb-6">
        <div className="bg-gray-800 text-white py-2 px-4 rounded-t-lg text-center font-medium">
          🚗 Driver
        </div>
      </div>
      <div className="grid gap-2">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-4 gap-2">
            {Array.from({ length: columns }).map((_, colIndex) => {
              const seatNumber = String(rowIndex * columns + colIndex + 1);
              const seatIndex = rowIndex * columns + colIndex + 1;
              
              if (seatIndex > totalSeats) {
                return <div key={colIndex} />;
              }

              return (
                <button
                  key={colIndex}
                  onClick={() => handleSeatClick(seatNumber)}
                  disabled={occupiedSeats.includes(seatNumber)}
                  className={getSeatClassName(seatNumber)}
                >
                  {seatNumber}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-4 text-sm text-gray-600">
        Selected: {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
