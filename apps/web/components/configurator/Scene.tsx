"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { Suspense, useMemo } from "react";
import { useConfiguratorStore } from "@/lib/configurator-store";
import { ProductModel } from "./ProductModel";

function SceneContent() {
  const geometry = useConfiguratorStore((s) => s.geometry);

  // Compute the visual center height for the orbit target.
  // Models are auto-normalized to ~0.8 units by GeometryModel.
  const targetY = useMemo(() => {
    const bbox = geometry.boundingBox;
    const sizeY = bbox.max.y - bbox.min.y;
    const maxDim = Math.max(
      bbox.max.x - bbox.min.x,
      sizeY,
      bbox.max.z - bbox.min.z,
      1
    );
    const scale = 0.8 / maxDim;
    return (sizeY * scale) / 2;
  }, [geometry.boundingBox]);

  return (
    <>
      <OrbitControls
        enablePan={false}
        minDistance={0.5}
        maxDistance={3}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2 - 0.05}
        target={[0, targetY, 0]}
      />

      {/* Warm studio lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[3, 4, 2]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        color="#fff5e6"
      />
      <directionalLight position={[-2, 3, -1]} intensity={0.4} color="#e8f0ff" />
      <directionalLight position={[0, -1, 3]} intensity={0.15} />

      <ProductModel />

      {/* Ground shadow */}
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.35}
        scale={3}
        blur={2.5}
        far={1.5}
      />

      {/* Ground plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.015, 0]}
        receiveShadow
      >
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#f0ece8" />
      </mesh>
    </>
  );
}

export function ConfiguratorScene() {
  return (
    <div className="h-full w-full min-h-[400px] bg-stone-100 rounded-xl overflow-hidden">
      <Canvas
        shadows
        camera={{ position: [1.2, 0.8, 1.2], fov: 35 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor("#f5f0eb");
        }}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
