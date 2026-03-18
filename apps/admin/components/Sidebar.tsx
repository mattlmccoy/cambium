"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_SECTIONS = [
  {
    label: "Operations",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "📊" },
      { href: "/products", label: "Products", icon: "📦" },
      { href: "/orders", label: "Orders", icon: "📋" },
      { href: "/factories", label: "Factories", icon: "🏭" },
      { href: "/materials", label: "Materials", icon: "🪵" },
    ],
  },
  {
    label: "Business Tools",
    items: [
      { href: "/costs", label: "Cost Models", icon: "💰" },
      { href: "/cost-modeling", label: "Cost Modeling", icon: "🧮" },
      { href: "/unit-economics", label: "Unit Economics", icon: "📈" },
      { href: "/sensitivity", label: "Sensitivity", icon: "🎛" },
      { href: "/planning", label: "Planning Board", icon: "📝" },
    ],
  },
  {
    label: "Dev Tools",
    items: [
      { href: "/dev-viewer", label: "3D Model Viewer", icon: "🔧" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-zinc-200 flex flex-col">
      <Link href="/" className="block px-5 py-4 border-b border-zinc-200">
        <span className="text-sm font-semibold tracking-wider text-zinc-900 uppercase">
          Cambium
        </span>
        <span className="block text-xs text-zinc-400 mt-0.5">Admin Tools</span>
      </Link>

      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-4">
            <div className="px-5 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              {section.label}
            </div>
            {section.items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-5 py-2 text-sm transition-colors ${
                    active
                      ? "bg-zinc-100 text-zinc-900 font-medium"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                  }`}
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
