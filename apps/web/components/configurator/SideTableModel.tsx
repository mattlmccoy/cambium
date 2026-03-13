"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import type { GeometryResult, GeometryPart } from "@cambium/shared";
import { useConfiguratorStore } from "@/lib/configurator-store";
import { getSpeciesById } from "@cambium/shared";

// Convert mm to scene units (1 unit = 1 meter)
const SCALE = 0.001;

function PartMesh({ part, woodColor }: { part: GeometryPart; woodColor: string }) {
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: woodColor,
        roughness: 0.7,
        metalness: 0.0,
      }),
    [woodColor]
  );

  const position: [number, number, number] = [
    part.position.x * SCALE,
    part.position.y * SCALE,
    part.position.z * SCALE,
  ];

  const rotation: [number, number, number] = [
    part.rotation.x,
    part.rotation.y,
    part.rotation.z,
  ];

  const { shape } = part;

  switch (shape.kind) {
    case "box":
      return (
        <mesh position={position} rotation={rotation} material={material} castShadow>
          <boxGeometry
            args={[
              shape.width * SCALE,
              shape.height * SCALE,
              shape.depth * SCALE,
            ]}
          />
        </mesh>
      );

    case "rounded-box":
      return (
        <RoundedBox
          position={position}
          rotation={rotation}
          args={[
            shape.width * SCALE,
            shape.height * SCALE,
            shape.depth * SCALE,
          ]}
          radius={shape.radius * SCALE}
          smoothness={4}
          castShadow
        >
          <meshStandardMaterial
            color={woodColor}
            roughness={0.7}
            metalness={0.0}
          />
        </RoundedBox>
      );

    case "cylinder":
      return (
        <mesh position={position} rotation={rotation} material={material} castShadow>
          <cylinderGeometry
            args={[
              shape.radiusTop * SCALE,
              shape.radiusBottom * SCALE,
              shape.height * SCALE,
              24,
            ]}
          />
        </mesh>
      );

    case "extrude":
      // Fallback to a box for extrude shapes (will implement custom extrusion later)
      return (
        <mesh position={position} rotation={rotation} material={material} castShadow>
          <boxGeometry args={[1, 1, shape.depth * SCALE]} />
        </mesh>
      );

    default:
      return null;
  }
}

export function SideTableModel() {
  const geometry = useConfiguratorStore((s) => s.geometry);
  const woodSpecies = useConfiguratorStore((s) => s.params.woodSpecies);

  const species = getSpeciesById(woodSpecies);
  const woodColor = species?.color ?? "#c4a872";

  // Offset so the bottom of the table sits at y = 0
  const offsetY = -geometry.boundingBox.min.y * SCALE;

  return (
    <group position={[0, offsetY, 0]}>
      {geometry.parts.map((part) => (
        <PartMesh key={part.id} part={part} woodColor={woodColor} />
      ))}
    </group>
  );
}
