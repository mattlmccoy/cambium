"use client";

import * as THREE from "three";
import { Suspense, useMemo } from "react";
import { useConfiguratorStore } from "@/lib/configurator-store";
import { getSpeciesById } from "@cambium/shared";
import { CoreMesh } from "./shared/CoreMesh";
import { CoreModelMesh } from "./shared/CoreModelMesh";
import { useModelView } from "./view-context";
import { PartMesh } from "./shared/PartMesh";

/**
 * Auto-normalizes the geometry so that the largest bounding-box dimension
 * maps to ~0.8 Three.js units.  The model always sits on y = 0.
 *
 * PartMesh / CoreMesh work in raw mm coordinates;
 * the outer <group> applies one uniform scale.
 */
export function GeometryModel() {
  const { exploded, coreOnly } = useModelView();
  const geometry = useConfiguratorStore((s) => s.geometry);
  const woodSpecies = useConfiguratorStore((s) => s.params.woodSpecies);

  const coreVisibility = useConfiguratorStore((s) => s.params.coreVisibility);
  const finish = useConfiguratorStore((s) => s.params.finish);
  const species = getSpeciesById(woodSpecies);
  const woodColor = useMemo(() => {
    const color = new THREE.Color(species?.color ?? "#c4a872");
    if (finish === 'dark-stain') color.multiplyScalar(.55);
    if (finish === 'light-stain') color.lerp(new THREE.Color('#e7d5b6'), .28);
    if (finish === 'natural-oil') color.multiplyScalar(.88);
    return '#' + color.getHexString();
  }, [species?.color, finish]);

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
        {geometry.parts.map((original) => {
          if (coreOnly && original.material === 'wood') return null;
          const part = exploded ? { ...original, position: { ...original.position } } : original;
          if (exploded) {
            const outward = Math.sign(part.position.x) || 1;
            if (part.id === 'top' || part.id === 'seat') part.position.y += 180;
            else if (part.shape.kind === 'wood-shell') { part.position.x += outward * 130 + part.shape.side * 22; part.position.y -= 45; }
            else if (part.id.startsWith('leg-')) { part.position.x += outward * 70; part.position.y -= 45; }
            else if (part.id.startsWith('apron-cover')) part.position.z += (Math.sign(part.position.z) || 1) * 100;
            else if (part.id.startsWith('back-')) { part.position.y += 90; part.position.z += 80; }
            else if (part.id.startsWith('shelf-')) part.position.x += 140;
            else if (part.id === 'frame-1' || part.id === 'frame-3') { part.position.x += outward * 70; part.position.y -= 45; }
          }
          if (!coreOnly && coreVisibility === 'hidden' && part.layer === 'core') return null;
          if (coreVisibility === 'exposed' && (part.id.includes('cover'))) return null;
          // Wood panels are always procedural
          if (part.material === "wood") {
            return <PartMesh key={part.id} part={part} color={woodColor} roughness={finish==='clear'?.28:finish==='matte'?.82:.5} />;
          }
          // Core parts: use GLB model if shape is "model", otherwise procedural
          if (part.shape.kind === "model") {
            return (
              <Suspense key={part.id} fallback={<CoreMesh part={part} />}>
                <CoreModelMesh part={part} />
              </Suspense>
            );
          }
          return <CoreMesh key={part.id} part={part} />;
        })}
      </group>
    </group>
  );
}
