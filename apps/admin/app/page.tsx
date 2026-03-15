import Link from "next/link";

export default function AdminHome() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-semibold mb-2">Cambium Admin</h1>
      <p className="text-sm text-zinc-500 mb-8">
        Internal tools for operations and business planning.
      </p>

      <div className="max-w-5xl space-y-8">
        {/* Operations */}
        <div>
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            Operations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { href: "/dashboard", label: "Dashboard", desc: "Overview & metrics" },
              { href: "/products", label: "Products", desc: "SKU management" },
              { href: "/orders", label: "Orders", desc: "Order tracking & BOM" },
              { href: "/factories", label: "Factories", desc: "Microfactory management" },
              { href: "/materials", label: "Materials", desc: "Wood species & suppliers" },
              { href: "/costs", label: "Cost Models", desc: "Regional pricing & margins" },
            ].map(({ href, label, desc }) => (
              <Link
                key={href}
                href={href}
                className="block p-6 bg-white border border-zinc-200 rounded-lg hover:border-zinc-400 transition-colors"
              >
                <h3 className="font-medium text-zinc-900">{label}</h3>
                <p className="text-sm text-zinc-500 mt-1">{desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Business Tools */}
        <div>
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            Business Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                href: "/cost-modeling",
                label: "Cost Modeling",
                desc: "Interactive COGS calculator. Edit assumptions, see microfactory vs China path live.",
                tag: "New",
              },
              {
                href: "/unit-economics",
                label: "Unit Economics",
                desc: "Min DTC price at target margin. Compare all sourcing paths side-by-side.",
                tag: "New",
              },
              {
                href: "/sensitivity",
                label: "Sensitivity Analysis",
                desc: "What-if scenarios: batch size, wood price, overhead. Compare results.",
                tag: "New",
              },
              {
                href: "/planning",
                label: "Planning Board",
                desc: "Startup task tracker. Epics, tasks, owners, outputs across all workstreams.",
                tag: "New",
              },
            ].map(({ href, label, desc, tag }) => (
              <Link
                key={href}
                href={href}
                className="block p-6 bg-white border border-zinc-200 rounded-lg hover:border-zinc-400 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-zinc-900">{label}</h3>
                  {tag && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-medium">
                      {tag}
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-500 mt-1">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
