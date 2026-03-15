"use client";

import { useState, useMemo } from "react";
import {
  DEFAULT_ASSUMPTIONS,
  calcMicrofactory,
  calcChina,
  calcUnitEconomics,
  type CostAssumptions,
} from "../../lib/cost-assumptions";

function fmt(n: number): string {
  return `$${n.toFixed(2)}`;
}

interface Scenario {
  id: string;
  name: string;
  overrides: Partial<CostAssumptions>;
}

const PRESET_SCENARIOS: Scenario[] = [
  {
    id: "baseline",
    name: "Baseline (defaults)",
    overrides: {},
  },
  {
    id: "small-batch",
    name: "Small batch (10 units)",
    overrides: { batchSize: 10 },
  },
  {
    id: "large-batch",
    name: "Large batch (100 units)",
    overrides: { batchSize: 100 },
  },
  {
    id: "premium-wood",
    name: "Premium wood ($12/bf)",
    overrides: { localBfPrice: 12.0 },
  },
  {
    id: "cheap-wood",
    name: "Budget wood ($6/bf)",
    overrides: { localBfPrice: 6.0 },
  },
  {
    id: "low-margin",
    name: "40% margin (IKEA-adjacent)",
    overrides: { targetDtcMargin: 0.40 },
  },
  {
    id: "high-overhead",
    name: "High overhead ($8k/mo)",
    overrides: { monthlyOverhead: 8000 },
  },
  {
    id: "fast-factory",
    name: "Fast factory (400 units/mo)",
    overrides: { monthlyThroughput: 400 },
  },
];

function computeScenario(base: CostAssumptions, overrides: Partial<CostAssumptions>) {
  const a = { ...base, ...overrides };
  const m = calcMicrofactory(a);
  const c = calcChina(a);
  const e = calcUnitEconomics(a, m, c);
  return { assumptions: a, micro: m, china: c, econ: e };
}

export default function SensitivityPage() {
  const [activeScenarios, setActiveScenarios] = useState<string[]>([
    "baseline",
    "small-batch",
    "large-batch",
    "premium-wood",
  ]);

  const [customOverrides, setCustomOverrides] = useState({
    batchSize: 10,
    localBfPrice: 10.0,
    subframeUnitCost: 12.0,
  });

  const base = DEFAULT_ASSUMPTIONS;

  const results = useMemo(() => {
    const scenarios = PRESET_SCENARIOS.filter((s) =>
      activeScenarios.includes(s.id)
    );

    // Add custom scenario
    scenarios.push({
      id: "custom",
      name: "Custom scenario",
      overrides: customOverrides,
    });

    return scenarios.map((s) => ({
      ...s,
      result: computeScenario(base, s.overrides),
    }));
  }, [activeScenarios, customOverrides, base]);

  function toggleScenario(id: string) {
    setActiveScenarios((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  return (
    <div className="p-8 max-w-7xl">
      <h1 className="text-2xl font-semibold mb-1">Sensitivity Analysis</h1>
      <p className="text-sm text-zinc-500 mb-6">
        Compare scenarios side-by-side. Toggle presets or set custom overrides.
      </p>

      {/* Scenario toggles */}
      <div className="bg-white border border-zinc-200 rounded-lg p-4 mb-6">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Active Scenarios
        </h3>
        <div className="flex flex-wrap gap-2">
          {PRESET_SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => toggleScenario(s.id)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                activeScenarios.includes(s.id)
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "bg-white text-zinc-600 border-zinc-300 hover:border-zinc-400"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Custom scenario inputs */}
      <div className="bg-white border border-zinc-200 rounded-lg p-4 mb-6">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Custom Scenario Overrides
        </h3>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <label className="text-sm text-zinc-600">Batch size</label>
            <input
              type="number"
              value={customOverrides.batchSize}
              onChange={(e) =>
                setCustomOverrides((p) => ({
                  ...p,
                  batchSize: parseInt(e.target.value) || 1,
                }))
              }
              className="w-20 px-2 py-1 text-sm border border-zinc-300 rounded bg-blue-50 text-blue-700 font-mono"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-zinc-600">Wood $/bf</label>
            <input
              type="number"
              value={customOverrides.localBfPrice}
              onChange={(e) =>
                setCustomOverrides((p) => ({
                  ...p,
                  localBfPrice: parseFloat(e.target.value) || 0,
                }))
              }
              step={0.5}
              className="w-20 px-2 py-1 text-sm border border-zinc-300 rounded bg-blue-50 text-blue-700 font-mono"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-zinc-600">Subframe $</label>
            <input
              type="number"
              value={customOverrides.subframeUnitCost}
              onChange={(e) =>
                setCustomOverrides((p) => ({
                  ...p,
                  subframeUnitCost: parseFloat(e.target.value) || 0,
                }))
              }
              step={1}
              className="w-20 px-2 py-1 text-sm border border-zinc-300 rounded bg-blue-50 text-blue-700 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-zinc-600 sticky left-0 bg-zinc-50">
                  Metric
                </th>
                {results.map((r) => (
                  <th
                    key={r.id}
                    className="text-right px-4 py-3 font-medium text-zinc-600 min-w-[120px]"
                  >
                    {r.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                {
                  label: "COGS — local wood",
                  key: (r: typeof results[0]) => r.result.micro.cogsLocal,
                },
                {
                  label: "COGS — cross-region",
                  key: (r: typeof results[0]) => r.result.micro.cogsCross,
                },
                {
                  label: "China landed",
                  key: (r: typeof results[0]) => r.result.china.landedCost,
                },
                {
                  label: "Var Cost (local + ship)",
                  key: (r: typeof results[0]) => r.result.micro.varCostLocal,
                  bold: true,
                },
                {
                  label: "Min DTC — local",
                  key: (r: typeof results[0]) => r.result.econ.microLocalMinDtc,
                  bold: true,
                  highlight: true,
                },
                {
                  label: "Min DTC — cross",
                  key: (r: typeof results[0]) => r.result.econ.microCrossMinDtc,
                },
                {
                  label: "Min DTC — China",
                  key: (r: typeof results[0]) => r.result.econ.chinaMinDtc,
                },
                {
                  label: "Wholesale retail sugg.",
                  key: (r: typeof results[0]) =>
                    r.result.econ.wholesaleRetailSuggested,
                },
              ].map((row) => (
                <tr
                  key={row.label}
                  className={`border-b border-zinc-100 ${
                    row.highlight ? "bg-green-50" : ""
                  }`}
                >
                  <td
                    className={`px-4 py-2.5 sticky left-0 bg-white ${
                      row.highlight ? "!bg-green-50" : ""
                    } ${row.bold ? "font-medium" : "text-zinc-600"}`}
                  >
                    {row.label}
                  </td>
                  {results.map((r) => (
                    <td
                      key={r.id}
                      className={`px-4 py-2.5 text-right font-mono ${
                        row.bold ? "font-medium text-zinc-900" : "text-zinc-700"
                      }`}
                    >
                      {fmt(row.key(r))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
