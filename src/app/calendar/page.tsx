"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";

const DAY_ABBREVS = ["ح", "ن", "ث", "ر", "خ", "ج", "س"];

const PERIOD_CONFIG: Record<string, { label: string; icon: string; dotClass: string; cardBorder: string }> = {
  morning: { label: "الصباح", icon: "wb_sunny", dotClass: "bg-[var(--primary)]", cardBorder: "var(--secondary-container)" },
  afternoon: { label: "الظهيرة", icon: "wb_twilight", dotClass: "bg-[var(--tertiary)]", cardBorder: "var(--tertiary-container)" },
  evening: { label: "المساء", icon: "dark_mode", dotClass: "bg-[var(--outline)]", cardBorder: "var(--primary-container)" },
};

const CATEGORY_PERIOD: Record<string, string> = {
  routine: "morning",
  chore: "afternoon",
  homework: "evening",
  behavior: "evening",
  custom: "evening",
};

const CATEGORY_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  routine: { label: "عادة", color: "var(--primary)", bg: "rgba(0,108,73,0.1)" },
  chore: { label: "مهمة", color: "var(--secondary)", bg: "rgba(0,88,190,0.1)" },
  homework: { label: "واجب", color: "var(--tertiary)", bg: "rgba(133,83,0,0.1)" },
  behavior: { label: "سلوك", color: "var(--outline)", bg: "rgba(108,122,113,0.1)" },
  custom: { label: "مخصص", color: "var(--outline)", bg: "rgba(108,122,113,0.1)" },
};

export default function CalendarPage() {
  const { state, isTaskCompletedOnDate, completeTask, undoCompleteTask } = useStore();

  const [weekStart, setWeekStart] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  });
  const [selDate, setSelDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [fMem, setFMem] = useState("all");

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const isToday = selDate === todayStr;

  const week = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const ds = d.toISOString().split("T")[0];
      return { date: ds, abbrev: DAY_ABBREVS[i], num: d.getDate(), today: ds === todayStr, sel: ds === selDate };
    });
  }, [weekStart, selDate, todayStr]);

  const monthTitle = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 3);
    return d.toLocaleDateString("ar-SA", { month: "long", year: "numeric" });
  }, [weekStart]);

  const tasks = useMemo(() => {
    return state.tasks.filter((t) => {
      if (!t.active) return false;
      if (fMem !== "all" && !t.assignedTo.includes(fMem)) return false;
      return true;
    });
  }, [state.tasks, fMem]);

  const timelinePeriods = useMemo(() => {
    const groups: Record<string, typeof tasks> = { morning: [], afternoon: [], evening: [] };
    tasks.forEach((t) => {
      const period = CATEGORY_PERIOD[t.category] || "evening";
      groups[period].push(t);
    });
    return groups;
  }, [tasks]);

  const weeklyStats = useMemo(() => {
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d.toISOString().split("T")[0];
    });

    let completedCount = 0;
    let totalPoints = 0;
    const dailyCounts: number[] = [];

    weekDays.forEach((date) => {
      let dayCount = 0;
      state.tasks.forEach((task) => {
        if (!task.active) return;
        task.assignedTo.forEach((mId) => {
          if (isTaskCompletedOnDate(task.id, mId, date)) {
            dayCount++;
            completedCount++;
            totalPoints += task.points;
          }
        });
      });
      dailyCounts.push(dayCount);
    });

    let consecutive = 0;
    const todayIdx = weekDays.indexOf(todayStr);
    for (let i = todayIdx; i >= 0; i--) {
      let hasCompletion = false;
      state.tasks.forEach((task) => {
        if (!task.active) return;
        task.assignedTo.forEach((mId) => {
          if (isTaskCompletedOnDate(task.id, mId, weekDays[i])) hasCompletion = true;
        });
      });
      if (hasCompletion) consecutive++;
      else break;
    }

    return {
      completedCount,
      totalPoints,
      consecutive,
      dailyCounts,
      maxDaily: Math.max(...dailyCounts, 1),
    };
  }, [state.tasks, weekStart, todayStr, isTaskCompletedOnDate]);

  const go = (dir: number) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + dir * 7);
    setWeekStart(d);
  };

  const selDateFormatted = new Date(selDate).toLocaleDateString("ar-SA", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="space-y-6">
      {/* ── 1. Member Filter ── */}
      <div className="chip-scroll">
        <button
          onClick={() => setFMem("all")}
          className={`flex items-center justify-center w-14 h-14 rounded-full font-body-sm text-xs font-semibold border-2 transition-all duration-200 shrink-0 ${
            fMem === "all"
              ? "border-[var(--primary)] bg-[var(--primary-container)] text-[var(--on-primary-container)]"
              : "border-[var(--outline-variant)] bg-white/70 text-[var(--on-surface-variant)] opacity-60"
          }`}
        >
          الكل
        </button>
        {state.familyMembers.map((m) => (
          <button
            key={m.id}
            onClick={() => setFMem(m.id)}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-full border-2 transition-all duration-200 shrink-0 ${
              fMem === m.id
                ? "border-[var(--primary)] bg-[var(--primary-container)] text-[var(--on-primary-container)]"
                : "border-[var(--outline-variant)] bg-white/70 text-[var(--on-surface-variant)] opacity-60"
            }`}
          >
            <span className="text-base leading-none">{m.avatar || m.name.charAt(0)}</span>
            <span className="font-body-sm text-[8px] font-medium mt-0.5 truncate max-w-[48px]">{m.name}</span>
          </button>
        ))}
      </div>

      {/* ── 2. Week Selector + 3. Week Strip ── */}
      <div className="glass-card p-4 anim anim1">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => go(-1)} className="glass-card p-2 rounded-xl cursor-pointer border-none active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-[var(--on-surface)]">chevron_right</span>
          </button>
          <span className="font-headline-sm font-bold text-sm text-[var(--on-surface)]">{monthTitle}</span>
          <button onClick={() => go(1)} className="glass-card p-2 rounded-xl cursor-pointer border-none active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-[var(--on-surface)]">chevron_left</span>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {week.map((d) => (
            <button
              key={d.date}
              onClick={() => setSelDate(d.date)}
              className={`flex flex-col items-center py-2.5 rounded-xl cursor-pointer border-none transition-all duration-200 relative ${
                d.sel
                  ? "glass-card bg-[var(--primary-container)] text-white scale-110 shadow-lg"
                  : d.today
                    ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "bg-transparent text-[var(--on-surface-variant)]"
              }`}
            >
              <span className={`text-[9px] font-semibold ${d.sel ? "text-white/70" : ""}`}>{d.abbrev}</span>
              <span className="text-base font-extrabold">{d.num}</span>
              {d.sel && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white shadow" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. Today Summary Card ── */}
      <div className="glass-card p-5 anim anim2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--primary-container)] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined filled-icon text-[var(--on-primary-container)]">calendar_today</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-headline-sm font-bold text-sm text-[var(--on-surface)]">{selDateFormatted}</p>
            <p className="font-body-sm text-xs text-[var(--on-surface-variant)] mt-0.5">
              {isToday ? "يومك ممتلئ بالنشاطات! استمر" : "عرض مهام هذا اليوم"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[var(--surface-container-high)] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[var(--on-surface-variant)] text-xl">partly_cloudy_day</span>
          </div>
        </div>
      </div>

      {/* ── 5. Timeline Section ── */}
      <div className="space-y-5 anim anim3">
        {(["morning", "afternoon", "evening"] as const).map((period) => {
          const cfg = PERIOD_CONFIG[period];
          const periodTasks = timelinePeriods[period];
          if (periodTasks.length === 0) return null;

          return (
            <div key={period}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-2.5 h-2.5 rounded-full ${cfg.dotClass}`} />
                <span className="font-headline-sm font-bold text-sm" style={{ color: cfg.dotClass.includes("primary") ? "var(--primary)" : cfg.dotClass.includes("tertiary") ? "var(--tertiary)" : "var(--outline)" }}>
                  {cfg.label}
                </span>
                <span className="material-symbols-outlined text-xl" style={{ color: cfg.dotClass.includes("primary") ? "var(--primary)" : cfg.dotClass.includes("tertiary") ? "var(--tertiary)" : "var(--outline)" }}>
                  {cfg.icon}
                </span>
              </div>

              <div className="relative pr-6">
                <div
                  className="absolute right-[11px] top-0 bottom-0 w-[2px] rounded-full"
                  style={{ background: `linear-gradient(to bottom, ${cfg.cardBorder}, transparent)` }}
                />

                <div className="space-y-2.5">
                  {periodTasks.map((t, i) => {
                    const done =
                      fMem !== "all"
                        ? isTaskCompletedOnDate(t.id, fMem, selDate)
                        : t.assignedTo.some((mId) => isTaskCompletedOnDate(t.id, mId, selDate));
                    const badge = CATEGORY_BADGE[t.category] || CATEGORY_BADGE.custom;

                    const assignedMembers = t.assignedTo
                      .map((mId) => state.familyMembers.find((m) => m.id === mId))
                      .filter(Boolean);

                    const dotColor =
                      period === "morning" ? "var(--primary)" : period === "afternoon" ? "var(--tertiary)" : "var(--outline)";

                    return (
                      <div
                        key={t.id}
                        className={`glass-card p-3.5 anim${Math.min(i + 1, 5)}`}
                        style={{ borderRight: `4px solid ${cfg.cardBorder}` }}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              if (fMem !== "all") {
                                done ? undoCompleteTask(t.id, fMem) : completeTask(t.id, fMem);
                              }
                            }}
                            className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-200 shrink-0 cursor-pointer ${
                              done
                                ? "border-[var(--primary)] bg-[var(--primary)]"
                                : "border-[var(--outline-variant)] bg-transparent"
                            }`}
                          >
                            {done && <span className="material-symbols-outlined text-white text-sm">check</span>}
                          </button>

                          <div className="flex-1 min-w-0">
                            <p className={`font-body-md text-[15px] font-bold truncate ${done ? "line-through opacity-35" : ""}`}>
                              {t.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="badge" style={{ background: badge.bg, color: badge.color }}>
                                {badge.label}
                              </span>
                            </div>
                          </div>

                          <div className="flex -space-x-2 space-x-reverse shrink-0">
                            {assignedMembers.slice(0, 3).map(
                              (m) =>
                                m && (
                                  <span
                                    key={m.id}
                                    className="w-6 h-6 rounded-full bg-[var(--surface-container-high)] flex items-center justify-center text-[10px] font-bold border-2 border-white"
                                    style={{ color: m.color || "var(--primary)" }}
                                  >
                                    {m.avatar || m.name.charAt(0)}
                                  </span>
                                )
                            )}
                          </div>

                          <div className="flex items-center gap-0.5 shrink-0">
                            <span className="material-symbols-outlined filled-icon text-[var(--tertiary)] text-sm">star</span>
                            <span className="font-label-md text-xs font-extrabold" style={{ color: dotColor }}>
                              {t.points}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {tasks.length === 0 && (
          <div className="glass-card text-center py-10">
            <div className="w-14 h-14 rounded-2xl bg-[var(--primary-container)] flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined filled-icon text-[var(--on-primary-container)] text-2xl">task_alt</span>
            </div>
            <p className="font-headline-sm font-bold text-sm text-[var(--on-surface)] mb-0.5">لا توجد مهام</p>
            <p className="font-body-sm text-xs text-[var(--on-surface-variant)]">اختر يوماً لعرض المهام</p>
          </div>
        )}
      </div>

      {/* ── 6. Weekly Summary ── */}
      <div className="glass-card p-5 anim anim4">
        <h3 className="font-headline-sm font-bold text-sm text-[var(--on-surface)] mb-4">ملخص الأسبوع</h3>

        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="text-center">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary-container)] flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined text-[var(--on-primary-container)]">task_alt</span>
            </div>
            <p className="font-headline-sm font-bold text-lg text-[var(--primary)]">{weeklyStats.completedCount}</p>
            <p className="font-body-sm text-[10px] text-[var(--on-surface-variant)]">مهام مكتملة</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-xl bg-[var(--tertiary-container)] flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined filled-icon text-[var(--on-tertiary-container)]">stars</span>
            </div>
            <p className="font-headline-sm font-bold text-lg text-[var(--tertiary)]">{weeklyStats.totalPoints}</p>
            <p className="font-body-sm text-[10px] text-[var(--on-surface-variant)]">نقاط الأسبوع</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-xl bg-[var(--secondary-container)] flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined text-[var(--on-secondary-container)]">local_fire_department</span>
            </div>
            <p className="font-headline-sm font-bold text-lg text-[var(--secondary)]">{weeklyStats.consecutive}</p>
            <p className="font-body-sm text-[10px] text-[var(--on-surface-variant)]">أيام متتالية</p>
          </div>
        </div>

        <div className="flex items-end justify-between gap-2 px-1" style={{ height: 96 }}>
          {week.map((d, i) => {
            const count = weeklyStats.dailyCounts[i];
            const height = (count / weeklyStats.maxDaily) * 60;
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center justify-end gap-1.5">
                <div
                  className="rounded-t-md transition-all duration-500"
                  style={{
                    width: "70%",
                    height: `${Math.max(height, count > 0 ? 8 : 3)}px`,
                    background: d.sel
                      ? "linear-gradient(to top, var(--primary), var(--primary-container))"
                      : "var(--surface-container-high)",
                  }}
                />
                <span className={`font-body-sm text-[9px] ${d.sel ? "font-bold text-[var(--primary)]" : "text-[var(--on-surface-variant)]"}`}>
                  {d.abbrev}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
