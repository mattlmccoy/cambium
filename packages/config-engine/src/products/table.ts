import type { BOMResult, GeometryResult, TableParams, ValidationResult } from "@cambium/shared";
import { TABLE_CONSTRAINTS } from "@cambium/shared";
import { checkRange, createValidationResult, warn } from "../constraints";
import { boxPart, cylinderPart, lineItem, panelItem } from "./shared";

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

export function generateTableGeometry(params: TableParams): GeometryResult {
  const brace = params.length > 1200;
  const parts = [
    boxPart("top", "Top", "surface", "wood", { x: 0, y: params.height - params.topThickness / 2, z: 0 }, { x: params.length, y: params.topThickness, z: params.width }, { x: 0, y: 0, z: 0 }, params.topShape === "rectangle" ? 0 : 30),
  ];
  const legHeight = params.height - params.topThickness;
  const insetX = params.length / 2 - 65;
  const insetZ = params.width / 2 - 65;
  [
    { x: -insetX, z: -insetZ },
    { x: insetX, z: -insetZ },
    { x: -insetX, z: insetZ },
    { x: insetX, z: insetZ },
  ].forEach((position, index) => {
    parts.push(cylinderPart(`leg-${index}`, `Leg ${index + 1}`, "rod", "metal", { x: position.x, y: legHeight / 2, z: position.z }, legHeight, 5));
    parts.push(boxPart(`wrap-${index}`, `Leg Wrap ${index + 1}`, "panel", "wood", { x: position.x + 10, y: legHeight / 2, z: position.z }, { x: 42, y: legHeight, z: 12 }));
    parts.push(boxPart(`wrap-side-${index}`, `Leg Side Wrap ${index + 1}`, "panel", "wood", { x: position.x, y: legHeight / 2, z: position.z + 10 }, { x: 12, y: legHeight, z: 42 }));
  });
  const apronY = legHeight - 40;
  parts.push(
    cylinderPart("front-apron", "Front Apron", "rod", "metal", { x: 0, y: apronY, z: -params.width / 2 + 55 }, params.length - 110, 5, { x: 0, y: 0, z: Math.PI / 2 }),
    cylinderPart("back-apron", "Back Apron", "rod", "metal", { x: 0, y: apronY, z: params.width / 2 - 55 }, params.length - 110, 5, { x: 0, y: 0, z: Math.PI / 2 }),
    cylinderPart("left-apron", "Left Apron", "rod", "metal", { x: -params.length / 2 + 55, y: apronY, z: 0 }, params.width - 110, 5, { x: Math.PI / 2, y: 0, z: 0 }),
    cylinderPart("right-apron", "Right Apron", "rod", "metal", { x: params.length / 2 - 55, y: apronY, z: 0 }, params.width - 110, 5, { x: Math.PI / 2, y: 0, z: 0 })
  );
  if (brace) {
    parts.push(cylinderPart("cross-brace", "Cross Brace", "brace", "metal", { x: 0, y: apronY, z: 0 }, params.width - 120, 5, { x: Math.PI / 2, y: 0, z: 0 }));
  }
  if (params.apronVisibility === "visible") {
    parts.push(
      boxPart("front-cover", "Front Apron Cover", "panel", "wood", { x: 0, y: apronY, z: -params.width / 2 + 48 }, { x: params.length - 110, y: 36, z: 10 }),
      boxPart("back-cover", "Back Apron Cover", "panel", "wood", { x: 0, y: apronY, z: params.width / 2 - 48 }, { x: params.length - 110, y: 36, z: 10 })
    );
  }
  return {
    parts,
    boundingBox: {
      min: { x: -params.length / 2, y: 0, z: -params.width / 2 },
      max: { x: params.length / 2, y: params.height, z: params.width / 2 },
    },
  };
}

export function generateTableBOM(params: TableParams): BOMResult {
  const items = [
    panelItem("top", "Top Panel", params.woodSpecies, params.length > 1400 ? 2 : 1, params.length > 1400 ? params.length / 2 : params.length, params.width, params.topThickness),
    panelItem("leg-wraps-front", "Front Leg Wrap", params.woodSpecies, 4, params.height - params.topThickness, 42, 12),
    panelItem("leg-wraps-side", "Side Leg Wrap", params.woodSpecies, 4, params.height - params.topThickness, 42, 12),
  ];
  if (params.apronVisibility === "visible") {
    items.push(panelItem("apron-covers", "Apron Cover", params.woodSpecies, 2, params.length - 110, 36, 10));
  }
  const legHeight = params.height - params.topThickness;
  const legRodMm = legHeight * 4;
  const apronRodMm = 2 * (params.length - 110) + 2 * (params.width - 110);
  const braceRodMm = params.length > 1200 ? params.width - 120 : 0;
  const totalRodMm = legRodMm + apronRodMm + braceRodMm;

  items.push(
    lineItem("table-core-rods", "Steel Rod Set", "core", "powder-coated steel", params.length > 1200 ? 9 : 8),
    lineItem("table-core-joints", "Joint Set", "core", "injection-molded nylon", params.length > 1200 ? 6 : 4, 0.55),
    lineItem("table-fasteners", "Fastener Kit", "hardware", "steel", 24, 0.22),
    lineItem("table-packaging", "Flat-pack Kit", "packaging", "corrugated + kraft", 1, 14)
  );
  return {
    items,
    totalBoardFeet: items.reduce((sum, item) => sum + (item.boardFeet ?? 0), 0),
    totalRodMm,
  };
}
