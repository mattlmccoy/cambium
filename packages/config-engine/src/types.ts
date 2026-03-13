import type {
  SideTableParams,
  GeometryResult,
  BOMResult,
  CostBreakdown,
  ValidationResult,
} from "@cambium/shared";

export type { SideTableParams, GeometryResult, BOMResult, CostBreakdown, ValidationResult };

export interface CostModelInputs {
  pricePerBoardFoot: number;
  cncRatePerHour: number;
  laborRate: number;
  shippingBase: number;
  marginPercent: number;
}
