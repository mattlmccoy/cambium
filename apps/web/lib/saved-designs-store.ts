import { create } from "zustand";
import type { AnyProductParams } from "@cambium/shared";

export interface SavedDesign {
  id: string;
  name: string;
  productSlug: string;
  params: AnyProductParams;
  cost: number;
  savedAt: string; // ISO date
}

interface SavedDesignsState {
  designs: SavedDesign[];
  saveDesign: (design: Omit<SavedDesign, "id" | "savedAt">) => void;
  deleteDesign: (id: string) => void;
  renameDesign: (id: string, name: string) => void;
  hydrate: () => void;
}

const STORAGE_KEY = "cambium-saved-designs";

function loadFromStorage(): SavedDesign[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as SavedDesign[];
  } catch {
    // Ignore parse errors
  }
  return [];
}

function saveToStorage(designs: SavedDesign[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
  } catch {
    // Ignore storage errors
  }
}

export const useSavedDesignsStore = create<SavedDesignsState>((set, get) => ({
  designs: [],

  saveDesign: (design) => {
    const newDesign: SavedDesign = {
      ...design,
      id: crypto.randomUUID(),
      savedAt: new Date().toISOString(),
    };
    const designs = [...get().designs, newDesign];
    saveToStorage(designs);
    set({ designs });
  },

  deleteDesign: (id) => {
    const designs = get().designs.filter((d) => d.id !== id);
    saveToStorage(designs);
    set({ designs });
  },

  renameDesign: (id, name) => {
    const designs = get().designs.map((d) =>
      d.id === id ? { ...d, name } : d
    );
    saveToStorage(designs);
    set({ designs });
  },

  hydrate: () => {
    const designs = loadFromStorage();
    set({ designs });
  },
}));
