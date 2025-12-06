import BusManagement from '@/containers/admin-dashboard/BusManagement';

export default function AdminBusesPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Bus Management</h1>
      <BusManagement />
    </main>
  );
}
