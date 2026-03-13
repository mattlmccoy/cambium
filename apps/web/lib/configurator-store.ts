import { create } from "zustand";
import type { SideTableParams, CostBreakdown, GeometryResult, BOMResult, ValidationResult } from "@cambium/shared";
import { SIDE_TABLE_DEFAULTS } from "@cambium/shared";
import { computeConfiguration } from "@cambium/config-engine";

interface ConfiguratorState {
  params: SideTableParams;
  geometry: GeometryResult;
  bom: BOMResult;
  cost: CostBreakdown;
  validation: ValidationResult;

  // Actions
  setParam: <K extends keyof SideTableParams>(key: K, value: SideTableParams[K]) => void;
  setParams: (params: Partial<SideTableParams>) => void;
  resetParams: () => void;
}

function recompute(params: SideTableParams) {
  return computeConfiguration(params);
}

const initialResult = recompute(SIDE_TABLE_DEFAULTS);

export const useConfiguratorStore = create<ConfiguratorState>((set) => ({
  params: SIDE_TABLE_DEFAULTS,
  geometry: initialResult.geometry,
  bom: initialResult.bom,
  cost: initialResult.cost,
  validation: initialResult.validation,

  setParam: (key, value) =>
    set((state) => {
      const newParams = { ...state.params, [key]: value };
      const result = recompute(newParams);
      return {
        params: newParams,
        geometry: result.geometry,
        bom: result.bom,
        cost: result.cost,
        validation: result.validation,
      };
    }),

  setParams: (partial) =>
    set((state) => {
      const newParams = { ...state.params, ...partial };
      const result = recompute(newParams);
      return {
        params: newParams,
        geometry: result.geometry,
        bom: result.bom,
        cost: result.cost,
        validation: result.validation,
      };
    }),

  resetParams: () => {
    const result = recompute(SIDE_TABLE_DEFAULTS);
    set({
      params: SIDE_TABLE_DEFAULTS,
      geometry: result.geometry,
      bom: result.bom,
      cost: result.cost,
      validation: result.validation,
    });
  },
}));
