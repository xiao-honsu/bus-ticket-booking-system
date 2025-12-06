export default function OperatorManagement() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Operator Management</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ Add Operator</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Contact</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="px-4 py-3">Sample Operator</td>
              <td className="px-4 py-3">operator@example.com</td>
              <td className="px-4 py-3">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Active</span>
              </td>
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
