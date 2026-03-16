"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSavedDesignsStore } from "@/lib/saved-designs-store";
import { useBenchStore } from "@/lib/bench-store";
import { PRODUCT_ORDER, WOOD_SPECIES } from "@cambium/shared";

export default function SavedDesignsPage() {
  const designs = useSavedDesignsStore((s) => s.designs);
  const deleteDesign = useSavedDesignsStore((s) => s.deleteDesign);
  const hydrate = useSavedDesignsStore((s) => s.hydrate);
  const addToBench = useBenchStore((s) => s.addItem);
  const hydrateBench = useBenchStore((s) => s.hydrate);
  const [hydrated, setHydrated] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    hydrate();
    hydrateBench();
    setHydrated(true);
  }, [hydrate, hydrateBench]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm text-stone-400">Loading...</div>
      </div>
    );
  }

  if (designs.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6">
        <div className="mx-auto max-w-md text-center">
          <div className="mb-4 text-4xl">📐</div>
          <h1 className="mb-2 text-2xl font-light text-stone-900">
            No saved designs yet
          </h1>
          <p className="mb-6 text-sm text-stone-500">
            Save designs from the configurator to revisit them later.
          </p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-stone-900 px-6 py-2.5 text-sm text-white transition-colors hover:bg-stone-800"
          >
            Start designing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-light text-stone-900">
        Saved Designs
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {designs.map((design) => {
          const product = PRODUCT_ORDER.find((p) => p.slug === design.productSlug);
          const species = WOOD_SPECIES.find((s) => s.id === design.params.woodSpecies);
          const isAdded = addedId === design.id;

          return (
            <div
              key={design.id}
              className="overflow-hidden rounded-2xl border border-stone-200 bg-white"
            >
              {/* Color header */}
              <div
                className="h-16"
                style={{ backgroundColor: species?.color ?? "#c4a872" }}
              />

              <div className="p-5">
                <div className="mb-1 text-sm font-medium text-stone-900">
                  {design.name}
                </div>
                <div className="mb-1 text-xs text-stone-500">
                  {product?.label ?? design.productSlug}
                </div>
                <div className="mb-3 text-xs text-stone-400">
                  {species?.name} &middot; {design.params.finish} &middot; $
                  {design.cost}
                </div>
                <div className="mb-3 text-[10px] text-stone-300">
                  Saved{" "}
                  {new Date(design.savedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/configure/${design.productSlug}?loadDesign=${design.id}`}
                    className="flex-1 rounded-lg border border-stone-200 py-2 text-center text-xs text-stone-700 transition-colors hover:border-stone-400"
                  >
                    Open
                  </Link>
                  <button
                    onClick={() => {
                      addToBench({
                        productSlug: design.productSlug,
                        params: design.params,
                        cost: design.cost,
                        designName: design.name,
                      });
                      setAddedId(design.id);
                      setTimeout(() => setAddedId(null), 2000);
                    }}
                    className={`flex-1 rounded-lg py-2 text-center text-xs transition-colors ${
                      isAdded
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-stone-900 text-white hover:bg-stone-800"
                    }`}
                  >
                    {isAdded ? "✓ Added!" : "Add to Bench"}
                  </button>
                  <button
                    onClick={() => deleteDesign(design.id)}
                    className="rounded-lg border border-stone-200 px-3 py-2 text-xs text-red-500 transition-colors hover:border-red-300 hover:bg-red-50"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
