"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Bounds } from "@react-three/drei";
import { Suspense, useMemo, useState } from "react";
import { useConfiguratorStore } from "@/lib/configurator-store";
import { ModelViewContext } from "./models/view-context";
import { ProductModel } from "./ProductModel";

function SceneContent({ exploded, coreOnly }: { exploded: boolean; coreOnly: boolean }) {
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
        makeDefault
        enablePan={false}
        minDistance={0.5}
        maxDistance={8}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2 - 0.05}
        target={[0, targetY, 0]}
      />

      {/* Warm studio lighting */}
      <ambientLight intensity={0.85} />
      <directionalLight
        position={[3, 4, 2]}
        intensity={1.2}
        castShadow
        shadow-bias={-0.0001}
        shadow-normalBias={0.005}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        color="#fff5e6"
      />
      <directionalLight position={[-2, 3, -1]} intensity={0.4} color="#e8f0ff" />
      <directionalLight position={[0, -1, 3]} intensity={0.15} />

      <Bounds key={`${exploded}-${coreOnly}`} fit clip observe margin={1.35}><ModelViewContext.Provider value={{ exploded, coreOnly }}><ProductModel /></ModelViewContext.Provider></Bounds>

      {/* Ground shadow */}
      <ContactShadows
        position={[0, exploded ? -0.15 : -0.01, 0]}
        opacity={0.35}
        scale={3}
        blur={2.5}
        far={1.5}
      />

      {/* Ground plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, exploded ? -0.155 : -0.015, 0]}
        receiveShadow
      >
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#f0ece8" />
      </mesh>
    </>
  );
}

export function ConfiguratorScene({ studio = false }: { studio?: boolean }) {
  const [exploded, setExploded] = useState(false);
  const [coreOnly, setCoreOnly] = useState(false);
  return (
    <div className="relative h-full w-full min-h-[400px] bg-stone-100 rounded-xl overflow-hidden">
      <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2 rounded-xl bg-white/90 p-2 shadow-sm">
        <button type="button" aria-pressed={!exploded} onClick={() => setExploded(false)} className={`rounded-lg px-3 py-2 text-sm ${!exploded ? 'bg-stone-900 text-white' : 'text-stone-700'}`}>Assembled</button>
        <button type="button" aria-pressed={exploded} onClick={() => setExploded(true)} className={`rounded-lg px-3 py-2 text-sm ${exploded ? 'bg-stone-900 text-white' : 'text-stone-700'}`}>Exploded</button>
        {studio && <button type="button" aria-pressed={coreOnly} onClick={() => setCoreOnly(!coreOnly)} className={`rounded-lg px-3 py-2 text-sm ${coreOnly ? 'bg-stone-900 text-white' : 'text-stone-700'}`}>Backbone</button>}
      </div>
      {exploded && <p className="absolute bottom-4 left-4 right-4 z-10 rounded-lg bg-white/90 px-3 py-2 text-xs text-stone-600">Assembly study. Fasteners and final joint details are not shown.</p>}
      <Canvas
        shadows
        camera={{ position: [1.2, 0.8, 1.2], fov: 35 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor("#f5f0eb");
        }}
      >
        <Suspense fallback={null}>
          <SceneContent exploded={exploded} coreOnly={coreOnly} />
        </Suspense>
      </Canvas>
    </div>
  );
}
