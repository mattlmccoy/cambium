import { REGIONS, getSpeciesForRegion, getWoodBasePrice, CROSS_REGION_SURCHARGE_PER_BF } from "@cambium/shared";

export default function MaterialsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Materials & Wood Species</h1>

      <div className="space-y-8">
        {REGIONS.map((region) => {
          const species = getSpeciesForRegion(region.id);
          return (
            <div key={region.id} className="bg-white border border-zinc-200 rounded-lg p-6">
              <h2 className="text-lg font-medium mb-1">
                {region.name} — {region.city}, {region.state}
              </h2>
              <p className="text-sm text-zinc-500 mb-4">
                Serves: {region.statesServiced.join(", ")}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {species.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 p-3 border border-zinc-100 rounded-lg"
                  >
                    <span
                      className="w-8 h-8 rounded-full shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <div>
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-zinc-500">
                        Janka: {s.hardness} | {s.density} kg/m³ | ${getWoodBasePrice(s.id).toFixed(2)}/bf
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
