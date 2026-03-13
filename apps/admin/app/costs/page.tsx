import { REGIONS } from "@cambium/shared";

export default function CostsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Cost Models</h1>
      <p className="text-sm text-zinc-500 mb-6">
        Configure cost parameters per region for accurate pricing.
      </p>
      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-zinc-600">Region</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600">CNC Rate/hr</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600">Labor Rate/hr</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600">Shipping Base</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600">Margin %</th>
            </tr>
          </thead>
          <tbody>
            {REGIONS.map((region) => (
              <tr key={region.id} className="border-b border-zinc-100">
                <td className="px-4 py-3 font-medium">
                  {region.city}, {region.state}
                </td>
                <td className="px-4 py-3 text-zinc-500">$75</td>
                <td className="px-4 py-3 text-zinc-500">$35</td>
                <td className="px-4 py-3 text-zinc-500">$25</td>
                <td className="px-4 py-3 text-zinc-500">40%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
