"use client";

import dynamic from "next/dynamic";
import { ControlPanel } from "@/components/configurator/ControlPanel";
import Link from "next/link";

// Dynamic import to avoid SSR issues with Three.js
const ConfiguratorScene = dynamic(
  () =>
    import("@/components/configurator/Scene").then(
      (mod) => mod.ConfiguratorScene
    ),
  { ssr: false, loading: () => <SceneLoading /> }
);

function SceneLoading() {
  return (
    <div className="w-full h-full min-h-[400px] bg-stone-100 rounded-xl flex items-center justify-center">
      <div className="text-stone-400 text-sm">Loading 3D viewer...</div>
    </div>
  );
}

export default function ConfigurePage() {
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white">
        <Link href="/" className="text-lg font-light tracking-wide text-stone-900">
          CAMBIUM
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-stone-500">Side Table</span>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Control panel - left side */}
        <aside className="w-[380px] border-r border-stone-200 bg-white overflow-hidden flex flex-col">
          <ControlPanel />
        </aside>

        {/* 3D viewport - right side */}
        <main className="flex-1 p-6 bg-stone-50">
          <ConfiguratorScene />
        </main>
      </div>
    </div>
  );
}
