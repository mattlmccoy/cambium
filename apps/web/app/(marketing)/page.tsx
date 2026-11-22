"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LAUNCH_PRODUCTS, getLaunchWoods, REGIONS, REGION_STORIES, SPECIES_STORIES, getWoodSuitability } from "@cambium/shared";
import { computeConfiguration, DEFAULT_COST_MODEL } from "@cambium/config-engine";
import { useRegionStore } from "@/lib/region-store";
import { ZipEntry } from "@/components/ZipEntry";
import { CambiumLogoMark } from "@/components/CambiumLogo";

// ─── Animation variants ──────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardHover = {
  rest: { scale: 1 },
  hover: { scale: 1.02, transition: { duration: 0.3, ease: "easeOut" } },
};

// ─── Region Story Component ─────────────────────────────────────

function RegionShowcase({ regionId }: { regionId: string }) {
  const region = REGIONS.find((r) => r.id === regionId);
  const story = REGION_STORIES[regionId];
  const localSpecies = getLaunchWoods(regionId);

  if (!region || !story) return null;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={stagger}
    >
      <motion.div
        variants={fadeUp}
        className="rounded-3xl bg-white/70 p-8 shadow-sm backdrop-blur"
      >
        <div className="mb-1 text-xs uppercase tracking-[0.3em] text-stone-400">
          Your region
        </div>
        <h2 className="font-display mb-2 text-2xl text-stone-900">
          {story.headline}
        </h2>
        <p className="mb-6 max-w-2xl text-sm leading-relaxed text-stone-600">
          {story.story}
        </p>

        <div className="mb-2 text-xs font-medium uppercase tracking-wider text-stone-400">
          Selected local hardwoods
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
      </motion.div>
    </motion.div>
  );
}

// ─── Product Card with Regional Pricing ─────────────────────────

function useRegionalStartingPrice(regionId: string) {
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const newPrices: Record<string, number> = {};
    for (const product of LAUNCH_PRODUCTS) {
      const woods = getLaunchWoods(regionId);
      if (!woods.length) continue;
      const cheapestWood = woods[0].id;
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
        newPrices[product.slug] = Math.min(result.cost.total, ...woods.slice(1).map(wood =>
          computeConfiguration(product.slug, { ...params, woodSpecies: wood.id }, { ...DEFAULT_COST_MODEL, regionId }).cost.total
        ));
      } catch {
        // No price is shown when the configured estimate is unavailable.
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

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_rgba(244,240,235,0.95)_42%,_#e5ddd3_100%)]">
      {/* Hero */}
      <div className="px-6 pb-8 pt-12">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="mb-8 max-w-2xl"
          >
            <motion.h1
              variants={fadeUp}
              className="font-display mb-4 text-4xl leading-tight tracking-tight text-stone-900 sm:text-5xl lg:text-6xl"
            >
              Solid wood furniture.{" "}
              <span className="text-stone-500">Made to pack flat.</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mb-6 text-lg leading-relaxed text-stone-600"
            >
              Coffee and side tables in regional hardwoods. Compare woods, check dimensions and view each design in 3D. Products and regional production are in development.
            </motion.p>
            <motion.div variants={fadeUp}>
              <ZipEntry />
            </motion.div>
          </motion.div>
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
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="mb-6 text-xl font-light text-stone-800"
            >
              {isDetected ? "Tables in your region" : "The collection"}
            </motion.h2>

            <div className="grid gap-5 md:grid-cols-2">
              {LAUNCH_PRODUCTS.map((product) => {
                const startingPrice = prices[product.slug];

                // Find top recommended local woods for this product
                const localSpecies = getLaunchWoods(regionId);
                const bestWoods = localSpecies
                  .filter((s) => getWoodSuitability(product.slug, s.hardness).rating === "recommended")
                  .sort((a, b) => b.hardness - a.hardness)
                  .slice(0, 2);

                return (
                  <motion.div key={product.slug} variants={fadeUp} className="flex">
                    <motion.div
                      initial="rest"
                      whileHover="hover"
                      variants={cardHover}
                      className="flex w-full"
                    >
                      <Link
                        href={`/configure/${product.slug}`}
                        className="group flex w-full flex-col overflow-hidden rounded-[28px] border border-white/50 bg-white/60 shadow-[0_24px_60px_rgba(66,44,22,0.12)] backdrop-blur transition-shadow hover:shadow-[0_24px_60px_rgba(66,44,22,0.2)]"
                      >
                        <div className="relative aspect-[6/5] shrink-0 overflow-hidden bg-[#e9e6df]">
                          <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/images/collection/${product.slug}.png`} alt={`${product.displayName}: ${product.label.toLowerCase()} in hardwood with a recessed steel frame`}
                            fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                        </div>
                        <div className="px-6 pt-5">
                          <div className="text-xs uppercase tracking-[.18em] text-stone-500">{product.slug === "table" ? "Coffee table" : product.label}</div>
                          <div className="font-display mt-1 text-3xl text-stone-900">{product.displayName}</div>
                          <div className="mt-1 text-sm text-stone-500">{product.tagline}</div>
                        </div>
                        {/* Card body — flex-1 so all cards match height */}
                        <div className="flex flex-1 flex-col justify-between p-6">
                          <div className="space-y-3">
                            <div className="text-sm leading-relaxed text-stone-600">
                              {product.anatomyDescription}
                            </div>
                            {isDetected && bestWoods.length > 0 && (
                              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700">
                                <span className="font-medium">Local hardwoods:</span>
                                {bestWoods.map((w) => (
                                  <span key={w.id} className="flex items-center gap-1">
                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: w.color }} />
                                    {w.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4 text-sm">
                            <span className="font-medium text-stone-900">
                              {startingPrice ? `Est. from $${startingPrice}` : "Assortment coming soon"}
                            </span>
                            <span className="text-stone-400 transition-transform group-hover:translate-x-1">
                              Choose your wood
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      <section className="mx-auto mb-16 grid max-w-6xl items-center gap-8 px-6 md:grid-cols-2" aria-label="The chair in development"><Link href="/design-lab/chair"><img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/chair-07/hero.jpg`} width={1200} height={1200} alt="Hardwood chair with a concealed steel frame" className="rounded-[28px]"/></Link><div><p className="text-sm uppercase tracking-widest text-stone-500">Coming next</p><h2 className="mt-3 font-display text-4xl">The chair.</h2><p className="mt-4 leading-relaxed text-stone-600">A hardwood seat and back over a concealed steel frame. The chair is in development; joints, comfort and strength still need testing.</p><Link href="/design-lab/chair" className="mt-5 inline-block underline underline-offset-4">Explore the chair</Link></div></section>
      {/* How it works — visual step strip */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger}
        className="border-t border-stone-200/50 bg-stone-900 px-6 py-16"
      >
        <div className="mx-auto max-w-6xl">
          <motion.div variants={fadeUp} className="mb-8">
            <span className="text-xs uppercase tracking-[0.3em] text-white/40">How It Works</span>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: "01", icon: "M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z", title: "Enter your ZIP", desc: "See the proposed wood selection for your region." },
              { step: "02", icon: "M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25", title: "Design in 3D", desc: "Compare woods and check the dimensions." },
              { step: "03", icon: "M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085", title: "Regional production", desc: "We plan to machine the wood parts at regional workshops." },
              { step: "04", icon: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12", title: "Flat packing", desc: "Removable parts reduce the space needed for shipping." },
            ].map((item) => (
              <motion.div
                key={item.step}
                variants={fadeUp}
                className="group rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                    <svg className="h-4.5 w-4.5 text-white/70" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                  </div>
                  <span className="text-xl font-light text-white/20">{item.step}</span>
                </div>
                <div className="mb-1.5 text-sm font-medium text-white">
                  {item.title}
                </div>
                <p className="text-xs leading-relaxed text-white/50">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="bg-stone-50/80 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            {/* Brand */}
            <div className="max-w-xs">
              <div className="mb-3 flex items-center gap-2">
                <CambiumLogoMark size={20} color="#78716c" />
                <span className="flex items-baseline gap-1">
                  <span className="text-sm font-light tracking-[0.15em] text-stone-700">CAMBIUM</span>
                  <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-stone-400">Design</span>
                </span>
              </div>
              <p className="text-xs leading-relaxed text-stone-400">
                Furniture with roots. Considered designs for locally-sourced hardwood and regional fabrication.
              </p>
            </div>

            {/* Links */}
            <div className="flex gap-12 text-xs">
              <div>
                <div className="mb-2 font-medium uppercase tracking-wider text-stone-400">Products</div>
                <div className="space-y-1.5">
                  {LAUNCH_PRODUCTS.map((p) => (
                    <div key={p.slug}>
                      <Link href={`/configure/${p.slug}`} className="text-stone-500 transition-colors hover:text-stone-900">
                        {p.displayName}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 font-medium uppercase tracking-wider text-stone-400">Company</div>
                <div className="space-y-1.5">
                  <div><Link href="/our-story" className="text-stone-500 transition-colors hover:text-stone-900">Our Story</Link></div>
                  <div><Link href="/bench" className="text-stone-500 transition-colors hover:text-stone-900">My Bench</Link></div>
                  <div><Link href="/saved-designs" className="text-stone-500 transition-colors hover:text-stone-900">Saved Designs</Link></div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-stone-200/60 pt-6">
            <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
              <span className="text-[10px] text-stone-400">
                Two designs &middot; local hardwood &middot; one natural finish
              </span>
              <span className="text-[10px] text-stone-300">
                &copy; {new Date().getFullYear()} Cambium Design
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
