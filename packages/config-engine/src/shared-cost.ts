import type { AnyProductParams, BOMResult, CostBreakdown, ProductSlug } from "@cambium/shared";
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
  costModel: CostModelInputs,
  slug?: ProductSlug
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

  // Parts cost: non-rod items use unitCost; rod cost comes from totalRodMm × per-mm rate
  const nonRodPartsCost = bom.items.reduce(
    (sum, item) => sum + (item.unitCost ?? 0) * item.quantity,
    0
  );
  const productCost = slug ? costModel.productCosts[slug] : undefined;
  const rodCost = bom.totalRodMm * (productCost?.rodCostPerMm ?? 0.006);
  const partsCost = nonRodPartsCost + rodCost;

  const finishCost = calculateFinishCost(params, bom);
  const labor = 0.35 * effectiveLaborRate;
  const shipping = effectiveShipping;

  // Overhead per unit, adjusted by region
  const overheadBase = costModel.overheadPerMonth / costModel.unitsPerMonth;
  const overheadPerUnit = overheadBase * regionFactors.overheadMultiplier;

  const subtotal = material + cncTime + partsCost + finishCost + labor + shipping + overheadPerUnit;

  // Per-product margin, falling back to global grossMargin
  const grossMargin = (slug && costModel.productMargins?.[slug]) ?? costModel.grossMargin;
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
  cncRatePerHour: 35,          // own-CNC microfactory rate (was 75)
  laborRate: 30,               // base rate, multiplied by regional factor (was 35)
  shippingBase: 18,            // fallback only — regional shipping overrides this (was 25)
  grossMargin: 0.45,           // 45% fallback margin (was 55%)
  overheadPerMonth: 4000,      // monthly fixed costs (rent, utilities, insurance)
  unitsPerMonth: 500,          // target production volume (was implicit 200)
  productCosts: {
    "side-table": { rodCostPerMm: 0.006, jointCost: 0.35, packagingCost: 6 },
    table: { rodCostPerMm: 0.008, jointCost: 0.45, packagingCost: 12 },
    chair: { rodCostPerMm: 0.006, jointCost: 0.40, packagingCost: 7 },
    shelf: { rodCostPerMm: 0.005, jointCost: 0.30, packagingCost: 8 },
  },
  productMargins: {
    "side-table": 0.40,
    table: 0.50,
    chair: 0.45,
    shelf: 0.40,
  },
  regionId: "minneapolis",     // baseline / geographic center of US
};
