// ─── Product Types ───────────────────────────────────────────────

export type ProductCategory = "side-table" | "coffee-table" | "shelf" | "desk";

export type TopProfile = "square" | "rounded-square" | "circle" | "organic";
export type EdgeProfile = "square" | "chamfer" | "roundover" | "bevel";
export type LegStyle = "straight" | "tapered" | "splayed" | "hairpin-wrap";
export type FinishType =
  | "clear"
  | "matte"
  | "natural-oil"
  | "light-stain"
  | "dark-stain";

export interface SideTableParams {
  topWidth: number; // mm, 300-600
  topDepth: number; // mm, 300-600
  height: number; // mm, 350-650
  topThickness: number; // mm, 18-25

  topProfile: TopProfile;
  topEdge: EdgeProfile;
  legStyle: LegStyle;
  legCount: 3 | 4;

  woodSpecies: string;
  finish: FinishType;
  regionId: string;
}

// ─── Geometry Types ──────────────────────────────────────────────

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface GeometryPart {
  id: string;
  name: string;
  type: "top" | "leg" | "stretcher" | "subframe";
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
  | { kind: "extrude"; profile: Vec3[]; depth: number }
  | {
      kind: "rounded-box";
      width: number;
      height: number;
      depth: number;
      radius: number;
    };

export interface GeometryResult {
  parts: GeometryPart[];
  boundingBox: { min: Vec3; max: Vec3 };
}

// ─── BOM Types ───────────────────────────────────────────────────

export interface BOMItem {
  partId: string;
  name: string;
  material: string;
  quantity: number;
  dimensions: { length: number; width: number; thickness: number };
  boardFeet: number;
}

export interface BOMResult {
  items: BOMItem[];
  totalBoardFeet: number;
  hardwareItems: HardwareItem[];
}

export interface HardwareItem {
  name: string;
  quantity: number;
  unitCost: number;
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
  commonName: string;
  description: string;
  density: number; // kg/m3
  hardness: number; // janka
  color: string; // hex for 3D preview
  grainPattern: "straight" | "wavy" | "interlocked" | "irregular";
}

export interface RegionWoodSpecies {
  speciesId: string;
  pricePerBoardFoot: number;
  availability: "high" | "medium" | "low";
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
  productSlug: string;
  configuration: SideTableParams;
  bom: BOMResult;
  cost: CostBreakdown;
  status: OrderStatus;
  factoryId: string | null;
  createdAt: Date;
}
