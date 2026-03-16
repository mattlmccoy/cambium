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

// ─── Regional Tier System ─────────────────────────────────────────
// Distance-based pricing tiers that encourage buying local.
// Closer regions have smaller surcharges; cross-country has the highest.

export interface RegionTier {
  tier: 0 | 1 | 2 | 3 | 4;
  label: string;
  surchargePerBf: number;
  handlingMultiplier: number;
  maxDistance: number;       // miles (upper bound for this tier)
  color: string;             // display color for map rings / badges
}

export const REGION_TIERS: RegionTier[] = [
  { tier: 0, label: "Your Region",    surchargePerBf: 0,    handlingMultiplier: 1.00, maxDistance: 0,    color: "#10b981" },
  { tier: 1, label: "Neighboring",    surchargePerBf: 2.00, handlingMultiplier: 1.10, maxDistance: 600,  color: "#34d399" },
  { tier: 2, label: "Regional",       surchargePerBf: 4.00, handlingMultiplier: 1.15, maxDistance: 1200, color: "#f59e0b" },
  { tier: 3, label: "Distant",        surchargePerBf: 6.00, handlingMultiplier: 1.22, maxDistance: 2000, color: "#f97316" },
  { tier: 4, label: "Cross-Country",  surchargePerBf: 8.50, handlingMultiplier: 1.30, maxDistance: Infinity, color: "#ef4444" },
];

/** Get the tier for shipping wood between two regions */
export function getRegionTier(fromRegion: string, toRegion: string): RegionTier {
  if (fromRegion === toRegion) return REGION_TIERS[0];
  const distance = getRegionDistance(fromRegion, toRegion);
  for (const tier of REGION_TIERS) {
    if (tier.tier === 0) continue;
    if (distance <= tier.maxDistance) return tier;
  }
  return REGION_TIERS[REGION_TIERS.length - 1];
}

/** Group all regions by their tier relative to the user's region, sorted by tier */
export function getRegionsGroupedByTier(
  userRegionId: string,
  allRegions: readonly { id: string; name: string; city: string; state: string }[]
): { tier: RegionTier; regions: { id: string; name: string; city: string; state: string; distance: number }[] }[] {
  const groups = new Map<number, { tier: RegionTier; regions: { id: string; name: string; city: string; state: string; distance: number }[] }>();

  for (const region of allRegions) {
    if (region.id === userRegionId) continue; // skip the user's own region
    const tier = getRegionTier(userRegionId, region.id);
    const distance = getRegionDistance(userRegionId, region.id);

    if (!groups.has(tier.tier)) {
      groups.set(tier.tier, { tier, regions: [] });
    }
    groups.get(tier.tier)!.regions.push({ ...region, distance });
  }

  // Sort regions within each tier by distance
  for (const group of groups.values()) {
    group.regions.sort((a, b) => a.distance - b.distance);
  }

  // Sort groups by tier number
  return Array.from(groups.values()).sort((a, b) => a.tier.tier - b.tier.tier);
}

// Legacy constants (deprecated — use REGION_TIERS instead)
export const CROSS_REGION_SURCHARGE_PER_BF = 6.00;
export const CROSS_REGION_HANDLING_MULTIPLIER = 1.25;

// ─── Region Coordinates ────────────────────────────────────────
// Lat/lng for each microfactory city. Used for distance calculations
// to show users how far cross-region wood must travel.

export const REGION_COORDINATES: Record<string, { lat: number; lng: number }> = {
  seattle:      { lat: 47.6062, lng: -122.3321 },
  sacramento:   { lat: 38.5816, lng: -121.4944 },
  phoenix:      { lat: 33.4484, lng: -112.0740 },
  denver:       { lat: 39.7392, lng: -104.9903 },
  austin:       { lat: 30.2672, lng: -97.7431  },
  minneapolis:  { lat: 44.9778, lng: -93.2650  },
  chicago:      { lat: 41.8781, lng: -87.6298  },
  pittsburgh:   { lat: 40.4406, lng: -79.9959  },
  boston:        { lat: 42.3601, lng: -71.0589  },
  atlanta:      { lat: 33.7490, lng: -84.3880  },
};

/**
 * Calculate the distance in miles between two regions using the haversine formula.
 */
export function getRegionDistance(regionA: string, regionB: string): number {
  const a = REGION_COORDINATES[regionA];
  const b = REGION_COORDINATES[regionB];
  if (!a || !b) return 0;

  const R = 3959; // Earth radius in miles
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinLng * sinLng;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
}

/**
 * Find the closest source region for a species relative to the user's region.
 */
export function getClosestSourceRegion(
  speciesRegions: readonly string[],
  userRegionId: string
): string {
  if (speciesRegions.length === 0) return userRegionId;
  if (speciesRegions.includes(userRegionId)) return userRegionId;

  let closest = speciesRegions[0];
  let closestDist = getRegionDistance(userRegionId, closest);
  for (let i = 1; i < speciesRegions.length; i++) {
    const dist = getRegionDistance(userRegionId, speciesRegions[i]);
    if (dist < closestDist) {
      closest = speciesRegions[i];
      closestDist = dist;
    }
  }
  return closest;
}

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
 * Local species get the base price. Cross-region species get tiered surcharges.
 */
export function getEffectiveWoodPrice(
  speciesId: string,
  speciesRegions: readonly string[],
  userRegionId: string
): { pricePerBf: number; isLocal: boolean; surcharge: number; tier: RegionTier; sourceRegion: string } {
  const basePrice = getWoodBasePrice(speciesId);
  const isLocal = speciesRegions.includes(userRegionId);

  if (isLocal) {
    return { pricePerBf: basePrice, isLocal: true, surcharge: 0, tier: REGION_TIERS[0], sourceRegion: userRegionId };
  }

  // Find the closest region that has this species
  const sourceRegion = getClosestSourceRegion(speciesRegions, userRegionId);
  const tier = getRegionTier(sourceRegion, userRegionId);

  const pricePerBf = basePrice * tier.handlingMultiplier + tier.surchargePerBf;
  return {
    pricePerBf,
    isLocal: false,
    surcharge: pricePerBf - basePrice,
    tier,
    sourceRegion,
  };
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
