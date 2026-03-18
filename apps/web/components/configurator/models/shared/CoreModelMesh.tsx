"use client";

import { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import type { GeometryPart } from "@cambium/shared";

/**
 * Renders a Core (steel subframe) part loaded from a GLB model file.
 *
 * The GLB is expected at `/models/cores/{modelId}.glb`.
 * Falls back to null if loading fails — the parent should use
 * procedural CoreMesh as fallback.
 */

const CORE_MATERIAL_PROPS = {
  color: "#1a1a1a",
  metalness: 0.85,
  roughness: 0.35,
};

interface CoreModelMeshProps {
  part: GeometryPart;
  /** Override the base path for models (default: /models/cores/) */
  basePath?: string;
}

export function CoreModelMesh({ part, basePath = "/models/cores/" }: CoreModelMeshProps) {
  if (part.shape.kind !== "model") return null;

  const modelUrl = `${basePath}${part.shape.modelId}.glb`;

  return <CoreModelInner part={part} url={modelUrl} />;
}

function CoreModelInner({ part, url }: { part: GeometryPart; url: string }) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial(CORE_MATERIAL_PROPS),
    []
  );

  // Clone the scene so multiple instances don't share state
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    // Apply our powder-coat material to all meshes
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = material;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    return clone;
  }, [scene, material]);

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

  const scale =
    part.shape.kind === "model" && part.shape.scale
      ? ([part.shape.scale.x, part.shape.scale.y, part.shape.scale.z] as [number, number, number])
      : [1, 1, 1] as [number, number, number];

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  );
}

/**
 * Check if a model GLB exists at runtime (for fallback logic).
 * Returns a promise that resolves to true if the model is loadable.
 */
export async function checkModelExists(modelId: string, basePath = "/models/cores/"): Promise<boolean> {
  try {
    const response = await fetch(`${basePath}${modelId}.glb`, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}
