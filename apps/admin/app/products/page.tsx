export default function ProductsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Products</h1>
      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-zinc-600">Product</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600">Category</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600">Base Price</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-zinc-100">
              <td className="px-4 py-3 font-medium">Side Table</td>
              <td className="px-4 py-3 text-zinc-500">side-table</td>
              <td className="px-4 py-3 text-zinc-500">From $89</td>
              <td className="px-4 py-3">
                <span className="px-2 py-0.5 text-xs rounded-full bg-green-50 text-green-700">
                  Active
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
