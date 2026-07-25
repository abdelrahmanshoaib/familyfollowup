"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { ChevronRight, ChevronLeft, CheckCircle, Circle, Star, Users } from "lucide-react";

export default function CalendarPage() {
  const { state, isTaskCompletedOnDate, completeTask, undoCompleteTask } = useStore();
  const [weekStart, setWeekStart] = useState(() => {
    const now = new Date();
    const d = now.getDay();
    const diff = now.getDate() - d + (d === 0 ? -6 : 1);
    return new Date(now.setDate(diff));
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [filterMember, setFilterMember] = useState("all");

  const days = ["الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"];
  const todayStr = new Date().toISOString().split("T")[0];

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    return {
      date: dateStr,
      label: days[i],
      num: d.getDate(),
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedDate,
    };
  });

  const dayTasks = state.tasks.filter((t) => {
    if (!t.active) return false;
    if (filterMember !== "all" && !t.assignedTo.includes(filterMember)) return false;
    return true;
  });

  const toggle = (taskId: string, memberId: string) => {
    if (isTaskCompletedOnDate(taskId, memberId, selectedDate)) {
      undoCompleteTask(taskId, memberId);
    } else {
      completeTask(taskId, memberId);
    }
  };

  return (
    <div className="space-y-4 animate-in">
      <h1 className="text-xl font-bold">التقويم</h1>

      {/* Week */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); }} className="btn btn-secondary py-1 px-2">
            <ChevronRight size={16} />
          </button>
          <span className="text-sm font-semibold">{weekStart.toLocaleDateString("ar-SA", { month: "long", year: "numeric" })}</span>
          <button onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); }} className="btn btn-secondary py-1 px-2">
            <ChevronLeft size={16} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <button
              key={day.date}
              onClick={() => setSelectedDate(day.date)}
              className="flex flex-col items-center py-2 rounded-lg cursor-pointer border-none transition-all"
              style={{
                background: day.isSelected ? "var(--accent)" : day.isToday ? "rgba(124, 108, 255, 0.1)" : "transparent",
                color: day.isSelected ? "white" : "var(--text-primary)",
              }}
            >
              <span className="text-[9px]" style={{ color: day.isSelected ? "rgba(255,255,255,0.7)" : "var(--text-secondary)" }}>{day.label}</span>
              <span className="text-base font-bold">{day.num}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Member filter */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        <button onClick={() => setFilterMember("all")} className={`chip ${filterMember === "all" ? "chip-active" : ""}`}>
          <Users size={12} /> الكل
        </button>
        {state.familyMembers.map((m) => (
          <button key={m.id} onClick={() => setFilterMember(m.id)} className={`chip ${filterMember === m.id ? "chip-active" : ""}`}>
            {m.icon || m.name.charAt(0)} {m.name}
          </button>
        ))}
      </div>

      {/* Tasks */}
      <h3 className="font-bold text-sm" style={{ color: "var(--text-secondary)" }}>
        {new Date(selectedDate).toLocaleDateString("ar-SA", { weekday: "long", day: "numeric", month: "long" })}
      </h3>

      <div className="space-y-2">
        {dayTasks.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-3xl mb-2">📅</p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>لا توجد مهام</p>
          </div>
        ) : (
          dayTasks.map((task, i) => {
            const memberId = task.assignedTo[0];
            const member = memberId ? state.familyMembers.find((m) => m.id === memberId) : null;
            const done = memberId ? isTaskCompletedOnDate(task.id, memberId, selectedDate) : false;

            return (
              <div key={task.id} className={`card animate-in-${Math.min(i + 1, 5)}`}>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => memberId && toggle(task.id, memberId)}
                    className="bg-transparent border-none p-0 cursor-pointer"
                    style={{ color: done ? "var(--success)" : "var(--text-secondary)" }}
                  >
                    {done ? <CheckCircle size={18} /> : <Circle size={18} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold" style={{ textDecoration: done ? "line-through" : "none", opacity: done ? 0.5 : 1 }}>
                      {task.title}
                    </span>
                    {member && (
                      <span className="badge text-[10px] mr-2" style={{ background: `${member.color || "var(--accent)"}15`, color: member.color || "var(--accent)" }}>
                        {member.icon || member.name.charAt(0)} {member.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Star size={11} style={{ color: "#ffb347" }} fill="#ffb347" />
                    <span className="text-xs font-bold" style={{ color: "#ffb347" }}>{task.points}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
