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
  Trophy,
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
  const totalPoints = state.familyMembers.reduce((sum, m) => sum + m.points, 0);

  return (
    <>
      {/* Desktop */}
      <header
        className="hide-mobile fixed top-0 left-0 right-0 z-40"
        style={{
          background: "rgba(10, 10, 26, 0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--accent)" }}
            >
              <span className="text-white text-sm">🏠</span>
            </div>
            <span className="font-bold text-sm hide-mobile">إدارة الأسرة</span>
          </Link>

          <nav className="flex items-center gap-1">
            {links.map((link) => {
              const active = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all no-underline"
                  style={{
                    background: active ? "var(--accent)" : "transparent",
                    color: active ? "white" : "var(--text-secondary)",
                  }}
                >
                  <Icon size={16} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg"
            style={{ background: "rgba(255, 179, 71, 0.1)", color: "#ffb347" }}
          >
            <Trophy size={14} />
            <span className="text-xs font-bold">{totalPoints.toLocaleString("ar")}</span>
          </div>
        </div>
      </header>

      {/* Mobile */}
      <nav
        className="hide-desktop fixed bottom-0 left-0 right-0 z-40"
        style={{
          background: "rgba(10, 10, 26, 0.9)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid var(--border)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="flex items-center justify-around h-14 px-1">
          {links.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg no-underline"
                style={{
                  color: active ? "var(--accent)" : "var(--text-secondary)",
                }}
              >
                <Icon size={20} strokeWidth={active ? 2.2 : 1.5} />
                <span className="text-[9px] font-medium">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
