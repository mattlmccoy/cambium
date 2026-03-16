"use client";

import { useState, useCallback } from "react";
import { REGIONS } from "@cambium/shared";
import { useRegionStore } from "@/lib/region-store";

interface ZipEntryProps {
  /** Optional callback fired when a region is detected from a valid ZIP */
  onDetected?: (regionId: string, zip: string) => void;
  /** Variant style: "hero" for the landing page, "compact" for embedded use */
  variant?: "hero" | "compact";
}

export function ZipEntry({ onDetected, variant = "hero" }: ZipEntryProps) {
  const { zip, regionId, isDetected, setZip } = useRegionStore();
  const [input, setInput] = useState(zip ?? "");
  const region = REGIONS.find((r) => r.id === regionId);

  const handleInput = useCallback(
    (value: string) => {
      const digits = value.replace(/\D/g, "").slice(0, 5);
      setInput(digits);
      if (digits.length === 5) {
        setZip(digits);
        // Fire callback after a tick so store has updated
        const detected = useRegionStore.getState();
        if (detected.isDetected && onDetected) {
          onDetected(detected.regionId, digits);
        }
      }
    },
    [setZip, onDetected]
  );

  if (isDetected && region) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-white/80 px-5 py-3 shadow-sm backdrop-blur">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
          <span className="text-sm">🌲</span>
        </div>
        <div>
          <div className="text-sm font-medium text-stone-900">
            {region.name} Workshop
          </div>
          <div className="text-xs text-stone-500">
            {region.city}, {region.state} &middot; ZIP {zip}
          </div>
        </div>
        <button
          onClick={() => {
            setInput("");
            useRegionStore.getState().setRegion("minneapolis");
            useRegionStore.setState({ zip: null, isDetected: false });
          }}
          className="ml-auto text-xs text-stone-400 hover:text-stone-600"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 rounded-2xl bg-white/80 shadow-sm backdrop-blur ${
      variant === "compact" ? "px-4 py-2.5" : "px-5 py-3"
    }`}>
      <input
        type="text"
        inputMode="numeric"
        placeholder="Enter your ZIP code"
        value={input}
        onChange={(e) => handleInput(e.target.value)}
        className={`bg-transparent text-stone-900 outline-none placeholder:text-stone-400 ${
          variant === "compact" ? "w-28 text-sm" : "w-32 text-sm"
        }`}
      />
      <span className="text-xs text-stone-400">
        Find your local workshop
      </span>
    </div>
  );
}
