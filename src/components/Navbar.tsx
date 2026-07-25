"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Gift,
  Calendar,
  Settings,
} from "lucide-react";

const tabs = [
  { href: "/", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/family", label: "الأسرة", icon: Users },
  { href: "/tasks", label: "المهام", icon: CheckSquare },
  { href: "/rewards", label: "المكافآت", icon: Gift },
  { href: "/calendar", label: "التقويم", icon: Calendar },
  { href: "/settings", label: "الإعدادات", icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();
  const { state } = useStore();
  const pts = state.familyMembers.reduce((s, m) => s + m.points, 0);

  return (
    <>
      {/* Desktop */}
      <header className="top-bar hide-m">
        <div className="max-w-[540px] mx-auto px-6 h-[60px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)" }}>
              <span className="text-white text-sm font-bold">F</span>
            </div>
            <span className="font-extrabold text-sm tracking-tight">FamilyApp</span>
          </Link>
          <nav className="flex items-center gap-1">
            {tabs.map((t) => {
              const on = pathname === t.href;
              const I = t.icon;
              return (
                <Link key={t.href} href={t.href}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold no-underline transition-all"
                  style={{ background: on ? "var(--accent)" : "transparent", color: on ? "#fff" : "var(--text2)" }}>
                  <I size={15} /> {t.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: "var(--orange-dim)" }}>
            <span className="text-sm">⭐</span>
            <span className="text-sm font-extrabold" style={{ color: "var(--orange)" }}>{pts.toLocaleString("ar")}</span>
          </div>
        </div>
      </header>

      {/* Mobile bottom */}
      <nav className="bottom-nav hide-d">
        <div className="flex items-center justify-around px-2">
          {tabs.map((t) => {
            const on = pathname === t.href;
            const I = t.icon;
            return (
              <Link key={t.href} href={t.href} className="nav-item" style={{ color: on ? "var(--accent)" : "var(--text3)", width: "100%" }}>
                <div className="relative">
                  <I size={22} strokeWidth={on ? 2.4 : 1.6} />
                  {on && <div className="nav-dot" />}
                </div>
                <span style={{ color: on ? "var(--text)" : "var(--text3)" }}>{t.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
