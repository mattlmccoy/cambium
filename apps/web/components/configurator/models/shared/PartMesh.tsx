"use client";

import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { useMemo } from "react";
import type { GeometryPart } from "@cambium/shared";

/**
 * Renders a single geometry part in raw mm coordinates.
 * The parent GeometryModel group handles scaling to Three.js units.
 */
export function PartMesh({
  part,
  color,
}: {
  part: GeometryPart;
  color: string;
}) {
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.72,
        metalness: 0.02,
      }),
    [color]
  );

  const position: [number, number, number] = [
    part.position.x,
    part.position.y,
    part.position.z,
  ];
  const rotation: [number, number, number] = [
    part.rotation.x,
    part.rotation.y,
    part.rotation.z,
  ];

  switch (part.shape.kind) {
    case "box":
      return (
        <mesh position={position} rotation={rotation} material={material} castShadow>
          <boxGeometry
            args={[part.shape.width, part.shape.height, part.shape.depth]}
          />
        </mesh>
      );
    case "rounded-box":
      return (
        <RoundedBox
          position={position}
          rotation={rotation}
          args={[part.shape.width, part.shape.height, part.shape.depth]}
          radius={part.shape.radius}
          smoothness={4}
          castShadow
        >
          <meshStandardMaterial color={color} roughness={0.72} metalness={0.02} />
        </RoundedBox>
      );
    case "cylinder":
      return (
        <mesh position={position} rotation={rotation} material={material} castShadow>
          <cylinderGeometry
            args={[
              part.shape.radiusTop,
              part.shape.radiusBottom,
              part.shape.height,
              24,
            ]}
          />
        </mesh>
      );
    default:
      return null;
  }
}
