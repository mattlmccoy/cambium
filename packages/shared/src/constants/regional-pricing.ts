// ─── Regional Cost Factors ──────────────────────────────────────
// Each microfactory region has different labor rates, overhead, and
// shipping costs based on local cost of living and market conditions.

export interface RegionalCostFactors {
  regionId: string;
  laborRateMultiplier: number;   // 1.0 = baseline ($35/hr)
  cncRateMultiplier: number;     // shop rate multiplier
  overheadMultiplier: number;    // rent/utilities
  shippingBase: number;          // DTC shipping cost from this region ($)
}

// Based on BLS data for woodworking occupations by metro area (2024)
// and commercial real estate indices for shop space
export const REGIONAL_COST_FACTORS: RegionalCostFactors[] = [
  { regionId: "seattle",      laborRateMultiplier: 1.15, cncRateMultiplier: 1.10, overheadMultiplier: 1.20, shippingBase: 28 },
  { regionId: "sacramento",   laborRateMultiplier: 1.20, cncRateMultiplier: 1.15, overheadMultiplier: 1.30, shippingBase: 30 },
  { regionId: "phoenix",      laborRateMultiplier: 0.90, cncRateMultiplier: 0.95, overheadMultiplier: 0.85, shippingBase: 26 },
  { regionId: "denver",       laborRateMultiplier: 1.05, cncRateMultiplier: 1.00, overheadMultiplier: 1.05, shippingBase: 27 },
  { regionId: "austin",       laborRateMultiplier: 0.95, cncRateMultiplier: 0.95, overheadMultiplier: 0.90, shippingBase: 24 },
  { regionId: "minneapolis",  laborRateMultiplier: 1.00, cncRateMultiplier: 1.00, overheadMultiplier: 1.00, shippingBase: 25 },
  { regionId: "chicago",      laborRateMultiplier: 1.10, cncRateMultiplier: 1.05, overheadMultiplier: 1.15, shippingBase: 26 },
  { regionId: "pittsburgh",   laborRateMultiplier: 0.95, cncRateMultiplier: 0.95, overheadMultiplier: 0.90, shippingBase: 24 },
  { regionId: "boston",        laborRateMultiplier: 1.20, cncRateMultiplier: 1.15, overheadMultiplier: 1.25, shippingBase: 30 },
  { regionId: "atlanta",      laborRateMultiplier: 0.90, cncRateMultiplier: 0.90, overheadMultiplier: 0.85, shippingBase: 22 },
];

// ─── Per-Species Wood Pricing ───────────────────────────────────
// Base price per board foot for each species.
// Sourced from Woodworkers Source, Bell Forest Products, and
// regional mill price lists (2024–2025 retail pricing).
//
// When a species is used in its home region, it gets the base price.
// When shipped cross-region, a surcharge is added.

export interface WoodSpeciesPrice {
  speciesId: string;
  basePrice: number;  // $/board foot (retail small-quantity price)
}

export const WOOD_SPECIES_PRICES: WoodSpeciesPrice[] = [
  // Pacific Northwest
  { speciesId: "douglas-fir",        basePrice: 5.50 },   // abundant, structural softwood
  { speciesId: "western-red-cedar",  basePrice: 8.75 },   // premium outdoor/aromatic
  { speciesId: "bigleaf-maple",      basePrice: 7.25 },   // moderate hardwood, figured stock more
  { speciesId: "red-alder",          basePrice: 5.00 },   // very common PNW furniture wood
  { speciesId: "white-oak",          basePrice: 9.50 },   // premium, high demand (whiskey/furniture)

  // California
  { speciesId: "claro-walnut",       basePrice: 14.00 },  // premium California native
  { speciesId: "coast-redwood",      basePrice: 10.50 },  // limited supply, high demand
  { speciesId: "incense-cedar",      basePrice: 6.50 },   // moderate softwood

  // Southwest
  { speciesId: "mesquite",           basePrice: 12.00 },  // very hard, limited supply
  { speciesId: "ponderosa-pine",     basePrice: 4.75 },   // abundant softwood

  // Rocky Mountain
  { speciesId: "beetle-kill-pine",   basePrice: 4.25 },   // reclaimed/salvage pricing
  { speciesId: "aspen",              basePrice: 4.00 },   // soft, abundant

  // Texas
  { speciesId: "pecan",              basePrice: 8.50 },   // hickory family, moderate
  { speciesId: "bald-cypress",       basePrice: 7.50 },   // rot-resistant, moderate

  // Upper Midwest
  { speciesId: "hard-maple",         basePrice: 8.00 },   // workhorse hardwood
  { speciesId: "yellow-birch",       basePrice: 7.50 },   // moderate hardwood
  { speciesId: "red-oak",            basePrice: 6.50 },   // most common US hardwood
  { speciesId: "basswood",           basePrice: 4.50 },   // soft, carving wood

  // Great Lakes
  { speciesId: "black-walnut",       basePrice: 12.50 },  // premium domestic hardwood
  { speciesId: "cherry",             basePrice: 9.00 },   // popular fine furniture
  { speciesId: "hickory",            basePrice: 8.50 },   // very hard, rustic

  // Mid-Atlantic
  { speciesId: "black-cherry",       basePrice: 9.50 },   // PA cherry, fine furniture
  { speciesId: "yellow-poplar",      basePrice: 4.25 },   // abundant, paint-grade

  // New England
  { speciesId: "eastern-white-pine", basePrice: 4.00 },   // most abundant NE softwood
  { speciesId: "beech",              basePrice: 6.50 },   // hard, steam-bending

  // Southeast
  { speciesId: "southern-yellow-pine", basePrice: 4.50 }, // abundant construction grade
  { speciesId: "cypress",            basePrice: 7.00 },   // rot-resistant, coastal
];

// ─── Cross-Region Surcharges ────────────────────────────────────
// When a customer wants wood from a different region, they pay extra
// for transport logistics. This encourages buying local.

export const CROSS_REGION_SURCHARGE_PER_BF = 3.50;     // $/bf transport premium
export const CROSS_REGION_HANDLING_MULTIPLIER = 1.15;   // 15% handling uplift on wood cost

// ─── Helpers ────────────────────────────────────────────────────

export function getRegionalCostFactors(regionId: string): RegionalCostFactors {
  return (
    REGIONAL_COST_FACTORS.find((r) => r.regionId === regionId) ??
    REGIONAL_COST_FACTORS.find((r) => r.regionId === "minneapolis")! // baseline fallback
  );
}

export function getWoodBasePrice(speciesId: string): number {
  const entry = WOOD_SPECIES_PRICES.find((w) => w.speciesId === speciesId);
  return entry?.basePrice ?? 8.50; // fallback to average
}

/**
 * Get the effective price per board foot for a species in a given region.
 * Local species get the base price. Cross-region species get base + surcharge.
 */
export function getEffectiveWoodPrice(
  speciesId: string,
  speciesRegions: readonly string[],
  userRegionId: string
): { pricePerBf: number; isLocal: boolean; surcharge: number } {
  const basePrice = getWoodBasePrice(speciesId);
  const isLocal = speciesRegions.includes(userRegionId);

  if (isLocal) {
    return { pricePerBf: basePrice, isLocal: true, surcharge: 0 };
  }

  const surcharge = CROSS_REGION_SURCHARGE_PER_BF;
  const pricePerBf = basePrice * CROSS_REGION_HANDLING_MULTIPLIER + surcharge;
  return { pricePerBf, isLocal: false, surcharge: pricePerBf - basePrice };
}

/**
 * Find the cheapest local wood species for a region.
 * Returns the species ID.
 */
export function getCheapestLocalSpecies(
  regionId: string,
  allSpecies: readonly { id: string; regions: readonly string[] }[]
): string {
  const localSpecies = allSpecies.filter((s) => s.regions.includes(regionId));
  if (localSpecies.length === 0) return allSpecies[0]?.id ?? "white-oak";

  let cheapest = localSpecies[0];
  let cheapestPrice = getWoodBasePrice(cheapest.id);

  for (const species of localSpecies) {
    const price = getWoodBasePrice(species.id);
    if (price < cheapestPrice) {
      cheapest = species;
      cheapestPrice = price;
    }
  }

  return cheapest.id;
}
