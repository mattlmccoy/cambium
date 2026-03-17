"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { REGIONS, WOOD_SPECIES, getSpeciesForRegion } from "@cambium/shared";
import { ZipEntry } from "@/components/ZipEntry";
import { CambiumLogoMark } from "@/components/CambiumLogo";
import { useRegionStore } from "@/lib/region-store";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

const CambiumMap = dynamic(
  () => import("@/components/CambiumMap").then((mod) => mod.CambiumMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[400px] items-center justify-center rounded-xl bg-white/5">
        <span className="text-sm text-white/30">Loading map...</span>
      </div>
    ),
  }
);

// ─── Shared animation variants ─────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

// ─── Network Section (with map) ──────────────────────────────────

function NetworkSection({
  focusedHub,
  setFocusedHub,
  externalFocusId,
  mapRef,
}: {
  focusedHub: string | null;
  setFocusedHub: (id: string | null) => void;
  externalFocusId: string | null;
  mapRef: React.RefObject<HTMLDivElement | null>;
}) {
  const regionId = useRegionStore((s) => s.regionId);
  const isDetected = useRegionStore((s) => s.isDetected);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Auto-scroll to focused card on mobile / when off-screen
  useEffect(() => {
    if (focusedHub && cardRefs.current[focusedHub]) {
      cardRefs.current[focusedHub]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [focusedHub]);

  return (
    <section className="bg-stone-900 px-6 py-24 text-white">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="mb-8">
            <span className="text-xs uppercase tracking-[0.3em] text-white/50">
              Our Network
            </span>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="font-display mb-8 text-3xl sm:text-4xl"
          >
            10 workshops. 27 species. Your region.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mb-12 text-sm text-white/50"
          >
            Click a workshop to see its pricing tiers. Hover to view local wood species.
          </motion.p>

          <motion.div variants={fadeIn} ref={mapRef}>
            <CambiumMap
              userRegionId={isDetected ? regionId : undefined}
              onFocusChange={setFocusedHub}
              focusRegionId={externalFocusId}
            />
          </motion.div>

          {/* Region list below map */}
          <motion.div
            variants={stagger}
            className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
          >
            {REGIONS.map((region) => {
              const species = getSpeciesForRegion(region.id);
              const isFocused = focusedHub === region.id;
              const regionColor = isFocused
                ? (REGION_COLORS_MAP[region.id] ?? "rgba(255,255,255,0.2)")
                : undefined;

              return (
                <motion.div
                  key={region.id}
                  ref={(el) => { cardRefs.current[region.id] = el; }}
                  variants={fadeUp}
                  className={`rounded-xl border p-4 transition-all duration-300 ${
                    isFocused
                      ? "border-white/30 bg-white/10 ring-1 ring-white/20 scale-[1.03]"
                      : focusedHub
                        ? "border-white/5 bg-white/[0.02] opacity-50"
                        : "border-white/10 bg-white/5"
                  }`}
                  style={isFocused ? { borderColor: regionColor } : undefined}
                >
                  <div className={`mb-1 text-sm font-medium transition-colors duration-300 ${isFocused ? "text-white" : ""}`}>
                    {region.city}
                  </div>
                  <div className={`mb-2 text-xs transition-colors duration-300 ${isFocused ? "text-white/60" : "text-white/40"}`}>
                    {region.name}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {species.slice(0, 4).map((s) => (
                      <span
                        key={s.id}
                        className="h-3 w-3 rounded-full transition-opacity duration-300"
                        style={{
                          backgroundColor: s.color,
                          opacity: isFocused ? 1 : focusedHub ? 0.4 : 0.8,
                        }}
                        title={s.name}
                      />
                    ))}
                    {species.length > 4 && (
                      <span className={`text-[10px] transition-colors duration-300 ${isFocused ? "text-white/50" : "text-white/30"}`}>
                        +{species.length - 4}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// Region colors for card highlight borders (matches CambiumMap)
const REGION_COLORS_MAP: Record<string, string> = {
  seattle:     "#c9a87c",
  sacramento:  "#8c6b53",
  phoenix:     "#a07058",
  denver:      "#95a0b0",
  austin:      "#c09562",
  minneapolis: "#d4c5a8",
  chicago:     "#7a6050",
  pittsburgh:  "#b06850",
  boston:       "#c8b088",
  atlanta:     "#c4a868",
};

// ─── Page ───────────────────────────────────────────────────────

export default function OurStoryPage() {
  const hydrate = useRegionStore((s) => s.hydrate);
  const router = useRouter();
  const [focusedHub, setFocusedHub] = useState<string | null>(null);
  const [externalFocusId, setExternalFocusId] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="relative min-h-screen bg-stone-50">
      {/* Skip to store */}
      <Link
        href="/"
        className="fixed right-6 top-20 z-50 rounded-full bg-white/80 px-4 py-2 text-xs font-medium text-stone-500 shadow-sm backdrop-blur transition-colors hover:text-stone-900"
      >
        Skip to store →
      </Link>

      {/* ─── Section 1: Hero ─────────────────────────────────── */}
      <section className="flex min-h-[85vh] flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="mx-auto max-w-3xl"
        >
          <motion.div variants={fadeUp} className="mb-4 flex items-center justify-center gap-2">
            <CambiumLogoMark size={18} color="#a8a29e" />
            <span className="text-xs uppercase tracking-[0.4em] text-stone-400">
              Cambium Design
            </span>
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="font-display mb-6 text-5xl leading-tight tracking-tight text-stone-900 sm:text-6xl"
          >
            Furniture with roots
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-stone-600"
          >
            We believe every piece of furniture should tell a story &mdash;
            where the wood grew, who shaped it, and the community it supports.
          </motion.p>
          <motion.div variants={fadeUp}>
            <svg
              className="mx-auto text-stone-300"
              width="24"
              height="48"
              viewBox="0 0 24 48"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 4v36M6 34l6 8 6-8" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Section 2: The Problem ────────────────────────── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="mb-8">
              <span className="text-xs uppercase tracking-[0.3em] text-stone-400">
                The Problem
              </span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="font-display mb-6 text-3xl text-stone-900 sm:text-4xl"
            >
              Furniture shouldn&apos;t cross an ocean to reach your living room
            </motion.h2>
            <motion.div variants={fadeUp} className="space-y-4 text-stone-600">
              <p className="text-lg leading-relaxed">
                Most furniture sold in the US is manufactured overseas, shipped thousands of miles
                in containers, and assembled from materials of unknown origin. The carbon footprint
                is massive, local craftspeople are cut out, and when something breaks, you throw it away.
              </p>
              <p className="text-lg leading-relaxed">
                Meanwhile, American forests produce exceptional hardwoods that go underutilized,
                and skilled woodworkers across the country struggle to compete with global pricing.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Section 3: Our Solution ───────────────────────── */}
      <section className="bg-stone-900 px-6 py-24 text-white">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="mb-8">
              <span className="text-xs uppercase tracking-[0.3em] text-white/50">
                Our Solution
              </span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="mb-6 text-3xl font-light sm:text-4xl"
            >
              A network of 10 microfactories across the US
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mb-12 text-lg leading-relaxed text-white/70"
            >
              Instead of one massive factory overseas, we operate small CNC workshops
              in major metro areas. Each one sources wood from local mills, cuts panels
              to your exact specifications, and ships your order in days, not weeks.
            </motion.p>

            <motion.div
              variants={stagger}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
            >
              {REGIONS.slice(0, 10).map((region) => (
                <motion.div
                  key={region.id}
                  variants={fadeUp}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="text-sm font-medium">{region.city}</div>
                  <div className="text-xs text-white/50">{region.state}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Section 4: How It Works ───────────────────────── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="mb-8">
              <span className="text-xs uppercase tracking-[0.3em] text-stone-400">
                How It Works
              </span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="font-display mb-12 text-3xl text-stone-900 sm:text-4xl"
            >
              Four steps to your custom piece
            </motion.h2>

            <div className="grid gap-8 sm:grid-cols-2">
              {[
                {
                  step: "01",
                  title: "Enter your ZIP",
                  desc: "We detect your nearest microfactory and show you the local wood species available in your region.",
                },
                {
                  step: "02",
                  title: "Design in 3D",
                  desc: "Use our real-time configurator to choose dimensions, wood species, finish, and style. See every change instantly.",
                },
                {
                  step: "03",
                  title: "We CNC-cut your panels",
                  desc: "Your local workshop sources lumber from nearby mills and precision-cuts every panel on a CNC router.",
                },
                {
                  step: "04",
                  title: "Flat-pack to your door",
                  desc: "Your furniture ships in a slim box with a fold-flat steel frame. Unfold, attach panels, done. One hex key.",
                },
              ].map((item) => (
                <motion.div
                  key={item.step}
                  variants={fadeUp}
                  className="rounded-2xl border border-stone-200 bg-white p-6"
                >
                  <div className="mb-3 text-3xl font-light text-stone-300">
                    {item.step}
                  </div>
                  <div className="mb-2 text-lg font-medium text-stone-900">
                    {item.title}
                  </div>
                  <p className="text-sm leading-relaxed text-stone-500">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Section 5: The Core System ────────────────────── */}
      <section className="bg-stone-100 px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="mb-8">
              <span className="text-xs uppercase tracking-[0.3em] text-stone-400">
                The Core System
              </span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="font-display mb-6 text-3xl text-stone-900 sm:text-4xl"
            >
              One engineered frame. Infinite wood combinations.
            </motion.h2>
            <motion.div variants={fadeUp} className="space-y-4 text-stone-600">
              <p className="text-lg leading-relaxed">
                Every Cambium piece is built on a standardized fold-flat steel subframe &mdash;
                precision-welded steel rods with a matte black powder coat. This frame is the
                skeleton that makes flat-pack assembly possible without sacrificing rigidity.
              </p>
              <p className="text-lg leading-relaxed">
                The wood panels are the face of your furniture. They slide, clip, and bolt onto
                the steel core. Because the core is universal, you can swap, upgrade, or replace
                panels anytime &mdash; a new wood species, a fresh finish, or a different size altogether.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Section 6: Why Local Wood ─────────────────────── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="mb-8">
              <span className="text-xs uppercase tracking-[0.3em] text-stone-400">
                Why Local Wood
              </span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="font-display mb-12 text-3xl text-stone-900 sm:text-4xl"
            >
              Wood with a story
            </motion.h2>

            <motion.div variants={stagger} className="grid gap-6 sm:grid-cols-3">
              {[
                {
                  title: "Lower carbon footprint",
                  desc: "Wood travels hundreds of miles, not thousands. No container ships, no cross-country trucking for raw materials.",
                },
                {
                  title: "Local forestry jobs",
                  desc: "Every order supports regional mills and sustainable forest management practices in your part of the country.",
                },
                {
                  title: "Know your wood",
                  desc: "We can tell you which region your lumber came from, what species it is, and why it grows there. That's a story worth telling.",
                },
              ].map((item) => (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  className="rounded-2xl border border-stone-200 bg-white p-6"
                >
                  <div className="mb-2 text-sm font-medium text-stone-900">
                    {item.title}
                  </div>
                  <p className="text-sm leading-relaxed text-stone-500">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Section 7: Our Network (Interactive Map) ──────── */}
      <NetworkSection
        focusedHub={focusedHub}
        setFocusedHub={setFocusedHub}
        externalFocusId={externalFocusId}
        mapRef={mapRef}
      />

      {/* ─── Section 8: CTA ────────────────────────────────── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="font-display mb-4 text-3xl text-stone-900 sm:text-4xl"
            >
              Ready to design your first piece?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mb-8 text-lg text-stone-600"
            >
              Enter your ZIP to find your local workshop and see it highlighted on the map above.
            </motion.p>
            <motion.div variants={fadeUp} className="flex justify-center">
              <ZipEntry
                onDetected={(detectedRegionId) => {
                  setExternalFocusId(detectedRegionId);
                  setFocusedHub(detectedRegionId);
                  // Scroll to map section
                  setTimeout(() => {
                    mapRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }, 100);
                }}
              />
            </motion.div>
            <motion.div variants={fadeUp} className="mt-6">
              <Link
                href="/"
                className="text-sm text-stone-400 underline decoration-stone-300 underline-offset-4 hover:text-stone-600"
              >
                or browse the collection →
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
