"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import {
  CheckCircle,
  Circle,
  Star,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Repeat,
} from "lucide-react";
import type { Task } from "@/lib/types";

export default function TasksPage() {
  const { state, addTask, removeTask, completeTask, undoCompleteTask, isTaskCompletedOnDate } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [filterMember, setFilterMember] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  const today = new Date().toISOString().split("T")[0];

  const categories = [
    { value: "routine", label: "روتينية", color: "#7c6cff" },
    { value: "chore", label: "أعمال منزلية", color: "#00d4aa" },
    { value: "homework", label: "واجبات", color: "#ffb347" },
    { value: "behavior", label: "سلوك", color: "#ff6b9d" },
    { value: "custom", label: "أخرى", color: "#888" },
  ];

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

  const handleAdd = () => {
    if (!form.title.trim()) return;
    addTask(form);
    setForm({ title: "", description: "", points: 10, category: "routine", frequency: "daily", assignedTo: [] });
    setShowForm(false);
  };

  return (
    <div className="space-y-4 animate-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">المهام</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          <Plus size={16} /> جديد
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        <button onClick={() => setFilterMember("all")} className={`chip ${filterMember === "all" ? "chip-active" : ""}`}>
          الكل
        </button>
        {state.familyMembers.map((m) => (
          <button key={m.id} onClick={() => setFilterMember(m.id)} className={`chip ${filterMember === m.id ? "chip-active" : ""}`}>
            {m.icon || m.name.charAt(0)} {m.name}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        <button onClick={() => setFilterCategory("all")} className={`chip ${filterCategory === "all" ? "chip-active" : ""}`}>
          كل الفئات
        </button>
        {categories.map((c) => (
          <button key={c.value} onClick={() => setFilterCategory(c.value)} className={`chip ${filterCategory === c.value ? "chip-active" : ""}`}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="card animate-in" style={{ borderColor: "var(--accent)" }}>
          <div className="space-y-3">
            <input className="input" placeholder="عنوان المهمة" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            <textarea className="input" placeholder="الوصف (اختياري)" rows={2} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: "var(--text-secondary)" }}>النقاط</label>
                <input className="input" type="number" min={1} value={form.points} onChange={(e) => setForm((p) => ({ ...p, points: +e.target.value }))} />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: "var(--text-secondary)" }}>الفئة</label>
                <select className="select" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as Task["category"] }))}>
                  {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--text-secondary)" }}>التكرار</label>
              <select className="select" value={form.frequency} onChange={(e) => setForm((p) => ({ ...p, frequency: e.target.value as Task["frequency"] }))}>
                <option value="daily">يومي</option>
                <option value="weekly">أسبوعي</option>
                <option value="once">مرة واحدة</option>
              </select>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--text-secondary)" }}>تعيين إلى</label>
              <div className="flex gap-2 flex-wrap">
                {state.familyMembers.map((m) => (
                  <button key={m.id} onClick={() => setForm((p) => ({
                    ...p,
                    assignedTo: p.assignedTo.includes(m.id) ? p.assignedTo.filter((id) => id !== m.id) : [...p.assignedTo, m.id],
                  }))} className={`chip ${form.assignedTo.includes(m.id) ? "chip-active" : ""}`}>
                    {m.icon || m.name.charAt(0)} {m.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAdd} className="btn btn-primary flex-1">حفظ</button>
              <button onClick={() => setShowForm(false)} className="btn btn-secondary">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>لا توجد مهام</p>
          </div>
        ) : (
          tasks.map((task, i) => {
            const isExpanded = expandedTask === task.id;
            const cat = categories.find((c) => c.value === task.category);
            const catColor = cat?.color || "#888";
            const member = task.assignedTo[0] ? state.familyMembers.find((m) => m.id === task.assignedTo[0]) : null;
            const isCompleted = task.assignedTo[0] ? isTaskCompletedOnDate(task.id, task.assignedTo[0], today) : false;

            return (
              <div key={task.id} className={`card animate-in-${Math.min(i + 1, 5)}`}>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => task.assignedTo[0] && (isCompleted ? undoCompleteTask(task.id, task.assignedTo[0]) : completeTask(task.id, task.assignedTo[0]))}
                    className="bg-transparent border-none p-0 cursor-pointer"
                    style={{ color: isCompleted ? "var(--success)" : "var(--text-secondary)" }}
                  >
                    {isCompleted ? <CheckCircle size={20} /> : <Circle size={20} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ textDecoration: isCompleted ? "line-through" : "none", opacity: isCompleted ? 0.5 : 1 }}>
                        {task.title}
                      </span>
                      <span className="badge" style={{ background: `${catColor}15`, color: catColor }}>
                        {cat?.label}
                      </span>
                    </div>
                    {task.description && <p className="text-xs mt-1 truncate" style={{ color: "var(--text-secondary)" }}>{task.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      <Star size={12} style={{ color: "#ffb347" }} fill="#ffb347" />
                      <span className="text-xs font-bold" style={{ color: "#ffb347" }}>{task.points}</span>
                    </div>
                    <button onClick={() => setExpandedTask(isExpanded ? null : task.id)} className="bg-transparent border-none p-0 cursor-pointer" style={{ color: "var(--text-secondary)" }}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                    <div className="flex gap-1 flex-wrap mb-2">
                      {task.assignedTo.map((id) => {
                        const m = state.familyMembers.find((x) => x.id === id);
                        return m ? <span key={id} className="badge" style={{ background: `${m.color || "var(--accent)"}15`, color: m.color || "var(--accent)" }}>{m.icon || m.name.charAt(0)} {m.name}</span> : null;
                      })}
                      {task.assignedTo.length === 0 && <span className="text-xs" style={{ color: "var(--text-secondary)" }}>غير مُعيّنة</span>}
                    </div>
                    <button onClick={() => removeTask(task.id)} className="btn btn-danger text-xs py-1.5 px-3">
                      <Trash2 size={12} /> حذف
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
