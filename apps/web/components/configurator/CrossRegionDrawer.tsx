"use client";

import { useState, useMemo } from "react";
import {
  REGIONS,
  WOOD_SPECIES,
  getSpeciesForRegion,
  getEffectiveWoodPrice,
  getRegionDistance,
  getRegionsGroupedByTier,
  getWoodSuitability,
  SPECIES_STORIES,
} from "@cambium/shared";
import type { ProductSlug } from "@cambium/shared";

interface CrossRegionDrawerProps {
  open: boolean;
  onClose: () => void;
  regionId: string;
  productSlug: ProductSlug;
  selectedSpecies: string;
  onSelect: (speciesId: string) => void;
}

export function CrossRegionDrawer({
  open,
  onClose,
  regionId,
  productSlug,
  selectedSpecies,
  onSelect,
}: CrossRegionDrawerProps) {
  const [pendingSpecies, setPendingSpecies] = useState<string | null>(null);

  const tierGroups = useMemo(
    () => getRegionsGroupedByTier(regionId, REGIONS),
    [regionId]
  );

  const localSpeciesIds = useMemo(() => {
    return new Set(getSpeciesForRegion(regionId).map((s) => s.id));
  }, [regionId]);

  const handleSelect = (speciesId: string) => {
    setPendingSpecies(speciesId);
  };

  const confirmSelection = () => {
    if (pendingSpecies) {
      onSelect(pendingSpecies);
      setPendingSpecies(null);
      onClose();
    }
  };

  const cancelSelection = () => {
    setPendingSpecies(null);
  };

  // Get pending species info for confirmation
  const pendingInfo = pendingSpecies
    ? (() => {
        const species = WOOD_SPECIES.find((s) => s.id === pendingSpecies);
        if (!species) return null;
        const pricing = getEffectiveWoodPrice(
          species.id,
          species.regions as unknown as readonly string[],
          regionId
        );
        const distance = getRegionDistance(regionId, pricing.sourceRegion);
        const sourceRegionData = REGIONS.find((r) => r.id === pricing.sourceRegion);
        return { species, pricing, distance, sourceRegionData };
      })()
    : null;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-[420px] flex-col bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-light text-stone-900">
              All Wood Species
            </h2>
            <p className="text-xs text-stone-500">
              Browse woods from other regions (tiered pricing applies)
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Confirmation banner */}
        {pendingInfo && (
          <div className="border-b border-amber-200 bg-amber-50 px-6 py-4">
            <div className="mb-2 flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: pendingInfo.species.color }}
              />
              <span className="text-sm font-medium text-amber-900">
                {pendingInfo.species.name}
              </span>
              <span
                className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                style={{ backgroundColor: pendingInfo.pricing.tier.color }}
              >
                {pendingInfo.pricing.tier.label}
              </span>
            </div>
            <div className="mb-3 space-y-1 text-[11px] text-amber-800">
              <div>
                Ships from {pendingInfo.sourceRegionData?.name ?? "another region"} (~{pendingInfo.distance} mi)
              </div>
              <div>
                +${pendingInfo.pricing.surcharge.toFixed(2)}/bf tier surcharge ({pendingInfo.pricing.tier.label})
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={confirmSelection}
                className="rounded-md bg-amber-700 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-800"
              >
                Confirm Selection
              </button>
              <button
                onClick={cancelSelection}
                className="rounded-md border border-amber-300 px-4 py-1.5 text-xs text-amber-800 transition-colors hover:bg-amber-100"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Species list by tier */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {tierGroups.length === 0 && (
            <div className="py-12 text-center text-sm text-stone-400">
              No cross-region species available
            </div>
          )}

          {tierGroups.map(({ tier, regions }) => (
            <div key={tier.tier} className="mb-6">
              {/* Tier header */}
              <div className="mb-3 flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: tier.color }}
                />
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  {tier.label}
                </span>
                <span className="text-[10px] text-stone-400">
                  +${tier.surchargePerBf.toFixed(2)}/bf
                </span>
              </div>

              {/* Regions within this tier */}
              {regions.map((region) => {
                const regionSpecies = getSpeciesForRegion(region.id).filter(
                  (s) => !localSpeciesIds.has(s.id)
                );
                if (regionSpecies.length === 0) return null;

                return (
                  <div key={region.id} className="mb-4 ml-4">
                    <div className="mb-2 flex items-baseline gap-2">
                      <span className="text-xs font-medium text-stone-700">
                        {region.name}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {region.city} · ~{region.distance} mi
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {regionSpecies.map((species) => {
                        const pricing = getEffectiveWoodPrice(
                          species.id,
                          species.regions as unknown as readonly string[],
                          regionId
                        );
                        const suitability = getWoodSuitability(productSlug, species.hardness);
                        const isSelected = selectedSpecies === species.id;
                        const isPending = pendingSpecies === species.id;
                        const story = SPECIES_STORIES[species.id];

                        return (
                          <button
                            key={species.id}
                            onClick={() => handleSelect(species.id)}
                            className={`w-full rounded-lg border p-3 text-left transition-colors ${
                              isSelected
                                ? "border-stone-900 bg-stone-900 text-white"
                                : isPending
                                  ? "border-amber-400 bg-amber-50"
                                  : "border-stone-150 bg-white hover:border-stone-300"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="h-3 w-3 shrink-0 rounded-full"
                                style={{ backgroundColor: species.color }}
                              />
                              <span className={`text-xs font-medium ${isSelected ? "text-white" : "text-stone-900"}`}>
                                {species.name}
                              </span>
                              {suitability.rating === "recommended" && (
                                <span className="ml-1 h-1.5 w-1.5 rounded-full bg-emerald-500" title="Recommended for this product" />
                              )}
                              {suitability.rating === "soft-warning" && (
                                <span className={`ml-1 text-[9px] ${isSelected ? "text-amber-300" : "text-amber-500"}`} title={suitability.description}>
                                  ⚠
                                </span>
                              )}
                              <span className={`ml-auto text-[10px] ${isSelected ? "text-white/60" : "text-stone-400"}`}>
                                ${pricing.pricePerBf.toFixed(2)}/bf
                              </span>
                            </div>
                            {story && (
                              <div className={`mt-1 text-[10px] leading-relaxed ${isSelected ? "text-white/50" : "text-stone-400"}`}>
                                {story.character.split(".")[0]}.
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
