import type {
  AnyProductParams,
  ValidationError,
  ValidationResult,
  ValidationWarning,
  WoodSpecies,
} from "@cambium/shared";
import { getSpeciesById } from "@cambium/shared";

export function createValidationResult(
  errors: ValidationError[],
  warnings: ValidationWarning[]
): ValidationResult {
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function checkRange(
  field: string,
  value: number,
  min: number,
  max: number,
  errors: ValidationError[],
  label: string,
  unit = "mm"
) {
  if (value < min || value > max) {
    errors.push({
      field,
      message: `${label} must be between ${min}${unit} and ${max}${unit}`,
    });
  }
}

export function structuralOverhangLimit(thicknessMm: number, hardness: number): number {
  return thicknessMm * Math.sqrt(hardness / 1000) * 2.5;
}

export function getWoodSpeciesForParams(params: AnyProductParams): WoodSpecies | undefined {
  return getSpeciesById(params.woodSpecies);
}

export function warn(
  warnings: ValidationWarning[],
  field: string,
  message: string
) {
  warnings.push({ field, message });
}
