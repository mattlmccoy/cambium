import type { ProductSlug } from "@cambium/shared";

export interface CoreCostProfile {
  unitCost: number;
  shipping: number;
}

// Default assumptions for the Cambium cost model.
// These mirror the ASSUMPTIONS sheet in the Excel workbook
// but are now interactive on the admin backend.

export interface CostAssumptions {
  // General
  currency: string;
  targetDtcMargin: number;       // 0-1
  targetRetailerMargin: number;  // 0-1
  batchSize: number;

  // Subframe (Backbone)
  subframeUnitCost: number;
  subframeShipping: number;
  coreCosts: Record<ProductSlug, CoreCostProfile>;

  // Wood Materials
  boardFeetPerUnit: number;
  localBfPrice: number;
  crossRegionBfPrice: number;
  wasteKerf: number;             // 1.xx multiplier

  // Hardware & Consumables
  hardwareCost: number;
  rubberPads: number;
  packaging: number;
  finishConsumables: number;

  // Microfactory Time & Rates
  cncRate: number;
  laborRate: number;
  cncTimePerUnit: number;        // hours
  setupTimePerBatch: number;     // hours
  sandingTime: number;           // hours
  assemblyTime: number;          // hours
  cncOversight: number;          // 0-1

  // Overhead
  monthlyOverhead: number;
  monthlyThroughput: number;

  // Shipping
  dtcShipping: number;

  // China Path
  chinaExWorks: number;
  chinaMoq: number;
  chinaTooling: number;
  chinaDefectRate: number;
  chinaFreightPerCbm: number;
  chinaUnitsPerCbm: number;
  chinaTariffRate: number;
  chinaBrokerage: number;
  chinaDomFreight: number;
  chinaHoldingRate: number;
  chinaMonthsHeld: number;
  chinaFxBuffer: number;
}

export const DEFAULT_ASSUMPTIONS: CostAssumptions = {
  currency: "USD",
  targetDtcMargin: 0.65,
  targetRetailerMargin: 0.50,
  batchSize: 25,

  subframeUnitCost: 12.00,
  subframeShipping: 3.50,
  coreCosts: {
    "side-table": { unitCost: 12.0, shipping: 3.5 },
    table: { unitCost: 24.0, shipping: 6.0 },
    chair: { unitCost: 16.5, shipping: 4.25 },
    shelf: { unitCost: 14.0, shipping: 3.75 },
  },

  boardFeetPerUnit: 1.8,
  localBfPrice: 8.50,
  crossRegionBfPrice: 12.00,
  wasteKerf: 1.15,

  hardwareCost: 7.80,
  rubberPads: 2.00,
  packaging: 8.00,
  finishConsumables: 3.50,

  cncRate: 75.0,
  laborRate: 35.0,
  cncTimePerUnit: 0.45,
  setupTimePerBatch: 1.0,
  sandingTime: 0.35,
  assemblyTime: 0.25,
  cncOversight: 0.2,

  monthlyOverhead: 4000,
  monthlyThroughput: 200,

  dtcShipping: 25.0,

  chinaExWorks: 85.0,
  chinaMoq: 200,
  chinaTooling: 3000,
  chinaDefectRate: 0.03,
  chinaFreightPerCbm: 180,
  chinaUnitsPerCbm: 30,
  chinaTariffRate: 0.032,
  chinaBrokerage: 1200,
  chinaDomFreight: 1.5,
  chinaHoldingRate: 0.02,
  chinaMonthsHeld: 3,
  chinaFxBuffer: 0.02,
};

// ─── Derived calculations (mirrors MICROFACTORY_CALC sheet) ─────

export interface MicrofactoryCalc {
  subframeLanded: number;
  bfNeeded: number;
  woodCostLocal: number;
  woodCostCross: number;
  hardwareTotal: number;
  finishTotal: number;
  packagingTotal: number;
  setupPerUnit: number;
  cncCost: number;
  operatorCncCost: number;
  sandingLabor: number;
  assemblyLabor: number;
  overheadPerUnit: number;
  cogsLocal: number;
  cogsCross: number;
  varCostLocal: number;
  varCostCross: number;
}

export function calcMicrofactory(a: CostAssumptions): MicrofactoryCalc {
  const subframeLanded = a.subframeUnitCost + a.subframeShipping;
  const bfNeeded = a.boardFeetPerUnit * a.wasteKerf;
  const woodCostLocal = bfNeeded * a.localBfPrice;
  const woodCostCross = bfNeeded * a.crossRegionBfPrice;
  const hardwareTotal = a.hardwareCost + a.rubberPads;
  const finishTotal = a.finishConsumables;
  const packagingTotal = a.packaging;
  const setupPerUnit = a.setupTimePerBatch / a.batchSize;
  const cncCost = (a.cncTimePerUnit + setupPerUnit) * a.cncRate;
  const operatorCncCost = (a.cncTimePerUnit + setupPerUnit) * a.cncOversight * a.laborRate;
  const sandingLabor = a.sandingTime * a.laborRate;
  const assemblyLabor = a.assemblyTime * a.laborRate;
  const overheadPerUnit = a.monthlyOverhead / a.monthlyThroughput;

  const cogsLocal = subframeLanded + woodCostLocal + hardwareTotal + finishTotal + packagingTotal + cncCost + operatorCncCost + sandingLabor + assemblyLabor + overheadPerUnit;
  const cogsCross = subframeLanded + woodCostCross + hardwareTotal + finishTotal + packagingTotal + cncCost + operatorCncCost + sandingLabor + assemblyLabor + overheadPerUnit;
  const varCostLocal = cogsLocal + a.dtcShipping;
  const varCostCross = cogsCross + a.dtcShipping;

  return {
    subframeLanded, bfNeeded, woodCostLocal, woodCostCross,
    hardwareTotal, finishTotal, packagingTotal,
    setupPerUnit, cncCost, operatorCncCost, sandingLabor, assemblyLabor,
    overheadPerUnit, cogsLocal, cogsCross, varCostLocal, varCostCross,
  };
}

// ─── China path calculations ────────────────────────────────────

export interface ChinaCalc {
  exWorksFx: number;
  freightPerUnit: number;
  dutyPerUnit: number;
  brokeragePerUnit: number;
  domFreight: number;
  holdingPerUnit: number;
  defectUplift: number;
  toolingPerMoq: number;
  toolingPer1k: number;
  subtotal: number;
  landedCost: number;
}

export function calcChina(a: CostAssumptions): ChinaCalc {
  const exWorksFx = a.chinaExWorks * (1 + a.chinaFxBuffer);
  const freightPerUnit = a.chinaFreightPerCbm / a.chinaUnitsPerCbm;
  const dutyPerUnit = exWorksFx * a.chinaTariffRate;
  const brokeragePerUnit = a.chinaBrokerage / a.chinaMoq;
  const domFreight = a.chinaDomFreight;
  const holdingPerUnit = exWorksFx * a.chinaHoldingRate * a.chinaMonthsHeld;
  const defectUplift = 1 / (1 - a.chinaDefectRate);
  const toolingPerMoq = a.chinaTooling / a.chinaMoq;
  const toolingPer1k = a.chinaTooling / 1000;
  const subtotal = exWorksFx + freightPerUnit + dutyPerUnit + brokeragePerUnit + domFreight + holdingPerUnit + toolingPerMoq;
  const landedCost = subtotal * defectUplift;

  return {
    exWorksFx, freightPerUnit, dutyPerUnit, brokeragePerUnit,
    domFreight, holdingPerUnit, defectUplift, toolingPerMoq,
    toolingPer1k, subtotal, landedCost,
  };
}

// ─── Unit Economics ─────────────────────────────────────────────

export interface UnitEconomics {
  microLocalMinDtc: number;
  microCrossMinDtc: number;
  chinaMinDtc: number;
  wholesaleRetailSuggested: number;
}

export function calcUnitEconomics(a: CostAssumptions, m: MicrofactoryCalc, c: ChinaCalc): UnitEconomics {
  const microLocalMinDtc = m.varCostLocal / (1 - a.targetDtcMargin);
  const microCrossMinDtc = m.varCostCross / (1 - a.targetDtcMargin);
  const chinaMinDtc = (c.landedCost + a.dtcShipping) / (1 - a.targetDtcMargin);
  const wholesaleRetailSuggested = microLocalMinDtc / (1 - a.targetRetailerMargin);

  return { microLocalMinDtc, microCrossMinDtc, chinaMinDtc, wholesaleRetailSuggested };
}
