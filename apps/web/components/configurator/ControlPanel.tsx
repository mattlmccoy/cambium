"use client";

import { useConfiguratorStore } from "@/lib/configurator-store";
import {
  SIDE_TABLE_CONSTRAINTS,
  FINISHES,
  REGIONS,
  getSpeciesForRegion,
} from "@cambium/shared";
import type {
  TopProfile,
  EdgeProfile,
  LegStyle,
  FinishType,
} from "@cambium/shared";

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-stone-600">{label}</span>
        <span className="text-stone-900 font-medium tabular-nums">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-stone-200 rounded-full appearance-none cursor-pointer accent-stone-700"
      />
    </div>
  );
}

function OptionGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; name: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-2">
      <span className="text-sm text-stone-600">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              value === opt.id
                ? "bg-stone-900 text-white border-stone-900"
                : "bg-white text-stone-700 border-stone-200 hover:border-stone-400"
            }`}
          >
            {opt.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ControlPanel() {
  const params = useConfiguratorStore((s) => s.params);
  const cost = useConfiguratorStore((s) => s.cost);
  const validation = useConfiguratorStore((s) => s.validation);
  const setParam = useConfiguratorStore((s) => s.setParam);

  const c = SIDE_TABLE_CONSTRAINTS;
  const regionSpecies = getSpeciesForRegion(params.regionId);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="space-y-6 p-6 flex-1">
        {/* Region */}
        <div className="space-y-2">
          <span className="text-sm text-stone-600">Your Region</span>
          <select
            value={params.regionId}
            onChange={(e) => {
              setParam("regionId", e.target.value);
              // Reset species to first available in new region
              const species = getSpeciesForRegion(e.target.value);
              if (species.length > 0 && !species.find((s) => s.id === params.woodSpecies)) {
                setParam("woodSpecies", species[0].id);
              }
            }}
            className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white"
          >
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.city}, {r.state})
              </option>
            ))}
          </select>
        </div>

        {/* Dimensions */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            Dimensions
          </h3>
          <Slider
            label="Width"
            value={params.topWidth}
            min={c.topWidth.min}
            max={c.topWidth.max}
            step={c.topWidth.step}
            unit="mm"
            onChange={(v) => setParam("topWidth", v)}
          />
          <Slider
            label="Depth"
            value={params.topDepth}
            min={c.topDepth.min}
            max={c.topDepth.max}
            step={c.topDepth.step}
            unit="mm"
            onChange={(v) => setParam("topDepth", v)}
          />
          <Slider
            label="Height"
            value={params.height}
            min={c.height.min}
            max={c.height.max}
            step={c.height.step}
            unit="mm"
            onChange={(v) => setParam("height", v)}
          />
        </div>

        {/* Shape */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            Shape
          </h3>
          <OptionGroup<TopProfile>
            label="Top Profile"
            value={params.topProfile}
            options={[
              { id: "square", name: "Square" },
              { id: "rounded-square", name: "Rounded" },
              { id: "circle", name: "Circle" },
              { id: "organic", name: "Organic" },
            ]}
            onChange={(v) => setParam("topProfile", v)}
          />
          <OptionGroup<EdgeProfile>
            label="Edge"
            value={params.topEdge}
            options={[
              { id: "square", name: "Sharp" },
              { id: "chamfer", name: "Chamfer" },
              { id: "roundover", name: "Round" },
              { id: "bevel", name: "Bevel" },
            ]}
            onChange={(v) => setParam("topEdge", v)}
          />
          <OptionGroup<LegStyle>
            label="Legs"
            value={params.legStyle}
            options={[
              { id: "straight", name: "Straight" },
              { id: "tapered", name: "Tapered" },
              { id: "splayed", name: "Splayed" },
              { id: "hairpin-wrap", name: "Hairpin" },
            ]}
            onChange={(v) => setParam("legStyle", v)}
          />
          <OptionGroup<"3" | "4">
            label="Leg Count"
            value={String(params.legCount) as "3" | "4"}
            options={[
              { id: "3", name: "3 Legs" },
              { id: "4", name: "4 Legs" },
            ]}
            onChange={(v) => setParam("legCount", Number(v) as 3 | 4)}
          />
        </div>

        {/* Material */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            Material
          </h3>
          <div className="space-y-2">
            <span className="text-sm text-stone-600">Wood Species</span>
            <div className="grid grid-cols-2 gap-2">
              {regionSpecies.map((species) => (
                <button
                  key={species.id}
                  onClick={() => setParam("woodSpecies", species.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs rounded-lg border transition-colors ${
                    params.woodSpecies === species.id
                      ? "bg-stone-900 text-white border-stone-900"
                      : "bg-white text-stone-700 border-stone-200 hover:border-stone-400"
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: species.color }}
                  />
                  {species.name}
                </button>
              ))}
            </div>
          </div>
          <OptionGroup<FinishType>
            label="Finish"
            value={params.finish}
            options={FINISHES.map((f) => ({ id: f.id as FinishType, name: f.name }))}
            onChange={(v) => setParam("finish", v)}
          />
        </div>

        {/* Validation warnings */}
        {validation.warnings.length > 0 && (
          <div className="space-y-1">
            {validation.warnings.map((w, i) => (
              <p key={i} className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                {w.message}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Price & CTA - sticky at bottom */}
      <div className="border-t border-stone-200 p-6 bg-white">
        <div className="flex items-baseline justify-between mb-4">
          <span className="text-sm text-stone-500">Estimated Price</span>
          <span className="text-3xl font-light text-stone-900">
            ${cost.total}
          </span>
        </div>
        <button className="w-full py-3 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors text-sm tracking-wide">
          Add to Cart
        </button>
        <p className="text-xs text-stone-400 text-center mt-2">
          Ships flat-pack from your local microfactory
        </p>
      </div>
    </div>
  );
}
