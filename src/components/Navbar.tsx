"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";

const tabs = [
  { href: "/", label: "الرئيسية", icon: "dashboard", iconActive: "dashboard" },
  { href: "/family", label: "العائلة", icon: "group", iconActive: "group" },
  { href: "/tasks", label: "المهام", icon: "assignment", iconActive: "assignment" },
  { href: "/rewards", label: "الجوائز", icon: "military_tech", iconActive: "military_tech" },
  { href: "/settings", label: "الإعدادات", icon: "settings", iconActive: "settings" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { state } = useStore();
  const pts = state.familyMembers.reduce((s, m) => s + m.points, 0);
  const familyName = state.theme.familyName || "عائلتي";

  return (
    <>
      {/* Desktop Top Bar */}
      <header className="top-bar hide-m">
        <div className="max-w-[540px] mx-auto px-5 py-2 flex flex-row-reverse items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container">
              <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-container))" }}>
                <span className="material-symbols-outlined filled-icon text-white text-xl">family_restroom</span>
              </div>
            </div>
            <span className="font-headline-sm text-lg text-primary font-bold">{familyName}</span>
          </div>
          <nav className="flex items-center gap-1">
            {tabs.map((t) => {
              const on = pathname === t.href;
              return (
                <Link key={t.href} href={t.href}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium no-underline transition-all"
                  style={{ background: on ? "rgba(0,108,73,0.1)" : "transparent", color: on ? "var(--primary)" : "var(--outline)" }}>
                  <span className={`material-symbols-outlined text-base ${on ? "filled-icon" : ""}`}>{t.icon}</span>
                  {t.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">notifications</span>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(0,108,73,0.1)" }}>
              <span className="material-symbols-outlined text-sm filled-icon" style={{ color: "var(--primary)" }}>stars</span>
              <span className="text-xs font-bold" style={{ color: "var(--primary)" }}>{pts.toLocaleString("ar")}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Top Bar */}
      <header className="top-bar hide-d" style={{ padding: "0 20px" }}>
        <div className="flex flex-row-reverse items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container">
              <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-container))" }}>
                <span className="material-symbols-outlined filled-icon text-white text-xl">family_restroom</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-headline-sm text-base text-primary font-bold block">{familyName}</span>
            </div>
          </div>
          <span className="material-symbols-outlined text-primary">notifications</span>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav hide-d">
        <div className="flex items-center justify-around px-2 pt-2 pb-4">
          {tabs.map((t) => {
            const on = pathname === t.href;
            return (
              <Link key={t.href} href={t.href}
                className="flex flex-col items-center justify-center no-underline transition-all p-1.5"
                style={{
                  color: on ? "var(--primary)" : "var(--outline)",
                  transform: on ? "scale(1.1)" : "scale(1)",
                  transition: "all 0.3s",
                }}>
                <span className={`material-symbols-outlined text-2xl ${on ? "filled-icon" : ""}`}>{t.icon}</span>
                <span className="text-xs mt-0.5" style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 500 }}>{t.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
