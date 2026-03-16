import type { ProductSlug } from "../types/index";
export * from "./products";
export * from "./regional-pricing";
export * from "./zip-regions";
export * from "./stories";
export * from "./carbon";

// ─── Side Table Parameter Constraints ────────────────────────────

// ─── CNC Constants ───────────────────────────────────────────────

export const CNC_CONSTANTS = {
  sheetWidth: 1220, // mm (4' plywood sheet)
  sheetHeight: 2440, // mm (8' plywood sheet)
  bitDiameter: 6.35, // mm (1/4" bit)
  feedRate: 3000, // mm/min
  plungeRate: 1000, // mm/min
  materialThicknesses: [12, 18, 20, 25], // mm available
} as const;

// ─── Finish Options ──────────────────────────────────────────────

export const FINISHES = [
  { id: "clear", name: "Clear Coat", costPerSqFt: 0.5 },
  { id: "matte", name: "Matte Finish", costPerSqFt: 0.6 },
  { id: "natural-oil", name: "Natural Oil", costPerSqFt: 0.75 },
  { id: "light-stain", name: "Light Stain", costPerSqFt: 0.8 },
  { id: "dark-stain", name: "Dark Stain", costPerSqFt: 0.8 },
] as const;

// ─── Region Data ─────────────────────────────────────────────────

export const REGIONS = [
  {
    id: "seattle",
    name: "Pacific Northwest",
    city: "Seattle",
    state: "WA",
    statesServiced: ["WA", "OR", "ID"],
  },
  {
    id: "sacramento",
    name: "California",
    city: "Sacramento",
    state: "CA",
    statesServiced: ["CA", "NV"],
  },
  {
    id: "phoenix",
    name: "Southwest",
    city: "Phoenix",
    state: "AZ",
    statesServiced: ["AZ", "NM"],
  },
  {
    id: "denver",
    name: "Rocky Mountain",
    city: "Denver",
    state: "CO",
    statesServiced: ["CO", "WY", "UT", "MT", "KS"],
  },
  {
    id: "austin",
    name: "Texas & South Central",
    city: "Austin",
    state: "TX",
    statesServiced: ["TX", "OK", "AR", "LA"],
  },
  {
    id: "minneapolis",
    name: "Upper Midwest",
    city: "Minneapolis",
    state: "MN",
    statesServiced: ["MN", "ND", "SD", "WI", "IA", "NE"],
  },
  {
    id: "chicago",
    name: "Great Lakes",
    city: "Chicago",
    state: "IL",
    statesServiced: ["IL", "IN", "MI", "MO"],
  },
  {
    id: "pittsburgh",
    name: "Mid-Atlantic",
    city: "Pittsburgh",
    state: "PA",
    statesServiced: ["PA", "OH", "WV", "KY", "VA", "MD", "DC", "DE"],
  },
  {
    id: "boston",
    name: "New England",
    city: "Boston",
    state: "MA",
    statesServiced: ["MA", "ME", "NH", "VT", "RI", "CT", "NY", "NJ"],
  },
  {
    id: "atlanta",
    name: "Southeast",
    city: "Atlanta",
    state: "GA",
    statesServiced: ["GA", "SC", "NC", "AL", "MS", "TN", "FL"],
  },
] as const;

// ─── Wood Species Database ───────────────────────────────────────

export const WOOD_SPECIES = [
  // Pacific Northwest
  { id: "douglas-fir", name: "Douglas Fir", color: "#c4956a", density: 530, hardness: 660, grain: "straight" as const, regions: ["seattle", "sacramento", "denver"] },
  { id: "western-red-cedar", name: "Western Red Cedar", color: "#a0674b", density: 370, hardness: 350, grain: "straight" as const, regions: ["seattle"] },
  { id: "bigleaf-maple", name: "Bigleaf Maple", color: "#d4b896", density: 480, hardness: 850, grain: "wavy" as const, regions: ["seattle"] },
  { id: "red-alder", name: "Red Alder", color: "#c9a882", density: 410, hardness: 590, grain: "straight" as const, regions: ["seattle"] },
  { id: "white-oak", name: "White Oak", color: "#c4a872", density: 770, hardness: 1360, grain: "straight" as const, regions: ["seattle", "minneapolis", "chicago", "pittsburgh", "boston", "atlanta", "austin"] },

  // California
  { id: "claro-walnut", name: "Claro Walnut", color: "#5c4033", density: 560, hardness: 1010, grain: "wavy" as const, regions: ["sacramento"] },
  { id: "coast-redwood", name: "Coast Redwood", color: "#8b4533", density: 400, hardness: 420, grain: "straight" as const, regions: ["sacramento"] },
  { id: "incense-cedar", name: "Incense Cedar", color: "#b8956a", density: 370, hardness: 470, grain: "straight" as const, regions: ["sacramento"] },

  // Southwest
  { id: "mesquite", name: "Mesquite", color: "#6b3a2a", density: 800, hardness: 2345, grain: "irregular" as const, regions: ["phoenix", "austin"] },
  { id: "ponderosa-pine", name: "Ponderosa Pine", color: "#d4b078", density: 400, hardness: 460, grain: "straight" as const, regions: ["phoenix"] },

  // Rocky Mountain
  { id: "beetle-kill-pine", name: "Beetle-Kill Blue Pine", color: "#8a9aad", density: 400, hardness: 460, grain: "straight" as const, regions: ["denver"] },
  { id: "aspen", name: "Aspen", color: "#e0d4c0", density: 420, hardness: 350, grain: "straight" as const, regions: ["denver"] },

  // Texas
  { id: "pecan", name: "Pecan / Hickory", color: "#b08050", density: 720, hardness: 1820, grain: "straight" as const, regions: ["austin", "phoenix"] },
  { id: "bald-cypress", name: "Bald Cypress", color: "#a08060", density: 510, hardness: 510, grain: "straight" as const, regions: ["austin"] },

  // Upper Midwest
  { id: "hard-maple", name: "Hard Maple", color: "#e8d8c0", density: 710, hardness: 1450, grain: "straight" as const, regions: ["minneapolis", "chicago", "pittsburgh", "boston"] },
  { id: "yellow-birch", name: "Yellow Birch", color: "#c8a878", density: 660, hardness: 1260, grain: "wavy" as const, regions: ["minneapolis", "boston"] },
  { id: "red-oak", name: "Red Oak", color: "#b8956a", density: 660, hardness: 1290, grain: "straight" as const, regions: ["minneapolis", "chicago", "pittsburgh", "boston", "atlanta"] },
  { id: "basswood", name: "Basswood", color: "#e0d0b8", density: 420, hardness: 410, grain: "straight" as const, regions: ["minneapolis"] },

  // Great Lakes
  { id: "black-walnut", name: "Black Walnut", color: "#4a3728", density: 610, hardness: 1010, grain: "straight" as const, regions: ["chicago", "pittsburgh", "atlanta"] },
  { id: "cherry", name: "Cherry", color: "#a0603a", density: 560, hardness: 950, grain: "straight" as const, regions: ["chicago", "pittsburgh", "boston"] },
  { id: "hickory", name: "Hickory", color: "#c09868", density: 810, hardness: 1820, grain: "straight" as const, regions: ["chicago", "pittsburgh", "atlanta", "austin"] },

  // Mid-Atlantic
  { id: "black-cherry", name: "Black Cherry", color: "#963a28", density: 560, hardness: 950, grain: "straight" as const, regions: ["pittsburgh"] },
  { id: "yellow-poplar", name: "Yellow Poplar", color: "#c8c090", density: 430, hardness: 540, grain: "straight" as const, regions: ["pittsburgh", "atlanta"] },

  // New England
  { id: "eastern-white-pine", name: "Eastern White Pine", color: "#d8c8a8", density: 380, hardness: 380, grain: "straight" as const, regions: ["boston"] },
  { id: "beech", name: "Beech", color: "#d0b890", density: 720, hardness: 1300, grain: "straight" as const, regions: ["boston"] },

  // Southeast
  { id: "southern-yellow-pine", name: "Southern Yellow Pine", color: "#c8a868", density: 590, hardness: 870, grain: "straight" as const, regions: ["atlanta"] },
  { id: "cypress", name: "Cypress", color: "#a89070", density: 510, hardness: 510, grain: "straight" as const, regions: ["atlanta"] },
] as const;

// Helper to get species available in a region
export function getSpeciesForRegion(regionId: string) {
  return WOOD_SPECIES.filter((s) =>
    (s.regions as readonly string[]).includes(regionId)
  );
}

// Helper to get species by ID
export function getSpeciesById(id: string) {
  return WOOD_SPECIES.find((s) => s.id === id);
}

export function isProductSlug(value: string): value is ProductSlug {
  return value === "side-table" || value === "table" || value === "chair" || value === "shelf";
}
