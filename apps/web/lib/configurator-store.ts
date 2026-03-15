import { create } from "zustand";
import type {
  AnyProductParams,
  BOMResult,
  CostBreakdown,
  GeometryResult,
  ProductDefinition,
  ProductSlug,
  ValidationResult,
} from "@cambium/shared";
import { PRODUCT_CATALOG, WOOD_SPECIES, getCheapestLocalSpecies, getSpeciesForRegion } from "@cambium/shared";
import { computeConfiguration, DEFAULT_COST_MODEL } from "@cambium/config-engine";
import type { CostModelInputs } from "@cambium/config-engine";

interface ConfiguratorState {
  productSlug: ProductSlug;
  product: ProductDefinition;
  params: AnyProductParams;
  geometry: GeometryResult;
  bom: BOMResult;
  cost: CostBreakdown;
  validation: ValidationResult;
  setProduct: (slug: ProductSlug, regionId?: string) => void;
  setParam: (key: string, value: unknown) => void;
  setParams: (params: Partial<AnyProductParams>) => void;
  resetParams: () => void;
  /** Update pricing when region changes */
  updateRegion: (regionId: string) => void;
}

function buildCostModel(regionId: string): CostModelInputs {
  return { ...DEFAULT_COST_MODEL, regionId };
}

function computeForProduct(productSlug: ProductSlug, params: AnyProductParams, regionId?: string) {
  const costModel = buildCostModel(regionId ?? params.regionId);
  return computeConfiguration(productSlug, params, costModel);
}

/** Get the cheapest locally-available wood species for a region */
function getIdealWood(regionId: string): string {
  return getCheapestLocalSpecies(regionId, WOOD_SPECIES);
}

const initialRegion = "minneapolis";
const initialProduct = PRODUCT_CATALOG["side-table"];
const initialParams = {
  ...initialProduct.defaults,
  regionId: initialRegion,
  woodSpecies: getIdealWood(initialRegion),
  finish: "natural-oil" as const,
};
const initialResult = computeForProduct(initialProduct.slug, initialParams, initialRegion);

export const useConfiguratorStore = create<ConfiguratorState>((set) => ({
  productSlug: initialProduct.slug,
  product: initialProduct,
  params: initialParams,
  geometry: initialResult.geometry,
  bom: initialResult.bom,
  cost: initialResult.cost,
  validation: initialResult.validation,

  setProduct: (productSlug, regionId) => {
    const product = PRODUCT_CATALOG[productSlug];
    const effectiveRegion = regionId ?? "minneapolis";
    const idealWood = getIdealWood(effectiveRegion);
    const params = {
      ...product.defaults,
      regionId: effectiveRegion,
      woodSpecies: idealWood,
      finish: "natural-oil" as const,
    };
    const result = computeForProduct(productSlug, params, effectiveRegion);
    set({
      productSlug,
      product,
      params: result.params,
      geometry: result.geometry,
      bom: result.bom,
      cost: result.cost,
      validation: result.validation,
    });
  },

  setParam: (key, value) =>
    set((state) => {
      const nextParams = { ...state.params, [key]: value } as AnyProductParams;

      // When changing region, auto-switch to a local wood if current isn't available
      if (key === "regionId") {
        const newRegion = value as string;
        const speciesInNewRegion = getSpeciesForRegion(newRegion);
        if (!speciesInNewRegion.some((s) => s.id === nextParams.woodSpecies)) {
          nextParams.woodSpecies = getIdealWood(newRegion);
        }
      }

      const result = computeForProduct(state.productSlug, nextParams);
      return {
        params: result.params,
        geometry: result.geometry,
        bom: result.bom,
        cost: result.cost,
        validation: result.validation,
      };
    }),

  setParams: (partial) =>
    set((state) => {
      const nextParams = { ...state.params, ...partial } as AnyProductParams;
      const result = computeForProduct(state.productSlug, nextParams);
      return {
        params: result.params,
        geometry: result.geometry,
        bom: result.bom,
        cost: result.cost,
        validation: result.validation,
      };
    }),

  resetParams: () =>
    set((state) => {
      const regionId = state.params.regionId;
      const idealWood = getIdealWood(regionId);
      const defaults = {
        ...state.product.defaults,
        regionId,
        woodSpecies: idealWood,
        finish: "natural-oil" as const,
      };
      const result = computeForProduct(state.productSlug, defaults, regionId);
      return {
        params: result.params,
        geometry: result.geometry,
        bom: result.bom,
        cost: result.cost,
        validation: result.validation,
      };
    }),

  updateRegion: (regionId) =>
    set((state) => {
      const speciesInRegion = getSpeciesForRegion(regionId);
      const isAvailable = speciesInRegion.some((s) => s.id === state.params.woodSpecies);
      const nextParams = {
        ...state.params,
        regionId,
        woodSpecies: isAvailable ? state.params.woodSpecies : getIdealWood(regionId),
      } as AnyProductParams;

      const result = computeForProduct(state.productSlug, nextParams, regionId);
      return {
        params: result.params,
        geometry: result.geometry,
        bom: result.bom,
        cost: result.cost,
        validation: result.validation,
      };
    }),
}));
