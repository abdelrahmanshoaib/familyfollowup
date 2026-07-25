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
  const [fMember, setFMember] = useState("all");

  const dayNames = ["إثن", "ثلا", "أرب", "خمي", "جمع", "سبت", "أحد"];
  const todayStr = new Date().toISOString().split("T")[0];

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const ds = d.toISOString().split("T")[0];
    return { date: ds, name: dayNames[i], num: d.getDate(), today: ds === todayStr, sel: ds === selDate };
  });

  const tasks = state.tasks.filter((t) => {
    if (!t.active) return false;
    if (fMember !== "all" && !t.assignedTo.includes(fMember)) return false;
    return true;
  });

  const go = (dir: number) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + dir * 7);
    setWeekStart(d);
  };

  const toggle = (taskId: string, memberId: string) => {
    isTaskCompletedOnDate(taskId, memberId, selDate)
      ? undoCompleteTask(taskId, memberId)
      : completeTask(taskId, memberId);
  };

  return (
    <div className="space-y-3 anim">
      <h1 className="text-lg font-bold">التقويم</h1>

      {/* Week */}
      <div className="glass p-3">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => go(-1)} className="btn btn-ghost py-1 px-2"><ChevronRight size={14} /></button>
          <span className="text-xs font-semibold">{weekStart.toLocaleDateString("ar-SA", { month: "long", year: "numeric" })}</span>
          <button onClick={() => go(1)} className="btn btn-ghost py-1 px-2"><ChevronLeft size={14} /></button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {week.map((d) => (
            <button key={d.date} onClick={() => setSelDate(d.date)}
              className="flex flex-col items-center py-2 rounded-xl cursor-pointer border-none transition-all"
              style={{
                background: d.sel ? "var(--accent)" : d.today ? "rgba(124,108,255,0.12)" : "transparent",
                color: d.sel ? "#fff" : "var(--text)",
              }}>
              <span className="text-[8px] leading-tight" style={{ color: d.sel ? "rgba(255,255,255,0.6)" : "var(--text2)" }}>{d.name}</span>
              <span className="text-sm font-bold">{d.num}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Members */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
        <button onClick={() => setFMember("all")} className={`chip ${fMember === "all" ? "on" : ""}`}><Users size={11} /> الكل</button>
        {state.familyMembers.map((m) => (
          <button key={m.id} onClick={() => setFMember(m.id)} className={`chip ${fMember === m.id ? "on" : ""}`}>
            {m.icon || m.name.charAt(0)} {m.name}
          </button>
        ))}
      </div>

      {/* Date label */}
      <p className="text-[11px] font-semibold" style={{ color: "var(--text2)" }}>
        {new Date(selDate).toLocaleDateString("ar-SA", { weekday: "long", day: "numeric", month: "long" })}
      </p>

      {/* Tasks */}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="glass-sm p-8 text-center">
            <p className="text-2xl mb-1">📅</p>
            <p className="text-xs" style={{ color: "var(--text2)" }}>لا توجد مهام</p>
          </div>
        ) : tasks.map((t, i) => {
          const mId = t.assignedTo[0];
          const m = mId ? state.familyMembers.find((x) => x.id === mId) : null;
          const done = mId ? isTaskCompletedOnDate(t.id, mId, selDate) : false;

          return (
            <div key={t.id} className={`glass-sm p-3 anim-d${Math.min(i + 1, 5)}`}>
              <div className="flex items-center gap-2.5">
                <button onClick={() => mId && toggle(t.id, mId)} className="bg-transparent border-none p-0 cursor-pointer shrink-0"
                  style={{ color: done ? "var(--green)" : "var(--text2)" }}>
                  {done ? <CheckCircle size={18} /> : <Circle size={18} />}
                </button>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold block truncate"
                    style={{ textDecoration: done ? "line-through" : "none", opacity: done ? 0.4 : 1 }}>
                    {t.title}
                  </span>
                  {m && (
                    <span className="badge text-[9px] mt-0.5" style={{ background: `${m.color || "var(--accent)"}15`, color: m.color || "var(--accent)" }}>
                      {m.icon || m.name.charAt(0)} {m.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <Star size={10} fill="var(--orange)" style={{ color: "var(--orange)" }} />
                  <span className="text-[10px] font-bold" style={{ color: "var(--orange)" }}>{t.points}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
