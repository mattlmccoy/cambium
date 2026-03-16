"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useBenchStore } from "@/lib/bench-store";
import { PRODUCT_ORDER, REGIONS, WOOD_SPECIES } from "@cambium/shared";

export default function BenchPage() {
  const items = useBenchStore((s) => s.items);
  const removeItem = useBenchStore((s) => s.removeItem);
  const clearBench = useBenchStore((s) => s.clearBench);
  const hydrate = useBenchStore((s) => s.hydrate);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    hydrate();
    setHydrated(true);
  }, [hydrate]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm text-stone-400">Loading...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6">
        <div className="mx-auto max-w-md text-center">
          <div className="mb-4 text-4xl">🪑</div>
          <h1 className="mb-2 text-2xl font-light text-stone-900">
            Your bench is empty
          </h1>
          <p className="mb-6 text-sm text-stone-500">
            Add designs from the configurator to see them here.
          </p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-stone-900 px-6 py-2.5 text-sm text-white transition-colors hover:bg-stone-800"
          >
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  const total = items.reduce((sum, item) => sum + item.cost, 0);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-light text-stone-900">My Bench</h1>
        <span className="text-sm text-stone-500">
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="space-y-4">
        {items.map((item) => {
          const product = PRODUCT_ORDER.find((p) => p.slug === item.productSlug);
          const region = REGIONS.find((r) => r.id === item.params.regionId);
          const species = WOOD_SPECIES.find((s) => s.id === item.params.woodSpecies);

          return (
            <div
              key={item.id}
              className="flex items-center gap-6 rounded-2xl border border-stone-200 bg-white p-5"
            >
              {/* Color swatch */}
              <div
                className="h-12 w-12 shrink-0 rounded-xl"
                style={{ backgroundColor: species?.color ?? "#c4a872" }}
              />

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-medium text-stone-900">
                    {product?.label ?? item.productSlug}
                  </span>
                  {item.designName && (
                    <span className="text-xs text-stone-400">
                      &ldquo;{item.designName}&rdquo;
                    </span>
                  )}
                </div>
                <div className="text-xs text-stone-500">
                  {species?.name ?? item.params.woodSpecies} &middot;{" "}
                  {item.params.finish} &middot;{" "}
                  {region?.name ?? item.params.regionId}
                </div>
              </div>

              {/* Price */}
              <div className="text-right">
                <div className="text-lg font-light text-stone-900">
                  ${item.cost}
                </div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 gap-2">
                <Link
                  href={`/configure/${item.productSlug}?loadBench=${item.id}`}
                  className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs text-stone-600 transition-colors hover:border-stone-400"
                >
                  Edit
                </Link>
                <button
                  onClick={() => removeItem(item.id)}
                  className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs text-red-500 transition-colors hover:border-red-300 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-8 flex items-center justify-between rounded-2xl bg-stone-100 p-6">
        <div>
          <div className="text-sm text-stone-500">Total</div>
          <div className="text-3xl font-light text-stone-900">${total}</div>
        </div>
        <div className="flex gap-3">
          <Link
            href="/"
            className="rounded-lg border border-stone-200 bg-white px-5 py-2.5 text-sm text-stone-700 transition-colors hover:border-stone-400"
          >
            Continue shopping
          </Link>
          <button
            className="rounded-lg bg-stone-900 px-5 py-2.5 text-sm text-white transition-colors hover:bg-stone-800"
            onClick={() => {
              // Checkout placeholder
              alert("Checkout coming soon!");
            }}
          >
            Proceed to checkout
          </button>
        </div>
      </div>
    </div>
  );
}
