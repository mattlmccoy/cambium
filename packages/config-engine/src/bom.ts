import type { SideTableParams, BOMResult } from "./types";
import type { BOMItem, HardwareItem } from "@cambium/shared";

// Convert mm dimensions to board feet
// Board foot = (length_in × width_in × thickness_in) / 144
function mmToBoardFeet(
  length: number,
  width: number,
  thickness: number
): number {
  const lengthIn = length / 25.4;
  const widthIn = width / 25.4;
  const thicknessIn = thickness / 25.4;
  return (lengthIn * widthIn * thicknessIn) / 144;
}

export function generateBOM(params: SideTableParams): BOMResult {
  const items: BOMItem[] = [];
  const legHeight = params.height - params.topThickness;

  // Table top panel
  const topBF = mmToBoardFeet(
    params.topWidth,
    params.topDepth,
    params.topThickness
  );
  items.push({
    partId: "top",
    name: "Table Top",
    material: params.woodSpecies,
    quantity: 1,
    dimensions: {
      length: params.topWidth,
      width: params.topDepth,
      thickness: params.topThickness,
    },
    boardFeet: topBF,
  });

  // Legs
  const legWidth = Math.max(
    25,
    Math.min(params.topWidth, params.topDepth) * 0.06
  );
  const legBF = mmToBoardFeet(legWidth, legWidth, legHeight);
  items.push({
    partId: "legs",
    name: "Table Legs",
    material: params.woodSpecies,
    quantity: params.legCount,
    dimensions: {
      length: legHeight,
      width: legWidth,
      thickness: legWidth,
    },
    boardFeet: legBF * params.legCount,
  });

  // Hardware
  const hardwareItems: HardwareItem[] = [];

  if (params.legStyle === "hairpin-wrap") {
    // Hairpin legs use metal brackets
    hardwareItems.push({
      name: "Hairpin leg bracket",
      quantity: params.legCount,
      unitCost: 8.5,
    });
    hardwareItems.push({
      name: "M6 wood screw",
      quantity: params.legCount * 4,
      unitCost: 0.15,
    });
  } else {
    // Wood legs use threaded inserts + bolts for easy assembly
    hardwareItems.push({
      name: "Threaded insert (M8)",
      quantity: params.legCount,
      unitCost: 0.75,
    });
    hardwareItems.push({
      name: "Hanger bolt (M8x60)",
      quantity: params.legCount,
      unitCost: 1.2,
    });
    // Mounting plates for leg attachment
    hardwareItems.push({
      name: "Leg mounting plate",
      quantity: params.legCount,
      unitCost: 2.5,
    });
  }

  // Rubber feet
  hardwareItems.push({
    name: "Rubber foot pad",
    quantity: params.legCount,
    unitCost: 0.5,
  });

  const totalBoardFeet = items.reduce((sum, item) => sum + item.boardFeet, 0);

  return {
    items,
    totalBoardFeet,
    hardwareItems,
  };
}
