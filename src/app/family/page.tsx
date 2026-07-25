"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Plus, Trash2, Star, Edit3, Check, X, Users, Trophy } from "lucide-react";
import IconPicker from "@/components/IconPicker";

export default function FamilyPage() {
  const { state, addFamilyMember, updateFamilyMember, removeFamilyMember } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<"new" | "edit">("new");

  const colors = ["#7c6cff", "#ff6b9d", "#34d399", "#fb923c", "#60a5fa", "#a78bfa", "#f472b6", "#2dd4bf", "#e879f9", "#38bdf8"];
  const [f, setF] = useState({ name: "", role: "child" as "parent" | "child", color: "#7c6cff", icon: "" });
  const [ef, setEf] = useState({ name: "", role: "child" as "parent" | "child", color: "#7c6cff", icon: "" });

  const add = () => {
    if (!f.name.trim()) return;
    addFamilyMember({ name: f.name, role: f.role, avatar: f.icon || f.name.charAt(0), color: f.color, icon: f.icon });
    setF({ name: "", role: "child", color: "#7c6cff", icon: "" });
    setShowForm(false);
  };

  const save = () => {
    if (!editId || !ef.name.trim()) return;
    updateFamilyMember(editId, { name: ef.name, role: ef.role, avatar: ef.icon || ef.name.charAt(0), color: ef.color, icon: ef.icon });
    setEditId(null);
  };

  const startEdit = (m: typeof state.familyMembers[0]) => {
    setEditId(m.id);
    setEf({ name: m.name, role: m.role, color: m.color || "#7c6cff", icon: m.icon || "" });
  };

  const Dots = ({ value, onChange }: { value: string; onChange: (c: string) => void }) => (
    <div className="flex gap-1.5 flex-wrap">
      {colors.map((c) => (
        <button key={c} onClick={() => onChange(c)} className="w-6 h-6 rounded-full cursor-pointer border-2 transition-transform"
          style={{ background: c, borderColor: value === c ? "#fff" : "transparent", transform: value === c ? "scale(1.15)" : "scale(1)" }} />
      ))}
    </div>
  );

  const parents = state.familyMembers.filter((m) => m.role === "parent");
  const children = state.familyMembers.filter((m) => m.role === "child");

  const Card = ({ m, i }: { m: typeof state.familyMembers[0]; i: number }) => {
    const editing = editId === m.id;

    if (editing) {
      return (
        <div className="glass p-3 anim-scale">
          <div className="flex items-center gap-2.5 mb-2.5">
            <button onClick={() => { setPickerTarget("edit"); setShowPicker(true); }}
              className="avatar cursor-pointer border-none" style={{ width: 40, height: 40, background: ef.color, fontSize: "1.1rem" }}>
              {ef.icon || ef.name.charAt(0) || "?"}
            </button>
            <input className="input flex-1 text-sm" value={ef.name} onChange={(e) => setEf((p) => ({ ...p, name: e.target.value }))} placeholder="الاسم" />
          </div>
          <Dots value={ef.color} onChange={(c) => setEf((p) => ({ ...p, color: c }))} />
          <div className="flex gap-1.5 mt-2.5">
            <button onClick={save} className="btn btn-success flex-1 text-xs py-1.5"><Check size={11} /> حفظ</button>
            <button onClick={() => setEditId(null)} className="btn btn-ghost text-xs py-1.5"><X size={11} /></button>
            <button onClick={() => { removeFamilyMember(m.id); setEditId(null); }} className="btn btn-danger text-xs py-1.5 px-2"><Trash2 size={11} /></button>
          </div>
        </div>
      );
    }

    return (
      <div className={`glass-sm p-3 anim-d${Math.min(i + 1, 5)}`} style={{ borderRight: `3px solid ${m.color || "var(--accent)"}` }}>
        <div className="flex items-center gap-2.5">
          <div className="avatar w-10 h-10 text-xs" style={{ background: m.color || "var(--accent)" }}>
            {m.icon || m.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold truncate">{m.name}</h3>
            <p className="text-[10px]" style={{ color: "var(--text2)" }}>{m.role === "parent" ? "والد/ة" : "طفل/ة"}</p>
            <div className="flex items-center gap-0.5 mt-0.5">
              <Trophy size={10} style={{ color: "var(--orange)" }} />
              <span className="text-[10px] font-bold" style={{ color: "var(--orange)" }}>{m.points.toLocaleString("ar")}</span>
            </div>
          </div>
          <div className="flex gap-0.5 shrink-0">
            <button onClick={() => startEdit(m)} className="p-1.5 rounded-lg bg-transparent border-none cursor-pointer" style={{ color: "var(--text2)" }}>
              <Edit3 size={13} />
            </button>
            <button onClick={() => removeFamilyMember(m.id)} className="p-1.5 rounded-lg bg-transparent border-none cursor-pointer" style={{ color: "var(--red)" }}>
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 anim">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">أعضاء الأسرة</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary text-xs px-4 py-2">
          <Plus size={14} /> جديد
        </button>
      </div>

      {showForm && (
        <div className="glass p-4 anim-scale" style={{ borderColor: "rgba(124,108,255,0.3)" }}>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <button onClick={() => { setPickerTarget("new"); setShowPicker(true); }}
                className="avatar cursor-pointer border-none" style={{ width: 48, height: 48, background: f.color, fontSize: "1.3rem" }}>
                {f.icon || f.name.charAt(0) || "?"}
              </button>
              <div>
                <p className="text-sm font-semibold">الأيقونة</p>
                <p className="text-[10px]" style={{ color: "var(--text2)" }}>اضغط للتغيير</p>
              </div>
            </div>
            <input className="input" placeholder="الاسم" value={f.name} onChange={(e) => setF((p) => ({ ...p, name: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] mb-1 block" style={{ color: "var(--text2)" }}>الدور</label>
                <select className="select" value={f.role} onChange={(e) => setF((p) => ({ ...p, role: e.target.value as "parent" | "child" }))}>
                  <option value="parent">والد/ة</option>
                  <option value="child">طفل/ة</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] mb-1 block" style={{ color: "var(--text2)" }}>اللون</label>
                <Dots value={f.color} onChange={(c) => setF((p) => ({ ...p, color: c }))} />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={add} className="btn btn-primary flex-1 text-sm">حفظ</button>
              <button onClick={() => setShowForm(false)} className="btn btn-ghost text-sm">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {parents.length > 0 && (
        <div>
          <p className="text-[10px] font-bold mb-2 flex items-center gap-1" style={{ color: "var(--text2)" }}>
            <Users size={11} /> الوالدون
          </p>
          <div className="space-y-2">{parents.map((m, i) => <Card key={m.id} m={m} i={i} />)}</div>
        </div>
      )}

      <div>
        <p className="text-[10px] font-bold mb-2 flex items-center gap-1" style={{ color: "var(--text2)" }}>
          <Star size={11} /> الأطفال
        </p>
        {children.length === 0 ? (
          <div className="glass-sm p-8 text-center">
            <p className="text-2xl mb-1">👶</p>
            <p className="text-xs mb-2" style={{ color: "var(--text2)" }}>لا يوجد أطفال</p>
            <button onClick={() => setShowForm(true)} className="btn btn-primary text-xs">إضافة</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">{children.map((m, i) => <Card key={m.id} m={m} i={i} />)}</div>
        )}
      </div>

      {showPicker && (
        <IconPicker value={pickerTarget === "new" ? f.icon : ef.icon}
          onChange={(icon) => {
            pickerTarget === "new" ? setF((p) => ({ ...p, icon })) : setEf((p) => ({ ...p, icon }));
            setShowPicker(false);
          }}
          onClose={() => setShowPicker(false)} />
      )}
    </div>
  );
}
