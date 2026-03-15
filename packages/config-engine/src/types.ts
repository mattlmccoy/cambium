import type {
  AnyProductParams,
  BOMResult,
  CostBreakdown,
  GeometryResult,
  ProductSlug,
  ValidationResult,
} from "@cambium/shared";

export type {
  AnyProductParams,
  BOMResult,
  CostBreakdown,
  GeometryResult,
  ProductSlug,
  ValidationResult,
} from "@cambium/shared";

export interface ProductCostModel {
  rodCostPerMm: number;
  jointCost: number;
  packagingCost: number;
}

export interface CostModelInputs {
  /** Base price per board foot — used as fallback when no regional data available */
  pricePerBoardFoot: number;
  cncRatePerHour: number;
  laborRate: number;
  shippingBase: number;
  /** Target gross margin as decimal (0.55 = 55%). Price = cost / (1 - grossMargin) */
  grossMargin: number;
  productCosts: Record<ProductSlug, ProductCostModel>;
  /** Optional region ID for regional pricing adjustments */
  regionId?: string;
}

export interface ProductDefinitionRuntime<TParams extends AnyProductParams = AnyProductParams> {
  slug: ProductSlug;
  normalizeParams: (params: TParams) => TParams;
  validate: (params: TParams) => ValidationResult;
  generateGeometry: (params: TParams) => GeometryResult;
  generateBOM: (params: TParams) => BOMResult;
}

export interface ConfigResult<TParams extends AnyProductParams = AnyProductParams> {
  productSlug: ProductSlug;
  params: TParams;
  validation: ValidationResult;
  geometry: GeometryResult;
  bom: BOMResult;
  cost: CostBreakdown;
}
