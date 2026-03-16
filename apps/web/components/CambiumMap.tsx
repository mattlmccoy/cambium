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

// ─── Region colors (muted palette) ─────────────────────────────

const REGION_COLORS: Record<string, string> = {
  seattle:     "#7da87d",
  sacramento:  "#c7956d",
  phoenix:     "#d4a76a",
  denver:      "#8c9cb8",
  austin:      "#b87a6d",
  minneapolis: "#7d9db8",
  chicago:     "#a0856d",
  pittsburgh:  "#8d7daa",
  boston:       "#6d8a9d",
  atlanta:     "#9daa7d",
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

// Approximate conversion: miles to SVG units for the AlbersUSA projection
// The US is roughly 2,800 miles wide and the map is 800 SVG units
const MILES_TO_SVG = 800 / 2800;

// ─── Types ──────────────────────────────────────────────────────

interface CambiumMapProps {
  userRegionId?: string;
  userZip?: string;
  compact?: boolean;
}

interface TooltipData {
  regionId: string;
  x: number;
  y: number;
}

// ─── Component ──────────────────────────────────────────────────

export function CambiumMap({ userRegionId, compact = false }: CambiumMapProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [focusRegion, setFocusRegion] = useState<string | null>(null);

  const userCoords = useMemo(() => {
    if (!userRegionId) return null;
    const coords = REGION_COORDINATES[userRegionId];
    if (!coords) return null;
    return [coords.lng, coords.lat] as [number, number];
  }, [userRegionId]);

  // Tier distances for ring visualization (exclude Tier 0)
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

              return (
                <Geography
                  key={geo.rpiKey}
                  geography={geo}
                  fill={isUserRegion ? "#374151" : fillColor}
                  stroke="#ffffff"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", fill: isUserRegion ? "#1f2937" : `${fillColor}dd` },
                    pressed: { outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>

        {/* Tier rings when a region is focused */}
        {focusRegion && (() => {
          const focusCoords = REGION_COORDINATES[focusRegion];
          if (!focusCoords) return null;
          return (
            <Marker coordinates={[focusCoords.lng, focusCoords.lat]}>
              {tierRings.map((tier) => {
                const radius = tier.maxDistance * milesToSvg;
                return (
                  <g key={tier.tier}>
                    <circle
                      r={radius}
                      fill={tier.color}
                      fillOpacity={0.06}
                      stroke={tier.color}
                      strokeWidth={1}
                      strokeOpacity={0.4}
                      strokeDasharray="4 3"
                    />
                    {/* Tier label at top of ring */}
                    <text
                      y={-radius - 4}
                      textAnchor="middle"
                      style={{
                        fontSize: 7,
                        fontWeight: 500,
                        fill: tier.color,
                        fontFamily: "system-ui, sans-serif",
                      }}
                    >
                      {tier.label} +${tier.surchargePerBf}/bf
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
          const tier = regionTiers[region.id];
          const tierColor = tier?.color;

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
              {/* Tier highlight ring when focus is active */}
              {focusRegion && tier && (
                <circle
                  r={8}
                  fill={tierColor}
                  fillOpacity={0.25}
                  stroke={tierColor}
                  strokeWidth={1}
                  strokeOpacity={0.5}
                />
              )}
              <circle
                r={isFocus ? 7 : isUser ? 6 : 4}
                fill={isFocus ? "#f59e0b" : isUser ? "#f59e0b" : focusRegion && tier ? tierColor ?? "#ffffff" : "#ffffff"}
                stroke={isFocus ? "#92400e" : isUser ? "#92400e" : "#374151"}
                strokeWidth={isFocus ? 2.5 : isUser ? 2 : 1.5}
                style={{ cursor: "pointer" }}
              />
              {!compact && (
                <text
                  textAnchor="middle"
                  y={-10}
                  style={{
                    fontSize: isFocus || isUser ? 10 : 8,
                    fontWeight: isFocus || isUser ? 600 : 400,
                    fill: isFocus ? "#92400e" : isUser ? "#1f2937" : "#6b7280",
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  {region.city}
                </text>
              )}
            </Marker>
          );
        })}

        {/* Arc from user region (if detected) */}
        {userCoords && userRegionId && !focusRegion && (
          <Marker coordinates={userCoords}>
            <circle r={8} fill="#f59e0b" fillOpacity={0.3} />
          </Marker>
        )}
      </ComposableMap>

      {/* Focus info bar */}
      {focusRegion && (
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 rounded-lg bg-white/95 px-4 py-2.5 shadow-lg backdrop-blur">
          <div className="flex-1">
            <div className="text-xs font-medium text-stone-900">
              {REGIONS.find((r) => r.id === focusRegion)?.name} tiers
            </div>
            <div className="mt-1 flex gap-3">
              {REGION_TIERS.filter((t) => t.tier > 0).map((tier) => (
                <div key={tier.tier} className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tier.color }} />
                  <span className="text-[10px] text-stone-500">
                    {tier.label} +${tier.surchargePerBf}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => setFocusRegion(null)}
            className="rounded-md border border-stone-200 px-2 py-1 text-[10px] text-stone-500 hover:bg-stone-50"
          >
            Clear
          </button>
        </div>
      )}

      {/* Tooltip */}
      {tooltip && !focusRegion && (
        <MapTooltip
          regionId={tooltip.regionId}
          x={tooltip.x}
          y={tooltip.y}
        />
      )}

      {/* Tier tooltip when focused */}
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

  return (
    <div
      className="pointer-events-none absolute z-50 rounded-xl border border-stone-200 bg-white p-4 shadow-lg"
      style={{
        left: x + 12,
        top: y - 20,
        maxWidth: 260,
      }}
    >
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

  return (
    <div
      className="pointer-events-none absolute z-50 rounded-xl border bg-white p-4 shadow-lg"
      style={{
        left: x + 12,
        top: y - 20,
        maxWidth: 240,
        borderColor: tier.color,
      }}
    >
      <div className="mb-1 flex items-center gap-2">
        <span className="text-sm font-medium text-stone-900">{to.name}</span>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
          style={{ backgroundColor: tier.color }}
        >
          {tier.label}
        </span>
      </div>
      <div className="space-y-0.5 text-[11px] text-stone-500">
        <div>~{distance} miles from {from.city}</div>
        <div>+${tier.surchargePerBf.toFixed(2)}/bf surcharge</div>
        <div>{Math.round(tier.handlingMultiplier * 100 - 100)}% handling uplift</div>
      </div>
    </div>
  );
}
