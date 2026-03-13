export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Orders Today", value: "0" },
          { label: "Revenue (MTD)", value: "$0" },
          { label: "Active Factories", value: "0 / 10" },
          { label: "Pending Orders", value: "0" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-zinc-200 rounded-lg p-6">
            <p className="text-sm text-zinc-500">{label}</p>
            <p className="text-2xl font-semibold mt-1">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
