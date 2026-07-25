"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { CheckCircle, Circle, Star, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { Task } from "@/lib/types";

export default function TasksPage() {
  const { state, addTask, removeTask, completeTask, undoCompleteTask, isTaskCompletedOnDate } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [fMember, setFMember] = useState("all");
  const [fCat, setFCat] = useState("all");
  const today = new Date().toISOString().split("T")[0];

  const cats = [
    { v: "routine", l: "روتينية", c: "var(--accent)" },
    { v: "chore", l: "منزلية", c: "var(--green)" },
    { v: "homework", l: "واجبات", c: "var(--orange)" },
    { v: "behavior", l: "سلوك", c: "var(--accent2)" },
    { v: "custom", l: "أخرى", c: "var(--text2)" },
  ];

  const [f, setF] = useState({
    title: "", description: "", points: 10,
    category: "routine" as Task["category"],
    frequency: "daily" as Task["frequency"],
    assignedTo: [] as string[],
  });

  const tasks = state.tasks.filter((t) => {
    if (!t.active) return false;
    if (fMember !== "all" && !t.assignedTo.includes(fMember)) return false;
    if (fCat !== "all" && t.category !== fCat) return false;
    return true;
  });

  const add = () => {
    if (!f.title.trim()) return;
    addTask(f);
    setF({ title: "", description: "", points: 10, category: "routine", frequency: "daily", assignedTo: [] });
    setShowForm(false);
  };

  return (
    <div className="space-y-3 anim">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">المهام</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary text-xs px-4 py-2">
          <Plus size={14} /> جديد
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
        <button onClick={() => setFMember("all")} className={`chip ${fMember === "all" ? "on" : ""}`}>الكل</button>
        {state.familyMembers.map((m) => (
          <button key={m.id} onClick={() => setFMember(m.id)} className={`chip ${fMember === m.id ? "on" : ""}`}>
            {m.icon || m.name.charAt(0)} {m.name}
          </button>
        ))}
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
        <button onClick={() => setFCat("all")} className={`chip ${fCat === "all" ? "on" : ""}`}>كل الفئات</button>
        {cats.map((c) => (
          <button key={c.v} onClick={() => setFCat(c.v)} className={`chip ${fCat === c.v ? "on" : ""}`}>{c.l}</button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="glass p-4 anim-scale" style={{ borderColor: "rgba(124,108,255,0.3)" }}>
          <div className="space-y-3">
            <input className="input" placeholder="عنوان المهمة" value={f.title} onChange={(e) => setF((p) => ({ ...p, title: e.target.value }))} />
            <textarea className="input" placeholder="الوصف (اختياري)" rows={2} value={f.description} onChange={(e) => setF((p) => ({ ...p, description: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] mb-1 block" style={{ color: "var(--text2)" }}>النقاط</label>
                <input className="input" type="number" min={1} value={f.points} onChange={(e) => setF((p) => ({ ...p, points: +e.target.value }))} />
              </div>
              <div>
                <label className="text-[10px] mb-1 block" style={{ color: "var(--text2)" }}>الفئة</label>
                <select className="select" value={f.category} onChange={(e) => setF((p) => ({ ...p, category: e.target.value as Task["category"] }))}>
                  {cats.map((c) => <option key={c.v} value={c.v}>{c.l}</option>)}
                </select>
              </div>
            </div>
            <select className="select" value={f.frequency} onChange={(e) => setF((p) => ({ ...p, frequency: e.target.value as Task["frequency"] }))}>
              <option value="daily">يومي</option>
              <option value="weekly">أسبوعي</option>
              <option value="once">مرة واحدة</option>
            </select>
            <div>
              <label className="text-[10px] mb-1 block" style={{ color: "var(--text2)" }}>تعيين إلى</label>
              <div className="flex gap-1.5 flex-wrap">
                {state.familyMembers.map((m) => (
                  <button key={m.id} onClick={() => setF((p) => ({
                    ...p, assignedTo: p.assignedTo.includes(m.id) ? p.assignedTo.filter((x) => x !== m.id) : [...p.assignedTo, m.id],
                  }))} className={`chip ${f.assignedTo.includes(m.id) ? "on" : ""}`}>
                    {m.icon || m.name.charAt(0)} {m.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={add} className="btn btn-primary flex-1 text-sm">حفظ</button>
              <button onClick={() => setShowForm(false)} className="btn btn-ghost text-sm">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="glass-sm p-8 text-center">
            <p className="text-2xl mb-1">📋</p>
            <p className="text-xs" style={{ color: "var(--text2)" }}>لا توجد مهام</p>
          </div>
        ) : tasks.map((t, i) => {
          const exp = expanded === t.id;
          const cat = cats.find((c) => c.v === t.category);
          const mId = t.assignedTo[0];
          const done = mId ? isTaskCompletedOnDate(t.id, mId, today) : false;

          return (
            <div key={t.id} className={`glass-sm p-3 anim-d${Math.min(i + 1, 5)}`}>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => mId && (done ? undoCompleteTask(t.id, mId) : completeTask(t.id, mId))}
                  className="bg-transparent border-none p-0 cursor-pointer shrink-0"
                  style={{ color: done ? "var(--green)" : "var(--text2)" }}
                >
                  {done ? <CheckCircle size={20} /> : <Circle size={20} />}
                </button>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold block truncate"
                    style={{ textDecoration: done ? "line-through" : "none", opacity: done ? 0.4 : 1 }}>
                    {t.title}
                  </span>
                  {t.description && <p className="text-[10px] truncate mt-0.5" style={{ color: "var(--text2)" }}>{t.description}</p>}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="badge" style={{ background: `${cat?.c}15`, color: cat?.c }}>{cat?.l}</span>
                  <div className="flex items-center gap-0.5">
                    <Star size={10} fill="var(--orange)" style={{ color: "var(--orange)" }} />
                    <span className="text-[11px] font-bold" style={{ color: "var(--orange)" }}>{t.points}</span>
                  </div>
                  <button onClick={() => setExpanded(exp ? null : t.id)} className="bg-transparent border-none p-0 cursor-pointer" style={{ color: "var(--text2)" }}>
                    {exp ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>

              {exp && (
                <div className="mt-2.5 pt-2.5 space-y-2" style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex gap-1 flex-wrap">
                    {t.assignedTo.map((id) => {
                      const m = state.familyMembers.find((x) => x.id === id);
                      return m ? <span key={id} className="badge" style={{ background: `${m.color || "var(--accent)"}15`, color: m.color || "var(--accent)" }}>{m.icon || m.name.charAt(0)} {m.name}</span> : null;
                    })}
                    {!t.assignedTo.length && <span className="text-[10px]" style={{ color: "var(--text2)" }}>غير مُعيّنة</span>}
                  </div>
                  <button onClick={() => removeTask(t.id)} className="btn btn-danger text-xs py-1.5 px-3">
                    <Trash2 size={11} /> حذف
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
