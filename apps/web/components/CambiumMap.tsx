"use client";

import { useState, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
} from "react-simple-maps";
import { REGIONS, REGION_COORDINATES, getSpeciesForRegion } from "@cambium/shared";

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

  const userCoords = useMemo(() => {
    if (!userRegionId) return null;
    const coords = REGION_COORDINATES[userRegionId];
    if (!coords) return null;
    return [coords.lng, coords.lat] as [number, number];
  }, [userRegionId]);

  return (
    <div className={`relative ${compact ? "" : "mx-auto max-w-4xl"}`}>
      <ComposableMap
        projection="geoAlbersUsa"
        projectionConfig={{ scale: compact ? 800 : 1000 }}
        width={compact ? 600 : 800}
        height={compact ? 400 : 500}
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

        {/* Microfactory markers */}
        {REGIONS.map((region) => {
          const coords = REGION_COORDINATES[region.id];
          if (!coords) return null;
          const isUser = region.id === userRegionId;
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
            >
              <circle
                r={isUser ? 6 : 4}
                fill={isUser ? "#f59e0b" : "#ffffff"}
                stroke={isUser ? "#92400e" : "#374151"}
                strokeWidth={isUser ? 2 : 1.5}
              />
              {!compact && (
                <text
                  textAnchor="middle"
                  y={-10}
                  style={{
                    fontSize: isUser ? 10 : 8,
                    fontWeight: isUser ? 600 : 400,
                    fill: isUser ? "#1f2937" : "#6b7280",
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  {region.city}
                </text>
              )}
            </Marker>
          );
        })}

        {/* Arc from user region (if detected) to show connection */}
        {userCoords && userRegionId && (
          <Marker coordinates={userCoords}>
            <circle r={8} fill="#f59e0b" fillOpacity={0.3} />
          </Marker>
        )}
      </ComposableMap>

      {/* Tooltip */}
      {tooltip && (
        <MapTooltip
          regionId={tooltip.regionId}
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
    </div>
  );
}
