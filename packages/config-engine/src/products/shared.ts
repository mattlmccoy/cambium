import type { BOMItem, GeometryPart, ShapeDescriptor, Vec3 } from "@cambium/shared";
import { mmToBoardFeet } from "../shared-cost";

export function boxPart(
  id: string,
  name: string,
  type: GeometryPart["type"],
  material: GeometryPart["material"],
  position: Vec3,
  dimensions: Vec3,
  rotation: Vec3 = { x: 0, y: 0, z: 0 },
  radius = 0
): GeometryPart {
  const shape: ShapeDescriptor =
    radius > 0
      ? {
          kind: "rounded-box",
          width: dimensions.x,
          height: dimensions.y,
          depth: dimensions.z,
          radius,
        }
      : {
          kind: "box",
          width: dimensions.x,
          height: dimensions.y,
          depth: dimensions.z,
        };

  return { id, name, type, material, position, rotation, dimensions, shape };
}

export function cylinderPart(
  id: string,
  name: string,
  type: GeometryPart["type"],
  material: GeometryPart["material"],
  position: Vec3,
  height: number,
  radius: number,
  rotation: Vec3 = { x: 0, y: 0, z: 0 }
): GeometryPart {
  return {
    id,
    name,
    type,
    material,
    position,
    rotation,
    dimensions: { x: radius * 2, y: height, z: radius * 2 },
    shape: {
      kind: "cylinder",
      radiusTop: radius,
      radiusBottom: radius,
      height,
    },
  };
}

export function panelItem(
  partId: string,
  name: string,
  material: string,
  quantity: number,
  length: number,
  width: number,
  thickness: number
): BOMItem {
  return {
    partId,
    name,
    category: "panel",
    material,
    quantity,
    dimensions: { length, width, thickness },
    boardFeet: mmToBoardFeet(length, width, thickness) * quantity,
  };
}

export function lineItem(
  partId: string,
  name: string,
  category: BOMItem["category"],
  material: string,
  quantity: number,
  unitCost?: number
): BOMItem {
  return {
    partId,
    name,
    category,
    material,
    quantity,
    ...(unitCost !== undefined && { unitCost }),
  };
}
