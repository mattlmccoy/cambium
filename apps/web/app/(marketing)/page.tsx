"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PRODUCT_ORDER, REGIONS, WOOD_SPECIES, getSpeciesForRegion, REGION_STORIES, SPECIES_STORIES, getCheapestLocalSpecies, getEffectiveWoodPrice } from "@cambium/shared";
import { computeConfiguration, DEFAULT_COST_MODEL } from "@cambium/config-engine";
import { useRegionStore } from "@/lib/region-store";
import { ZipEntry } from "@/components/ZipEntry";

// ─── First Visit Redirect ─────────────────────────────────────────

const VISITED_KEY = "cambium-visited";

function useFirstVisitRedirect() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const visited = localStorage.getItem(VISITED_KEY);
    if (!visited) {
      localStorage.setItem(VISITED_KEY, "true");
      router.replace("/our-story");
    } else {
      setChecked(true);
    }
  }, [router]);

  return checked;
}

// ─── Region Story Component ─────────────────────────────────────

function RegionShowcase({ regionId }: { regionId: string }) {
  const region = REGIONS.find((r) => r.id === regionId);
  const story = REGION_STORIES[regionId];
  const localSpecies = getSpeciesForRegion(regionId);

  if (!region || !story) return null;

  return (
    <div className="rounded-3xl bg-white/70 p-8 shadow-sm backdrop-blur">
      <div className="mb-1 text-xs uppercase tracking-[0.3em] text-stone-400">
        Your Workshop
      </div>
      <h2 className="mb-2 text-2xl font-light text-stone-900">
        {story.headline}
      </h2>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-stone-600">
        {story.story}
      </p>

      <div className="mb-2 text-xs font-medium uppercase tracking-wider text-stone-400">
        Local Wood Species
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {localSpecies.map((species) => {
          const speciesStory = SPECIES_STORIES[species.id];
          return (
            <div
              key={species.id}
              className="rounded-xl border border-stone-100 bg-white/90 p-3"
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="h-5 w-5 rounded-full shadow-inner"
                  style={{ backgroundColor: species.color }}
                />
                <span className="text-sm font-medium text-stone-800">
                  {species.name}
                </span>
              </div>
              {speciesStory && (
                <p className="text-[11px] leading-snug text-stone-500">
                  {speciesStory.character.split(".")[0]}.
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-xs text-stone-400">
        {story.forestFact}
      </div>
    </div>
  );
}

// ─── Product Card with Regional Pricing ─────────────────────────

const CARD_STYLES = [
  "from-stone-900 via-stone-700 to-amber-600",
  "from-emerald-900 via-teal-700 to-amber-500",
  "from-slate-900 via-zinc-700 to-rose-500",
  "from-indigo-950 via-sky-800 to-cyan-500",
];

function useRegionalStartingPrice(regionId: string) {
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const newPrices: Record<string, number> = {};
    for (const product of PRODUCT_ORDER) {
      const cheapestWood = getCheapestLocalSpecies(regionId, WOOD_SPECIES);
      const params = {
        ...product.defaults,
        regionId,
        woodSpecies: cheapestWood,
        finish: "natural-oil" as const,
      };
      try {
        const result = computeConfiguration(
          product.slug,
          params,
          { ...DEFAULT_COST_MODEL, regionId }
        );
        newPrices[product.slug] = result.cost.total;
      } catch {
        newPrices[product.slug] = product.priceBand.min;
      }
    }
    setPrices(newPrices);
  }, [regionId]);

  return prices;
}

// ─── Main Landing Page ──────────────────────────────────────────

export default function Home() {
  const { regionId, isDetected, hydrate } = useRegionStore();
  const prices = useRegionalStartingPrice(regionId);
  const ready = useFirstVisitRedirect();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Don't render until we've checked first-visit status
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="text-sm text-stone-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_rgba(244,240,235,0.95)_42%,_#e5ddd3_100%)]">
      {/* Hero */}
      <div className="px-6 pb-8 pt-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 max-w-2xl">
            <h1 className="mb-4 text-4xl font-light leading-tight tracking-tight text-stone-900 sm:text-5xl">
              Designed by you. Built near you.
            </h1>
            <p className="mb-6 text-lg leading-relaxed text-stone-600">
              Custom solid wood furniture, crafted at a microfactory in your region from locally-sourced lumber. Design it in 3D, and it ships flat-packed to your door.
            </p>
            <ZipEntry />
          </div>
        </div>
      </div>

      {/* Region story (shown after ZIP detection) */}
      {isDetected && (
        <div className="px-6 pb-8">
          <div className="mx-auto max-w-6xl">
            <RegionShowcase regionId={regionId} />
          </div>
        </div>
      )}

      {/* Product catalog */}
      <div className="px-6 pb-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <h2 className="text-xl font-light text-stone-800">
              {isDetected ? "Build something with local wood" : "Explore our collection"}
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {PRODUCT_ORDER.map((product, index) => {
              const startingPrice = prices[product.slug];

              return (
                <Link
                  key={product.slug}
                  href={`/configure/${product.slug}`}
                  className="group overflow-hidden rounded-[28px] border border-white/50 bg-white/60 shadow-[0_24px_60px_rgba(66,44,22,0.12)] backdrop-blur transition-shadow hover:shadow-[0_24px_60px_rgba(66,44,22,0.2)]"
                >
                  <div
                    className={`h-48 bg-gradient-to-br ${CARD_STYLES[index]} p-6 text-white`}
                  >
                    <div className="flex h-full flex-col justify-between">
                      <span className="text-xs uppercase tracking-[0.25em] text-white/70">
                        {product.sku}
                      </span>
                      <div>
                        <div className="mb-2 text-3xl font-light">
                          {product.label}
                        </div>
                        <div className="text-sm text-white/75">
                          {product.description}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 p-6">
                    <div className="text-sm text-stone-600">
                      {product.core.summary}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-stone-900">
                        {startingPrice ? `From $${startingPrice}` : `$${product.priceBand.min} – $${product.priceBand.max}`}
                      </span>
                      <span className="text-stone-400 transition-transform group-hover:translate-x-1">
                        Design yours →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Brand footer */}
      <div className="border-t border-stone-200/50 bg-stone-50/50 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-stone-400">
                How It Works
              </div>
              <p className="text-sm text-stone-600">
                Enter your ZIP code. We find the nearest workshop and show you the local wood species available. Design your piece in 3D, and your local microfactory builds it from locally-sourced lumber.
              </p>
            </div>
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-stone-400">
                The Core System
              </div>
              <p className="text-sm text-stone-600">
                Every piece shares a precision-engineered fold-flat steel frame. It ships in a slim box alongside your wood panels. Unfold, attach panels with one hex key, done.
              </p>
            </div>
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-stone-400">
                Why Local Wood
              </div>
              <p className="text-sm text-stone-600">
                Shorter supply chains mean fresher wood, lower carbon footprint, and support for local forestry jobs. Plus, you get to tell the story of where your furniture came from.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
