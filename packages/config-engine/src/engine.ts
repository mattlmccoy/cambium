import type { AnyProductParams, ProductSlug, SideTableParams } from "@cambium/shared";
import type { ConfigResult, CostModelInputs } from "./types";
import { calculateCost, DEFAULT_COST_MODEL } from "./shared-cost";
import { productRegistry } from "./registry";

export function computeConfiguration<TParams extends AnyProductParams>(
  slug: ProductSlug,
  params: TParams,
  costModel: CostModelInputs = DEFAULT_COST_MODEL
): ConfigResult<TParams> {
  const runtime = productRegistry[slug];
  const normalized = runtime.normalizeParams(params) as TParams;
  const validation = runtime.validate(normalized);
  const geometry = runtime.generateGeometry(normalized);
  const bom = runtime.generateBOM(normalized);
  const cost = calculateCost(normalized, bom, costModel, slug);

  return {
    productSlug: slug,
    params: normalized,
    validation,
    geometry,
    bom,
    cost,
  };
}

export function computeSideTableConfiguration(
  params: SideTableParams,
  costModel: CostModelInputs = DEFAULT_COST_MODEL
): ConfigResult<SideTableParams> {
  return computeConfiguration("side-table", params, costModel);
}
