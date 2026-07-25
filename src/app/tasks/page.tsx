"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import type { Task } from "@/lib/types";

const categories = [
  { v: "routine", l: "روتينية" },
  { v: "homework", l: "واجبات" },
  { v: "chore", l: "أعمال منزلية" },
  { v: "behavior", l: "السلوك" },
  { v: "custom", l: "أخرى" },
];

const categoryColors: Record<string, string> = {
  routine: "var(--primary)",
  homework: "var(--secondary)",
  chore: "var(--tertiary)",
  behavior: "#e11d48",
  custom: "var(--on-surface-variant)",
};

const categoryLabels: Record<string, string> = {
  routine: "روتينية",
  homework: "واجبات",
  chore: "أعمال منزلية",
  behavior: "السلوك",
  custom: "أخرى",
};

const frequencyOptions = [
  { v: "daily", l: "يومي" },
  { v: "weekly", l: "أسبوعي" },
  { v: "once", l: "مرة واحدة" },
];

export default function TasksPage() {
  const { state, addTask, removeTask, completeTask, undoCompleteTask, isTaskCompletedOnDate } = useStore();
  const [showSheet, setShowSheet] = useState(false);
  const [filterMember, setFilterMember] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    title: "",
    description: "",
    points: 10,
    category: "routine" as Task["category"],
    frequency: "daily" as Task["frequency"],
    assignedTo: [] as string[],
  });

  const tasks = state.tasks.filter((t) => {
    if (!t.active) return false;
    if (filterMember !== "all" && !t.assignedTo.includes(filterMember)) return false;
    if (filterCategory !== "all" && t.category !== filterCategory) return false;
    return true;
  });

  const submitTask = () => {
    if (!form.title.trim()) return;
    addTask(form);
    setForm({ title: "", description: "", points: 10, category: "routine", frequency: "daily", assignedTo: [] });
    setShowSheet(false);
  };

  const toggleAssignedMember = (id: string) => {
    setForm((p) => ({
      ...p,
      assignedTo: p.assignedTo.includes(id)
        ? p.assignedTo.filter((x) => x !== id)
        : [...p.assignedTo, id],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="anim">
        <h1 className="font-headline-md" style={{ fontSize: 24, fontWeight: 700, color: "var(--on-surface)" }}>
          المهام اليومية
        </h1>
        <p className="font-body-sm" style={{ fontSize: 13, color: "var(--on-surface-variant)", marginTop: 4 }}>
          إنجازات اليوم تبني مستقبل الغد
        </p>
      </div>

      <div className="chip-scroll anim1">
        <button
          onClick={() => setFilterCategory("all")}
          className={`chip ${filterCategory === "all" ? "on" : ""}`}
        >
          الكل
        </button>
        {categories.map((c) => (
          <button
            key={c.v}
            onClick={() => setFilterCategory(c.v)}
            className={`chip ${filterCategory === c.v ? "on" : ""}`}
          >
            {c.l}
          </button>
        ))}
      </div>

      <div className="chip-scroll anim2">
        <button
          onClick={() => setFilterMember("all")}
          className={`flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer bg-transparent border-none`}
          style={{ scrollSnapAlign: "start" }}
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
              filterMember === "all" ? "ring-2 ring-primary" : ""
            }`}
            style={{
              background: filterMember === "all" ? "var(--primary-container)" : "var(--surface-container-high)",
              color: filterMember === "all" ? "var(--on-primary-container)" : "var(--on-surface-variant)",
            }}
          >
            <span className="material-symbols-outlined">groups</span>
          </div>
          <span className="font-label-md" style={{ fontSize: 11, color: "var(--on-surface-variant)" }}>الكل</span>
        </button>
        {state.familyMembers.map((m) => (
          <button
            key={m.id}
            onClick={() => setFilterMember(m.id)}
            className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer bg-transparent border-none"
            style={{ scrollSnapAlign: "start" }}
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 overflow-hidden ${
                filterMember === m.id ? "ring-2 ring-primary" : ""
              }`}
              style={{
                background: m.color || "var(--primary-container)",
                color: "var(--on-primary)",
              }}
            >
              {m.avatar ? (
                <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
              ) : (
                m.icon || m.name.charAt(0)
              )}
            </div>
            <span className="font-label-md" style={{ fontSize: 11, color: "var(--on-surface-variant)" }}>{m.name}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3 anim3">
        {tasks.length === 0 ? (
          <div className="glass-card" style={{ padding: "40px 20px", textAlign: "center" }}>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: "var(--primary-container)" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: "var(--on-primary-container)" }}>
                task_alt
              </span>
            </div>
            <p className="font-headline-sm" style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: "var(--on-surface)" }}>
              لا توجد مهام
            </p>
            <p className="font-body-sm" style={{ fontSize: 12, color: "var(--on-surface-variant)" }}>
              أضف مهمة جديدة للبدء
            </p>
          </div>
        ) : (
          tasks.map((t, i) => {
            const firstMember = t.assignedTo[0];
            const done = firstMember ? isTaskCompletedOnDate(t.id, firstMember, today) : false;
            const member = firstMember ? state.familyMembers.find((m) => m.id === firstMember) : null;
            const animClass = `anim${Math.min(i + 1, 5)}`;

            return (
              <div
                key={t.id}
                className={`glass-card ${animClass}`}
                style={{
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  transition: "all 0.3s ease",
                  transform: done ? "scale(0.98)" : "scale(1)",
                  opacity: done ? 0.55 : 1,
                }}
              >
                <button
                  onClick={() => firstMember && (done ? undoCompleteTask(t.id, firstMember) : completeTask(t.id, firstMember))}
                  className="bg-transparent border-none p-0 cursor-pointer shrink-0 flex items-center justify-center"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    border: done ? "none" : "2px solid var(--primary)",
                    background: done ? "var(--primary)" : "transparent",
                    transition: "all 0.3s ease",
                  }}
                >
                  {done && (
                    <span className="material-symbols-outlined filled-icon" style={{ fontSize: 24, color: "var(--on-primary)" }}>
                      check
                    </span>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p
                    className="font-headline-sm"
                    style={{
                      fontWeight: 700,
                      fontSize: 15,
                      color: "var(--on-surface)",
                      textDecoration: done ? "line-through" : "none",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {t.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="badge"
                      style={{
                        background: `${categoryColors[t.category]}15`,
                        color: categoryColors[t.category],
                        fontSize: 11,
                        fontWeight: 500,
                      }}
                    >
                      {categoryLabels[t.category]}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <span className="material-symbols-outlined filled-icon" style={{ fontSize: 14, color: "var(--tertiary)" }}>
                        star
                      </span>
                      <span className="font-label-md" style={{ fontSize: 12, fontWeight: 700, color: "var(--tertiary)" }}>
                        {t.points}
                      </span>
                    </div>
                  </div>
                </div>

                {member && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden"
                    style={{
                      background: member.color || "var(--primary-container)",
                      color: "var(--on-primary)",
                      boxShadow: "0 0 0 2px white",
                    }}
                  >
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      member.icon || member.name.charAt(0)
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <button className="fab" onClick={() => setShowSheet(true)}>
        <span className="material-symbols-outlined">add</span>
      </button>

      <div className={`sheet-overlay ${showSheet ? "open" : ""}`} onClick={() => setShowSheet(false)} />

      <div className={`bottom-sheet ${showSheet ? "open" : ""}`}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "var(--outline-variant)", margin: "0 auto 20px" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 className="font-headline-md" style={{ fontSize: 20, fontWeight: 700, color: "var(--on-surface)" }}>
            إضافة مهمة جديدة
          </h2>
          <button
            onClick={submitTask}
            className="font-label-md"
            style={{
              background: "var(--primary)",
              color: "var(--on-primary)",
              border: "none",
              borderRadius: 12,
              padding: "8px 20px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            حفظ
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="font-label-md" style={{ fontSize: 13, fontWeight: 500, color: "var(--on-surface-variant)", display: "block", marginBottom: 8 }}>
              اسم المهمة
            </label>
            <input
              className="input-field"
              placeholder="أدخل اسم المهمة"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="font-label-md" style={{ fontSize: 13, fontWeight: 500, color: "var(--on-surface-variant)", display: "block", marginBottom: 8 }}>
                النقاط
              </label>
              <input
                className="input-field"
                type="number"
                min={1}
                value={form.points}
                onChange={(e) => setForm((p) => ({ ...p, points: +e.target.value }))}
              />
            </div>
            <div>
              <label className="font-label-md" style={{ fontSize: 13, fontWeight: 500, color: "var(--on-surface-variant)", display: "block", marginBottom: 8 }}>
                التاريخ
              </label>
              <input
                className="input-field"
                type="date"
                defaultValue={today}
                style={{ colorScheme: "light" }}
              />
            </div>
          </div>

          <div>
            <label className="font-label-md" style={{ fontSize: 13, fontWeight: 500, color: "var(--on-surface-variant)", display: "block", marginBottom: 8 }}>
              المسؤول
            </label>
            <div className="chip-scroll">
              {state.familyMembers.map((m) => (
                <button
                  key={m.id}
                  onClick={() => toggleAssignedMember(m.id)}
                  className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer bg-transparent border-none"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 overflow-hidden ${
                      form.assignedTo.includes(m.id) ? "ring-2 ring-primary" : ""
                    }`}
                    style={{
                      background: m.color || "var(--primary-container)",
                      color: "var(--on-primary)",
                    }}
                  >
                    {m.avatar ? (
                      <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                    ) : (
                      m.icon || m.name.charAt(0)
                    )}
                  </div>
                  <span className="font-label-md" style={{ fontSize: 10, color: "var(--on-surface-variant)" }}>{m.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-label-md" style={{ fontSize: 13, fontWeight: 500, color: "var(--on-surface-variant)", display: "block", marginBottom: 8 }}>
              الفئة
            </label>
            <div className="chip-scroll">
              {categories.map((c) => (
                <button
                  key={c.v}
                  onClick={() => setForm((p) => ({ ...p, category: c.v as Task["category"] }))}
                  className={`chip ${form.category === c.v ? "on" : ""}`}
                >
                  {c.l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-label-md" style={{ fontSize: 13, fontWeight: 500, color: "var(--on-surface-variant)", display: "block", marginBottom: 8 }}>
              التكرار
            </label>
            <select
              className="select-field"
              value={form.frequency}
              onChange={(e) => setForm((p) => ({ ...p, frequency: e.target.value as Task["frequency"] }))}
            >
              {frequencyOptions.map((f) => (
                <option key={f.v} value={f.v}>{f.l}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
