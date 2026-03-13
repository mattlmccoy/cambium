"use client";

import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  ContactShadows,
} from "@react-three/drei";
import { Suspense } from "react";
import { SideTableModel } from "./SideTableModel";

function SceneContent() {
  return (
    <>
      <OrbitControls
        enablePan={false}
        minDistance={0.5}
        maxDistance={3}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2 - 0.1}
        target={[0, 0.25, 0]}
      />

      {/* Lighting - warm studio setup */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[2, 3, 2]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-1, 2, -1]} intensity={0.4} />
      <directionalLight position={[0, -1, 2]} intensity={0.2} />

      {/* The table */}
      <SideTableModel />

      {/* Ground shadow */}
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.4}
        scale={2}
        blur={2}
        far={1}
      />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, 0]} receiveShadow>
        <planeGeometry args={[5, 5]} />
        <meshStandardMaterial color="#f0ece8" />
      </mesh>
    </>
  );
}

export function ConfiguratorScene() {
  return (
    <div className="w-full h-full min-h-[400px] bg-stone-100 rounded-xl overflow-hidden">
      <Canvas
        shadows
        camera={{ position: [1.2, 0.6, 1.2], fov: 35 }}
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
