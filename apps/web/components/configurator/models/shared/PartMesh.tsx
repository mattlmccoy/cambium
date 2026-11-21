"use client";

import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { ProfileMesh } from "./ProfileMesh";
import type { GeometryPart } from "@cambium/shared";

/**
 * Renders a single geometry part in raw mm coordinates.
 * The parent GeometryModel group handles scaling to Three.js units.
 */
export function PartMesh({
  part,
  color,
  roughness = 0.72,
}: {
  part: GeometryPart;
  color: string;
  roughness?: number;
}) {
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness: 0.02,
      }),
    [color, roughness]
  );

  useEffect(() => () => material.dispose(), [material]);

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
    case "profile-panel":
    case "wood-shell":
    case "tube":
      return <ProfileMesh part={part} color={color} roughness={roughness} />;
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
          <meshStandardMaterial color={color} roughness={roughness} metalness={0.02} />
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
    case "model":
      // Model parts are handled by CoreModelMesh, not PartMesh
      return null;
    default:
      return null;
  }
}
