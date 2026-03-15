import type { AnyProductParams, BOMResult, CostBreakdown } from "@cambium/shared";
import type { CostModelInputs } from "./types";
import {
  FINISHES,
  WOOD_SPECIES,
  getEffectiveWoodPrice,
  getRegionalCostFactors,
  getSpeciesById,
} from "@cambium/shared";

export function mmToBoardFeet(
  length: number,
  width: number,
  thickness: number
): number {
  const lengthIn = length / 25.4;
  const widthIn = width / 25.4;
  const thicknessIn = thickness / 25.4;
  return (lengthIn * widthIn * thicknessIn) / 144;
}

export function estimatePanelCncHours(params: AnyProductParams, bom: BOMResult): number {
  const panelCount = bom.items
    .filter((item) => item.category === "panel")
    .reduce((sum, item) => sum + item.quantity, 0);
  const footprint =
    "topWidth" in params
      ? params.topWidth * params.topDepth
      : "length" in params
      ? params.length * params.width
      : "seatWidth" in params
      ? params.seatWidth * params.seatDepth
      : params.shelfWidth * params.shelfDepth * params.shelfCount;
  return 0.15 + panelCount * 0.04 + footprint / 2_500_000;
}

export function calculateFinishCost(params: AnyProductParams, bom: BOMResult): number {
  const finish = FINISHES.find((item) => item.id === params.finish);
  if (!finish) {
    return 0;
  }

  const areaSqFt = bom.items
    .filter((item) => item.category === "panel" && item.dimensions)
    .reduce((sum, item) => {
      const dimensions = item.dimensions!;
      return (
        sum +
        ((dimensions.length * dimensions.width * item.quantity * 2) /
          (304.8 * 304.8))
      );
    }, 0);

  return areaSqFt * finish.costPerSqFt;
}

export function calculateCost(
  params: AnyProductParams,
  bom: BOMResult,
  costModel: CostModelInputs
): CostBreakdown {
  // ─── Regional pricing ─────────────────────────────────────────
  const regionId = costModel.regionId ?? params.regionId;
  const regionFactors = getRegionalCostFactors(regionId);

  // Wood pricing: use species-level regional pricing when available
  const species = getSpeciesById(params.woodSpecies);
  const speciesRegions = species
    ? (WOOD_SPECIES.find((s) => s.id === species.id)?.regions ?? [])
    : [];
  const woodPricing = getEffectiveWoodPrice(
    params.woodSpecies,
    speciesRegions as unknown as readonly string[],
    regionId
  );

  const effectivePricePerBf = woodPricing.pricePerBf;
  const material = bom.totalBoardFeet * effectivePricePerBf;
  const crossRegionSurcharge = bom.totalBoardFeet * woodPricing.surcharge;

  // Apply regional multipliers to labor/CNC rates
  const effectiveCncRate = costModel.cncRatePerHour * regionFactors.cncRateMultiplier;
  const effectiveLaborRate = costModel.laborRate * regionFactors.laborRateMultiplier;
  const effectiveShipping = regionFactors.shippingBase;

  const cncTime = estimatePanelCncHours(params, bom) * effectiveCncRate;
  const partsCost = bom.items.reduce(
    (sum, item) => sum + (item.unitCost ?? 0) * item.quantity,
    0
  );
  const finishCost = calculateFinishCost(params, bom);
  const labor = 0.35 * effectiveLaborRate;
  const shipping = effectiveShipping;

  // Overhead per unit, adjusted by region
  const overheadPerUnit = (4000 / 200) * regionFactors.overheadMultiplier;

  const subtotal = material + cncTime + partsCost + finishCost + labor + shipping + overheadPerUnit;

  // Gross margin pricing: price = cost / (1 - grossMargin)
  // e.g., 55% gross margin → price = cost / 0.45
  const grossMargin = costModel.grossMargin;
  const total = Math.ceil(subtotal / (1 - grossMargin));
  const margin = total - subtotal;

  return {
    material: Number(material.toFixed(2)),
    cncTime: Number(cncTime.toFixed(2)),
    hardware: Number((partsCost + finishCost).toFixed(2)),
    labor: Number(labor.toFixed(2)),
    shipping: Number(shipping.toFixed(2)),
    margin: Number(margin.toFixed(2)),
    total,
    crossRegionSurcharge: Number(crossRegionSurcharge.toFixed(2)),
    isLocalWood: woodPricing.isLocal,
  };
}

export const DEFAULT_COST_MODEL: CostModelInputs = {
  pricePerBoardFoot: 8.5,     // fallback only — regional pricing overrides this
  cncRatePerHour: 75,          // base rate, multiplied by regional factor
  laborRate: 35,               // base rate, multiplied by regional factor
  shippingBase: 25,            // fallback only — regional shipping overrides this
  grossMargin: 0.55,           // 55% gross margin (DTC furniture standard)
  productCosts: {
    "side-table": { rodCostPerMm: 0.012, jointCost: 0.45, packagingCost: 8 },
    table: { rodCostPerMm: 0.016, jointCost: 0.55, packagingCost: 14 },
    chair: { rodCostPerMm: 0.013, jointCost: 0.5, packagingCost: 9 },
    shelf: { rodCostPerMm: 0.011, jointCost: 0.4, packagingCost: 10 },
  },
  regionId: "minneapolis",     // baseline / geographic center of US
};
