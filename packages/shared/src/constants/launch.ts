import { PRODUCT_CATALOG } from './products';
import { getSpeciesForRegion } from './index';
import type { AnyProductParams, ProductSlug } from '../types';

/** Deliberate workshop assortment, not a price-sorted list that changes SKUs automatically. */
export const LAUNCH_WOOD_IDS: Record<string, readonly string[]> = {
  seattle: ['bigleaf-maple', 'white-oak'],
  sacramento: ['claro-walnut'],
  phoenix: ['pecan', 'mesquite'],
  denver: [], // No table-grade local hardwood assortment selected yet.
  austin: ['pecan', 'white-oak'],
  minneapolis: ['red-oak', 'hard-maple'],
  chicago: ['red-oak', 'hard-maple'],
  pittsburgh: ['red-oak', 'hard-maple'],
  boston: ['yellow-birch', 'hard-maple'],
  atlanta: ['red-oak', 'white-oak'],
};
export const LAUNCH_PRODUCTS = [PRODUCT_CATALOG['side-table'], PRODUCT_CATALOG.table] as const;
export function isLaunchProduct(slug: string): slug is 'side-table' | 'table' {
  return slug === 'side-table' || slug === 'table';
}
export function getLaunchWoods(regionId: string) {
  const local = getSpeciesForRegion(regionId);
  return (LAUNCH_WOOD_IDS[regionId] ?? []).flatMap(id => {
    const wood = local.find(s => s.id === id);
    return wood ? [wood] : [];
  });
}
/** Check a saved design against the curated offering without mutating the save. */
export function isLaunchConfiguration(params: AnyProductParams): boolean {
  if (!isLaunchProduct(params.productSlug)) return false;
  const fixed = PRODUCT_CATALOG[params.productSlug].defaults;
  const actual = params as unknown as Record<string, unknown>;
  return Object.entries(fixed).every(([key, value]) => key === 'regionId' || key === 'woodSpecies' || actual[key] === value)
    && getLaunchWoods(params.regionId).some(s => s.id === params.woodSpecies);
}
export function launchDimensions(slug: ProductSlug): string {
  const p = PRODUCT_CATALOG[slug].defaults;
  if (p.productSlug === 'side-table') return `${p.topWidth} × ${p.topDepth} × ${p.height} mm`;
  if (p.productSlug === 'table') return `${p.length} × ${p.width} × ${p.height} mm`;
  return '';
}
