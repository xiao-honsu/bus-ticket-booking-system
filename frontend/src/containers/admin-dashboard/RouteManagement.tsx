export default function RouteManagement() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Route Management</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + Add Route
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Route Name</th>
              <th className="px-4 py-3 text-left">Origin</th>
              <th className="px-4 py-3 text-left">Destination</th>
              <th className="px-4 py-3 text-left">Distance</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="px-4 py-3">HCM - Da Lat</td>
              <td className="px-4 py-3">Ho Chi Minh</td>
              <td className="px-4 py-3">Da Lat</td>
              <td className="px-4 py-3">308 km</td>
              <td className="px-4 py-3">
                <button className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                <button className="text-red-600 hover:text-red-800">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
