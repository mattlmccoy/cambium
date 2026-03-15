import { create } from "zustand";
import { zipToRegion, isValidZip } from "@cambium/shared";

interface RegionState {
  /** User-entered ZIP code, or null if not yet entered */
  zip: string | null;
  /** Active microfactory region ID */
  regionId: string;
  /** Whether the region was auto-detected from ZIP (vs default/manual) */
  isDetected: boolean;
  /** Set ZIP code and auto-detect region */
  setZip: (zip: string) => void;
  /** Manually set region (e.g., from dropdown) */
  setRegion: (regionId: string) => void;
  /** Initialize from localStorage if available */
  hydrate: () => void;
}

const STORAGE_KEY = "cambium-region";
const DEFAULT_REGION = "minneapolis"; // geographic center of US

function loadFromStorage(): { zip: string | null; regionId: string; isDetected: boolean } {
  if (typeof window === "undefined") {
    return { zip: null, regionId: DEFAULT_REGION, isDetected: false };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return {
        zip: data.zip ?? null,
        regionId: data.regionId ?? DEFAULT_REGION,
        isDetected: data.isDetected ?? false,
      };
    }
  } catch {
    // Ignore parse errors
  }
  return { zip: null, regionId: DEFAULT_REGION, isDetected: false };
}

function saveToStorage(zip: string | null, regionId: string, isDetected: boolean) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ zip, regionId, isDetected }));
  } catch {
    // Ignore storage errors
  }
}

export const useRegionStore = create<RegionState>((set) => ({
  zip: null,
  regionId: DEFAULT_REGION,
  isDetected: false,

  setZip: (zip: string) => {
    if (!isValidZip(zip)) return;
    const regionId = zipToRegion(zip) ?? DEFAULT_REGION;
    saveToStorage(zip, regionId, true);
    set({ zip, regionId, isDetected: true });
  },

  setRegion: (regionId: string) => {
    set((state) => {
      saveToStorage(state.zip, regionId, false);
      return { regionId, isDetected: false };
    });
  },

  hydrate: () => {
    const saved = loadFromStorage();
    set(saved);
  },
}));
