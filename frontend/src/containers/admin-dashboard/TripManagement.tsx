export default function TripManagement() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Trip Management</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + Add Trip
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Route</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Time</th>
              <th className="px-4 py-3 text-left">Available Seats</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="px-4 py-3">HCM - Da Lat</td>
              <td className="px-4 py-3">Nov 25, 2025</td>
              <td className="px-4 py-3">08:00</td>
              <td className="px-4 py-3">25/40</td>
              <td className="px-4 py-3">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Scheduled
                </span>
              </td>
              <td className="px-4 py-3">
                <button className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                <button className="text-red-600 hover:text-red-800">Cancel</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
