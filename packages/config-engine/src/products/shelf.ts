import type { BOMResult, GeometryResult, ShelfParams, ValidationResult } from "@cambium/shared";
import { SHELF_CONSTRAINTS } from "@cambium/shared";
import { checkRange, createValidationResult, warn } from "../constraints";
import { boxPart, cylinderPart, lineItem, panelItem } from "./shared";

export function normalizeShelfParams(params: ShelfParams): ShelfParams {
  const shelfThickness = params.shelfDepth > 300 ? Math.max(20, params.shelfThickness) : params.shelfThickness;
  return { ...params, shelfThickness };
}

export function validateShelf(params: ShelfParams): ValidationResult {
  const errors: ValidationResult["errors"] = [];
  const warnings: ValidationResult["warnings"] = [];
  checkRange("shelfWidth", params.shelfWidth, SHELF_CONSTRAINTS.shelfWidth.min, SHELF_CONSTRAINTS.shelfWidth.max, errors, "Shelf width");
  checkRange("shelfDepth", params.shelfDepth, SHELF_CONSTRAINTS.shelfDepth.min, SHELF_CONSTRAINTS.shelfDepth.max, errors, "Shelf depth");
  checkRange("shelfThickness", params.shelfThickness, SHELF_CONSTRAINTS.shelfThickness.min, SHELF_CONSTRAINTS.shelfThickness.max, errors, "Shelf thickness");
  checkRange("shelfCount", params.shelfCount, SHELF_CONSTRAINTS.shelfCount.min, SHELF_CONSTRAINTS.shelfCount.max, errors, "Shelf count", "");
  checkRange("unitHeight", params.unitHeight, SHELF_CONSTRAINTS.unitHeight.min, SHELF_CONSTRAINTS.unitHeight.max, errors, "Unit height");
  checkRange("shelfSpacing", params.shelfSpacing, SHELF_CONSTRAINTS.shelfSpacing.min, SHELF_CONSTRAINTS.shelfSpacing.max, errors, "Shelf spacing");
  if (params.shelfDepth > 300 && params.shelfThickness < 20) {
    warn(warnings, "shelfThickness", "Deep shelves use a 20mm minimum shelf thickness.");
  }
  if (params.mountType === "free-standing" && params.unitHeight > 1500) {
    warn(warnings, "unitHeight", "Tall free-standing shelves include a rear stabilizer brace.");
  }
  return createValidationResult(errors, warnings);
}

export function generateShelfGeometry(params: ShelfParams): GeometryResult {
  const parts = [];
  const shelfLevels = Array.from({ length: params.shelfCount }, (_, index) => index);
  if (params.mountType === "free-standing") {
    const sideX = params.shelfWidth / 2 - 22;
    parts.push(
      cylinderPart("side-left", "Left Side Frame", "rod", "metal", { x: -sideX, y: params.unitHeight / 2, z: 0 }, params.unitHeight, 4),
      cylinderPart("side-right", "Right Side Frame", "rod", "metal", { x: sideX, y: params.unitHeight / 2, z: 0 }, params.unitHeight, 4),
      cylinderPart("top-bar", "Top Bar", "rod", "metal", { x: 0, y: params.unitHeight - 20, z: 0 }, params.shelfWidth - 44, 4, { x: 0, y: 0, z: Math.PI / 2 })
    );
    if (params.unitHeight > 1500) {
      parts.push(cylinderPart("rear-stabilizer", "Rear Stabilizer", "brace", "metal", { x: 0, y: params.unitHeight / 2, z: -params.shelfDepth / 2 + 12 }, params.unitHeight - 80, 4));
    }
    if (params.backPanel) {
      parts.push(boxPart("back-panel", "Back Panel", "panel", "wood", { x: 0, y: params.unitHeight / 2, z: -params.shelfDepth / 2 + 8 }, { x: params.shelfWidth - 80, y: params.unitHeight - 120, z: 10 }));
    }
  }

  shelfLevels.forEach((level) => {
    const y = params.mountType === "free-standing"
      ? 80 + level * params.shelfSpacing
      : params.shelfThickness / 2 + level * params.shelfSpacing;
    parts.push(
      boxPart(`shelf-${level}`, `Shelf ${level + 1}`, "panel", "wood", { x: 0, y, z: 0 }, { x: params.shelfWidth, y: params.shelfThickness, z: params.shelfDepth })
    );
    parts.push(
      boxPart(`shelf-edge-${level}`, `Shelf Edge ${level + 1}`, "panel", "wood", { x: 0, y, z: params.shelfDepth / 2 + 6 }, { x: params.shelfWidth, y: 24, z: 8 })
    );
    if (params.mountType === "wall-mount") {
      parts.push(
        cylinderPart(`wall-bracket-left-${level}`, "Wall Bracket Left", "rod", "metal", { x: -params.shelfWidth / 2 + 80, y: y - 8, z: -params.shelfDepth / 2 + 12 }, params.shelfDepth - 24, 4, { x: Math.PI / 2, y: 0, z: 0 }),
        cylinderPart(`wall-bracket-right-${level}`, "Wall Bracket Right", "rod", "metal", { x: params.shelfWidth / 2 - 80, y: y - 8, z: -params.shelfDepth / 2 + 12 }, params.shelfDepth - 24, 4, { x: Math.PI / 2, y: 0, z: 0 })
      );
    }
  });

  return {
    parts,
    boundingBox: {
      min: { x: -params.shelfWidth / 2, y: 0, z: -params.shelfDepth / 2 },
      max: { x: params.shelfWidth / 2, y: params.mountType === "free-standing" ? params.unitHeight : params.shelfCount * params.shelfSpacing, z: params.shelfDepth / 2 },
    },
  };
}

export function generateShelfBOM(params: ShelfParams): BOMResult {
  const items = [
    panelItem("shelves", "Shelf Panel", params.woodSpecies, params.shelfCount, params.shelfWidth, params.shelfDepth, params.shelfThickness),
    panelItem("shelf-edges", "Shelf Edge Strip", params.woodSpecies, params.shelfCount, params.shelfWidth, 24, 8),
  ];
  let totalRodMm = 0;
  if (params.mountType === "free-standing") {
    const sideRodMm = params.unitHeight * 2;
    const topBarMm = params.shelfWidth - 44;
    const stabilizerMm = params.unitHeight > 1500 ? params.unitHeight - 80 : 0;
    totalRodMm = sideRodMm + topBarMm + stabilizerMm;

    items.push(lineItem("shelf-core", "Shelf Frame Rods", "core", "powder-coated steel", params.unitHeight > 1500 ? 7 : 6));
    if (params.backPanel) {
      items.push(panelItem("back-panel", "Back Panel", params.woodSpecies, 1, params.shelfWidth - 80, params.unitHeight - 120, 10));
    }
  } else {
    const bracketMm = (params.shelfDepth - 24) * params.shelfCount * 2;
    totalRodMm = bracketMm;

    items.push(lineItem("wall-brackets", "Wall Brackets", "core", "powder-coated steel", params.shelfCount * 2));
    items.push(lineItem("wall-anchors", "Wall Anchor Kit", "hardware", "steel", params.shelfCount * 4, 0.25));
  }
  items.push(
    lineItem("shelf-joints", "Joint Set", "core", "injection-molded nylon", params.mountType === "free-standing" ? 6 : params.shelfCount * 2, 0.4),
    lineItem("shelf-packaging", "Flat-pack Kit", "packaging", "corrugated + kraft", 1, params.mountType === "free-standing" ? 12 : 6)
  );
  return {
    items,
    totalBoardFeet: items.reduce((sum, item) => sum + (item.boardFeet ?? 0), 0),
    totalRodMm,
  };
}
