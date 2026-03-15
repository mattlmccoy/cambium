import type { AnyProductParams, ProductSlug } from "@cambium/shared";
import type { ProductDefinitionRuntime } from "./types";
import {
  generateChairBOM,
  generateChairGeometry,
  normalizeChairParams,
  validateChair,
} from "./products/chair";
import {
  generateShelfBOM,
  generateShelfGeometry,
  normalizeShelfParams,
  validateShelf,
} from "./products/shelf";
import {
  generateSideTableBOM,
  generateSideTableGeometry,
  normalizeSideTableParams,
  validateSideTable,
} from "./products/side-table";
import {
  generateTableBOM,
  generateTableGeometry,
  normalizeTableParams,
  validateTable,
} from "./products/table";

export const productRegistry: Record<ProductSlug, ProductDefinitionRuntime> = {
  "side-table": {
    slug: "side-table",
    normalizeParams: (params: AnyProductParams) =>
      normalizeSideTableParams(params as Extract<AnyProductParams, { productSlug: "side-table" }>),
    validate: (params: AnyProductParams) =>
      validateSideTable(params as Extract<AnyProductParams, { productSlug: "side-table" }>),
    generateGeometry: (params: AnyProductParams) =>
      generateSideTableGeometry(params as Extract<AnyProductParams, { productSlug: "side-table" }>),
    generateBOM: (params: AnyProductParams) =>
      generateSideTableBOM(params as Extract<AnyProductParams, { productSlug: "side-table" }>),
  },
  table: {
    slug: "table",
    normalizeParams: (params: AnyProductParams) =>
      normalizeTableParams(params as Extract<AnyProductParams, { productSlug: "table" }>),
    validate: (params: AnyProductParams) =>
      validateTable(params as Extract<AnyProductParams, { productSlug: "table" }>),
    generateGeometry: (params: AnyProductParams) =>
      generateTableGeometry(params as Extract<AnyProductParams, { productSlug: "table" }>),
    generateBOM: (params: AnyProductParams) =>
      generateTableBOM(params as Extract<AnyProductParams, { productSlug: "table" }>),
  },
  chair: {
    slug: "chair",
    normalizeParams: (params: AnyProductParams) =>
      normalizeChairParams(params as Extract<AnyProductParams, { productSlug: "chair" }>),
    validate: (params: AnyProductParams) =>
      validateChair(params as Extract<AnyProductParams, { productSlug: "chair" }>),
    generateGeometry: (params: AnyProductParams) =>
      generateChairGeometry(params as Extract<AnyProductParams, { productSlug: "chair" }>),
    generateBOM: (params: AnyProductParams) =>
      generateChairBOM(params as Extract<AnyProductParams, { productSlug: "chair" }>),
  },
  shelf: {
    slug: "shelf",
    normalizeParams: (params: AnyProductParams) =>
      normalizeShelfParams(params as Extract<AnyProductParams, { productSlug: "shelf" }>),
    validate: (params: AnyProductParams) =>
      validateShelf(params as Extract<AnyProductParams, { productSlug: "shelf" }>),
    generateGeometry: (params: AnyProductParams) =>
      generateShelfGeometry(params as Extract<AnyProductParams, { productSlug: "shelf" }>),
    generateBOM: (params: AnyProductParams) =>
      generateShelfBOM(params as Extract<AnyProductParams, { productSlug: "shelf" }>),
  },
};
