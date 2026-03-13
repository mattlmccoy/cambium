export default function OrdersPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Orders</h1>
      <div className="bg-white border border-zinc-200 rounded-lg p-12 text-center">
        <p className="text-zinc-500">No orders yet.</p>
        <p className="text-sm text-zinc-400 mt-1">
          Orders will appear here once customers place them through the configurator.
        </p>
      </div>
    </div>
  );
}
