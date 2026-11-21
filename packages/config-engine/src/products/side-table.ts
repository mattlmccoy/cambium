import type { BOMResult, GeometryResult, SideTableParams, ValidationResult } from "@cambium/shared";
import { SIDE_TABLE_CONSTRAINTS } from "@cambium/shared";
import { checkRange, createValidationResult, warn } from "../constraints";
import { panel, tableFrame, bounds, collectionBOM } from "./collection";

export function normalizeSideTableParams(params: SideTableParams): SideTableParams {
  return { ...params };
}

export function validateSideTable(params: SideTableParams): ValidationResult {
  const errors: ValidationResult["errors"] = [];
  const warnings: ValidationResult["warnings"] = [];
  const c = SIDE_TABLE_CONSTRAINTS;

  checkRange("topWidth", params.topWidth, c.topWidth.min, c.topWidth.max, errors, "Top width");
  checkRange("topDepth", params.topDepth, c.topDepth.min, c.topDepth.max, errors, "Top depth");
  checkRange("height", params.height, c.height.min, c.height.max, errors, "Height");
  checkRange("topThickness", params.topThickness, c.topThickness.min, c.topThickness.max, errors, "Top thickness");

  if (params.legCount === 3 && params.topProfile === "square") {
    warn(warnings, "legCount", "Three legs work best with circular or rounded tops.");
  }

  if (params.topProfile === 'circle' && params.topWidth !== params.topDepth) warn(warnings, 'topDepth', 'Circular tops use the smaller dimension as their diameter.');
  return createValidationResult(errors, warnings);
}

export function generateSideTableGeometry(p: SideTableParams): GeometryResult {
  const circle=p.topProfile==='circle';
  const width=circle?Math.min(p.topWidth,p.topDepth):p.topWidth;
  const depth=circle?width:p.topDepth;
  const parts=tableFrame(width,depth,p.height,p.topThickness,p.legWrapStyle,p.legCount===3,circle,p.apronCovers);
  parts.push(panel('top',width,p.topThickness,depth,{x:0,y:p.height-p.topThickness/2,z:0},p.topEdge,36,undefined,circle));
  return bounds(parts);
}
export function generateSideTableBOM(p: SideTableParams): BOMResult {
  return collectionBOM(generateSideTableGeometry(p),p.woodSpecies,p.legCount*4+8,8);
}
