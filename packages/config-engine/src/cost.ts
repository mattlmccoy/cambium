import type { SideTableParams, BOMResult, CostBreakdown } from "./types";
import type { CostModelInputs } from "./types";
import { FINISHES } from "@cambium/shared";

// Estimate CNC time in hours based on part complexity
function estimateCncHours(params: SideTableParams): number {
  let hours = 0;

  // Base time: setup + material loading
  hours += 0.15;

  // Top panel cutting
  const topPerimeter =
    params.topProfile === "circle"
      ? Math.PI * Math.min(params.topWidth, params.topDepth)
      : 2 * (params.topWidth + params.topDepth);

  // Cut time based on perimeter length and feed rate
  hours += topPerimeter / (3000 * 60); // 3000mm/min feed rate

  // Edge profiling (adds time for non-square edges)
  if (params.topEdge !== "square") {
    hours += 0.1;
  }

  // Organic profiles are more complex
  if (params.topProfile === "organic") {
    hours += 0.15;
  }

  // Leg cutting (if wood legs, not hairpin)
  if (params.legStyle !== "hairpin-wrap") {
    hours += 0.05 * params.legCount;
    if (params.legStyle === "tapered" || params.legStyle === "splayed") {
      hours += 0.03 * params.legCount;
    }
  }

  return hours;
}

// Calculate finish cost based on surface area
function calculateFinishCost(params: SideTableParams): number {
  const finish = FINISHES.find((f) => f.id === params.finish);
  if (!finish) return 0;

  // Approximate surface area in sq ft
  const topAreaSqFt =
    (params.topWidth * params.topDepth) / (304.8 * 304.8) * 2; // top + bottom
  const edgeAreaSqFt =
    (2 * (params.topWidth + params.topDepth) * params.topThickness) /
    (304.8 * 304.8);

  return (topAreaSqFt + edgeAreaSqFt) * finish.costPerSqFt;
}

export function calculateCost(
  params: SideTableParams,
  bom: BOMResult,
  costModel: CostModelInputs
): CostBreakdown {
  // Material cost
  const material = bom.totalBoardFeet * costModel.pricePerBoardFoot;

  // CNC time cost
  const cncHours = estimateCncHours(params);
  const cncTime = cncHours * costModel.cncRatePerHour;

  // Hardware cost
  const hardware = bom.hardwareItems.reduce(
    (sum, item) => sum + item.quantity * item.unitCost,
    0
  );

  // Finish cost
  const finishCost = calculateFinishCost(params);

  // Labor (assembly check, QA, packing)
  const labor = 0.25 * costModel.laborRate; // ~15 min per unit

  // Shipping
  const shipping = costModel.shippingBase;

  // Subtotal before margin
  const subtotal = material + cncTime + hardware + finishCost + labor + shipping;

  // Apply margin
  const margin = subtotal * (costModel.marginPercent / 100);
  const total = Math.ceil(subtotal + margin);

  return {
    material: Math.round(material * 100) / 100,
    cncTime: Math.round(cncTime * 100) / 100,
    hardware: Math.round(hardware * 100) / 100,
    labor: Math.round(labor * 100) / 100,
    shipping: Math.round(shipping * 100) / 100,
    margin: Math.round(margin * 100) / 100,
    total,
  };
}

// Default cost model for initial estimates (before DB is connected)
export const DEFAULT_COST_MODEL: CostModelInputs = {
  pricePerBoardFoot: 8.5, // Mid-range domestic hardwood
  cncRatePerHour: 75,
  laborRate: 35,
  shippingBase: 25,
  marginPercent: 40,
};
