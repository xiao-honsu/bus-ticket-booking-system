export default function SeatLegend() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Legend</h3>
      <div className="space-y-3">
        <div className="flex items-center">
          <div className="w-8 h-8 border-2 border-gray-300 rounded mr-3"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-500 rounded mr-3"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-300 rounded mr-3"></div>
          <span>Occupied</span>
        </div>
      </div>
    </div>
  );
}
