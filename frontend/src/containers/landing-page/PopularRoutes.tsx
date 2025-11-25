export default function PopularRoutes() {
  const routes = [
    { id: 1, from: 'Ho Chi Minh', to: 'Da Lat', price: '200,000đ' },
    { id: 2, from: 'Hanoi', to: 'Ha Long', price: '150,000đ' },
    { id: 3, from: 'Da Nang', to: 'Hoi An', price: '100,000đ' },
    { id: 4, from: 'Ho Chi Minh', to: 'Nha Trang', price: '250,000đ' },
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Popular Routes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {routes.map((route) => (
            <div
              key={route.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold">{route.from}</span>
                <span className="text-gray-400">→</span>
                <span className="text-lg font-semibold">{route.to}</span>
              </div>
              <div className="text-blue-600 font-bold text-xl">From {route.price}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
