"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Plus, Trash2, Star, Edit3, Check, X, Users, Trophy } from "lucide-react";
import IconPicker from "@/components/IconPicker";

export default function FamilyPage() {
  const { state, addFamilyMember, updateFamilyMember, removeFamilyMember } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconTarget, setIconTarget] = useState<"new" | "edit">("new");

  const colors = ["#7c6cff", "#ff6b9d", "#00d4aa", "#ffb347", "#74b9ff", "#a29bfe", "#fd79a8", "#00cec9", "#e17055", "#0984e3"];

  const [form, setForm] = useState({ name: "", role: "child" as "parent" | "child", color: "#7c6cff", icon: "" });
  const [editForm, setEditForm] = useState({ name: "", role: "child" as "parent" | "child", color: "#7c6cff", icon: "" });

  const handleAdd = () => {
    if (!form.name.trim()) return;
    addFamilyMember({ name: form.name, role: form.role, avatar: form.icon || form.name.charAt(0), color: form.color, icon: form.icon });
    setForm({ name: "", role: "child", color: "#7c6cff", icon: "" });
    setShowForm(false);
  };

  const startEdit = (m: typeof state.familyMembers[0]) => {
    setEditingId(m.id);
    setEditForm({ name: m.name, role: m.role, color: m.color || "#7c6cff", icon: m.icon || "" });
  };

  const saveEdit = () => {
    if (!editingId || !editForm.name.trim()) return;
    updateFamilyMember(editingId, { name: editForm.name, role: editForm.role, avatar: editForm.icon || editForm.name.charAt(0), color: editForm.color, icon: editForm.icon });
    setEditingId(null);
  };

  const parents = state.familyMembers.filter((m) => m.role === "parent");
  const children = state.familyMembers.filter((m) => m.role === "child");

  const ColorPicker = ({ value, onChange }: { value: string; onChange: (c: string) => void }) => (
    <div className="flex gap-1.5 flex-wrap">
      {colors.map((c) => (
        <button key={c} onClick={() => onChange(c)} className="w-6 h-6 rounded-full cursor-pointer border-2 transition-transform"
          style={{ background: c, borderColor: value === c ? "white" : "transparent", transform: value === c ? "scale(1.15)" : "scale(1)" }} />
      ))}
    </div>
  );

  const MemberCard = ({ m, i }: { m: typeof state.familyMembers[0]; i: number }) => {
    const editing = editingId === m.id;

    if (editing) {
      return (
        <div className={`card animate-in`} style={{ border: `1px solid ${editForm.color}` }}>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <button onClick={() => { setIconTarget("edit"); setShowIconPicker(true); }} className="avatar cursor-pointer border-none"
                style={{ width: 44, height: 44, background: editForm.color, fontSize: "1.2rem" }}>
                {editForm.icon || editForm.name.charAt(0) || "?"}
              </button>
              <input className="input flex-1" value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} placeholder="الاسم" />
            </div>
            <ColorPicker value={editForm.color} onChange={(c) => setEditForm((p) => ({ ...p, color: c }))} />
            <div className="flex gap-2">
              <button onClick={saveEdit} className="btn btn-success flex-1 text-xs py-1.5"><Check size={12} /> حفظ</button>
              <button onClick={() => setEditingId(null)} className="btn btn-secondary text-xs py-1.5"><X size={12} /></button>
              <button onClick={() => { removeFamilyMember(m.id); setEditingId(null); }} className="btn btn-danger text-xs py-1.5 px-2"><Trash2 size={12} /></button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`card animate-in-${Math.min(i + 1, 5)}`} style={{ borderRight: `3px solid ${m.color || "var(--accent)"}` }}>
        <div className="flex items-center gap-3">
          <div className="avatar w-11 h-11 text-sm" style={{ background: m.color || "var(--accent)" }}>
            {m.icon || m.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm">{m.name}</h3>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{m.role === "parent" ? "والد/ة" : "طفل/ة"}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Trophy size={11} style={{ color: "#ffb347" }} />
              <span className="text-xs font-bold" style={{ color: "#ffb347" }}>{m.points.toLocaleString("ar")}</span>
            </div>
          </div>
          <div className="flex gap-0.5">
            <button onClick={() => startEdit(m)} className="p-1.5 rounded-lg bg-transparent border-none cursor-pointer" style={{ color: "var(--text-secondary)" }}>
              <Edit3 size={14} />
            </button>
            <button onClick={() => removeFamilyMember(m.id)} className="p-1.5 rounded-lg bg-transparent border-none cursor-pointer" style={{ color: "var(--danger)" }}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">أعضاء الأسرة</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          <Plus size={16} /> جديد
        </button>
      </div>

      {showForm && (
        <div className="card animate-in" style={{ borderColor: "var(--accent)" }}>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <button onClick={() => { setIconTarget("new"); setShowIconPicker(true); }} className="avatar cursor-pointer border-none"
                style={{ width: 52, height: 52, background: form.color, fontSize: "1.4rem" }}>
                {form.icon || form.name.charAt(0) || "?"}
              </button>
              <div>
                <p className="text-sm font-semibold">الأيقونة</p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>اضغط للتغيير</p>
              </div>
            </div>
            <input className="input" placeholder="الاسم" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: "var(--text-secondary)" }}>الدور</label>
                <select className="select" value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as "parent" | "child" }))}>
                  <option value="parent">والد/ة</option>
                  <option value="child">طفل/ة</option>
                </select>
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: "var(--text-secondary)" }}>اللون</label>
                <ColorPicker value={form.color} onChange={(c) => setForm((p) => ({ ...p, color: c }))} />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAdd} className="btn btn-primary flex-1">حفظ</button>
              <button onClick={() => setShowForm(false)} className="btn btn-secondary">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {parents.length > 0 && (
        <div>
          <h2 className="text-sm font-bold mb-2 flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
            <Users size={14} /> الوالدون
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {parents.map((m, i) => <MemberCard key={m.id} m={m} i={i} />)}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-bold mb-2 flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
          <Star size={14} /> الأطفال
        </h2>
        {children.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-3xl mb-2">👶</p>
            <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>لا يوجد أطفال بعد</p>
            <button onClick={() => setShowForm(true)} className="btn btn-primary">إضافة</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {children.map((m, i) => <MemberCard key={m.id} m={m} i={i} />)}
          </div>
        )}
      </div>

      {showIconPicker && (
        <IconPicker
          value={iconTarget === "new" ? form.icon : editForm.icon}
          onChange={(icon) => {
            if (iconTarget === "new") setForm((p) => ({ ...p, icon }));
            else setEditForm((p) => ({ ...p, icon }));
            setShowIconPicker(false);
          }}
          onClose={() => setShowIconPicker(false)}
        />
      )}
    </div>
  );
}
