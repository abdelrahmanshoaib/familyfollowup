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

const links = [
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
  const totalPoints = state.familyMembers.reduce((s, m) => s + m.points, 0);

  return (
    <>
      {/* Desktop top bar */}
      <header className="top-bar hide-m">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--accent)" }}>
              <span className="text-white text-sm">🏠</span>
            </div>
            <span className="font-bold text-sm">إدارة الأسرة</span>
          </Link>
          <nav className="flex items-center gap-1">
            {links.map((l) => {
              const on = pathname === l.href;
              const I = l.icon;
              return (
                <Link key={l.href} href={l.href}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium no-underline transition-all"
                  style={{ background: on ? "var(--accent)" : "transparent", color: on ? "#fff" : "var(--text2)" }}>
                  <I size={15} /> {l.label}
                </Link>
              );
            })}
          </nav>
          <div className="glass-pill px-3 py-1.5 flex items-center gap-1.5">
            <span style={{ color: "var(--orange)" }} className="text-xs font-bold">⭐ {totalPoints.toLocaleString("ar")}</span>
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav hide-d">
        <div className="flex items-center justify-around">
          {links.map((l) => {
            const on = pathname === l.href;
            const I = l.icon;
            return (
              <Link key={l.href} href={l.href} style={{ color: on ? "var(--accent)" : "var(--text2)" }}>
                <div className="relative">
                  <I size={22} strokeWidth={on ? 2.2 : 1.6} />
                  {on && (
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full" style={{ background: "var(--accent)" }} />
                  )}
                </div>
                <span>{l.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
