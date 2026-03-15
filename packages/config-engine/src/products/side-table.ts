import type { BOMResult, GeometryResult, SideTableParams, ValidationResult } from "@cambium/shared";
import { SIDE_TABLE_CONSTRAINTS } from "@cambium/shared";
import { checkRange, createValidationResult, getWoodSpeciesForParams, structuralOverhangLimit, warn } from "../constraints";
import { boxPart, cylinderPart, lineItem, panelItem } from "./shared";

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

  const species = getWoodSpeciesForParams(params);
  const maxOverhang = structuralOverhangLimit(params.topThickness, species?.hardness ?? 1000);
  const apronWidth = Math.max(260, params.topWidth - 90);
  const overhang = Math.max(0, (params.topWidth - apronWidth) / 2);
  if (overhang > maxOverhang) {
    warn(warnings, "topWidth", "Selected top overhang exceeds the preferred support range for this species.");
  }

  return createValidationResult(errors, warnings);
}

export function generateSideTableGeometry(params: SideTableParams): GeometryResult {
  const parts = [];
  const legHeight = params.height - params.topThickness;
  const topRadius = 0;

  parts.push(
    boxPart(
      "top",
      "Top",
      "surface",
      "wood",
      { x: 0, y: params.height - params.topThickness / 2, z: 0 },
      { x: params.topWidth, y: params.topThickness, z: params.topDepth },
      { x: 0, y: 0, z: 0 },
      topRadius
    )
  );

  const insetX = params.topWidth / 2 - 45;
  const insetZ = params.topDepth / 2 - 45;
  const legPositions =
    params.legCount === 3
      ? [
          { x: 0, z: -insetZ },
          { x: -insetX, z: insetZ },
          { x: insetX, z: insetZ },
        ]
      : [
          { x: -insetX, z: -insetZ },
          { x: insetX, z: -insetZ },
          { x: -insetX, z: insetZ },
          { x: insetX, z: insetZ },
        ];

  legPositions.forEach((position, index) => {
    parts.push(
      cylinderPart(
        `rod-leg-${index}`,
        `Core Leg ${index + 1}`,
        "rod",
        "metal",
        { x: position.x, y: legHeight / 2, z: position.z },
        legHeight,
        4
      )
    );

    if (params.legWrapStyle !== "exposed") {
      const wrapWidth = params.legWrapStyle === "full" ? 36 : 24;
      parts.push(
        boxPart(
          `panel-leg-front-${index}`,
          `Leg Wrap ${index + 1}`,
          "panel",
          "wood",
          { x: position.x + 8, y: legHeight / 2, z: position.z },
          { x: wrapWidth, y: legHeight, z: 10 }
        )
      );
      parts.push(
        boxPart(
          `panel-leg-side-${index}`,
          `Leg Side Wrap ${index + 1}`,
          "panel",
          "wood",
          { x: position.x, y: legHeight / 2, z: position.z + 8 },
          { x: 10, y: legHeight, z: wrapWidth }
        )
      );
    }
  });

  const apronY = legHeight - 30;
  const apronWidth = Math.max(260, params.topWidth - 90);
  const apronDepth = Math.max(260, params.topDepth - 90);
  const rodLengthX = apronWidth - 16;
  const rodLengthZ = apronDepth - 16;
  parts.push(
    cylinderPart("apron-front", "Front Apron Rod", "rod", "metal", { x: 0, y: apronY, z: -apronDepth / 2 }, rodLengthX, 4, { x: 0, y: 0, z: Math.PI / 2 }),
    cylinderPart("apron-back", "Back Apron Rod", "rod", "metal", { x: 0, y: apronY, z: apronDepth / 2 }, rodLengthX, 4, { x: 0, y: 0, z: Math.PI / 2 }),
    cylinderPart("apron-left", "Left Apron Rod", "rod", "metal", { x: -apronWidth / 2, y: apronY, z: 0 }, rodLengthZ, 4, { x: Math.PI / 2, y: 0, z: 0 }),
    cylinderPart("apron-right", "Right Apron Rod", "rod", "metal", { x: apronWidth / 2, y: apronY, z: 0 }, rodLengthZ, 4, { x: Math.PI / 2, y: 0, z: 0 })
  );

  [
    { x: -apronWidth / 2, z: -apronDepth / 2 },
    { x: apronWidth / 2, z: -apronDepth / 2 },
    { x: -apronWidth / 2, z: apronDepth / 2 },
    { x: apronWidth / 2, z: apronDepth / 2 },
  ].forEach((joint, index) => {
    parts.push(
      boxPart(
        `joint-${index}`,
        `Corner Joint ${index + 1}`,
        "joint",
        "plastic",
        { x: joint.x, y: apronY, z: joint.z },
        { x: 16, y: 16, z: 16 }
      )
    );
  });

  if (params.apronCovers) {
    parts.push(
      boxPart("apron-cover-front", "Front Apron Cover", "panel", "wood", { x: 0, y: apronY, z: -apronDepth / 2 - 6 }, { x: apronWidth, y: 32, z: 8 }),
      boxPart("apron-cover-back", "Back Apron Cover", "panel", "wood", { x: 0, y: apronY, z: apronDepth / 2 + 6 }, { x: apronWidth, y: 32, z: 8 })
    );
  }

  return {
    parts,
    boundingBox: {
      min: { x: -params.topWidth / 2, y: 0, z: -params.topDepth / 2 },
      max: { x: params.topWidth / 2, y: params.height, z: params.topDepth / 2 },
    },
  };
}

export function generateSideTableBOM(params: SideTableParams): BOMResult {
  const items = [
    panelItem("top", "Top Panel", params.woodSpecies, 1, params.topWidth, params.topDepth, params.topThickness),
  ];

  const legHeight = params.height - params.topThickness;
  if (params.legWrapStyle !== "exposed") {
    items.push(
      panelItem("leg-wrap-front", "Front Leg Wrap", params.woodSpecies, params.legCount, legHeight, 36, 10),
      panelItem("leg-wrap-side", "Side Leg Wrap", params.woodSpecies, params.legCount, legHeight, 36, 10)
    );
  }

  if (params.apronCovers) {
    items.push(panelItem("apron-covers", "Apron Covers", params.woodSpecies, 2, Math.max(260, params.topWidth - 90), 32, 8));
  }

  const rodQuantity = params.legCount + 4;
  items.push(
    lineItem("core-rods", "Bent Steel Rods", "core", "powder-coated steel", rodQuantity, 6),
    lineItem("core-joints", "Fold-flat Joints", "core", "injection-molded nylon", 4, 0.45),
    lineItem("panel-fasteners", "M5 Fastener Kit", "hardware", "steel", params.legCount * 4 + 8, 0.18),
    lineItem("packaging", "Flat-pack Kit", "packaging", "corrugated + honeycomb paper", 1, 8)
  );

  const totalBoardFeet = items.reduce((sum, item) => sum + (item.boardFeet ?? 0), 0);
  return { items, totalBoardFeet };
}
