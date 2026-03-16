"use client";

import { useState, useMemo, useCallback } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { REGIONS, REGION_COORDINATES, getSpeciesForRegion, getRegionDistance, REGION_TIERS, getRegionTier } from "@cambium/shared";

// ─── FIPS code to state abbreviation ────────────────────────────

const FIPS_TO_STATE: Record<string, string> = {
  "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA",
  "08": "CO", "09": "CT", "10": "DE", "11": "DC", "12": "FL",
  "13": "GA", "15": "HI", "16": "ID", "17": "IL", "18": "IN",
  "19": "IA", "20": "KS", "21": "KY", "22": "LA", "23": "ME",
  "24": "MD", "25": "MA", "26": "MI", "27": "MN", "28": "MS",
  "29": "MO", "30": "MT", "31": "NE", "32": "NV", "33": "NH",
  "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND",
  "39": "OH", "40": "OK", "41": "OR", "42": "PA", "44": "RI",
  "45": "SC", "46": "SD", "47": "TN", "48": "TX", "49": "UT",
  "50": "VT", "51": "VA", "53": "WA", "54": "WV", "55": "WI",
  "56": "WY",
};

// ─── Region colors derived from signature wood species ──────────
// Each region color is a muted variant of its most iconic local species.

const REGION_COLORS: Record<string, string> = {
  seattle:     "#c9a87c",  // Douglas Fir — warm tan
  sacramento:  "#8c6b53",  // Claro Walnut — rich brown
  phoenix:     "#a07058",  // Mesquite — desert rust
  denver:      "#95a0b0",  // Beetle-Kill Pine — blue-gray
  austin:      "#c09562",  // Pecan — honey amber
  minneapolis: "#d4c5a8",  // Hard Maple — pale cream
  chicago:     "#7a6050",  // Black Walnut — deep brown
  pittsburgh:  "#b06850",  // Black Cherry — cherry
  boston:       "#c8b088",  // Beech — warm tan
  atlanta:     "#c4a868",  // Southern Yellow Pine — straw gold
};

// ─── Tier ring colors — warm earthy progression ─────────────────

const TIER_RING_COLORS: Record<number, { stroke: string; fill: string; label: string }> = {
  1: { stroke: "#6b9e6b", fill: "#6b9e6b", label: "#5a8a5a" },  // sage green — Neighboring
  2: { stroke: "#c89050", fill: "#c89050", label: "#b07a40" },  // warm amber — Regional
  3: { stroke: "#b05040", fill: "#b05040", label: "#9a3a30" },  // earthy rust — Distant
};

// ─── Build state → regionId lookup ──────────────────────────────

function buildStateToRegionMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const region of REGIONS) {
    for (const state of region.statesServiced) {
      map[state] = region.id;
    }
  }
  return map;
}

const STATE_TO_REGION = buildStateToRegionMap();
const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// ─── Types ──────────────────────────────────────────────────────

interface CambiumMapProps {
  userRegionId?: string;
  userZip?: string;
  compact?: boolean;
  onFocusChange?: (regionId: string | null) => void;
}

interface TooltipData {
  regionId: string;
  x: number;
  y: number;
}

// ─── Component ──────────────────────────────────────────────────

export function CambiumMap({ userRegionId, compact = false, onFocusChange }: CambiumMapProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [focusRegion, _setFocusRegion] = useState<string | null>(null);

  const setFocusRegion = useCallback((updater: string | null | ((prev: string | null) => string | null)) => {
    _setFocusRegion((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      onFocusChange?.(next);
      return next;
    });
  }, [onFocusChange]);

  const userCoords = useMemo(() => {
    if (!userRegionId) return null;
    const coords = REGION_COORDINATES[userRegionId];
    if (!coords) return null;
    return [coords.lng, coords.lat] as [number, number];
  }, [userRegionId]);

  // Tier distances for ring visualization (exclude Tier 0 and Infinity)
  const tierRings = useMemo(() => {
    return REGION_TIERS.filter((t) => t.tier > 0 && t.maxDistance < Infinity);
  }, []);

  // Calculate tier for each region relative to focus
  const regionTiers = useMemo(() => {
    if (!focusRegion) return {};
    const tiers: Record<string, typeof REGION_TIERS[0]> = {};
    for (const region of REGIONS) {
      if (region.id !== focusRegion) {
        tiers[region.id] = getRegionTier(focusRegion, region.id);
      }
    }
    return tiers;
  }, [focusRegion]);

  const handleMarkerClick = useCallback((regionId: string) => {
    setFocusRegion((prev) => (prev === regionId ? null : regionId));
  }, []);

  const scale = compact ? 800 : 1000;
  const mapWidth = compact ? 600 : 800;
  const mapHeight = compact ? 400 : 500;
  const milesToSvg = mapWidth / 2800;

  return (
    <div className={`relative ${compact ? "" : "mx-auto max-w-4xl"}`}>
      <ComposableMap
        projection="geoAlbersUsa"
        projectionConfig={{ scale }}
        width={mapWidth}
        height={mapHeight}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const fips = geo.id as string;
              const stateAbbr = FIPS_TO_STATE[fips];
              const regionId = stateAbbr ? STATE_TO_REGION[stateAbbr] : undefined;
              const fillColor = regionId
                ? REGION_COLORS[regionId] ?? "#e5e5e5"
                : "#eeeeee";
              const isUserRegion = regionId === userRegionId;

              // When focused, mute states so colored rings read clearly
              const dimmed = focusRegion && !isUserRegion;

              return (
                <Geography
                  key={geo.rpiKey}
                  geography={geo}
                  fill={isUserRegion ? "#374151" : dimmed ? "#e2ddd6" : fillColor}
                  stroke="#ffffff"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none", transition: "fill 0.3s ease" },
                    hover: {
                      outline: "none",
                      fill: isUserRegion ? "#1f2937" : dimmed ? "#d6d3d1" : `${fillColor}dd`,
                    },
                    pressed: { outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>

        {/* Colored tier rings — concentric circles with earthy progression */}
        {focusRegion && (() => {
          const focusCoords = REGION_COORDINATES[focusRegion];
          if (!focusCoords) return null;
          return (
            <Marker coordinates={[focusCoords.lng, focusCoords.lat]}>
              {tierRings.map((tier) => {
                const radius = tier.maxDistance * milesToSvg;
                const colors = TIER_RING_COLORS[tier.tier];
                if (!colors) return null;
                return (
                  <g key={tier.tier}>
                    {/* Subtle fill for the ring band */}
                    <circle
                      r={radius}
                      fill={colors.fill}
                      fillOpacity={0.06}
                      stroke={colors.stroke}
                      strokeWidth={1.2}
                      strokeOpacity={0.5}
                      strokeDasharray={tier.tier === 1 ? "" : tier.tier === 2 ? "8 4" : "4 4"}
                    />
                    {/* Label at top of ring */}
                    <text
                      y={-radius - 4}
                      textAnchor="middle"
                      style={{
                        fontSize: 7,
                        fontWeight: 500,
                        fill: colors.label,
                        fontFamily: "system-ui, sans-serif",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {tier.label} · +${tier.surchargePerBf}/bf
                    </text>
                  </g>
                );
              })}
            </Marker>
          );
        })()}

        {/* Microfactory markers */}
        {REGIONS.map((region) => {
          const coords = REGION_COORDINATES[region.id];
          if (!coords) return null;
          const isUser = region.id === userRegionId;
          const isFocus = region.id === focusRegion;

          // In focus mode, show tier-colored halos on non-focus markers
          const tier = regionTiers[region.id];
          const tierNum = tier?.tier ?? 0;
          const tierColors = tier ? TIER_RING_COLORS[tierNum] : null;

          // Fade farther markers slightly
          const markerOpacity = focusRegion
            ? isFocus ? 1 : tierNum <= 1 ? 0.95 : tierNum === 2 ? 0.75 : 0.5
            : 1;

          return (
            <Marker
              key={region.id}
              coordinates={[coords.lng, coords.lat]}
              onMouseEnter={(e) => {
                const rect = (e.target as SVGElement).closest("svg")?.getBoundingClientRect();
                if (rect) {
                  setTooltip({
                    regionId: region.id,
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                  });
                }
              }}
              onMouseLeave={() => setTooltip(null)}
              onClick={() => handleMarkerClick(region.id)}
            >
              {/* Tier-colored halo on non-focus markers when focused */}
              {focusRegion && !isFocus && tierColors && (
                <circle
                  r={8}
                  fill={tierColors.stroke}
                  fillOpacity={0.15}
                  stroke={tierColors.stroke}
                  strokeWidth={0.5}
                  strokeOpacity={0.3}
                />
              )}
              {/* Pulse ring on focused marker */}
              {isFocus && (
                <circle
                  r={10}
                  fill="#f59e0b"
                  fillOpacity={0.15}
                  stroke="#f59e0b"
                  strokeWidth={0.75}
                  strokeOpacity={0.3}
                />
              )}
              <circle
                r={isFocus ? 5.5 : isUser ? 5 : 3.5}
                fill={isFocus || isUser ? "#f59e0b" : "#ffffff"}
                fillOpacity={markerOpacity}
                stroke={isFocus || isUser ? "#92400e" : "#57534e"}
                strokeWidth={isFocus ? 2 : isUser ? 1.75 : 1.25}
                strokeOpacity={markerOpacity}
                style={{ cursor: "pointer" }}
              />
              {!compact && (
                <text
                  textAnchor="middle"
                  y={isFocus ? -12 : -8}
                  style={{
                    fontSize: isFocus || isUser ? 9 : 7.5,
                    fontWeight: isFocus || isUser ? 600 : 400,
                    fill: isFocus ? "#44403c" : isUser ? "#1f2937" : "#78716c",
                    fillOpacity: markerOpacity,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  {region.city}
                </text>
              )}
            </Marker>
          );
        })}

        {/* User region glow (when not in focus mode) */}
        {userCoords && userRegionId && !focusRegion && (
          <Marker coordinates={userCoords}>
            <circle r={8} fill="#f59e0b" fillOpacity={0.2} />
          </Marker>
        )}
      </ComposableMap>

      {/* Focus bar with tier legend */}
      {focusRegion && (
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-lg bg-white/90 px-4 py-2.5 shadow-md backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <span className="text-xs text-stone-600">
              Pricing tiers from{" "}
              <span className="font-semibold text-stone-900">
                {REGIONS.find((r) => r.id === focusRegion)?.city}
              </span>
            </span>
            {/* Tier legend dots */}
            <div className="flex items-center gap-3">
              {tierRings.map((tier) => {
                const colors = TIER_RING_COLORS[tier.tier];
                if (!colors) return null;
                return (
                  <div key={tier.tier} className="flex items-center gap-1">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: colors.stroke }}
                    />
                    <span className="text-[10px] text-stone-500">
                      {tier.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <button
            onClick={() => setFocusRegion(null)}
            className="ml-3 rounded-md px-2 py-0.5 text-[10px] text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tooltip (default / no focus) */}
      {tooltip && !focusRegion && (
        <MapTooltip
          regionId={tooltip.regionId}
          x={tooltip.x}
          y={tooltip.y}
        />
      )}

      {/* Tier tooltip (focus mode — hover on non-focus markers) */}
      {tooltip && focusRegion && tooltip.regionId !== focusRegion && (
        <TierTooltip
          fromRegion={focusRegion}
          toRegion={tooltip.regionId}
          x={tooltip.x}
          y={tooltip.y}
        />
      )}
    </div>
  );
}

// ─── Tooltip ────────────────────────────────────────────────────

function MapTooltip({
  regionId,
  x,
  y,
}: {
  regionId: string;
  x: number;
  y: number;
}) {
  const region = REGIONS.find((r) => r.id === regionId);
  const species = getSpeciesForRegion(regionId);

  if (!region) return null;

  // Show the signature species color as a subtle accent
  const regionColor = REGION_COLORS[regionId];

  return (
    <div
      className="pointer-events-none absolute z-50 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg"
      style={{
        left: x + 12,
        top: y - 20,
        maxWidth: 260,
      }}
    >
      {/* Subtle color bar at top matching the region's signature wood */}
      {regionColor && (
        <div className="h-1" style={{ backgroundColor: regionColor, opacity: 0.6 }} />
      )}
      <div className="p-4">
        <div className="mb-1 text-sm font-medium text-stone-900">
          {region.name}
        </div>
        <div className="mb-3 text-xs text-stone-500">
          {region.city}, {region.state}
        </div>
        <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-stone-400">
          Local Species
        </div>
        <div className="flex flex-wrap gap-1.5">
          {species.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-[10px] text-stone-600">{s.name}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 text-[10px] text-stone-400">
          Click to show pricing tiers
        </div>
      </div>
    </div>
  );
}

// ─── Tier Tooltip ───────────────────────────────────────────────

function TierTooltip({
  fromRegion,
  toRegion,
  x,
  y,
}: {
  fromRegion: string;
  toRegion: string;
  x: number;
  y: number;
}) {
  const from = REGIONS.find((r) => r.id === fromRegion);
  const to = REGIONS.find((r) => r.id === toRegion);
  const tier = getRegionTier(fromRegion, toRegion);
  const distance = getRegionDistance(fromRegion, toRegion);

  if (!from || !to) return null;

  const tierColors = TIER_RING_COLORS[tier.tier];

  return (
    <div
      className="pointer-events-none absolute z-50 overflow-hidden rounded-xl bg-white shadow-lg"
      style={{
        left: x + 12,
        top: y - 20,
        maxWidth: 240,
        border: `1.5px solid ${tierColors?.stroke ?? "#d6d3d1"}`,
      }}
    >
      <div className="p-4">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="text-sm font-medium text-stone-900">{to.name}</span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
            style={{ backgroundColor: tierColors?.stroke ?? "#a8a29e" }}
          >
            {tier.label}
          </span>
        </div>
        <div className="space-y-0.5 text-[11px] text-stone-500">
          <div>~{distance.toLocaleString()} mi from {from.city}</div>
          <div className="font-medium text-stone-700">+${tier.surchargePerBf.toFixed(2)}/bf surcharge</div>
          <div>{Math.round(tier.handlingMultiplier * 100 - 100)}% handling uplift</div>
        </div>
      </div>
    </div>
  );
}
