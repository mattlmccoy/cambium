import type { ProductSlug } from "../types";

/**
 * Core Model Registry
 *
 * Maps each product slug to its approved Core GLB metadata.
 * null = no approved GLB yet, use procedural fallback geometry.
 *
 * When a Core GLB is approved via the admin dev-viewer:
 * 1. Place the GLB + meta.json in apps/web/public/models/cores/
 * 2. Update this registry with the entry
 */

export interface CoreModelEntry {
  /** Product this core belongs to */
  productSlug: ProductSlug;
  /** Model filename stem — maps to /models/cores/{modelId}.glb */
  modelId: string;
  /** Version number (incremented on re-approval) */
  version: number;
  /** Euler rotation [x,y,z] in radians to orient the model correctly */
  orientationEuler: [number, number, number];
  /** Fixed dimensions of this core in mm (from bounding box after orientation) */
  fixedDimensions: {
    width: number;
    height: number;
    depth: number;
  };
}

export const CORE_REGISTRY: Record<ProductSlug, CoreModelEntry | null> = {
  "side-table": null,
  table: null,
  chair: null,
  shelf: null,
};

/**
 * Get the core model entry for a product, or null if no CAD core is approved.
 */
export function getCoreEntry(slug: ProductSlug): CoreModelEntry | null {
  return CORE_REGISTRY[slug];
}
