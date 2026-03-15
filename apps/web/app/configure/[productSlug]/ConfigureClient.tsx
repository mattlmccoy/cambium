"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect } from "react";
import { ControlPanel } from "@/components/configurator/ControlPanel";
import { useConfiguratorStore } from "@/lib/configurator-store";
import { useRegionStore } from "@/lib/region-store";
import { isProductSlug } from "@cambium/shared";

const ConfiguratorScene = dynamic(
  () =>
    import("@/components/configurator/Scene").then(
      (mod) => mod.ConfiguratorScene
    ),
  { ssr: false, loading: () => <SceneLoading /> }
);

function SceneLoading() {
  return (
    <div className="flex min-h-[400px] h-full w-full items-center justify-center rounded-xl bg-stone-100">
      <div className="text-sm text-stone-400">Loading 3D viewer...</div>
    </div>
  );
}

export default function ConfigureClient({ productSlug }: { productSlug: string }) {
  const setProduct = useConfiguratorStore((state) => state.setProduct);
  const product = useConfiguratorStore((state) => state.product);
  const regionId = useRegionStore((state) => state.regionId);
  const hydrate = useRegionStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (productSlug && isProductSlug(productSlug)) {
      setProduct(productSlug, regionId);
    }
  }, [productSlug, setProduct, regionId]);

  if (!productSlug || !isProductSlug(productSlug)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 p-8">
        <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
          <h1 className="mb-2 text-2xl font-light text-stone-900">Unknown product</h1>
          <p className="mb-6 text-sm text-stone-500">
            This configurator route only supports side-table, table, chair, and shelf.
          </p>
          <Link href="/" className="rounded-lg bg-stone-900 px-4 py-2 text-sm text-white">
            Back to catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4">
        <Link href="/" className="text-lg font-light tracking-wide text-stone-900">
          CAMBIUM
        </Link>
        <div className="text-right">
          <div className="text-sm font-medium text-stone-900">{product.label}</div>
          <div className="text-xs text-stone-500">{product.sku}</div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="flex w-[390px] flex-col overflow-hidden border-r border-stone-200 bg-white">
          <ControlPanel />
        </aside>
        <main className="flex-1 bg-stone-50 p-6">
          <ConfiguratorScene />
        </main>
      </div>
    </div>
  );
}
