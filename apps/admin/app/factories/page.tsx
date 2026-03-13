import { REGIONS } from "@cambium/shared";

export default function FactoriesPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Microfactories</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REGIONS.map((region, i) => (
          <div
            key={region.id}
            className="bg-white border border-zinc-200 rounded-lg p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-medium">
                  #{i + 1} {region.city}, {region.state}
                </h2>
                <p className="text-sm text-zinc-500">{region.name}</p>
              </div>
              <span className="px-2 py-1 text-xs rounded-full bg-zinc-100 text-zinc-600">
                Planned
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">
                States Serviced
              </p>
              <div className="flex flex-wrap gap-1">
                {region.statesServiced.map((state) => (
                  <span
                    key={state}
                    className="px-2 py-0.5 text-xs bg-zinc-50 border border-zinc-200 rounded"
                  >
                    {state}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
