import type { BOMResult, GeometryResult, TableParams, ValidationResult } from "@cambium/shared";
import { TABLE_CONSTRAINTS } from "@cambium/shared";
import { checkRange, createValidationResult, warn } from "../constraints";
import { panel, tableFrame, bounds, collectionBOM } from "./collection";

export function normalizeTableParams(params: TableParams): TableParams {
  const hc =
    params.tableMode === "coffee"
      ? TABLE_CONSTRAINTS.coffeeHeight
      : TABLE_CONSTRAINTS.diningHeight;

  // If height is outside the mode's range (e.g. after mode switch), reset to default
  const height =
    params.height < hc.min || params.height > hc.max ? hc.default : params.height;

  const topThickness =
    params.length > 1200 ? Math.max(25, params.topThickness) : params.topThickness;

  return { ...params, height, topThickness };
}

export function validateTable(params: TableParams): ValidationResult {
  const errors: ValidationResult["errors"] = [];
  const warnings: ValidationResult["warnings"] = [];
  checkRange("length", params.length, TABLE_CONSTRAINTS.length.min, TABLE_CONSTRAINTS.length.max, errors, "Length");
  checkRange("width", params.width, TABLE_CONSTRAINTS.width.min, TABLE_CONSTRAINTS.width.max, errors, "Width");
  checkRange(
    "height",
    params.height,
    params.tableMode === "coffee" ? TABLE_CONSTRAINTS.coffeeHeight.min : TABLE_CONSTRAINTS.diningHeight.min,
    params.tableMode === "coffee" ? TABLE_CONSTRAINTS.coffeeHeight.max : TABLE_CONSTRAINTS.diningHeight.max,
    errors,
    "Height"
  );
  checkRange("topThickness", params.topThickness, TABLE_CONSTRAINTS.topThickness.min, TABLE_CONSTRAINTS.topThickness.max, errors, "Top thickness");

  if (params.length > 1200 && params.topThickness < 25) {
    warn(warnings, "topThickness", "Long tables use a 25mm minimum top thickness and include a center brace.");
  }

  return createValidationResult(errors, warnings);
}

export function generateTableGeometry(p: TableParams): GeometryResult {
  const parts=tableFrame(p.length,p.width,p.height,p.topThickness,'full',false,p.topShape==='racetrack',p.apronVisibility==='visible');
  const radius=p.topShape==='rectangle'?3:p.topShape==='racetrack'?Math.min(p.length,p.width)/2:65;
  parts.push(panel('top',p.length,p.topThickness,p.width,{x:0,y:p.height-p.topThickness/2,z:0},p.edgeProfile,radius));
  return bounds(parts);
}
export function generateTableBOM(p: TableParams): BOMResult {
  return collectionBOM(generateTableGeometry(p),p.woodSpecies,28,14);
}
