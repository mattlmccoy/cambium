// ─── ZIP Code → Region Mapping ──────────────────────────────────
// Maps US ZIP code prefixes (first 3 digits) to states,
// then states to Cambium microfactory regions.
//
// ZIP prefix ranges sourced from USPS Publication 65.
// State → region mapping hardcoded to avoid circular import with index.ts.

// State → Region mapping (mirrors REGIONS[].statesServiced)
const STATE_TO_REGION: Record<string, string> = {
  // Pacific Northwest (Seattle)
  WA: "seattle", OR: "seattle", ID: "seattle",
  // California (Sacramento)
  CA: "sacramento", NV: "sacramento",
  // Southwest (Phoenix)
  AZ: "phoenix", NM: "phoenix",
  // Rocky Mountain (Denver)
  CO: "denver", WY: "denver", UT: "denver", MT: "denver", KS: "denver",
  // Texas & South Central (Austin)
  TX: "austin", OK: "austin", AR: "austin", LA: "austin",
  // Upper Midwest (Minneapolis)
  MN: "minneapolis", ND: "minneapolis", SD: "minneapolis", WI: "minneapolis", IA: "minneapolis", NE: "minneapolis",
  // Great Lakes (Chicago)
  IL: "chicago", IN: "chicago", MI: "chicago", MO: "chicago",
  // Mid-Atlantic (Pittsburgh)
  PA: "pittsburgh", OH: "pittsburgh", WV: "pittsburgh", KY: "pittsburgh", VA: "pittsburgh", MD: "pittsburgh", DC: "pittsburgh", DE: "pittsburgh",
  // New England (Boston)
  MA: "boston", ME: "boston", NH: "boston", VT: "boston", RI: "boston", CT: "boston", NY: "boston", NJ: "boston",
  // Southeast (Atlanta)
  GA: "atlanta", SC: "atlanta", NC: "atlanta", AL: "atlanta", MS: "atlanta", TN: "atlanta", FL: "atlanta",
  // Non-contiguous (nearest microfactory)
  AK: "seattle", HI: "sacramento",
};

// ZIP prefix ranges → state abbreviation
// Format: [startPrefix, endPrefix, stateAbbrev]
// Sourced from USPS ZIP code assignment ranges
const ZIP_RANGES: [number, number, string][] = [
  // New England / Northeast
  [10, 27, "MA"],
  [28, 29, "RI"],
  [30, 38, "NH"],
  [39, 49, "ME"],
  [50, 59, "VT"],
  [60, 69, "CT"],
  [70, 89, "NJ"],
  [100, 149, "NY"],
  // Mid-Atlantic
  [150, 196, "PA"],
  [197, 199, "DE"],
  [200, 205, "DC"],
  [206, 219, "MD"],
  [220, 246, "VA"],
  [247, 268, "WV"],
  // Southeast
  [270, 289, "NC"],
  [290, 299, "SC"],
  [300, 319, "GA"],
  [399, 399, "GA"],
  [320, 349, "FL"],
  [350, 369, "AL"],
  [370, 385, "TN"],
  [386, 397, "MS"],
  // Midwest / Great Lakes
  [400, 427, "KY"],
  [430, 458, "OH"],
  [460, 479, "IN"],
  [480, 499, "MI"],
  [500, 528, "IA"],
  [530, 549, "WI"],
  [550, 567, "MN"],
  [570, 577, "SD"],
  [580, 588, "ND"],
  [590, 599, "MT"],
  [600, 629, "IL"],
  [630, 658, "MO"],
  [660, 679, "KS"],
  [680, 693, "NE"],
  // South Central
  [700, 714, "LA"],
  [716, 729, "AR"],
  [730, 749, "OK"],
  [750, 799, "TX"],
  [885, 885, "TX"],
  // Mountain West
  [800, 816, "CO"],
  [820, 831, "WY"],
  [832, 838, "ID"],
  [840, 847, "UT"],
  [850, 865, "AZ"],
  [870, 884, "NM"],
  [889, 898, "NV"],
  // West Coast
  [900, 961, "CA"],
  [967, 968, "HI"],
  [970, 979, "OR"],
  [980, 994, "WA"],
  [995, 999, "AK"],
];

/**
 * Get the state abbreviation for a ZIP code.
 */
export function getStateFromZip(zip: string): string | null {
  const prefix = parseInt(zip.substring(0, 3), 10);
  if (isNaN(prefix)) return null;

  for (const [start, end, state] of ZIP_RANGES) {
    if (prefix >= start && prefix <= end) {
      return state;
    }
  }
  return null;
}

/**
 * Get the Cambium microfactory region for a ZIP code.
 * Returns null if the ZIP code is invalid or not in a serviced area.
 */
export function zipToRegion(zip: string): string | null {
  const state = getStateFromZip(zip);
  if (!state) return null;
  return STATE_TO_REGION[state] ?? null;
}

/**
 * Validate that a string looks like a US ZIP code (5 digits).
 */
export function isValidZip(zip: string): boolean {
  return /^\d{5}$/.test(zip);
}
