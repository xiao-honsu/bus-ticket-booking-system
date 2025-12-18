export default function SeatLegend() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-base font-semibold mb-4">Seat Legend</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white border-2 border-green-500 rounded flex items-center justify-center text-xs font-semibold">
            A1
          </div>
          <span className="text-sm">Available</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-400 border-2 border-orange-500 rounded flex items-center justify-center text-xs font-semibold text-white">
            A2
          </div>
          <span className="text-sm">Selected</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500 border-2 border-red-600 rounded flex items-center justify-center text-xs font-semibold text-white">
            A3
          </div>
          <span className="text-sm">Booked</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400 border-2 border-yellow-500 rounded flex items-center justify-center text-xs font-semibold">
            A4
          </div>
          <span className="text-sm">Locked</span>
        </div>
        <div className="flex items-center gap-3 pt-2 border-t">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm">Window Seat</span>
        </div>
      </div>
    </div>
  );
}
