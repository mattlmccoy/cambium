"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useConfiguratorStore } from "@/lib/configurator-store";
import { useRegionStore } from "@/lib/region-store";
import { useBenchStore } from "@/lib/bench-store";
import { useSavedDesignsStore } from "@/lib/saved-designs-store";
import { CrossRegionDrawer } from "./CrossRegionDrawer";
import {
  FINISHES,
  REGIONS,
  TABLE_CONSTRAINTS,
  WOOD_SPECIES,
  getSpeciesForRegion,
  getEffectiveWoodPrice,
  getRegionDistance,
  getWoodSuitability,
  SPECIES_STORIES,
  estimateCarbonFootprint,
  getSpeciesById,
  REGION_COORDINATES,
} from "@cambium/shared";
import type {
  AnyProductParams,
  BOMResult,
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

// ─── Static Region Display ──────────────────────────────────────

function RegionDisplay() {
  const regionId = useConfiguratorStore((s) => s.params.regionId);
  const zip = useRegionStore((s) => s.zip);
  const region = REGIONS.find((r) => r.id === regionId);

  if (!region) return null;

  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-medium text-stone-900">
            {region.name}
          </div>
          <div className="text-xs text-stone-500">
            {region.city}, {region.state}
            {zip && <span className="ml-1">&middot; ZIP {zip}</span>}
          </div>
        </div>
        <Link
          href="/"
          className="text-xs text-stone-400 underline decoration-stone-300 underline-offset-2 transition-colors hover:text-stone-600"
        >
          Change
        </Link>
      </div>
    </div>
  );
}

// ─── Wood Species Selector (local only + drawer trigger) ─────────

function WoodSpeciesSelector({
  regionId,
  productSlug,
  selectedSpecies,
  onSelect,
}: {
  regionId: string;
  productSlug: string;
  selectedSpecies: string;
  onSelect: (speciesId: string) => void;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const localSpecies = getSpeciesForRegion(regionId);
  const localIds = new Set<string>(localSpecies.map((s) => s.id));

  // Count cross-region species
  const crossRegionCount = WOOD_SPECIES.filter((s) => !localIds.has(s.id as string)).length;

  // Check if currently selected species is cross-region
  const selectedIsLocal = localIds.has(selectedSpecies);
  const selectedSpeciesData = WOOD_SPECIES.find((s) => s.id === selectedSpecies);
  const selectedPricing = selectedSpeciesData
    ? getEffectiveWoodPrice(
        selectedSpeciesData.id,
        selectedSpeciesData.regions as unknown as readonly string[],
        regionId
      )
    : null;

  // Selected species story
  const selectedStory = SPECIES_STORIES[selectedSpecies];

  // Suitability warning for selected soft wood
  const selectedSuitability = selectedSpeciesData
    ? getWoodSuitability(productSlug, selectedSpeciesData.hardness)
    : null;

  // Find top 2 recommended local hardwoods for warning message
  const recommendedLocalWoods = useMemo(() => {
    if (!selectedSuitability || selectedSuitability.rating !== "soft-warning") return [];
    const product = useConfiguratorStore.getState().product;
    return localSpecies
      .filter((s) => s.hardness >= product.minJanka + 300)
      .sort((a, b) => b.hardness - a.hardness)
      .slice(0, 2);
  }, [selectedSuitability, localSpecies, productSlug]);

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
            const suitability = getWoodSuitability(productSlug, species.hardness);
            const isSelected = selectedSpecies === species.id;
            return (
              <button
                key={species.id}
                onClick={() => onSelect(species.id)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${
                  isSelected
                    ? "border-stone-900 bg-stone-900 text-white"
                    : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
                }`}
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: species.color }}
                />
                <span className="truncate">{species.name}</span>
                {suitability.rating === "recommended" && (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" title="Recommended" />
                )}
                {suitability.rating === "soft-warning" && (
                  <span className={`shrink-0 text-[9px] ${isSelected ? "text-amber-300" : "text-amber-500"}`} title={suitability.description}>
                    &#9888;
                  </span>
                )}
                <span className={`ml-auto text-[10px] ${
                  isSelected ? "text-white/60" : "text-stone-400"
                }`}>
                  ${pricing.pricePerBf.toFixed(2)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Suitability warning for soft wood */}
      {selectedSuitability?.rating === "soft-warning" && selectedSpeciesData && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <div className="flex items-start gap-2 text-[11px] text-amber-800">
            <span className="mt-0.5 shrink-0">&#9888;</span>
            <div>
              <span className="font-medium">{selectedSpeciesData.name}</span> (Janka {selectedSpeciesData.hardness}) is softer than recommended for this piece.
              {recommendedLocalWoods.length > 0 && (
                <span>
                  {" "}Consider {recommendedLocalWoods.map((w) => w.name).join(" or ")} for heavy use.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Selected species story snippet */}
      {selectedStory && selectedIsLocal && (
        <div className="rounded-lg bg-stone-50 px-3 py-2">
          <p className="text-[11px] leading-relaxed text-stone-500">
            {selectedStory.character.split(".")[0]}.
          </p>
        </div>
      )}

      {/* Cross-region link + status */}
      {!selectedIsLocal && selectedPricing && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <div className="flex items-center gap-2 text-xs text-amber-800">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: selectedPricing.tier.color }}
            />
            <span className="font-medium">
              {selectedSpeciesData?.name}
            </span>
            <span className="ml-auto text-[10px]">
              {selectedPricing.tier.label} &middot; +${selectedPricing.surcharge.toFixed(2)}/bf
            </span>
          </div>
        </div>
      )}

      {crossRegionCount > 0 && (
        <button
          onClick={() => setDrawerOpen(true)}
          className="w-full text-left text-xs text-stone-400 underline decoration-stone-300 underline-offset-2 transition-colors hover:text-stone-600"
        >
          Browse all {crossRegionCount} species from other regions &rarr;
        </button>
      )}

      <CrossRegionDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        regionId={regionId}
        productSlug={productSlug as any}
        selectedSpecies={selectedSpecies}
        onSelect={onSelect}
      />
    </div>
  );
}

// ─── Carbon Footprint Badge ──────────────────────────────────────

function CarbonBadge({
  bom,
  speciesId,
  regionId,
}: {
  bom: BOMResult;
  speciesId: string;
  regionId: string;
}) {
  const species = getSpeciesById(speciesId);
  if (!species || bom.totalBoardFeet <= 0) return null;

  // Calculate local distance (mill → workshop → customer, approx 200km)
  const localDistanceKm = 200;

  const carbon = estimateCarbonFootprint(
    bom.totalBoardFeet,
    species.density,
    localDistanceKm
  );

  if (carbon.importedCO2Kg <= 0) return null;

  const localBarWidth = Math.max(
    5,
    (carbon.localCO2Kg / carbon.importedCO2Kg) * 100
  );

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
      <div className="mb-2 flex items-center gap-1.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 17 3.5s1 5 .8 10" />
          <path d="M11 20H6" />
          <path d="M11 20v-4" />
        </svg>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
          Carbon Footprint
        </span>
      </div>
      <div className="mb-2 space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="h-2 rounded-full bg-emerald-400" style={{ width: `${localBarWidth}%` }} />
          <span className="text-[10px] text-emerald-700">
            Local: {carbon.localCO2Kg.toFixed(1)} kg CO2
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-full rounded-full bg-stone-300" />
          <span className="text-[10px] text-stone-500">
            Import: {carbon.importedCO2Kg.toFixed(1)} kg CO2
          </span>
        </div>
      </div>
      <div className="text-[11px] font-medium text-emerald-700">
        {carbon.savingsPercent}% less carbon than imported furniture
      </div>
    </div>
  );
}

// ─── Price Footer with Bench & Save ─────────────────────────────

function PriceFooter({
  product,
  params,
  cost,
  bom,
  resetParams,
}: {
  product: ProductDefinition;
  params: AnyProductParams;
  cost: { total: number; isLocalWood: boolean; crossRegionSurcharge: number };
  bom: BOMResult;
  resetParams: () => void;
}) {
  const addToBench = useBenchStore((s) => s.addItem);
  const saveDesign = useSavedDesignsStore((s) => s.saveDesign);
  const hydrateBench = useBenchStore((s) => s.hydrate);
  const hydrateDesigns = useSavedDesignsStore((s) => s.hydrate);

  const [benchAdded, setBenchAdded] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [designName, setDesignName] = useState("");

  useEffect(() => {
    hydrateBench();
    hydrateDesigns();
  }, [hydrateBench, hydrateDesigns]);

  const species = WOOD_SPECIES.find((s) => s.id === params.woodSpecies);

  const handleAddToBench = () => {
    addToBench({
      productSlug: params.productSlug,
      params,
      cost: cost.total,
    });
    setBenchAdded(true);
    setTimeout(() => setBenchAdded(false), 2000);
  };

  const handleSave = () => {
    const defaultName = `${product.displayName} - ${species?.name ?? params.woodSpecies} - ${new Date().toLocaleDateString()}`;
    setDesignName(defaultName);
    setShowSaveDialog(true);
  };

  const confirmSave = () => {
    saveDesign({
      name: designName || `${product.displayName} design`,
      productSlug: params.productSlug,
      params,
      cost: cost.total,
    });
    setShowSaveDialog(false);
    setDesignName("");
  };

  return (
    <div className="border-t border-stone-200 bg-white p-6">
      {/* Save dialog */}
      {showSaveDialog && (
        <div className="mb-4 rounded-lg border border-stone-200 bg-stone-50 p-3">
          <div className="mb-2 text-xs font-medium text-stone-600">
            Name this design
          </div>
          <input
            type="text"
            value={designName}
            onChange={(e) => setDesignName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && confirmSave()}
            className="mb-2 w-full rounded-md border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-900 outline-none focus:border-stone-400"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={confirmSave}
              className="rounded-md bg-stone-900 px-3 py-1 text-xs text-white"
            >
              Save
            </button>
            <button
              onClick={() => setShowSaveDialog(false)}
              className="rounded-md border border-stone-200 px-3 py-1 text-xs text-stone-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Carbon footprint */}
      <div className="mb-4">
        <CarbonBadge
          bom={bom}
          speciesId={params.woodSpecies}
          regionId={params.regionId}
        />
      </div>

      {/* Price */}
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-sm text-stone-500">Estimated Price</span>
        <span className="text-3xl font-light text-stone-900">
          ${cost.total}
        </span>
      </div>
      {!cost.isLocalWood && cost.crossRegionSurcharge > 0 && (
        <div className="mb-2 rounded-md bg-red-50 px-3 py-1.5 text-xs text-red-700">
          Includes ${cost.crossRegionSurcharge.toFixed(2)} cross-region tier surcharge
        </div>
      )}
      {cost.isLocalWood && (
        <div className="mb-2 rounded-md bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700">
          Using locally-sourced wood &mdash; best value
        </div>
      )}
      <div className="mb-4 text-xs text-stone-500">
        Target ${product.priceBand.min} &ndash; ${product.priceBand.max}
      </div>

      {/* Action buttons */}
      <div className="space-y-2">
        <button
          onClick={handleAddToBench}
          className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-colors ${
            benchAdded
              ? "bg-emerald-100 text-emerald-700"
              : "bg-stone-900 text-white hover:bg-stone-800"
          }`}
        >
          {benchAdded ? (
            "Added to Bench!"
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              Add to Bench
            </>
          )}
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-700 transition-colors hover:border-stone-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
            Save Design
          </button>
          <button
            onClick={resetParams}
            className="flex-1 rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-700 transition-colors hover:border-stone-400"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Control Panel ─────────────────────────────────────────

export function ControlPanel() {
  const product = useConfiguratorStore((s) => s.product);
  const params = useConfiguratorStore((s) => s.params);
  const cost = useConfiguratorStore((s) => s.cost);
  const bom = useConfiguratorStore((s) => s.bom);
  const validation = useConfiguratorStore((s) => s.validation);
  const setParam = useConfiguratorStore((s) => s.setParam);
  const resetParams = useConfiguratorStore((s) => s.resetParams);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="flex-1 space-y-6 p-6">
        {/* Product header with tree anatomy name */}
        <div className="rounded-2xl bg-stone-100 p-4">
          <div className="mb-1 text-xs uppercase tracking-[0.2em] text-stone-400">
            {product.label} &middot; {product.sku}
          </div>
          <div className="font-display text-2xl text-stone-900">
            {product.displayName}
          </div>
          <div className="mt-1 text-sm italic text-stone-500">
            {product.tagline}
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

        {/* Region (locked — set on landing page via ZIP) */}
        <Section title="Your Workshop">
          <RegionDisplay />
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
            productSlug={params.productSlug}
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

      {/* Price footer + actions */}
      <PriceFooter
        product={product}
        params={params}
        cost={cost}
        bom={bom}
        resetParams={resetParams}
      />
    </div>
  );
}
