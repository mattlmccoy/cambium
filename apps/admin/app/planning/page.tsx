"use client";

import { useState } from "react";

interface PlanItem {
  id: string;
  epic: string;
  task: string;
  subtask: string;
  owner: "Matt" | "Jake";
  output: string;
  status: "todo" | "in-progress" | "done";
}

const INITIAL_ITEMS: PlanItem[] = [
  {
    id: "1",
    epic: "Cost Modeling",
    task: "Estimate cost model for Cambium",
    subtask: "Populate ASSUMPTIONS with real board-feet prices, CNC rates, subframe quotes",
    owner: "Matt",
    output: "Updated cost model with validated inputs",
    status: "in-progress",
  },
  {
    id: "2",
    epic: "Cost Modeling",
    task: "Compare microfactory vs China path",
    subtask: "Fill CHINA_CALC with quotes; run UNIT_ECONOMICS for both paths",
    owner: "Matt",
    output: "Decision note: which path clears 65% margin at what price point",
    status: "todo",
  },
  {
    id: "3",
    epic: "Customer Discovery",
    task: "Explore customer interest",
    subtask: "Interview 10 target customers about flat-pack furniture; budget, lead-time, finish preferences",
    owner: "Matt",
    output: "Notes + top insights",
    status: "todo",
  },
  {
    id: "4",
    epic: "Customer Discovery",
    task: "Explore customer interest",
    subtask: "Run a fake-door landing page with 3 SKUs and capture email + price clicks",
    owner: "Jake",
    output: "Conversion rate, price-click heatmap",
    status: "todo",
  },
  {
    id: "5",
    epic: "Customer Discovery",
    task: "Materials interest",
    subtask: "Test interest in local-only vs cross-region premium wood; A/B test on configurator",
    owner: "Matt",
    output: "Survey + preference split",
    status: "todo",
  },
  {
    id: "6",
    epic: "Verticals",
    task: "Large furniture fit",
    subtask: "Prototype a parametric dining table in config-engine; collect room-size, seating, style",
    owner: "Jake",
    output: "Configurator mock + 3 quotes",
    status: "todo",
  },
  {
    id: "7",
    epic: "Verticals",
    task: "Small furniture look",
    subtask: "Upload 12 lamp/table variations; A/B test visual style vs finish preference",
    owner: "Matt",
    output: "CTR by style",
    status: "todo",
  },
  {
    id: "8",
    epic: "Product Line",
    task: "Define types to sell",
    subtask: "Shortlist 3 tables, 2 chairs, 4 lamps; assign SKU codes; create one-page BOM per SKU",
    owner: "Jake",
    output: "SKU list with BOM roughs",
    status: "todo",
  },
  {
    id: "9",
    epic: "Inspiration",
    task: "Pinterest board",
    subtask: "Curate 40 reference images; cluster by Silhouette / Edge profile / Finish; map to SKU variations",
    owner: "Matt",
    output: "Board sections + notes",
    status: "todo",
  },
  {
    id: "10",
    epic: "Software Platform",
    task: "ZIP code region flow",
    subtask: "Add ZIP-to-region lookup in configurator; filter wood species by region; add cross-region premium",
    owner: "Matt",
    output: "Working ZIP flow in web app",
    status: "todo",
  },
  {
    id: "11",
    epic: "Software Platform",
    task: "Flat-pack assembly instructions",
    subtask: "Design assembly instruction template; integrate into order confirmation flow",
    owner: "Jake",
    output: "PDF template for side table",
    status: "todo",
  },
  {
    id: "12",
    epic: "Software Platform",
    task: "Additional SKUs in config-engine",
    subtask: "Add coffee table and dining table param types to config-engine; wire to configurator",
    owner: "Matt",
    output: "Multi-SKU configurator",
    status: "todo",
  },
];

const EPIC_COLORS: Record<string, string> = {
  "Cost Modeling": "bg-amber-100 text-amber-800",
  "Customer Discovery": "bg-blue-100 text-blue-800",
  Verticals: "bg-purple-100 text-purple-800",
  "Product Line": "bg-pink-100 text-pink-800",
  Inspiration: "bg-orange-100 text-orange-800",
  "Software Platform": "bg-green-100 text-green-800",
};

const STATUS_LABELS = {
  todo: { label: "To Do", color: "bg-zinc-100 text-zinc-600" },
  "in-progress": { label: "In Progress", color: "bg-blue-100 text-blue-700" },
  done: { label: "Done", color: "bg-green-100 text-green-700" },
};

export default function PlanningPage() {
  const [items, setItems] = useState<PlanItem[]>(INITIAL_ITEMS);
  const [filterEpic, setFilterEpic] = useState<string>("all");
  const [filterOwner, setFilterOwner] = useState<string>("all");

  function cycleStatus(id: string) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const next =
          item.status === "todo"
            ? "in-progress"
            : item.status === "in-progress"
            ? "done"
            : "todo";
        return { ...item, status: next };
      })
    );
  }

  const epics = [...new Set(items.map((i) => i.epic))];
  const filtered = items.filter((i) => {
    if (filterEpic !== "all" && i.epic !== filterEpic) return false;
    if (filterOwner !== "all" && i.owner !== filterOwner) return false;
    return true;
  });

  const counts = {
    todo: items.filter((i) => i.status === "todo").length,
    "in-progress": items.filter((i) => i.status === "in-progress").length,
    done: items.filter((i) => i.status === "done").length,
  };

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-semibold mb-1">Planning Board</h1>
      <p className="text-sm text-zinc-500 mb-6">
        Track startup tasks across epics. Click status badges to cycle.
      </p>

      {/* Progress bar */}
      <div className="bg-white border border-zinc-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4 mb-2">
          <span className="text-sm text-zinc-500">
            {counts.done}/{items.length} tasks done
          </span>
          <div className="flex gap-3 text-xs">
            <span className="text-zinc-500">{counts.todo} to do</span>
            <span className="text-blue-600">{counts["in-progress"]} in progress</span>
            <span className="text-green-600">{counts.done} done</span>
          </div>
        </div>
        <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden flex">
          <div
            className="bg-green-500 h-full transition-all"
            style={{ width: `${(counts.done / items.length) * 100}%` }}
          />
          <div
            className="bg-blue-400 h-full transition-all"
            style={{
              width: `${(counts["in-progress"] / items.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <select
          value={filterEpic}
          onChange={(e) => setFilterEpic(e.target.value)}
          className="text-sm border border-zinc-300 rounded px-3 py-1.5"
        >
          <option value="all">All Epics</option>
          {epics.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
        <select
          value={filterOwner}
          onChange={(e) => setFilterOwner(e.target.value)}
          className="text-sm border border-zinc-300 rounded px-3 py-1.5"
        >
          <option value="all">All Owners</option>
          <option value="Matt">Matt</option>
          <option value="Jake">Jake</option>
        </select>
      </div>

      {/* Task table */}
      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 w-28">
                Status
              </th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 w-36">
                Epic
              </th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600">
                Task / Subtask
              </th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 w-16">
                Owner
              </th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 w-48">
                Output
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const s = STATUS_LABELS[item.status];
              return (
                <tr
                  key={item.id}
                  className={`border-b border-zinc-100 ${
                    item.status === "done" ? "opacity-50" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={() => cycleStatus(item.id)}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium cursor-pointer ${s.color} hover:opacity-80 transition-opacity`}
                    >
                      {s.label}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium ${
                        EPIC_COLORS[item.epic] || "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {item.epic}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-900">
                      {item.task}
                    </div>
                    <div className="text-zinc-500 mt-0.5">{item.subtask}</div>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{item.owner}</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">
                    {item.output}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
