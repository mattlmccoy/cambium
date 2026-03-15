"use client";

import { useConfiguratorStore } from "@/lib/configurator-store";
import {
  FINISHES,
  REGIONS,
  TABLE_CONSTRAINTS,
  WOOD_SPECIES,
  getSpeciesForRegion,
  getEffectiveWoodPrice,
} from "@cambium/shared";
import type {
  AnyProductParams,
  ChairBackStyle,
  ChairParams,
  CoreVisibility,
  EdgeProfile,
  FinishType,
  LegWrapStyle,
  NumericConstraint,
  ProductDefinition,
  ShelfMountType,
  ShelfParams,
  SideTableParams,
  TableMode,
  TableParams,
  TableTopShape,
  TopProfile,
} from "@cambium/shared";

// ─── UI Primitives ──────────────────────────────────────────────

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-stone-600">{label}</span>
        <span className="font-medium tabular-nums text-stone-900">
          {value}
          {unit && <span className="ml-0.5 text-stone-400">{unit}</span>}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-stone-200 accent-stone-800"
      />
    </div>
  );
}

function OptionGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; name: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="space-y-2">
      <span className="text-sm text-stone-600">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
              value === option.id
                ? "border-stone-900 bg-stone-900 text-white"
                : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
            }`}
          >
            {option.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
        {title}
      </h3>
      {children}
    </div>
  );
}

// ─── Constraint-driven slider ───────────────────────────────────

function getConstraint(
  product: ProductDefinition,
  params: AnyProductParams,
  key: string
): NumericConstraint | undefined {
  // Table height depends on dining/coffee mode
  if (product.slug === "table" && key === "height") {
    return (params as TableParams).tableMode === "coffee"
      ? TABLE_CONSTRAINTS.coffeeHeight
      : TABLE_CONSTRAINTS.diningHeight;
  }
  return product.constraints[key];
}

function DimensionSlider({ dimKey, label }: { dimKey: string; label: string }) {
  const product = useConfiguratorStore((s) => s.product);
  const params = useConfiguratorStore((s) => s.params);
  const setParam = useConfiguratorStore((s) => s.setParam);

  const constraint = getConstraint(product, params, dimKey);
  if (!constraint) return null;

  const value = (params as unknown as Record<string, number>)[dimKey];

  return (
    <Slider
      label={label}
      value={value}
      min={constraint.min}
      max={constraint.max}
      step={constraint.step}
      unit={constraint.unit}
      onChange={(v) => setParam(dimKey, v)}
    />
  );
}

// ─── Product Dimension Sections ─────────────────────────────────

function SideTableDimensions() {
  return (
    <>
      <DimensionSlider dimKey="topWidth" label="Width" />
      <DimensionSlider dimKey="topDepth" label="Depth" />
      <DimensionSlider dimKey="height" label="Height" />
      <DimensionSlider dimKey="topThickness" label="Top Thickness" />
    </>
  );
}

function TableDimensions() {
  return (
    <>
      <DimensionSlider dimKey="length" label="Length" />
      <DimensionSlider dimKey="width" label="Width" />
      <DimensionSlider dimKey="height" label="Height" />
      <DimensionSlider dimKey="topThickness" label="Top Thickness" />
    </>
  );
}

function ChairDimensions() {
  return (
    <>
      <DimensionSlider dimKey="seatWidth" label="Seat Width" />
      <DimensionSlider dimKey="seatDepth" label="Seat Depth" />
      <DimensionSlider dimKey="seatHeight" label="Seat Height" />
      <DimensionSlider dimKey="backHeight" label="Back Height" />
      <DimensionSlider dimKey="seatThickness" label="Seat Thickness" />
    </>
  );
}

function ShelfDimensions() {
  const params = useConfiguratorStore((s) => s.params) as ShelfParams;

  return (
    <>
      <DimensionSlider dimKey="shelfWidth" label="Width" />
      <DimensionSlider dimKey="shelfDepth" label="Depth" />
      <DimensionSlider dimKey="shelfThickness" label="Thickness" />
      <DimensionSlider dimKey="shelfCount" label="Shelves" />
      {params.mountType === "free-standing" && (
        <DimensionSlider dimKey="unitHeight" label="Unit Height" />
      )}
      <DimensionSlider dimKey="shelfSpacing" label="Spacing" />
    </>
  );
}

// ─── Product Design Sections ────────────────────────────────────

function SideTableDesign() {
  const params = useConfiguratorStore((s) => s.params) as SideTableParams;
  const setParam = useConfiguratorStore((s) => s.setParam);

  return (
    <>
      <OptionGroup<TopProfile>
        label="Top Profile"
        value={params.topProfile}
        options={[
          { id: "square", name: "Square" },
          { id: "circle", name: "Circle" },
        ]}
        onChange={(v) => setParam("topProfile", v)}
      />
      <OptionGroup<EdgeProfile>
        label="Edge Profile"
        value={params.topEdge}
        options={[
          { id: "square", name: "Square" },
          { id: "chamfer", name: "Chamfer" },
          { id: "roundover", name: "Round" },
          { id: "bevel", name: "Bevel" },
        ]}
        onChange={(v) => setParam("topEdge", v)}
      />
      <OptionGroup<"3" | "4">
        label="Leg Count"
        value={String(params.legCount) as "3" | "4"}
        options={[
          { id: "3", name: "3 Legs" },
          { id: "4", name: "4 Legs" },
        ]}
        onChange={(v) => setParam("legCount", Number(v) as 3 | 4)}
      />
      <OptionGroup<LegWrapStyle>
        label="Leg Wrap"
        value={params.legWrapStyle}
        options={[
          { id: "full", name: "Full" },
          { id: "partial", name: "Partial" },
          { id: "exposed", name: "Exposed Core" },
        ]}
        onChange={(v) => setParam("legWrapStyle", v)}
      />
      <OptionGroup<"yes" | "no">
        label="Apron Covers"
        value={params.apronCovers ? "yes" : "no"}
        options={[
          { id: "yes", name: "Installed" },
          { id: "no", name: "Exposed" },
        ]}
        onChange={(v) => setParam("apronCovers", v === "yes")}
      />
    </>
  );
}

function TableDesign() {
  const params = useConfiguratorStore((s) => s.params) as TableParams;
  const setParam = useConfiguratorStore((s) => s.setParam);

  return (
    <>
      <OptionGroup<TableTopShape>
        label="Top Shape"
        value={params.topShape}
        options={[
          { id: "rectangle", name: "Rectangle" },
          { id: "rounded-rectangle", name: "Rounded" },
          { id: "racetrack", name: "Racetrack" },
        ]}
        onChange={(v) => setParam("topShape", v)}
      />
      <OptionGroup<EdgeProfile>
        label="Edge Profile"
        value={params.edgeProfile}
        options={[
          { id: "square", name: "Square" },
          { id: "chamfer", name: "Chamfer" },
          { id: "roundover", name: "Round" },
          { id: "bevel", name: "Bevel" },
        ]}
        onChange={(v) => setParam("edgeProfile", v)}
      />
      <OptionGroup<"hidden" | "visible">
        label="Apron Cover"
        value={params.apronVisibility}
        options={[
          { id: "visible", name: "Visible" },
          { id: "hidden", name: "Hidden" },
        ]}
        onChange={(v) => setParam("apronVisibility", v)}
      />
    </>
  );
}

function ChairDesign() {
  const params = useConfiguratorStore((s) => s.params) as ChairParams;
  const setParam = useConfiguratorStore((s) => s.setParam);

  return (
    <>
      <OptionGroup<ChairBackStyle>
        label="Back Style"
        value={params.backStyle}
        options={[
          { id: "solid", name: "Solid" },
          { id: "three-slat", name: "3 Slat" },
          { id: "five-slat", name: "5 Slat" },
        ]}
        onChange={(v) => setParam("backStyle", v)}
      />
      <OptionGroup<"flat" | "scoop">
        label="Seat Contour"
        value={params.seatContour}
        options={[
          { id: "flat", name: "Flat" },
          { id: "scoop", name: "Scoop" },
        ]}
        onChange={(v) => setParam("seatContour", v)}
      />
      <OptionGroup<LegWrapStyle>
        label="Leg Wrap"
        value={params.legWrapStyle}
        options={[
          { id: "full", name: "Full" },
          { id: "partial", name: "Partial" },
          { id: "exposed", name: "Exposed Core" },
        ]}
        onChange={(v) => setParam("legWrapStyle", v)}
      />
    </>
  );
}

function ShelfDesign() {
  const params = useConfiguratorStore((s) => s.params) as ShelfParams;
  const setParam = useConfiguratorStore((s) => s.setParam);

  return (
    <>
      <OptionGroup<EdgeProfile>
        label="Edge Profile"
        value={params.edgeProfile}
        options={[
          { id: "square", name: "Square" },
          { id: "chamfer", name: "Chamfer" },
          { id: "roundover", name: "Round" },
          { id: "bevel", name: "Bevel" },
        ]}
        onChange={(v) => setParam("edgeProfile", v)}
      />
      <OptionGroup<"yes" | "no">
        label="Back Panel"
        value={params.backPanel ? "yes" : "no"}
        options={[
          { id: "no", name: "Open" },
          { id: "yes", name: "Panel" },
        ]}
        onChange={(v) => setParam("backPanel", v === "yes")}
      />
    </>
  );
}

// ─── Wood Species Selector ──────────────────────────────────────

function WoodSpeciesSelector({
  regionId,
  selectedSpecies,
  onSelect,
}: {
  regionId: string;
  selectedSpecies: string;
  onSelect: (speciesId: string) => void;
}) {
  const localSpecies = getSpeciesForRegion(regionId);
  const localIds = new Set(localSpecies.map((s) => s.id));

  // Cross-region species: all species NOT local to this region
  const crossRegionSpecies = WOOD_SPECIES.filter(
    (s) => !localIds.has(s.id)
  );

  return (
    <div className="space-y-3">
      {/* Local species */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-stone-600">Local to You</span>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
            Best Value
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {localSpecies.map((species) => {
            const pricing = getEffectiveWoodPrice(
              species.id,
              species.regions as unknown as readonly string[],
              regionId
            );
            return (
              <button
                key={species.id}
                onClick={() => onSelect(species.id)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${
                  selectedSpecies === species.id
                    ? "border-stone-900 bg-stone-900 text-white"
                    : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
                }`}
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: species.color }}
                />
                <span className="truncate">{species.name}</span>
                <span className={`ml-auto text-[10px] ${
                  selectedSpecies === species.id ? "text-white/60" : "text-stone-400"
                }`}>
                  ${pricing.pricePerBf.toFixed(2)}/bf
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cross-region species */}
      {crossRegionSpecies.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-stone-600">Other Regions</span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
              +Shipping
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {crossRegionSpecies.map((species) => {
              const pricing = getEffectiveWoodPrice(
                species.id,
                species.regions as unknown as readonly string[],
                regionId
              );
              return (
                <button
                  key={species.id}
                  onClick={() => onSelect(species.id)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${
                    selectedSpecies === species.id
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
                  }`}
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: species.color }}
                  />
                  <span className="truncate">{species.name}</span>
                  <span className={`ml-auto text-[10px] ${
                    selectedSpecies === species.id ? "text-white/60" : "text-amber-500"
                  }`}>
                    ${pricing.pricePerBf.toFixed(2)}/bf
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Control Panel ─────────────────────────────────────────

export function ControlPanel() {
  const product = useConfiguratorStore((s) => s.product);
  const params = useConfiguratorStore((s) => s.params);
  const cost = useConfiguratorStore((s) => s.cost);
  const validation = useConfiguratorStore((s) => s.validation);
  const setParam = useConfiguratorStore((s) => s.setParam);
  const resetParams = useConfiguratorStore((s) => s.resetParams);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="flex-1 space-y-6 p-6">
        {/* Product header */}
        <div className="rounded-2xl bg-stone-100 p-4">
          <div className="mb-1 text-xs uppercase tracking-[0.2em] text-stone-500">
            {product.sku}
          </div>
          <div className="text-xl font-light text-stone-900">
            {product.label}
          </div>
          <div className="mt-2 text-sm text-stone-600">
            {product.description}
          </div>
        </div>

        {/* Mode toggle (products with modes) */}
        {product.slug === "table" && (
          <Section title="Mode">
            <OptionGroup<TableMode>
              label="Table Mode"
              value={(params as TableParams).tableMode}
              options={[
                { id: "dining", name: "Dining" },
                { id: "coffee", name: "Coffee" },
              ]}
              onChange={(v) => setParam("tableMode", v)}
            />
          </Section>
        )}
        {product.slug === "shelf" && (
          <Section title="Mode">
            <OptionGroup<ShelfMountType>
              label="Mount Type"
              value={(params as ShelfParams).mountType}
              options={[
                { id: "free-standing", name: "Free-Standing" },
                { id: "wall-mount", name: "Wall-Mount" },
              ]}
              onChange={(v) => setParam("mountType", v)}
            />
          </Section>
        )}

        {/* Region */}
        <Section title="Region">
          <div className="space-y-2">
            <span className="text-sm text-stone-600">Your Region</span>
            <select
              value={params.regionId}
              onChange={(e) => {
                const newRegion = e.target.value;
                setParam("regionId", newRegion);
                const species = getSpeciesForRegion(newRegion);
                if (
                  species.length > 0 &&
                  !species.find((s) => s.id === params.woodSpecies)
                ) {
                  setParam("woodSpecies", species[0].id);
                }
              }}
              className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
            >
              {REGIONS.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name} ({region.city}, {region.state})
                </option>
              ))}
            </select>
          </div>
        </Section>

        {/* Dimensions - constraint-driven */}
        <Section title="Dimensions">
          {product.slug === "side-table" && <SideTableDimensions />}
          {product.slug === "table" && <TableDimensions />}
          {product.slug === "chair" && <ChairDimensions />}
          {product.slug === "shelf" && <ShelfDimensions />}
        </Section>

        {/* Design - product-specific options */}
        <Section title="Design">
          {product.slug === "side-table" && <SideTableDesign />}
          {product.slug === "table" && <TableDesign />}
          {product.slug === "chair" && <ChairDesign />}
          {product.slug === "shelf" && <ShelfDesign />}

          {/* Core visibility - shared across all products */}
          <OptionGroup<CoreVisibility>
            label="Core Visibility"
            value={params.coreVisibility as CoreVisibility}
            options={[
              { id: "hidden", name: "Hidden" },
              { id: "accent", name: "Accent" },
              { id: "exposed", name: "Exposed" },
            ]}
            onChange={(v) => setParam("coreVisibility", v)}
          />
        </Section>

        {/* Material */}
        <Section title="Material">
          <WoodSpeciesSelector
            regionId={params.regionId}
            selectedSpecies={params.woodSpecies}
            onSelect={(id) => setParam("woodSpecies", id)}
          />
          <OptionGroup<FinishType>
            label="Finish"
            value={params.finish}
            options={FINISHES.map((f) => ({
              id: f.id as FinishType,
              name: f.name,
            }))}
            onChange={(v) => setParam("finish", v)}
          />
        </Section>

        {/* Validation warnings */}
        {validation.warnings.length > 0 && (
          <Section title="Notes">
            {validation.warnings.map((warning, i) => (
              <p
                key={`${warning.field}-${i}`}
                className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700"
              >
                {warning.message}
              </p>
            ))}
          </Section>
        )}
      </div>

      {/* Price footer */}
      <div className="border-t border-stone-200 bg-white p-6">
        <div className="mb-1 flex items-baseline justify-between">
          <span className="text-sm text-stone-500">Estimated Price</span>
          <span className="text-3xl font-light text-stone-900">
            ${cost.total}
          </span>
        </div>
        {!cost.isLocalWood && cost.crossRegionSurcharge > 0 && (
          <div className="mb-2 rounded-md bg-amber-50 px-3 py-1.5 text-xs text-amber-700">
            Includes ${cost.crossRegionSurcharge.toFixed(2)} cross-region wood surcharge
          </div>
        )}
        {cost.isLocalWood && (
          <div className="mb-2 rounded-md bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700">
            Using locally-sourced wood — best value
          </div>
        )}
        <div className="mb-4 text-xs text-stone-500">
          Target ${product.priceBand.min} – ${product.priceBand.max}
        </div>
        <button
          onClick={resetParams}
          className="w-full rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-700 transition-colors hover:border-stone-400"
        >
          Reset to defaults
        </button>
      </div>
    </div>
  );
}
