import { create } from "zustand";
import type { AnyProductParams } from "@cambium/shared";

export interface BenchItem {
  id: string;
  productSlug: string;
  params: AnyProductParams;
  cost: number;
  addedAt: string; // ISO date
  designName?: string;
}

interface BenchState {
  items: BenchItem[];
  addItem: (item: Omit<BenchItem, "id" | "addedAt">) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<BenchItem>) => void;
  clearBench: () => void;
  hydrate: () => void;
}

const STORAGE_KEY = "cambium-bench";

function loadFromStorage(): BenchItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as BenchItem[];
  } catch {
    // Ignore parse errors
  }
  return [];
}

function saveToStorage(items: BenchItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage errors
  }
}

export const useBenchStore = create<BenchState>((set, get) => ({
  items: [],

  addItem: (item) => {
    const newItem: BenchItem = {
      ...item,
      id: crypto.randomUUID(),
      addedAt: new Date().toISOString(),
    };
    const items = [...get().items, newItem];
    saveToStorage(items);
    set({ items });
  },

  removeItem: (id) => {
    const items = get().items.filter((item) => item.id !== id);
    saveToStorage(items);
    set({ items });
  },

  updateItem: (id, updates) => {
    const items = get().items.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    saveToStorage(items);
    set({ items });
  },

  clearBench: () => {
    saveToStorage([]);
    set({ items: [] });
  },

  hydrate: () => {
    const items = loadFromStorage();
    set({ items });
  },
}));
