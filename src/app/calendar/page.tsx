"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { ChevronRight, ChevronLeft, CheckCircle, Circle, Star, Users } from "lucide-react";

export default function CalendarPage() {
  const { state, isTaskCompletedOnDate, completeTask, undoCompleteTask } = useStore();
  const [weekStart, setWeekStart] = useState(() => {
    const now = new Date();
    const d = now.getDay();
    return new Date(now.setDate(now.getDate() - d + (d === 0 ? -6 : 1)));
  });
  const [selDate, setSelDate] = useState(new Date().toISOString().split("T")[0]);
  const [fMem, setFMem] = useState("all");

  const dayLabels = ["إثن", "ثلا", "أرب", "خمي", "جمع", "سبت", "أحد"];
  const todayStr = new Date().toISOString().split("T")[0];

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const ds = d.toISOString().split("T")[0];
    return { date: ds, name: dayLabels[i], num: d.getDate(), today: ds === todayStr, sel: ds === selDate };
  });

  const tasks = state.tasks.filter((t) => {
    if (!t.active) return false;
    if (fMem !== "all" && !t.assignedTo.includes(fMem)) return false;
    return true;
  });

  const go = (dir: number) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + dir * 7);
    setWeekStart(d);
  };

  return (
    <div className="space-y-4 anim">
      <h1 className="title">التقويم</h1>

      {/* Week card */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => go(-1)} className="btn btn-ghost btn-sm px-2.5 py-1.5"><ChevronRight size={16} /></button>
          <span className="text-sm font-bold">{weekStart.toLocaleDateString("ar-SA", { month: "long", year: "numeric" })}</span>
          <button onClick={() => go(1)} className="btn btn-ghost btn-sm px-2.5 py-1.5"><ChevronLeft size={16} /></button>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {week.map((d) => (
            <button key={d.date} onClick={() => setSelDate(d.date)}
              className="flex flex-col items-center py-2.5 rounded-xl cursor-pointer border-none"
              style={{
                background: d.sel ? "var(--accent)" : d.today ? "var(--accent-dim)" : "transparent",
                color: d.sel ? "#fff" : "var(--text)",
              }}>
              <span className="text-[9px] font-semibold" style={{ color: d.sel ? "rgba(255,255,255,0.6)" : "var(--text3)" }}>{d.name}</span>
              <span className="text-base font-extrabold">{d.num}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="chip-scroll">
        <button onClick={() => setFMem("all")} className={`chip ${fMem === "all" ? "on" : ""}`}><Users size={12} /> الكل</button>
        {state.familyMembers.map((m) => (
          <button key={m.id} onClick={() => setFMem(m.id)} className={`chip ${fMem === m.id ? "on" : ""}`}>
            {m.icon || m.name.charAt(0)} {m.name}
          </button>
        ))}
      </div>

      <p className="text-sm font-bold" style={{ color: "var(--text2)" }}>
        {new Date(selDate).toLocaleDateString("ar-SA", { weekday: "long", day: "numeric", month: "long" })}
      </p>

      <div className="space-y-2.5">
        {tasks.length === 0 ? (
          <div className="card-sm text-center py-10">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "var(--accent-dim)" }}>
              <CheckCircle size={24} style={{ color: "var(--accent)" }} />
            </div>
            <p className="text-sm font-bold mb-0.5">لا توجد مهام</p>
            <p className="text-xs" style={{ color: "var(--text2)" }}>اختر يوماً لعرض المهام</p>
          </div>
        ) : tasks.map((t, i) => {
          const mId = t.assignedTo[0];
          const m = mId ? state.familyMembers.find((x) => x.id === mId) : null;
          const done = mId ? isTaskCompletedOnDate(t.id, mId, selDate) : false;

          return (
            <div key={t.id} className={`card-sm anim${Math.min(i + 1, 5)}`}>
              <div className="flex items-center gap-3">
                <button onClick={() => mId && (done ? undoCompleteTask(t.id, mId) : completeTask(t.id, mId))}
                  className="bg-transparent border-none p-0 cursor-pointer shrink-0"
                  style={{ color: done ? "var(--green)" : "var(--text3)" }}>
                  {done ? <CheckCircle size={20} /> : <Circle size={20} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold truncate"
                    style={{ textDecoration: done ? "line-through" : "none", opacity: done ? 0.35 : 1 }}>
                    {t.title}
                  </p>
                  {m && (
                    <span className="badge mt-1" style={{ background: `${m.color || "var(--accent)"}18`, color: m.color || "var(--accent)" }}>
                      {m.icon || m.name.charAt(0)} {m.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <Star size={11} fill="var(--orange)" style={{ color: "var(--orange)" }} />
                  <span className="text-xs font-extrabold" style={{ color: "var(--orange)" }}>{t.points}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
