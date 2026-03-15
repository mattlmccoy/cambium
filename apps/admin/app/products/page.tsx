import { PRODUCT_ORDER, REGIONS, WOOD_SPECIES, getCheapestLocalSpecies, REGIONAL_COST_FACTORS } from "@cambium/shared";
import { computeConfiguration, DEFAULT_COST_MODEL } from "@cambium/config-engine";

export default function ProductsPage() {
  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-semibold">Product Catalog</h1>
      <p className="mb-8 text-sm text-zinc-500">
        All Cambium SKUs with Core specifications, panel details, and packaging.
      </p>

      <div className="grid gap-6 xl:grid-cols-2">
        {PRODUCT_ORDER.map((product) => (
          <div
            key={product.slug}
            className="overflow-hidden rounded-xl border border-zinc-200 bg-white"
          >
            {/* Header */}
            <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold">{product.label}</h2>
                    <span className="rounded-full bg-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
                      {product.sku}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">
                    {product.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-emerald-600">
                    ${product.priceBand.min} – ${product.priceBand.max}
                  </div>
                  <div className="text-xs text-zinc-400">target range</div>
                </div>
              </div>
              {product.modes && (
                <div className="mt-3 flex gap-2">
                  {product.modes.map((mode) => (
                    <span
                      key={mode.id}
                      className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                    >
                      {mode.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-3 divide-x divide-zinc-100 px-2 py-4">
              {/* Core */}
              <div className="px-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Core
                </h3>
                <p className="mb-2 text-sm text-zinc-700">
                  {product.core.summary}
                </p>
                <div className="space-y-1 text-xs text-zinc-500">
                  <div>
                    Rod: {product.core.rodDiameterMm}mm &middot;{" "}
                    {product.core.finish}
                  </div>
                  <div>Foldable: {product.core.foldable ? "Yes" : "No"}</div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {product.core.jointTypes.map((jt) => (
                      <span
                        key={jt}
                        className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px]"
                      >
                        {jt}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Panels */}
              <div className="px-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Panels
                </h3>
                <p className="mb-2 text-sm text-zinc-700">
                  {product.panels.summary}
                </p>
                <div className="space-y-1 text-xs text-zinc-500">
                  <div>
                    {product.panels.range.min}–{product.panels.range.max} pieces
                  </div>
                  <div>{product.panels.material}</div>
                </div>
              </div>

              {/* Packaging */}
              <div className="px-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Packaging
                </h3>
                <div className="space-y-1 text-xs text-zinc-500">
                  <div>
                    Box: {product.packaging.box.width} &times;{" "}
                    {product.packaging.box.depth} &times;{" "}
                    {product.packaging.box.height}mm
                  </div>
                  <div>
                    Weight: {product.packaging.weightKg.min}–
                    {product.packaging.weightKg.max} kg
                  </div>
                  <div>
                    Assembly: {product.packaging.assemblyMinutes.min}–
                    {product.packaging.assemblyMinutes.max} min
                  </div>
                </div>
              </div>
            </div>

            {/* Constraints */}
            <div className="border-t border-zinc-100 px-6 py-3">
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-zinc-500">
                {Object.entries(product.constraints).map(([key, c]) => (
                  <span key={key}>
                    <span className="font-medium text-zinc-600">{key}:</span>{" "}
                    {c.min}–{c.max}
                    {c.unit} (default {c.default}{c.unit})
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Regional Pricing Comparison */}
      <h2 className="mb-4 mt-12 text-xl font-semibold">Regional Starting Prices</h2>
      <p className="mb-6 text-sm text-zinc-500">
        Starting price per SKU by region, using cheapest local wood + default dimensions + natural-oil finish. 55% gross margin.
      </p>
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Region
              </th>
              {PRODUCT_ORDER.map((p) => (
                <th
                  key={p.slug}
                  className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400"
                >
                  {p.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Labor Mult
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {REGIONS.map((region) => {
              const factor = REGIONAL_COST_FACTORS.find((f) => f.regionId === region.id);
              return (
                <tr key={region.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-2.5 font-medium text-zinc-700">
                    {region.name}
                    <span className="ml-1 text-xs text-zinc-400">
                      ({region.city})
                    </span>
                  </td>
                  {PRODUCT_ORDER.map((product) => {
                    const cheapestWood = getCheapestLocalSpecies(region.id, WOOD_SPECIES);
                    let price = "—";
                    try {
                      const result = computeConfiguration(
                        product.slug,
                        {
                          ...product.defaults,
                          regionId: region.id,
                          woodSpecies: cheapestWood,
                          finish: "natural-oil" as const,
                        },
                        { ...DEFAULT_COST_MODEL, regionId: region.id }
                      );
                      price = `$${result.cost.total}`;
                    } catch {
                      // skip
                    }
                    return (
                      <td
                        key={product.slug}
                        className="px-4 py-2.5 text-right tabular-nums text-zinc-600"
                      >
                        {price}
                      </td>
                    );
                  })}
                  <td className="px-4 py-2.5 text-right tabular-nums text-zinc-500">
                    {factor ? `${factor.laborRateMultiplier.toFixed(2)}×` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
