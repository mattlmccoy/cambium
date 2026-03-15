"use client";

import { useState, useMemo } from "react";
import {
  DEFAULT_ASSUMPTIONS,
  calcMicrofactory,
  calcChina,
  type CostAssumptions,
} from "../../lib/cost-assumptions";
import { PRODUCT_ORDER } from "@cambium/shared";

function fmt(n: number, decimals = 2): string {
  return `$${n.toFixed(decimals)}`;
}

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function InputRow({
  label,
  value,
  onChange,
  suffix,
  step,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  step?: number;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 gap-4">
      <span className="text-sm text-zinc-700 flex-1">{label}</span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          step={step ?? 0.01}
          min={min}
          max={max}
          className="w-24 px-2 py-1 text-sm text-right border border-zinc-300 rounded bg-blue-50 text-blue-700 font-mono focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        {suffix && (
          <span className="text-xs text-zinc-400 w-8">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function ResultRow({
  label,
  value,
  bold,
  highlight,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between py-1.5 ${
        bold ? "font-semibold" : ""
      } ${highlight ? "bg-green-50 -mx-3 px-3 rounded" : ""}`}
    >
      <span className="text-sm text-zinc-700">{label}</span>
      <span className={`text-sm font-mono ${highlight ? "text-green-700" : "text-zinc-900"}`}>
        {value}
      </span>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 border-b border-zinc-200 pb-1">
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function CostModelingPage() {
  const [assumptions, setAssumptions] = useState<CostAssumptions>(DEFAULT_ASSUMPTIONS);

  function set<K extends keyof CostAssumptions>(key: K, val: CostAssumptions[K]) {
    setAssumptions((prev) => ({ ...prev, [key]: val }));
  }

  const micro = useMemo(() => calcMicrofactory(assumptions), [assumptions]);
  const china = useMemo(() => calcChina(assumptions), [assumptions]);

  return (
    <div className="p-8 max-w-7xl">
      <h1 className="text-2xl font-semibold mb-1">Cost Modeling</h1>
      <p className="text-sm text-zinc-500 mb-6">
        Interactive cost model for the Cambium lineup. Edit blue inputs to see live calculations.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Assumptions */}
        <div className="bg-white border border-zinc-200 rounded-lg p-5">
          <h2 className="font-semibold text-zinc-900 mb-4">Assumptions</h2>

          <Section title="General">
            <InputRow label="DTC Gross Margin Target" value={assumptions.targetDtcMargin} onChange={(v) => set("targetDtcMargin", v)} suffix="" step={0.01} min={0} max={1} />
            <InputRow label="Retailer Margin" value={assumptions.targetRetailerMargin} onChange={(v) => set("targetRetailerMargin", v)} suffix="" step={0.01} />
            <InputRow label="Batch Size (units)" value={assumptions.batchSize} onChange={(v) => set("batchSize", v)} suffix="u" step={1} min={1} />
          </Section>

          <Section title="Subframe (Backbone)">
            <InputRow label="Subframe unit cost" value={assumptions.subframeUnitCost} onChange={(v) => set("subframeUnitCost", v)} suffix="$" />
            <InputRow label="Subframe shipping" value={assumptions.subframeShipping} onChange={(v) => set("subframeShipping", v)} suffix="$" />
          </Section>

          <Section title="Per-Product Core Costs">
            {PRODUCT_ORDER.map((product) => (
              <div key={product.slug} className="rounded-md border border-zinc-200 p-3 mb-3">
                <div className="mb-2 text-sm font-medium text-zinc-800">
                  {product.label}
                </div>
                <InputRow
                  label="Core unit cost"
                  value={assumptions.coreCosts[product.slug].unitCost}
                  onChange={(v) =>
                    setAssumptions((prev) => ({
                      ...prev,
                      coreCosts: {
                        ...prev.coreCosts,
                        [product.slug]: {
                          ...prev.coreCosts[product.slug],
                          unitCost: v,
                        },
                      },
                    }))
                  }
                  suffix="$"
                />
                <InputRow
                  label="Core shipping"
                  value={assumptions.coreCosts[product.slug].shipping}
                  onChange={(v) =>
                    setAssumptions((prev) => ({
                      ...prev,
                      coreCosts: {
                        ...prev.coreCosts,
                        [product.slug]: {
                          ...prev.coreCosts[product.slug],
                          shipping: v,
                        },
                      },
                    }))
                  }
                  suffix="$"
                />
              </div>
            ))}
          </Section>

          <Section title="Wood Materials">
            <InputRow label="Board feet / unit" value={assumptions.boardFeetPerUnit} onChange={(v) => set("boardFeetPerUnit", v)} suffix="bf" step={0.1} />
            <InputRow label="Local $/bf" value={assumptions.localBfPrice} onChange={(v) => set("localBfPrice", v)} suffix="$" />
            <InputRow label="Cross-region $/bf" value={assumptions.crossRegionBfPrice} onChange={(v) => set("crossRegionBfPrice", v)} suffix="$" />
            <InputRow label="Waste/kerf factor" value={assumptions.wasteKerf} onChange={(v) => set("wasteKerf", v)} suffix="x" step={0.01} />
          </Section>

          <Section title="Hardware & Consumables">
            <InputRow label="Hardware (inserts + bolts)" value={assumptions.hardwareCost} onChange={(v) => set("hardwareCost", v)} suffix="$" />
            <InputRow label="Rubber pads" value={assumptions.rubberPads} onChange={(v) => set("rubberPads", v)} suffix="$" />
            <InputRow label="Flat-pack packaging" value={assumptions.packaging} onChange={(v) => set("packaging", v)} suffix="$" />
            <InputRow label="Finish consumables" value={assumptions.finishConsumables} onChange={(v) => set("finishConsumables", v)} suffix="$" />
          </Section>

          <Section title="Microfactory Rates">
            <InputRow label="CNC rate ($/hr)" value={assumptions.cncRate} onChange={(v) => set("cncRate", v)} suffix="$/h" />
            <InputRow label="Labor rate ($/hr)" value={assumptions.laborRate} onChange={(v) => set("laborRate", v)} suffix="$/h" />
            <InputRow label="CNC time / unit (hr)" value={assumptions.cncTimePerUnit} onChange={(v) => set("cncTimePerUnit", v)} suffix="hr" step={0.05} />
            <InputRow label="Setup time / batch (hr)" value={assumptions.setupTimePerBatch} onChange={(v) => set("setupTimePerBatch", v)} suffix="hr" step={0.1} />
            <InputRow label="Sanding time (hr)" value={assumptions.sandingTime} onChange={(v) => set("sandingTime", v)} suffix="hr" step={0.05} />
            <InputRow label="Assembly & QC (hr)" value={assumptions.assemblyTime} onChange={(v) => set("assemblyTime", v)} suffix="hr" step={0.05} />
            <InputRow label="CNC oversight factor" value={assumptions.cncOversight} onChange={(v) => set("cncOversight", v)} suffix="" step={0.05} />
          </Section>

          <Section title="Overhead & Shipping">
            <InputRow label="Monthly overhead ($)" value={assumptions.monthlyOverhead} onChange={(v) => set("monthlyOverhead", v)} suffix="$" step={100} />
            <InputRow label="Monthly throughput (u)" value={assumptions.monthlyThroughput} onChange={(v) => set("monthlyThroughput", v)} suffix="u" step={10} />
            <InputRow label="DTC shipping / unit" value={assumptions.dtcShipping} onChange={(v) => set("dtcShipping", v)} suffix="$" />
          </Section>
        </div>

        {/* Column 2: Microfactory Calculation */}
        <div className="bg-white border border-zinc-200 rounded-lg p-5">
          <h2 className="font-semibold text-zinc-900 mb-4">Microfactory Calc</h2>

          <Section title="Subframe">
            <ResultRow label="Subframe landed at microfactory" value={fmt(micro.subframeLanded)} />
          </Section>

          <Section title="Material Cost (Wood)">
            <ResultRow label="Board feet needed (adj. waste)" value={micro.bfNeeded.toFixed(2) + " bf"} />
            <ResultRow label="Wood cost — local" value={fmt(micro.woodCostLocal)} />
            <ResultRow label="Wood cost — cross-region" value={fmt(micro.woodCostCross)} />
          </Section>

          <Section title="Hardware + Finish + Packaging">
            <ResultRow label="Hardware per unit" value={fmt(micro.hardwareTotal)} />
            <ResultRow label="Finish consumables" value={fmt(micro.finishTotal)} />
            <ResultRow label="Packaging" value={fmt(micro.packagingTotal)} />
          </Section>

          <Section title="Labor & Machine">
            <ResultRow label="Setup time / unit" value={micro.setupPerUnit.toFixed(3) + " hr"} />
            <ResultRow label="CNC cost / unit" value={fmt(micro.cncCost)} />
            <ResultRow label="Operator CNC cost" value={fmt(micro.operatorCncCost)} />
            <ResultRow label="Sanding & finishing" value={fmt(micro.sandingLabor)} />
            <ResultRow label="Assembly & QC" value={fmt(micro.assemblyLabor)} />
          </Section>

          <Section title="Overhead">
            <ResultRow label="Overhead / unit" value={fmt(micro.overheadPerUnit)} />
          </Section>

          <Section title="Totals">
            <ResultRow label="COGS — local wood" value={fmt(micro.cogsLocal)} bold />
            <ResultRow label="COGS — cross-region" value={fmt(micro.cogsCross)} bold />
            <ResultRow label="+ DTC Shipping" value={fmt(assumptions.dtcShipping)} />
            <div className="mt-2 border-t border-zinc-300 pt-2">
              <ResultRow label="Variable Cost — LOCAL" value={fmt(micro.varCostLocal)} bold highlight />
              <ResultRow label="Variable Cost — CROSS" value={fmt(micro.varCostCross)} bold />
            </div>
          </Section>
        </div>

        {/* Column 3: China Path */}
        <div className="space-y-6">
          <div className="bg-white border border-zinc-200 rounded-lg p-5">
            <h2 className="font-semibold text-zinc-900 mb-4">China Path</h2>

            <Section title="Inputs">
              <InputRow label="Ex-works unit price" value={assumptions.chinaExWorks} onChange={(v) => set("chinaExWorks", v)} suffix="$" />
              <InputRow label="MOQ (units)" value={assumptions.chinaMoq} onChange={(v) => set("chinaMoq", v)} suffix="u" step={50} />
              <InputRow label="Tooling (one-time)" value={assumptions.chinaTooling} onChange={(v) => set("chinaTooling", v)} suffix="$" step={500} />
              <InputRow label="Defect rate" value={assumptions.chinaDefectRate} onChange={(v) => set("chinaDefectRate", v)} suffix="" step={0.01} />
              <InputRow label="Freight $/CBM" value={assumptions.chinaFreightPerCbm} onChange={(v) => set("chinaFreightPerCbm", v)} suffix="$" />
              <InputRow label="Units / CBM" value={assumptions.chinaUnitsPerCbm} onChange={(v) => set("chinaUnitsPerCbm", v)} suffix="u" step={1} />
              <InputRow label="Tariff rate" value={assumptions.chinaTariffRate} onChange={(v) => set("chinaTariffRate", v)} suffix="" step={0.001} />
              <InputRow label="Brokerage / shipment" value={assumptions.chinaBrokerage} onChange={(v) => set("chinaBrokerage", v)} suffix="$" />
              <InputRow label="Dom freight to 3PL" value={assumptions.chinaDomFreight} onChange={(v) => set("chinaDomFreight", v)} suffix="$" />
              <InputRow label="Holding cost %/mo" value={assumptions.chinaHoldingRate} onChange={(v) => set("chinaHoldingRate", v)} suffix="" step={0.005} />
              <InputRow label="Months held" value={assumptions.chinaMonthsHeld} onChange={(v) => set("chinaMonthsHeld", v)} suffix="mo" step={1} />
              <InputRow label="FX buffer" value={assumptions.chinaFxBuffer} onChange={(v) => set("chinaFxBuffer", v)} suffix="" step={0.005} />
            </Section>

            <Section title="Calculations">
              <ResultRow label="Ex-works + FX buffer" value={fmt(china.exWorksFx)} />
              <ResultRow label="Ocean freight / unit" value={fmt(china.freightPerUnit)} />
              <ResultRow label="Duty / unit" value={fmt(china.dutyPerUnit)} />
              <ResultRow label="Brokerage / unit" value={fmt(china.brokeragePerUnit)} />
              <ResultRow label="Dom freight / unit" value={fmt(china.domFreight)} />
              <ResultRow label="Holding cost / unit" value={fmt(china.holdingPerUnit)} />
              <ResultRow label="Defect uplift factor" value={china.defectUplift.toFixed(3) + "x"} />
              <ResultRow label="Tooling / MOQ unit" value={fmt(china.toolingPerMoq)} />
            </Section>

            <Section title="Total">
              <ResultRow label="Subtotal before defects" value={fmt(china.subtotal)} />
              <ResultRow label="Landed cost / good unit" value={fmt(china.landedCost)} bold highlight />
            </Section>
          </div>

          {/* Quick comparison */}
          <div className="bg-zinc-900 text-white rounded-lg p-5">
            <h2 className="font-semibold mb-3">Quick Compare</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Micro COGS (local)</span>
                <span className="font-mono">{fmt(micro.cogsLocal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Micro COGS (cross)</span>
                <span className="font-mono">{fmt(micro.cogsCross)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">China landed</span>
                <span className="font-mono">{fmt(china.landedCost)}</span>
              </div>
              <div className="border-t border-zinc-700 mt-2 pt-2">
                <div className="flex justify-between text-green-400 font-semibold">
                  <span>Best path</span>
                  <span>
                    {micro.cogsLocal <= china.landedCost
                      ? "Microfactory (local)"
                      : "China"}
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-zinc-400">Delta</span>
                  <span className="font-mono">
                    {fmt(Math.abs(micro.cogsLocal - china.landedCost))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
