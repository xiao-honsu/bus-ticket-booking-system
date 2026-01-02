'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGetBusQuery, useUpdateBusSeatMapMutation } from '@/lib/store/services/api';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';

interface Seat {
  seatNumber: string;
  row: number;
  column: number;
  seatType: 'standard' | 'vip' | 'window' | 'aisle';
  position?: { x: number; y: number };
}

interface SeatMap {
  rows: number;
  columns: number;
  seats: Seat[];
}

const seatTypeColors = {
  standard: 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500',
  vip: 'bg-yellow-300 hover:bg-yellow-400 dark:bg-yellow-600 dark:hover:bg-yellow-500',
  window: 'bg-blue-200 hover:bg-blue-300 dark:bg-blue-600 dark:hover:bg-blue-500',
  aisle: 'bg-green-200 hover:bg-green-300 dark:bg-green-600 dark:hover:bg-green-500',
};

export default function BusSeatMapConfigPage() {
  const params = useParams();
  const router = useRouter();
  const busId = params.busId as string;

  const { data: bus, isLoading: isLoadingBus } = useGetBusQuery(busId);
  const [updateSeatMap, { isLoading: isSaving }] = useUpdateBusSeatMapMutation();

  // Initialize state from bus data using useMemo for initial values
  const initialSeatMapData = useMemo(
    () => ({
      rows: bus?.seatMap?.rows || 10,
      columns: bus?.seatMap?.columns || 4,
      seats: bus?.seatMap?.seats || [],
    }),
    [bus?.seatMap?.rows, bus?.seatMap?.columns, bus?.seatMap?.seats]
  );

  const [rows, setRows] = useState(initialSeatMapData.rows);
  const [columns, setColumns] = useState(initialSeatMapData.columns);
  const [seats, setSeats] = useState<Seat[]>(initialSeatMapData.seats);
  const [selectedSeatType, setSelectedSeatType] = useState<'standard' | 'vip' | 'window' | 'aisle'>('standard');

  // Sync state when bus data changes
  const [prevBusId, setPrevBusId] = useState<string | null>(null);
  if (bus && busId !== prevBusId) {
    setPrevBusId(busId);
    if (bus.seatMap) {
      setRows(bus.seatMap.rows || 10);
      setColumns(bus.seatMap.columns || 4);
      setSeats(bus.seatMap.seats || []);
    }
  }

  const handleLayoutChange = (templateRows: number, templateColumns: number) => {
    setRows(templateRows);
    setColumns(templateColumns);

    const newSeats: Seat[] = [];
    for (let row = 1; row <= templateRows; row++) {
      for (let col = 1; col <= templateColumns; col++) {
        newSeats.push({
          seatNumber: `${row}${String.fromCharCode(64 + col)}`,
          row,
          column: col,
          seatType: 'standard',
        });
      }
    }
    setSeats(newSeats);
  };

  const handleSeatClick = (row: number, column: number) => {
    const seatIndex = seats.findIndex((s) => s.row === row && s.column === column);

    if (seatIndex >= 0) {
      const updatedSeats = [...seats];
      updatedSeats[seatIndex] = {
        ...updatedSeats[seatIndex],
        seatType: selectedSeatType,
      };
      setSeats(updatedSeats);
    } else {
      const newSeat: Seat = {
        seatNumber: `${row}${String.fromCharCode(64 + column)}`,
        row,
        column,
        seatType: selectedSeatType,
      };
      setSeats([...seats, newSeat]);
    }
  };

  const handleRemoveSeat = (row: number, column: number) => {
    setSeats(seats.filter((s) => !(s.row === row && s.column === column)));
  };

  const getSeatAtPosition = (row: number, column: number): Seat | undefined => {
    return seats.find((s) => s.row === row && s.column === column);
  };

  const handleSave = async () => {
    try {
      const seatMapData: SeatMap = {
        rows,
        columns,
        seats,
      };

      await updateSeatMap({ busId, seatMapData }).unwrap();

      toast.success('Seat map updated successfully');
      router.push('/admin/buses');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update seat map');
    }
  };

  if (isLoadingBus) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading bus information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border shadow-sm sticky top-0 z-10">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push('/admin/buses')} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Bus Management
              </Button>
              <div className="h-6 w-px bg-border"></div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Configure Seat Map</h1>
                <p className="text-sm text-muted-foreground">
                  Bus: {bus?.busNumber} • {bus?.licensePlate}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => router.push('/admin/buses')} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Seat Map'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Controls */}
          <div className="col-span-3 space-y-6">
            {/* Layout Templates */}
            <div className="bg-card rounded-xl shadow-sm border-2 border-border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">📐 Layout Templates</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full h-14 text-base font-medium"
                  onClick={() => handleLayoutChange(10, 4)}
                >
                  Standard (10×4)
                  <span className="text-xs text-gray-500 ml-2">40 seats</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-14 text-base font-medium"
                  onClick={() => handleLayoutChange(12, 3)}
                >
                  Limousine (12×3)
                  <span className="text-xs text-gray-500 ml-2">36 seats</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-14 text-base font-medium"
                  onClick={() => handleLayoutChange(8, 2)}
                >
                  Sleeper (8×2)
                  <span className="text-xs text-gray-500 ml-2">16 seats</span>
                </Button>
              </div>
            </div>

            {/* Custom Layout */}
            <div className="bg-card rounded-xl shadow-sm border-2 border-border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">⚙️ Custom Layout</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rows" className="text-sm font-medium mb-2 block">
                    Number of Rows
                  </Label>
                  <Input
                    id="rows"
                    type="number"
                    min="1"
                    max="20"
                    value={rows}
                    onChange={(e) => setRows(parseInt(e.target.value) || 1)}
                    className="h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="columns" className="text-sm font-medium mb-2 block">
                    Number of Columns
                  </Label>
                  <Input
                    id="columns"
                    type="number"
                    min="1"
                    max="6"
                    value={columns}
                    onChange={(e) => setColumns(parseInt(e.target.value) || 1)}
                    className="h-11"
                  />
                </div>
              </div>
            </div>

            {/* Seat Type Selector */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-xl shadow-sm border-2 border-blue-200 dark:border-blue-800 p-6">
              <h3 className="text-lg font-semibold mb-4 text-blue-900 dark:text-blue-300 flex items-center gap-2">
                🎨 Painting Mode
              </h3>
              <div className="space-y-3">
                <Label className="text-sm mb-2 block text-gray-700">Select Seat Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedSeatType('standard')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedSeatType === 'standard'
                        ? 'bg-gray-200 dark:bg-gray-600 border-gray-500 dark:border-gray-400 ring-2 ring-blue-500 shadow-md'
                        : 'bg-card border-border hover:border-muted-foreground hover:shadow'
                    }`}
                  >
                    <div className="text-sm font-semibold">Standard</div>
                  </button>
                  <button
                    onClick={() => setSelectedSeatType('vip')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedSeatType === 'vip'
                        ? 'bg-yellow-300 dark:bg-yellow-600 border-yellow-500 dark:border-yellow-400 ring-2 ring-blue-500 shadow-md'
                        : 'bg-card border-border hover:border-muted-foreground hover:shadow'
                    }`}
                  >
                    <div className="text-sm font-semibold">VIP</div>
                  </button>
                  <button
                    onClick={() => setSelectedSeatType('window')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedSeatType === 'window'
                        ? 'bg-blue-200 dark:bg-blue-600 border-blue-500 dark:border-blue-400 ring-2 ring-blue-500 shadow-md'
                        : 'bg-card border-border hover:border-muted-foreground hover:shadow'
                    }`}
                  >
                    <div className="text-sm font-semibold">Window</div>
                  </button>
                  <button
                    onClick={() => setSelectedSeatType('aisle')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedSeatType === 'aisle'
                        ? 'bg-green-200 dark:bg-green-600 border-green-500 dark:border-green-400 ring-2 ring-blue-500 shadow-md'
                        : 'bg-card border-border hover:border-muted-foreground hover:shadow'
                    }`}
                  >
                    <div className="text-sm font-semibold">Aisle</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-amber-50 dark:bg-amber-950 rounded-xl border-2 border-amber-200 dark:border-amber-800 p-6">
              <h3 className="text-sm font-semibold mb-3 text-amber-900 dark:text-amber-300">💡 How to Use:</h3>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Select seat type from buttons above</li>
                <li>Click seats on the grid to paint them</li>
                <li>Right-click to remove a seat</li>
              </ol>
              <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  💰 Note: Seat pricing will be configured per trip
                </p>
              </div>
            </div>

            {/* Legend */}
            <div className="bg-card rounded-xl shadow-sm border-2 border-border p-6">
              <h3 className="text-sm font-semibold mb-4">Color Legend:</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg border-2 border-gray-400 dark:border-gray-500 shrink-0"></div>
                  <span className="text-sm font-medium">Standard</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-300 dark:bg-yellow-600 rounded-lg border-2 border-yellow-500 dark:border-yellow-500 shrink-0"></div>
                  <span className="text-sm font-medium">VIP</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-200 dark:bg-blue-600 rounded-lg border-2 border-blue-400 dark:border-blue-500 shrink-0"></div>
                  <span className="text-sm font-medium">Window</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-200 dark:bg-green-600 rounded-lg border-2 border-green-400 dark:border-green-500 shrink-0"></div>
                  <span className="text-sm font-medium">Aisle</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid Area */}
          <div className="col-span-9">
            <div className="bg-card rounded-xl shadow-lg border-2 border-border p-10">
              {/* Bus Front Indicator */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-center py-4 px-6 rounded-xl mb-8 font-semibold text-lg shadow-md">
                🚍 Front of Bus
              </div>

              {/* Seat Grid */}
              <div className="space-y-4">
                {Array.from({ length: rows }, (_, rowIndex) => {
                  const row = rowIndex + 1;
                  return (
                    <div key={row} className="flex justify-center gap-4">
                      <div className="w-12 flex items-center justify-center text-lg font-bold text-muted-foreground">
                        {row}
                      </div>
                      {Array.from({ length: columns }, (_, colIndex) => {
                        const column = colIndex + 1;
                        const seat = getSeatAtPosition(row, column);

                        return (
                          <div key={column} className="relative group">
                            <button
                              onClick={() => handleSeatClick(row, column)}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                handleRemoveSeat(row, column);
                              }}
                              className={`w-20 h-20 rounded-xl border-2 transition-all relative shadow-sm ${
                                seat
                                  ? `${seatTypeColors[seat.seatType]} border-border`
                                  : 'bg-card hover:bg-muted border-dashed border-border'
                              }`}
                              title={seat ? `${seat.seatNumber} - ${seat.seatType}` : 'Click to add seat'}
                            >
                              {seat && <div className="text-base font-bold">{seat.seatNumber}</div>}
                              {!seat && <div className="text-2xl text-muted-foreground font-bold">+</div>}
                            </button>

                            {/* Hover tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                              {seat ? (
                                <>
                                  {seat.seatNumber} - {seat.seatType}
                                </>
                              ) : (
                                'Click to add seat'
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Statistics */}
              <div className="mt-8 p-6 bg-muted rounded-xl border-2 border-border shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="text-lg font-bold text-foreground">
                    💺 Total Seats: <span className="text-blue-600 dark:text-blue-400 text-2xl">{seats.length}</span>
                  </div>
                  <div className="flex gap-6 text-sm text-muted-foreground">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">
                        {seats.filter((s) => s.seatType === 'standard').length}
                      </div>
                      <div className="text-xs font-medium">Standard</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {seats.filter((s) => s.seatType === 'vip').length}
                      </div>
                      <div className="text-xs font-medium">VIP</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {seats.filter((s) => s.seatType === 'window').length}
                      </div>
                      <div className="text-xs font-medium">Window</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {seats.filter((s) => s.seatType === 'aisle').length}
                      </div>
                      <div className="text-xs font-medium">Aisle</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
