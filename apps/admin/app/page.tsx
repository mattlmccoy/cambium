import Link from "next/link";

export default function AdminHome() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-semibold mb-8">Cambium Admin</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
        {[
          { href: "/dashboard", label: "Dashboard", desc: "Overview & metrics" },
          { href: "/products", label: "Products", desc: "SKU management" },
          { href: "/orders", label: "Orders", desc: "Order tracking & BOM" },
          { href: "/factories", label: "Factories", desc: "Microfactory management" },
          { href: "/materials", label: "Materials", desc: "Wood species & suppliers" },
          { href: "/costs", label: "Cost Models", desc: "Pricing & margins" },
        ].map(({ href, label, desc }) => (
          <Link
            key={href}
            href={href}
            className="block p-6 bg-white border border-zinc-200 rounded-lg hover:border-zinc-400 transition-colors"
          >
            <h2 className="font-medium text-zinc-900">{label}</h2>
            <p className="text-sm text-zinc-500 mt-1">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
