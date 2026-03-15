"use client";

import { useMemo } from "react";
import { useConfiguratorStore } from "@/lib/configurator-store";
import { getSpeciesById } from "@cambium/shared";
import { CoreMesh } from "./shared/CoreMesh";
import { PartMesh } from "./shared/PartMesh";

/**
 * Auto-normalizes the geometry so that the largest bounding-box dimension
 * maps to ~0.8 Three.js units.  The model always sits on y = 0.
 *
 * PartMesh / CoreMesh work in raw mm coordinates;
 * the outer <group> applies one uniform scale.
 */
export function GeometryModel() {
  const geometry = useConfiguratorStore((s) => s.geometry);
  const woodSpecies = useConfiguratorStore((s) => s.params.woodSpecies);

  const species = getSpeciesById(woodSpecies);
  const woodColor = species?.color ?? "#c4a872";

  const { scale, offsetY } = useMemo(() => {
    const bbox = geometry.boundingBox;
    const sizeX = bbox.max.x - bbox.min.x;
    const sizeY = bbox.max.y - bbox.min.y;
    const sizeZ = bbox.max.z - bbox.min.z;
    const maxDim = Math.max(sizeX, sizeY, sizeZ, 1); // avoid div/0
    return {
      scale: 0.8 / maxDim,
      offsetY: -bbox.min.y, // sit on ground
    };
  }, [geometry.boundingBox]);

  return (
    <group scale={scale}>
      <group position={[0, offsetY, 0]}>
        {geometry.parts.map((part) =>
          part.material === "wood" ? (
            <PartMesh key={part.id} part={part} color={woodColor} />
          ) : (
            <CoreMesh key={part.id} part={part} />
          )
        )}
      </group>
    </group>
  );
}
