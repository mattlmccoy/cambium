// ─── Carbon Footprint Estimation ─────────────────────────────────
// Compares the CO2 footprint of locally-manufactured Cambium furniture
// vs typical overseas-manufactured furniture (China → US port → inland).

export interface CarbonEstimate {
  /** CO2 in kg for local Cambium production + transport */
  localCO2Kg: number;
  /** CO2 in kg for typical overseas import */
  importedCO2Kg: number;
  /** Absolute savings in kg */
  savingsKg: number;
  /** Percentage savings (0-100) */
  savingsPercent: number;
  /** Local transport distance in km */
  localTransportKm: number;
  /** Imported transport distance in km (ocean + inland) */
  importedTransportKm: number;
}

// ─── Transport emission factors ──────────────────────────────────
// Source: EPA SmartWay, IMO studies

/** grams CO2 per ton-km by truck */
const TRUCK_G_CO2_PER_TON_KM = 80;

/** grams CO2 per ton-km by container ship */
const OCEAN_G_CO2_PER_TON_KM = 15;

// ─── Overseas supply chain assumptions ───────────────────────────

/** Ocean distance: China coast → US West Coast (km) */
const OVERSEAS_OCEAN_KM = 16_000;

/** Average US inland trucking from port to customer (km) */
const OVERSEAS_INLAND_KM = 1_600;

/**
 * Extra manufacturing CO2 delta (kg) for overseas vs US production.
 * Accounts for China's coal-heavy grid vs US grid mix for
 * CNC, kiln-drying, and factory operations on a per-piece basis.
 */
const MANUFACTURING_DELTA_KG = 2.5;

// ─── Conversion helpers ─────────────────────────────────────────

/**
 * Convert board feet to weight in kg.
 * 1 board foot = 0.00236 m³
 */
export function boardFeetToKg(boardFeet: number, densityKgPerM3: number): number {
  return boardFeet * 0.00236 * densityKgPerM3;
}

// ─── Main estimation ─────────────────────────────────────────────

/**
 * Estimate the carbon footprint comparison between local Cambium
 * production and typical overseas furniture manufacturing.
 *
 * @param totalBoardFeet - Total board feet of wood in the piece
 * @param speciesDensity - Wood density in kg/m³
 * @param localDistanceKm - Distance from local mill to customer (km)
 */
export function estimateCarbonFootprint(
  totalBoardFeet: number,
  speciesDensity: number,
  localDistanceKm: number
): CarbonEstimate {
  const weightKg = boardFeetToKg(totalBoardFeet, speciesDensity);
  const weightTons = weightKg / 1000;

  // Local: just truck from regional mill → microfactory → customer
  const localTransportCO2 =
    (weightTons * localDistanceKm * TRUCK_G_CO2_PER_TON_KM) / 1000; // convert g → kg

  const localCO2Kg = Math.round(localTransportCO2 * 100) / 100;

  // Imported: ocean shipping + inland trucking + manufacturing delta
  const oceanCO2 =
    (weightTons * OVERSEAS_OCEAN_KM * OCEAN_G_CO2_PER_TON_KM) / 1000;
  const inlandCO2 =
    (weightTons * OVERSEAS_INLAND_KM * TRUCK_G_CO2_PER_TON_KM) / 1000;

  const importedCO2Kg =
    Math.round((oceanCO2 + inlandCO2 + MANUFACTURING_DELTA_KG) * 100) / 100;

  const savingsKg = Math.round((importedCO2Kg - localCO2Kg) * 100) / 100;
  const savingsPercent =
    importedCO2Kg > 0
      ? Math.round((savingsKg / importedCO2Kg) * 100)
      : 0;

  return {
    localCO2Kg,
    importedCO2Kg,
    savingsKg,
    savingsPercent,
    localTransportKm: Math.round(localDistanceKm),
    importedTransportKm: OVERSEAS_OCEAN_KM + OVERSEAS_INLAND_KM,
  };
}
