import type { SideTableParams, GeometryResult } from "./types";
import type { GeometryPart, Vec3, ShapeDescriptor } from "@cambium/shared";

function generateTopShape(params: SideTableParams): ShapeDescriptor {
  const { topWidth, topDepth, topThickness, topProfile } = params;

  switch (topProfile) {
    case "circle": {
      const radius = Math.min(topWidth, topDepth) / 2;
      return {
        kind: "cylinder",
        radiusTop: radius,
        radiusBottom: radius,
        height: topThickness,
      };
    }
    case "rounded-square":
      return {
        kind: "rounded-box",
        width: topWidth,
        height: topThickness,
        depth: topDepth,
        radius: Math.min(topWidth, topDepth) * 0.1,
      };
    case "organic": {
      // Organic is a rounded-box with larger radius for now
      // Will evolve to custom spline profiles
      return {
        kind: "rounded-box",
        width: topWidth,
        height: topThickness,
        depth: topDepth,
        radius: Math.min(topWidth, topDepth) * 0.25,
      };
    }
    case "square":
    default:
      return {
        kind: "box",
        width: topWidth,
        height: topThickness,
        depth: topDepth,
      };
  }
}

function generateLegShape(
  params: SideTableParams,
  legHeight: number
): ShapeDescriptor {
  const legWidth = Math.max(25, Math.min(params.topWidth, params.topDepth) * 0.06);

  switch (params.legStyle) {
    case "tapered":
      return {
        kind: "cylinder",
        radiusTop: legWidth * 0.5,
        radiusBottom: legWidth * 0.35,
        height: legHeight,
      };
    case "splayed":
      return {
        kind: "cylinder",
        radiusTop: legWidth * 0.45,
        radiusBottom: legWidth * 0.4,
        height: legHeight,
      };
    case "hairpin-wrap":
      // Hairpin legs approximated as thin cylinders
      return {
        kind: "cylinder",
        radiusTop: 5,
        radiusBottom: 5,
        height: legHeight,
      };
    case "straight":
    default:
      return {
        kind: "box",
        width: legWidth,
        height: legHeight,
        depth: legWidth,
      };
  }
}

function computeLegPositions(params: SideTableParams): { pos: Vec3; rot: Vec3 }[] {
  const { topWidth, topDepth, legCount, topProfile, legStyle } = params;
  const inset = Math.min(topWidth, topDepth) * 0.12;

  const halfW = topWidth / 2 - inset;
  const halfD = topDepth / 2 - inset;

  // Splay angle for splayed legs (in radians)
  const splayAngle = legStyle === "splayed" ? 0.12 : 0;

  if (legCount === 3) {
    // Triangle arrangement - works best with circle/rounded
    if (topProfile === "circle" || topProfile === "organic") {
      const radius = Math.min(halfW, halfD);
      return [0, 1, 2].map((i) => {
        const angle = (i * Math.PI * 2) / 3 - Math.PI / 2;
        return {
          pos: { x: Math.cos(angle) * radius, y: 0, z: Math.sin(angle) * radius },
          rot: {
            x: Math.sin(angle) * splayAngle,
            y: 0,
            z: -Math.cos(angle) * splayAngle,
          },
        };
      });
    }
    // Fallback triangle for non-circular tops
    return [
      { pos: { x: 0, y: 0, z: -halfD }, rot: { x: splayAngle, y: 0, z: 0 } },
      { pos: { x: -halfW, y: 0, z: halfD }, rot: { x: -splayAngle, y: 0, z: splayAngle } },
      { pos: { x: halfW, y: 0, z: halfD }, rot: { x: -splayAngle, y: 0, z: -splayAngle } },
    ];
  }

  // 4 legs - standard rectangle corners
  return [
    { pos: { x: -halfW, y: 0, z: -halfD }, rot: { x: splayAngle, y: 0, z: splayAngle } },
    { pos: { x: halfW, y: 0, z: -halfD }, rot: { x: splayAngle, y: 0, z: -splayAngle } },
    { pos: { x: -halfW, y: 0, z: halfD }, rot: { x: -splayAngle, y: 0, z: splayAngle } },
    { pos: { x: halfW, y: 0, z: halfD }, rot: { x: -splayAngle, y: 0, z: -splayAngle } },
  ];
}

export function generateGeometry(params: SideTableParams): GeometryResult {
  const parts: GeometryPart[] = [];
  const legHeight = params.height - params.topThickness;

  // Table top
  parts.push({
    id: "top",
    name: "Table Top",
    type: "top",
    position: { x: 0, y: params.height - params.topThickness / 2, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    dimensions: {
      x: params.topWidth,
      y: params.topThickness,
      z: params.topDepth,
    },
    shape: generateTopShape(params),
  });

  // Legs
  const legPositions = computeLegPositions(params);
  legPositions.forEach((lp, i) => {
    parts.push({
      id: `leg-${i}`,
      name: `Leg ${i + 1}`,
      type: "leg",
      position: {
        x: lp.pos.x,
        y: legHeight / 2,
        z: lp.pos.z,
      },
      rotation: lp.rot,
      dimensions: { x: 30, y: legHeight, z: 30 },
      shape: generateLegShape(params, legHeight),
    });
  });

  // Bounding box
  const halfW = params.topWidth / 2;
  const halfD = params.topDepth / 2;

  return {
    parts,
    boundingBox: {
      min: { x: -halfW, y: 0, z: -halfD },
      max: { x: halfW, y: params.height, z: halfD },
    },
  };
}
