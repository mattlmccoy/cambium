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

function PathCard({
  title,
  tag,
  cogs,
  shipping,
  varCost,
  margin,
  minDtc,
  isBest,
}: {
  title: string;
  tag: string;
  cogs: number;
  shipping: number;
  varCost: number;
  margin: number;
  minDtc: number;
  isBest: boolean;
}) {
  return (
    <div
      className={`bg-white border rounded-lg p-6 ${
        isBest ? "border-green-400 ring-2 ring-green-100" : "border-zinc-200"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-zinc-900">{title}</h3>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            isBest
              ? "bg-green-100 text-green-700"
              : "bg-zinc-100 text-zinc-600"
          }`}
        >
          {tag}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">COGS (ex-shipping)</span>
          <span className="font-mono text-zinc-900">{fmt(cogs)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Shipping to customer</span>
          <span className="font-mono text-zinc-900">{fmt(shipping)}</span>
        </div>
        <div className="flex justify-between text-sm border-t border-zinc-100 pt-2">
          <span className="text-zinc-500">Variable cost (total)</span>
          <span className="font-mono font-medium text-zinc-900">{fmt(varCost)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Target DTC margin</span>
          <span className="font-mono text-zinc-900">{(margin * 100).toFixed(0)}%</span>
        </div>

        <div className="bg-zinc-50 -mx-3 px-3 py-3 rounded-lg mt-2">
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-medium text-zinc-700">Min DTC Price</span>
            <span className="text-2xl font-bold text-zinc-900 font-mono">
              {fmt(minDtc)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UnitEconomicsPage() {
  const [assumptions, setAssumptions] = useState<CostAssumptions>(DEFAULT_ASSUMPTIONS);

  const micro = useMemo(() => calcMicrofactory(assumptions), [assumptions]);
  const china = useMemo(() => calcChina(assumptions), [assumptions]);
  const econ = useMemo(
    () => calcUnitEconomics(assumptions, micro, china),
    [assumptions, micro, china]
  );

  const paths = [
    {
      title: "Microfactory — Local Wood",
      tag: "Local",
      cogs: micro.cogsLocal,
      shipping: assumptions.dtcShipping,
      varCost: micro.varCostLocal,
      margin: assumptions.targetDtcMargin,
      minDtc: econ.microLocalMinDtc,
    },
    {
      title: "Microfactory — Cross-Region",
      tag: "Cross-Region",
      cogs: micro.cogsCross,
      shipping: assumptions.dtcShipping,
      varCost: micro.varCostCross,
      margin: assumptions.targetDtcMargin,
      minDtc: econ.microCrossMinDtc,
    },
    {
      title: "China Import Path",
      tag: "China",
      cogs: china.landedCost,
      shipping: assumptions.dtcShipping,
      varCost: china.landedCost + assumptions.dtcShipping,
      margin: assumptions.targetDtcMargin,
      minDtc: econ.chinaMinDtc,
    },
  ];

  const bestIdx = paths.reduce(
    (best, p, i) => (p.minDtc < paths[best].minDtc ? i : best),
    0
  );

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-semibold mb-1">Unit Economics</h1>
      <p className="text-sm text-zinc-500 mb-6">
        Compare sourcing paths: min DTC price at {(assumptions.targetDtcMargin * 100).toFixed(0)}% gross margin. Side Table TB-SD-01.
      </p>

      {/* Margin slider */}
      <div className="bg-white border border-zinc-200 rounded-lg p-4 mb-6 flex items-center gap-6">
        <label className="text-sm font-medium text-zinc-700 whitespace-nowrap">
          Target DTC Margin
        </label>
        <input
          type="range"
          min={0.20}
          max={0.80}
          step={0.01}
          value={assumptions.targetDtcMargin}
          onChange={(e) =>
            setAssumptions((prev) => ({
              ...prev,
              targetDtcMargin: parseFloat(e.target.value),
            }))
          }
          className="flex-1"
        />
        <span className="text-lg font-mono font-semibold text-zinc-900 w-16 text-right">
          {(assumptions.targetDtcMargin * 100).toFixed(0)}%
        </span>
      </div>

      {/* Three path cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {paths.map((p, i) => (
          <PathCard key={p.tag} {...p} isBest={i === bestIdx} />
        ))}
      </div>

      {/* Wholesale section */}
      <div className="bg-white border border-zinc-200 rounded-lg p-6">
        <h2 className="font-semibold text-zinc-900 mb-4">Wholesale Sanity Check</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-zinc-500 mb-3">
              If you sell wholesale (to a retailer), they need a {(assumptions.targetRetailerMargin * 100).toFixed(0)}% margin.
              Your DTC price needs to work as both a ceiling and a floor.
            </p>
            <div className="flex items-center gap-4">
              <label className="text-sm text-zinc-600">Retailer Margin</label>
              <input
                type="range"
                min={0.30}
                max={0.60}
                step={0.01}
                value={assumptions.targetRetailerMargin}
                onChange={(e) =>
                  setAssumptions((prev) => ({
                    ...prev,
                    targetRetailerMargin: parseFloat(e.target.value),
                  }))
                }
                className="flex-1"
              />
              <span className="text-sm font-mono font-semibold w-12 text-right">
                {(assumptions.targetRetailerMargin * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          <div className="bg-zinc-50 rounded-lg p-4">
            <div className="text-sm text-zinc-500 mb-1">
              Suggested retail (micro local, wholesale)
            </div>
            <div className="text-3xl font-bold font-mono text-zinc-900">
              {fmt(econ.wholesaleRetailSuggested)}
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              Your wholesale price: {fmt(econ.microLocalMinDtc)} &rarr; retailer sells at {fmt(econ.wholesaleRetailSuggested)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
