"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { CheckCircle, Circle, Star, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { Task } from "@/lib/types";

const cats = [
  { v: "routine", l: "روتينية", c: "var(--accent)" },
  { v: "chore", l: "منزلية", c: "var(--green)" },
  { v: "homework", l: "واجبات", c: "var(--orange)" },
  { v: "behavior", l: "سلوك", c: "var(--pink)" },
  { v: "custom", l: "أخرى", c: "var(--text2)" },
];

export default function TasksPage() {
  const { state, addTask, removeTask, completeTask, undoCompleteTask, isTaskCompletedOnDate } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [fMem, setFMem] = useState("all");
  const [fCat, setFCat] = useState("all");
  const today = new Date().toISOString().split("T")[0];

  const [f, setF] = useState({
    title: "", description: "", points: 10,
    category: "routine" as Task["category"],
    frequency: "daily" as Task["frequency"],
    assignedTo: [] as string[],
  });

  const tasks = state.tasks.filter((t) => {
    if (!t.active) return false;
    if (fMem !== "all" && !t.assignedTo.includes(fMem)) return false;
    if (fCat !== "all" && t.category !== fCat) return false;
    return true;
  });

  const submit = () => {
    if (!f.title.trim()) return;
    addTask(f);
    setF({ title: "", description: "", points: 10, category: "routine", frequency: "daily", assignedTo: [] });
    setShowForm(false);
  };

  return (
    <div className="space-y-4 anim">
      <div className="flex items-center justify-between">
        <h1 className="title">المهام</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm">
          <Plus size={14} /> جديد
        </button>
      </div>

      <div className="chip-scroll">
        <button onClick={() => setFMem("all")} className={`chip ${fMem === "all" ? "on" : ""}`}>الكل</button>
        {state.familyMembers.map((m) => (
          <button key={m.id} onClick={() => setFMem(m.id)} className={`chip ${fMem === m.id ? "on" : ""}`}>
            {m.icon || m.name.charAt(0)} {m.name}
          </button>
        ))}
      </div>

      <div className="chip-scroll">
        <button onClick={() => setFCat("all")} className={`chip ${fCat === "all" ? "on" : ""}`}>كل الفئات</button>
        {cats.map((c) => (
          <button key={c.v} onClick={() => setFCat(c.v)} className={`chip ${fCat === c.v ? "on" : ""}`}>{c.l}</button>
        ))}
      </div>

      {showForm && (
        <div className="card anim" style={{ borderColor: "rgba(139,92,246,0.25)" }}>
          <div className="space-y-3">
            <input className="input" placeholder="عنوان المهمة" value={f.title} onChange={(e) => setF((p) => ({ ...p, title: e.target.value }))} />
            <textarea className="input" placeholder="الوصف (اختياري)" rows={2} value={f.description} onChange={(e) => setF((p) => ({ ...p, description: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label mb-1.5 block">النقاط</label>
                <input className="input" type="number" min={1} value={f.points} onChange={(e) => setF((p) => ({ ...p, points: +e.target.value }))} />
              </div>
              <div>
                <label className="label mb-1.5 block">الفئة</label>
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
              <label className="label mb-2 block">تعيين إلى</label>
              <div className="chip-scroll">
                {state.familyMembers.map((m) => (
                  <button key={m.id} onClick={() => setF((p) => ({
                    ...p, assignedTo: p.assignedTo.includes(m.id) ? p.assignedTo.filter((x) => x !== m.id) : [...p.assignedTo, m.id],
                  }))} className={`chip ${f.assignedTo.includes(m.id) ? "on" : ""}`}>
                    {m.icon || m.name.charAt(0)} {m.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={submit} className="btn btn-primary flex-1">حفظ</button>
              <button onClick={() => setShowForm(false)} className="btn btn-ghost">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2.5">
        {tasks.length === 0 ? (
          <div className="card-sm text-center py-10">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "var(--accent-dim)" }}>
              <CheckCircle size={24} style={{ color: "var(--accent)" }} />
            </div>
            <p className="text-sm font-bold mb-0.5">لا توجد مهام</p>
            <p className="text-xs" style={{ color: "var(--text2)" }}>أضف مهمة جديدة للبدء</p>
          </div>
        ) : tasks.map((t, i) => {
          const exp = expanded === t.id;
          const cat = cats.find((c) => c.v === t.category);
          const mId = t.assignedTo[0];
          const done = mId ? isTaskCompletedOnDate(t.id, mId, today) : false;

          return (
            <div key={t.id} className={`card-sm anim${Math.min(i + 1, 5)}`}>
              <div className="flex items-center gap-3">
                <button onClick={() => mId && (done ? undoCompleteTask(t.id, mId) : completeTask(t.id, mId))}
                  className="bg-transparent border-none p-0 cursor-pointer shrink-0"
                  style={{ color: done ? "var(--green)" : "var(--text3)" }}>
                  {done ? <CheckCircle size={22} /> : <Circle size={22} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold truncate"
                    style={{ textDecoration: done ? "line-through" : "none", opacity: done ? 0.35 : 1 }}>
                    {t.title}
                  </p>
                  {t.description && <p className="text-xs truncate mt-0.5" style={{ color: "var(--text2)" }}>{t.description}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="badge" style={{ background: `${cat?.c}18`, color: cat?.c }}>{cat?.l}</span>
                  <div className="flex items-center gap-0.5">
                    <Star size={11} fill="var(--orange)" style={{ color: "var(--orange)" }} />
                    <span className="text-xs font-extrabold" style={{ color: "var(--orange)" }}>{t.points}</span>
                  </div>
                  <button onClick={() => setExpanded(exp ? null : t.id)} className="bg-transparent border-none p-0 cursor-pointer" style={{ color: "var(--text3)" }}>
                    {exp ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {exp && (
                <div className="mt-3 pt-3 space-y-2.5" style={{ borderTop: "1px solid var(--border)" }}>
                  <div className="flex gap-1.5 flex-wrap">
                    {t.assignedTo.map((id) => {
                      const m = state.familyMembers.find((x) => x.id === id);
                      return m ? <span key={id} className="badge" style={{ background: `${m.color || "var(--accent)"}18`, color: m.color || "var(--accent)" }}>{m.icon || m.name.charAt(0)} {m.name}</span> : null;
                    })}
                    {!t.assignedTo.length && <span className="text-xs" style={{ color: "var(--text3)" }}>غير مُعيّنة</span>}
                  </div>
                  <button onClick={() => removeTask(t.id)} className="btn btn-danger btn-sm">
                    <Trash2 size={12} /> حذف
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
