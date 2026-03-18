import type {
  ChairParams,
  ProductDefinition,
  ShelfParams,
  SideTableParams,
  TableParams,
} from "../types";

export const SIDE_TABLE_CONSTRAINTS = {
  topWidth: { min: 300, max: 600, default: 400, step: 10, unit: "mm" },
  topDepth: { min: 300, max: 600, default: 400, step: 10, unit: "mm" },
  height: { min: 350, max: 650, default: 500, step: 10, unit: "mm" },
  topThickness: { min: 18, max: 25, default: 20, step: 1, unit: "mm" },
} as const;

export const TABLE_CONSTRAINTS = {
  length: { min: 900, max: 1800, default: 1400, step: 50, unit: "mm" },
  width: { min: 600, max: 1000, default: 800, step: 50, unit: "mm" },
  diningHeight: { min: 700, max: 760, default: 730, step: 10, unit: "mm" },
  coffeeHeight: { min: 350, max: 450, default: 400, step: 10, unit: "mm" },
  topThickness: { min: 20, max: 30, default: 25, step: 1, unit: "mm" },
} as const;

export const CHAIR_CONSTRAINTS = {
  seatWidth: { min: 400, max: 500, default: 450, step: 10, unit: "mm" },
  seatDepth: { min: 380, max: 440, default: 410, step: 10, unit: "mm" },
  seatHeight: { min: 430, max: 480, default: 450, step: 10, unit: "mm" },
  backHeight: { min: 350, max: 500, default: 420, step: 10, unit: "mm" },
  seatThickness: { min: 18, max: 22, default: 20, step: 1, unit: "mm" },
} as const;

export const SHELF_CONSTRAINTS = {
  shelfWidth: { min: 600, max: 1200, default: 900, step: 50, unit: "mm" },
  shelfDepth: { min: 200, max: 350, default: 250, step: 10, unit: "mm" },
  shelfThickness: { min: 18, max: 25, default: 20, step: 1, unit: "mm" },
  shelfCount: { min: 1, max: 5, default: 3, step: 1, unit: "" },
  unitHeight: { min: 800, max: 2000, default: 1500, step: 50, unit: "mm" },
  shelfSpacing: { min: 200, max: 500, default: 300, step: 25, unit: "mm" },
} as const;

export const SIDE_TABLE_DEFAULTS: SideTableParams = {
  productSlug: "side-table",
  topWidth: 400,
  topDepth: 400,
  height: 500,
  topThickness: 20,
  topProfile: "square",
  topEdge: "roundover",
  legCount: 4,
  legWrapStyle: "full",
  coreVisibility: "accent",
  apronCovers: true,
  woodSpecies: "white-oak",
  finish: "natural-oil",
  regionId: "seattle",
};

export const TABLE_DEFAULTS: TableParams = {
  productSlug: "table",
  tableMode: "dining",
  length: 1400,
  width: 800,
  height: 730,
  topThickness: 25,
  topShape: "rounded-rectangle",
  edgeProfile: "roundover",
  apronVisibility: "visible",
  coreVisibility: "accent",
  woodSpecies: "white-oak",
  finish: "natural-oil",
  regionId: "seattle",
};

export const CHAIR_DEFAULTS: ChairParams = {
  productSlug: "chair",
  seatWidth: 450,
  seatDepth: 410,
  seatHeight: 450,
  backHeight: 420,
  seatThickness: 20,
  backStyle: "solid",
  seatContour: "scoop",
  legWrapStyle: "partial",
  coreVisibility: "accent",
  woodSpecies: "white-oak",
  finish: "natural-oil",
  regionId: "seattle",
};

export const SHELF_DEFAULTS: ShelfParams = {
  productSlug: "shelf",
  mountType: "free-standing",
  shelfWidth: 900,
  shelfDepth: 250,
  shelfThickness: 20,
  shelfCount: 3,
  unitHeight: 1500,
  shelfSpacing: 300,
  edgeProfile: "square",
  backPanel: false,
  coreVisibility: "accent",
  woodSpecies: "white-oak",
  finish: "natural-oil",
  regionId: "seattle",
};

export const PRODUCT_CATALOG: Record<
  "side-table" | "table" | "chair" | "shelf",
  ProductDefinition
> = {
  "side-table": {
    slug: "side-table",
    sku: "TB-SD-01",
    label: "Side Table",
    displayName: "Heartwood",
    tagline: "The dense core \u2014 small, essential, foundational.",
    anatomyDescription: "Named for the dense core at a tree\u2019s center. Small but essential, like the piece beside you.",
    minJanka: 600,
    category: "accent",
    description: "Compact accent table with a fold-flat Core and CNC-cut wood wraps.",
    priceBand: { min: 99, max: 249 },
    dimensionsLocked: true,
    defaults: SIDE_TABLE_DEFAULTS,
    constraints: SIDE_TABLE_CONSTRAINTS,
    core: {
      summary: "4-leg bent steel rod Core with folding apron ring.",
      rodDiameterMm: 8,
      jointTypes: ["corner hinge", "panel insert"],
      foldable: true,
      finish: "Matte black powder coat",
    },
    panels: {
      summary: "Top plus two wrap panels per leg, with optional apron covers.",
      material: "Flat CNC-cut solid wood",
      range: { min: 6, max: 10 },
    },
    packaging: {
      box: { width: 680, depth: 680, height: 100 },
      weightKg: { min: 4, max: 7 },
      assemblyMinutes: { min: 10, max: 15 },
    },
  },
  table: {
    slug: "table",
    sku: "TB-DN-01",
    label: "Table",
    displayName: "Slab",
    tagline: "Every gathering starts around a Slab.",
    anatomyDescription: "Named for the broad cross-section of a felled tree. A gathering surface, wide and welcoming.",
    minJanka: 900,
    category: "dining",
    description: "Coffee and dining table modes sharing one fold-flat Core family.",
    modes: [
      { id: "dining", label: "Dining" },
      { id: "coffee", label: "Coffee" },
    ],
    defaultModeLabel: "Dining",
    priceBand: { min: 249, max: 899 },
    dimensionsLocked: true,
    defaults: TABLE_DEFAULTS,
    constraints: {
      length: TABLE_CONSTRAINTS.length,
      width: TABLE_CONSTRAINTS.width,
      height: TABLE_CONSTRAINTS.diningHeight,
      topThickness: TABLE_CONSTRAINTS.topThickness,
    },
    core: {
      summary: "Rectangular apron Core with optional center cross-brace for long spans.",
      rodDiameterMm: 10,
      jointTypes: ["corner hinge", "brace hinge", "panel insert"],
      foldable: true,
      finish: "Matte black powder coat",
    },
    panels: {
      summary: "Top split when needed, leg wraps, and apron cover strips.",
      material: "Flat CNC-cut solid wood",
      range: { min: 7, max: 11 },
    },
    packaging: {
      box: { width: 1020, depth: 1880, height: 120 },
      weightKg: { min: 12, max: 35 },
      assemblyMinutes: { min: 15, max: 30 },
    },
  },
  chair: {
    slug: "chair",
    sku: "CH-DN-01",
    label: "Dining Chair",
    displayName: "Bough",
    tagline: "The branch that supports you.",
    anatomyDescription: "Named for the limb that bears the weight of the canopy. Built to support, shaped for comfort.",
    minJanka: 1000,
    category: "seating",
    description: "Core-led seating frame with cosmetic wood seat, back, and leg wraps.",
    priceBand: { min: 149, max: 349 },
    dimensionsLocked: true,
    defaults: CHAIR_DEFAULTS,
    constraints: CHAIR_CONSTRAINTS,
    core: {
      summary: "Fold-flat chair Core with seat ring, angled back uprights, and stretchers.",
      rodDiameterMm: 8,
      jointTypes: ["seat hinge", "stretcher node", "panel insert"],
      foldable: true,
      finish: "Matte black powder coat",
    },
    panels: {
      summary: "Seat panel, back options, front wraps, and optional stretcher covers.",
      material: "Flat CNC-cut solid wood",
      range: { min: 5, max: 9 },
    },
    packaging: {
      box: { width: 520, depth: 520, height: 100 },
      weightKg: { min: 5, max: 8 },
      assemblyMinutes: { min: 10, max: 15 },
    },
  },
  shelf: {
    slug: "shelf",
    sku: "SH-WL-01",
    label: "Shelf",
    displayName: "Canopy",
    tagline: "Layers reaching upward, holding what matters.",
    anatomyDescription: "Named for the topmost layer of the forest. Shelves that reach upward, organizing and displaying.",
    minJanka: 400,
    category: "storage",
    description: "Wall-mount and free-standing shelf system built around a visible Core.",
    modes: [
      { id: "free-standing", label: "Free-Standing" },
      { id: "wall-mount", label: "Wall-Mount" },
    ],
    defaultModeLabel: "Free-Standing",
    priceBand: { min: 79, max: 499 },
    dimensionsLocked: true,
    defaults: SHELF_DEFAULTS,
    constraints: SHELF_CONSTRAINTS,
    core: {
      summary: "Bracket or ladder-frame Core depending on mount type.",
      rodDiameterMm: 8,
      jointTypes: ["wall bracket", "frame hinge", "shelf support"],
      foldable: true,
      finish: "Matte black powder coat",
    },
    panels: {
      summary: "Shelf surfaces with edge strips, optional side panels, and optional back.",
      material: "Flat CNC-cut solid wood",
      range: { min: 3, max: 5 },
    },
    packaging: {
      box: { width: 1280, depth: 600, height: 150 },
      weightKg: { min: 3, max: 18 },
      assemblyMinutes: { min: 10, max: 35 },
    },
  },
};

export const PRODUCT_ORDER = [
  PRODUCT_CATALOG["side-table"],
  PRODUCT_CATALOG.table,
  PRODUCT_CATALOG.chair,
  PRODUCT_CATALOG.shelf,
] as const;

// ─── Wood Suitability ─────────────────────────────────────────────

export type WoodSuitabilityRating = "recommended" | "suitable" | "soft-warning";

export interface WoodSuitability {
  rating: WoodSuitabilityRating;
  label: string;
  description: string;
}

/**
 * Evaluate how well a wood species' hardness matches a product's structural needs.
 * Species are never blocked — this is advisory guidance.
 */
export function getWoodSuitability(
  productSlug: string,
  jankaHardness: number
): WoodSuitability {
  const product = PRODUCT_CATALOG[productSlug as keyof typeof PRODUCT_CATALOG];
  if (!product) {
    return { rating: "suitable", label: "Suitable", description: "Good for this use." };
  }

  const minJanka = product.minJanka;
  const label = product.label.toLowerCase();

  if (jankaHardness >= minJanka + 300) {
    return {
      rating: "recommended",
      label: "Recommended",
      description: `Excellent hardness for a ${label}.`,
    };
  }

  if (jankaHardness >= minJanka) {
    return {
      rating: "suitable",
      label: "Suitable",
      description: `Good for this use.`,
    };
  }

  return {
    rating: "soft-warning",
    label: "Softer than ideal",
    description: `This wood (Janka ${jankaHardness}) is softer than recommended for a ${label} (${minJanka}+). Consider a harder species for heavy use.`,
  };
}
