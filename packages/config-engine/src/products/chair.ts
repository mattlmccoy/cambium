import type { BOMResult, ChairParams, GeometryResult, ValidationResult } from "@cambium/shared";
import { CHAIR_CONSTRAINTS } from "@cambium/shared";
import { checkRange, createValidationResult, warn } from "../constraints";
import { boxPart, cylinderPart, lineItem, panelItem } from "./shared";

export function normalizeChairParams(params: ChairParams): ChairParams {
  return { ...params };
}

export function validateChair(params: ChairParams): ValidationResult {
  const errors: ValidationResult["errors"] = [];
  const warnings: ValidationResult["warnings"] = [];
  checkRange("seatWidth", params.seatWidth, CHAIR_CONSTRAINTS.seatWidth.min, CHAIR_CONSTRAINTS.seatWidth.max, errors, "Seat width");
  checkRange("seatDepth", params.seatDepth, CHAIR_CONSTRAINTS.seatDepth.min, CHAIR_CONSTRAINTS.seatDepth.max, errors, "Seat depth");
  checkRange("seatHeight", params.seatHeight, CHAIR_CONSTRAINTS.seatHeight.min, CHAIR_CONSTRAINTS.seatHeight.max, errors, "Seat height");
  checkRange("backHeight", params.backHeight, CHAIR_CONSTRAINTS.backHeight.min, CHAIR_CONSTRAINTS.backHeight.max, errors, "Back height");
  checkRange("seatThickness", params.seatThickness, CHAIR_CONSTRAINTS.seatThickness.min, CHAIR_CONSTRAINTS.seatThickness.max, errors, "Seat thickness");
  if (params.seatHeight + params.backHeight > 980) {
    warn(warnings, "backHeight", "Combined seat and back height is outside the preferred chair envelope.");
  }
  return createValidationResult(errors, warnings);
}

export function generateChairGeometry(params: ChairParams): GeometryResult {
  const legHeight = params.seatHeight - params.seatThickness;
  const backTilt = 0.18; // ~10.3° backward lean (standard dining chair)
  const parts = [
    boxPart("seat", "Seat", "surface", "wood", { x: 0, y: params.seatHeight - params.seatThickness / 2, z: 0 }, { x: params.seatWidth, y: params.seatThickness, z: params.seatDepth }, { x: -0.05, y: 0, z: 0 }, params.seatContour === "scoop" ? 18 : 8),
  ];
  const legX = params.seatWidth / 2 - 40;
  const legZ = params.seatDepth / 2 - 40;
  [
    { x: -legX, z: -legZ },
    { x: legX, z: -legZ },
    { x: -legX, z: legZ },
    { x: legX, z: legZ },
  ].forEach((position, index) => {
    parts.push(cylinderPart(`chair-leg-${index}`, `Chair Leg ${index + 1}`, "rod", "metal", { x: position.x, y: legHeight / 2, z: position.z }, legHeight, 4));
  });
  parts.push(
    cylinderPart("back-upright-left", "Back Upright Left", "rod", "metal", { x: -legX + 8, y: params.seatHeight + params.backHeight / 2 - 15, z: legZ - 4 }, params.backHeight, 4, { x: backTilt, y: 0, z: 0 }),
    cylinderPart("back-upright-right", "Back Upright Right", "rod", "metal", { x: legX - 8, y: params.seatHeight + params.backHeight / 2 - 15, z: legZ - 4 }, params.backHeight, 4, { x: backTilt, y: 0, z: 0 }),
    cylinderPart("seat-ring-front", "Seat Ring Front", "rod", "metal", { x: 0, y: params.seatHeight - 20, z: -legZ }, params.seatWidth - 80, 4, { x: 0, y: 0, z: Math.PI / 2 }),
    cylinderPart("seat-ring-back", "Seat Ring Back", "rod", "metal", { x: 0, y: params.seatHeight - 20, z: legZ }, params.seatWidth - 80, 4, { x: 0, y: 0, z: Math.PI / 2 })
  );
  const slatCount = params.backStyle === "solid" ? 1 : params.backStyle === "three-slat" ? 3 : 5;
  for (let index = 0; index < slatCount; index += 1) {
    const offset = slatCount === 1 ? 0 : ((index / (slatCount - 1)) - 0.5) * (params.backHeight - 80);
    parts.push(
      boxPart(
        `back-panel-${index}`,
        slatCount === 1 ? "Back Panel" : `Back Slat ${index + 1}`,
        "panel",
        "wood",
        { x: 0, y: params.seatHeight + params.backHeight / 2 + offset, z: legZ + 2 },
        { x: params.seatWidth - 70, y: slatCount === 1 ? params.backHeight - 60 : 26, z: 12 },
        { x: backTilt, y: 0, z: 0 },
        slatCount === 1 ? 10 : 6
      )
    );
  }
  if (params.legWrapStyle !== "exposed") {
    [
      { x: -legX + 10, z: -legZ },
      { x: legX + 10, z: -legZ },
      { x: -legX + 10, z: legZ },
      { x: legX + 10, z: legZ },
    ].forEach((position, index) => {
      parts.push(boxPart(`chair-wrap-${index}`, `Leg Wrap ${index + 1}`, "panel", "wood", { x: position.x, y: legHeight / 2, z: position.z }, { x: params.legWrapStyle === "full" ? 34 : 24, y: legHeight, z: 10 }));
    });
  }
  return {
    parts,
    boundingBox: {
      min: { x: -params.seatWidth / 2, y: 0, z: -params.seatDepth / 2 },
      max: { x: params.seatWidth / 2, y: params.seatHeight + params.backHeight, z: params.seatDepth / 2 },
    },
  };
}

export function generateChairBOM(params: ChairParams): BOMResult {
  const backCount = params.backStyle === "solid" ? 1 : params.backStyle === "three-slat" ? 3 : 5;
  const items = [
    panelItem("seat", "Seat Panel", params.woodSpecies, 1, params.seatWidth, params.seatDepth, params.seatThickness),
    panelItem("back", "Back Panel", params.woodSpecies, backCount, params.seatWidth - 70, backCount === 1 ? params.backHeight - 60 : 26, 12),
  ];
  if (params.legWrapStyle !== "exposed") {
    items.push(panelItem("leg-wraps", "Leg Wrap", params.woodSpecies, 4, params.seatHeight - params.seatThickness, 34, 10));
  }
  const legHeight = params.seatHeight - params.seatThickness;
  const legRodMm = legHeight * 4;
  const backRodMm = params.backHeight * 2;
  const seatRingMm = (params.seatWidth - 80) * 2;
  const totalRodMm = legRodMm + backRodMm + seatRingMm;

  items.push(
    lineItem("chair-core", "Chair Core Rods", "core", "powder-coated steel", 8),
    lineItem("chair-joints", "Chair Joints", "core", "injection-molded nylon", 6, 0.5),
    lineItem("chair-fasteners", "Fastener Kit", "hardware", "steel", 16, 0.18),
    lineItem("chair-packaging", "Flat-pack Kit", "packaging", "corrugated + kraft", 1, 9)
  );
  return {
    items,
    totalBoardFeet: items.reduce((sum, item) => sum + (item.boardFeet ?? 0), 0),
    totalRodMm,
  };
}
