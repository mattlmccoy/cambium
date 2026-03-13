import type { SideTableParams, ValidationResult } from "./types";
import { SIDE_TABLE_CONSTRAINTS } from "@cambium/shared";

export function validateParams(params: SideTableParams): ValidationResult {
  const errors: ValidationResult["errors"] = [];
  const warnings: ValidationResult["warnings"] = [];

  // Dimension range checks
  const { topWidth, topDepth, height, topThickness } = params;
  const c = SIDE_TABLE_CONSTRAINTS;

  if (topWidth < c.topWidth.min || topWidth > c.topWidth.max) {
    errors.push({
      field: "topWidth",
      message: `Top width must be between ${c.topWidth.min}mm and ${c.topWidth.max}mm`,
    });
  }

  if (topDepth < c.topDepth.min || topDepth > c.topDepth.max) {
    errors.push({
      field: "topDepth",
      message: `Top depth must be between ${c.topDepth.min}mm and ${c.topDepth.max}mm`,
    });
  }

  if (height < c.height.min || height > c.height.max) {
    errors.push({
      field: "height",
      message: `Height must be between ${c.height.min}mm and ${c.height.max}mm`,
    });
  }

  if (topThickness < c.topThickness.min || topThickness > c.topThickness.max) {
    errors.push({
      field: "topThickness",
      message: `Top thickness must be between ${c.topThickness.min}mm and ${c.topThickness.max}mm`,
    });
  }

  // Proportion checks
  const aspectRatio = topWidth / topDepth;
  if (aspectRatio > 2 || aspectRatio < 0.5) {
    warnings.push({
      field: "topWidth",
      message:
        "Extreme aspect ratio may look unusual. Consider keeping width and depth closer together.",
    });
  }

  // Stability check: legs should not be too short relative to top size
  const legHeight = height - topThickness;
  const maxTopDimension = Math.max(topWidth, topDepth);
  if (legHeight < maxTopDimension * 0.5) {
    warnings.push({
      field: "height",
      message: "Table may appear squat. Consider increasing the height.",
    });
  }

  // 3-leg only makes sense for circle/rounded tops
  if (params.legCount === 3 && params.topProfile === "square") {
    warnings.push({
      field: "legCount",
      message:
        "Three legs work best with circular or rounded tops for visual balance.",
    });
  }

  // Organic profile is complex for CNC
  if (params.topProfile === "organic") {
    warnings.push({
      field: "topProfile",
      message:
        "Organic profiles require additional CNC time and may increase cost.",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
