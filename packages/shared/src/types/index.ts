// ─── Product Types ───────────────────────────────────────────────

export type ProductSlug = "side-table" | "table" | "chair" | "shelf";
export type ProductCategory =
  | "accent"
  | "dining"
  | "seating"
  | "storage";

export type TopProfile = "square" | "circle";
export type TableTopShape = "rectangle" | "rounded-rectangle" | "racetrack";
export type EdgeProfile = "square" | "chamfer" | "roundover" | "bevel";
export type FinishType =
  | "clear"
  | "matte"
  | "natural-oil"
  | "light-stain"
  | "dark-stain";

export type LegWrapStyle = "full" | "partial" | "exposed";
export type CoreVisibility = "hidden" | "accent" | "exposed";
export type TableMode = "dining" | "coffee";
export type ChairBackStyle = "solid" | "three-slat" | "five-slat";
export type SeatContour = "flat" | "scoop";
export type ShelfMountType = "free-standing" | "wall-mount";

export interface BaseProductParams {
  productSlug: ProductSlug;
  woodSpecies: string;
  finish: FinishType;
  regionId: string;
}

export interface SideTableParams extends BaseProductParams {
  productSlug: "side-table";
  topWidth: number;
  topDepth: number;
  height: number;
  topThickness: number;
  topProfile: TopProfile;
  topEdge: EdgeProfile;
  legCount: 3 | 4;
  legWrapStyle: LegWrapStyle;
  coreVisibility: CoreVisibility;
  apronCovers: boolean;
}

export interface TableParams extends BaseProductParams {
  productSlug: "table";
  tableMode: TableMode;
  length: number;
  width: number;
  height: number;
  topThickness: number;
  topShape: TableTopShape;
  edgeProfile: EdgeProfile;
  apronVisibility: "hidden" | "visible";
  coreVisibility: CoreVisibility;
}

export interface ChairParams extends BaseProductParams {
  productSlug: "chair";
  seatWidth: number;
  seatDepth: number;
  seatHeight: number;
  backHeight: number;
  seatThickness: number;
  backStyle: ChairBackStyle;
  seatContour: SeatContour;
  legWrapStyle: LegWrapStyle;
  coreVisibility: CoreVisibility;
}

export interface ShelfParams extends BaseProductParams {
  productSlug: "shelf";
  mountType: ShelfMountType;
  shelfWidth: number;
  shelfDepth: number;
  shelfThickness: number;
  shelfCount: number;
  unitHeight: number;
  shelfSpacing: number;
  edgeProfile: EdgeProfile;
  backPanel: boolean;
  coreVisibility: CoreVisibility;
}

export type AnyProductParams =
  | SideTableParams
  | TableParams
  | ChairParams
  | ShelfParams;

// ─── Catalog Types ───────────────────────────────────────────────

export interface NumericConstraint {
  min: number;
  max: number;
  default: number;
  step: number;
  unit: string;
}

export interface ProductConstraints {
  [key: string]: NumericConstraint;
}

export interface PackagingSpec {
  box: { width: number; depth: number; height: number };
  weightKg: { min: number; max: number };
  assemblyMinutes: { min: number; max: number };
}

export interface CoreSpec {
  summary: string;
  rodDiameterMm: number;
  jointTypes: string[];
  foldable: boolean;
  finish: string;
}

export interface PanelSpec {
  summary: string;
  material: string;
  range: { min: number; max: number };
}

export interface PriceBand {
  min: number;
  max: number;
}

export interface ProductDefinition<TParams extends AnyProductParams = AnyProductParams> {
  slug: ProductSlug;
  sku: string;
  label: string;
  /** Tree-anatomy display name (e.g., "Heartwood", "Slab") */
  displayName: string;
  /** Short tagline for the product */
  tagline: string;
  /** Longer description tying the product to its tree-anatomy namesake */
  anatomyDescription: string;
  /** Minimum Janka hardness recommended for this product type */
  minJanka: number;
  category: ProductCategory;
  description: string;
  modes?: { id: string; label: string }[];
  defaultModeLabel?: string;
  priceBand: PriceBand;
  /** When true, dimension sliders and structural options (leg count, mount type) are hidden.
   *  Users can only choose cosmetic options (wood, finish, edge profile, wrap style).
   *  The config engine enforces default values for all locked fields. */
  dimensionsLocked: boolean;
  defaults: TParams;
  constraints: ProductConstraints;
  core: CoreSpec;
  panels: PanelSpec;
  packaging: PackagingSpec;
}

// ─── Geometry Types ──────────────────────────────────────────────

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export type GeometryPartType =
  | "panel"
  | "rod"
  | "joint"
  | "brace"
  | "surface"
  | "hardware";

export type GeometryMaterial = "wood" | "metal" | "plastic";

/** Whether a geometry part belongs to the steel Core or the wood Shell layer */
export type GeometryLayer = "core" | "shell";

export interface GeometryPart {
  id: string;
  name: string;
  type: GeometryPartType;
  material: GeometryMaterial;
  /** Core = steel subframe (loaded from GLB or procedural), Shell = wood panels (always procedural) */
  layer: GeometryLayer;
  position: Vec3;
  rotation: Vec3;
  dimensions: Vec3;
  shape: ShapeDescriptor;
}

export type ShapeDescriptor =
  | { kind: "box"; width: number; height: number; depth: number }
  | {
      kind: "cylinder";
      radiusTop: number;
      radiusBottom: number;
      height: number;
    }
  | {
      kind: "rounded-box";
      width: number;
      height: number;
      depth: number;
      radius: number;
    }
  | {
      /** Loaded from a GLB/glTF model file */
      kind: "model";
      /** Model identifier (e.g., "side-table-core") — maps to /models/cores/{modelId}.glb */
      modelId: string;
      /** Optional scale override (default: [1,1,1]) */
      scale?: Vec3;
    };

export interface GeometryResult {
  parts: GeometryPart[];
  boundingBox: { min: Vec3; max: Vec3 };
}

// ─── BOM Types ───────────────────────────────────────────────────

export interface BOMItem {
  partId: string;
  name: string;
  category: "panel" | "core" | "hardware" | "packaging";
  material: string;
  quantity: number;
  dimensions?: { length: number; width: number; thickness: number };
  boardFeet?: number;
  unitCost?: number;
}

export interface BOMResult {
  items: BOMItem[];
  totalBoardFeet: number;
  /** Total steel rod length in mm — used for per-mm rod cost calculation */
  totalRodMm: number;
}

// ─── Cost Types ──────────────────────────────────────────────────

export interface CostBreakdown {
  material: number;
  cncTime: number;
  hardware: number;
  labor: number;
  shipping: number;
  margin: number;
  total: number;
  /** Extra cost included in material from using non-local wood species */
  crossRegionSurcharge: number;
  /** Whether the selected wood is local to the user's region */
  isLocalWood: boolean;
}

// ─── Validation Types ────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
}

// ─── Region / Material Types ─────────────────────────────────────

export interface Region {
  id: string;
  name: string;
  city: string;
  state: string;
  statesServiced: string[];
  woodSpecies: RegionWoodSpecies[];
}

export interface WoodSpecies {
  id: string;
  name: string;
  commonName?: string;
  description?: string;
  density: number;
  hardness: number;
  color: string;
  grainPattern?: "straight" | "wavy" | "interlocked" | "irregular";
}

export interface RegionWoodSpecies {
  speciesId: string;
  pricePerBoardFoot: number;
  availability: "high" | "medium" | "low";
}

// ─── Shipping Validation Types ───────────────────────────────────
// Groundwork for future shipping address verification against the
// order's configured region. Will be used during checkout to flag
// address / region mismatches.

export interface ShippingValidation {
  /** The region the furniture was configured in */
  configuredRegionId: string;
  /** The region derived from the shipping address */
  shippingRegionId: string | null;
  /** Whether the shipping address matches the configured region */
  isMatch: boolean;
  /** Distance in miles between configured and shipping regions */
  distanceMiles: number;
  /** Warning level for the user */
  severity: "ok" | "warning" | "error";
  /** Human-readable message */
  message: string;
}

// ─── Order Types ─────────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "fabricating"
  | "shipping"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  customerEmail: string;
  regionId: string;
  productSlug: ProductSlug;
  configuration: AnyProductParams;
  bom: BOMResult;
  cost: CostBreakdown;
  status: OrderStatus;
  factoryId: string | null;
  createdAt: Date;
}
