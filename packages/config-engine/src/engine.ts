import type {
  SideTableParams,
  GeometryResult,
  BOMResult,
  CostBreakdown,
  ValidationResult,
} from "./types";
import type { CostModelInputs } from "./types";
import { generateGeometry } from "./geometry";
import { generateBOM } from "./bom";
import { calculateCost, DEFAULT_COST_MODEL } from "./cost";
import { validateParams } from "./validation";

export interface ConfigResult {
  params: SideTableParams;
  validation: ValidationResult;
  geometry: GeometryResult;
  bom: BOMResult;
  cost: CostBreakdown;
}

/**
 * Main entry point: takes params and produces everything needed
 * for 3D preview, cost display, and order placement.
 */
export function computeConfiguration(
  params: SideTableParams,
  costModel: CostModelInputs = DEFAULT_COST_MODEL
): ConfigResult {
  const validation = validateParams(params);
  const geometry = generateGeometry(params);
  const bom = generateBOM(params);
  const cost = calculateCost(params, bom, costModel);

  return {
    params,
    validation,
    geometry,
    bom,
    cost,
  };
}
