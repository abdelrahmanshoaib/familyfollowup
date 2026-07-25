"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Plus, Trash2, Star, Edit3, Check, X, Users, Trophy } from "lucide-react";
import IconPicker from "@/components/IconPicker";

const colors = ["#8b5cf6", "#ec4899", "#22c55e", "#f59e0b", "#3b82f6", "#a78bfa", "#f472b6", "#2dd4bf", "#e879f9", "#38bdf8"];

export default function FamilyPage() {
  const { state, addFamilyMember, updateFamilyMember, removeFamilyMember } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<"new" | "edit">("new");

  const [f, setF] = useState({ name: "", role: "child" as "parent" | "child", color: "#8b5cf6", icon: "" });
  const [ef, setEf] = useState({ name: "", role: "child" as "parent" | "child", color: "#8b5cf6", icon: "" });

  const add = () => {
    if (!f.name.trim()) return;
    addFamilyMember({ name: f.name, role: f.role, avatar: f.icon || f.name.charAt(0), color: f.color, icon: f.icon });
    setF({ name: "", role: "child", color: "#8b5cf6", icon: "" });
    setShowForm(false);
  };

  const save = () => {
    if (!editId || !ef.name.trim()) return;
    updateFamilyMember(editId, { name: ef.name, role: ef.role, avatar: ef.icon || ef.name.charAt(0), color: ef.color, icon: ef.icon });
    setEditId(null);
  };

  const parents = state.familyMembers.filter((m) => m.role === "parent");
  const children = state.familyMembers.filter((m) => m.role === "child");

  const Dots = ({ value, onChange }: { value: string; onChange: (c: string) => void }) => (
    <div className="flex gap-2 flex-wrap">
      {colors.map((c) => (
        <button key={c} onClick={() => onChange(c)} className="w-7 h-7 rounded-full cursor-pointer border-[2.5px] transition-transform"
          style={{ background: c, borderColor: value === c ? "#fff" : "transparent", transform: value === c ? "scale(1.15)" : "scale(1)" }} />
      ))}
    </div>
  );

  const Card = ({ m, i }: { m: typeof state.familyMembers[0]; i: number }) => {
    const editing = editId === m.id;

    if (editing) {
      return (
        <div className="card-sm anim-scale">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => { setPickerTarget("edit"); setShowPicker(true); }}
              className="avatar cursor-pointer border-none" style={{ width: 44, height: 44, background: ef.color, fontSize: "1.2rem" }}>
              {ef.icon || ef.name.charAt(0) || "?"}
            </button>
            <input className="input flex-1 text-sm" value={ef.name} onChange={(e) => setEf((p) => ({ ...p, name: e.target.value }))} placeholder="الاسم" />
          </div>
          <Dots value={ef.color} onChange={(c) => setEf((p) => ({ ...p, color: c }))} />
          <div className="flex gap-2 mt-3">
            <button onClick={save} className="btn btn-success btn-sm flex-1"><Check size={12} /> حفظ</button>
            <button onClick={() => setEditId(null)} className="btn btn-ghost btn-sm"><X size={12} /></button>
            <button onClick={() => { removeFamilyMember(m.id); setEditId(null); }} className="btn btn-danger btn-sm px-2.5"><Trash2 size={12} /></button>
          </div>
        </div>
      );
    }

    return (
      <div className={`card-sm anim${Math.min(i + 1, 5)}`} style={{ borderRight: `3px solid ${m.color || "var(--accent)"}` }}>
        <div className="flex items-center gap-3">
          <div className="avatar w-11 h-11 text-sm" style={{ background: m.color || "var(--accent)" }}>
            {m.icon || m.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold truncate">{m.name}</h3>
            <p className="text-[11px]" style={{ color: "var(--text2)" }}>{m.role === "parent" ? "والد/ة" : "طفل/ة"}</p>
            <div className="flex items-center gap-1 mt-1">
              <Trophy size={11} style={{ color: "var(--orange)" }} />
              <span className="text-[11px] font-extrabold" style={{ color: "var(--orange)" }}>{m.points.toLocaleString("ar")}</span>
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <button onClick={() => { setEditId(m.id); setEf({ name: m.name, role: m.role, color: m.color || "#8b5cf6", icon: m.icon || "" }); }}
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-transparent border-none cursor-pointer" style={{ color: "var(--text3)" }}>
              <Edit3 size={14} />
            </button>
            <button onClick={() => removeFamilyMember(m.id)}
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-transparent border-none cursor-pointer" style={{ color: "var(--red)" }}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 anim">
      <div className="flex items-center justify-between">
        <h1 className="title">أعضاء الأسرة</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm">
          <Plus size={14} /> جديد
        </button>
      </div>

      {showForm && (
        <div className="card anim" style={{ borderColor: "rgba(139,92,246,0.25)" }}>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <button onClick={() => { setPickerTarget("new"); setShowPicker(true); }}
                className="avatar cursor-pointer border-none" style={{ width: 52, height: 52, background: f.color, fontSize: "1.4rem" }}>
                {f.icon || f.name.charAt(0) || "?"}
              </button>
              <div>
                <p className="text-sm font-bold">اختر الأيقونة</p>
                <p className="text-[11px]" style={{ color: "var(--text2)" }}>اضغط لاختيار أيقونة</p>
              </div>
            </div>
            <input className="input" placeholder="الاسم" value={f.name} onChange={(e) => setF((p) => ({ ...p, name: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label mb-1.5 block">الدور</label>
                <select className="select" value={f.role} onChange={(e) => setF((p) => ({ ...p, role: e.target.value as "parent" | "child" }))}>
                  <option value="parent">والد/ة</option>
                  <option value="child">طفل/ة</option>
                </select>
              </div>
              <div>
                <label className="label mb-1.5 block">اللون</label>
                <Dots value={f.color} onChange={(c) => setF((p) => ({ ...p, color: c }))} />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={add} className="btn btn-primary flex-1">حفظ</button>
              <button onClick={() => setShowForm(false)} className="btn btn-ghost">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {parents.length > 0 && (
        <div>
          <p className="label mb-2.5 flex items-center gap-1.5"><Users size={12} /> الوالدون</p>
          <div className="space-y-2.5">{parents.map((m, i) => <Card key={m.id} m={m} i={i} />)}</div>
        </div>
      )}

      <div>
        <p className="label mb-2.5 flex items-center gap-1.5"><Star size={12} /> الأطفال</p>
        {children.length === 0 ? (
          <div className="card-sm text-center py-10">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "var(--orange-dim)" }}>
              <Users size={24} style={{ color: "var(--orange)" }} />
            </div>
            <p className="text-sm font-bold mb-0.5">لا يوجد أطفال</p>
            <p className="text-xs mb-3" style={{ color: "var(--text2)" }}>أضف أول طفل</p>
            <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm">إضافة</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">{children.map((m, i) => <Card key={m.id} m={m} i={i} />)}</div>
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
