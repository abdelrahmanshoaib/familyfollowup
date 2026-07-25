"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Trophy, Plus, Trash2, ShoppingCart, Check, Coins } from "lucide-react";

export default function RewardsPage() {
  const { state, redeemReward, addReward, removeReward } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [sel, setSel] = useState(state.familyMembers[0]?.id || "");
  const [doneId, setDoneId] = useState<string | null>(null);

  const [f, setF] = useState({ title: "", description: "", pointsCost: 50, category: "treat" as "fun" | "treat" | "privilege" | "gift", icon: "🎁" });

  const cats = [
    { v: "treat", l: "تحفيز", i: "🍪" }, { v: "fun", l: "ترفيه", i: "🎮" },
    { v: "privilege", l: "مزايا", i: "⭐" }, { v: "gift", l: "هدايا", i: "🎁" },
  ];
  const icons = ["🎁", "🎮", "🍪", "🧸", "📱", "🎬", "🛍️", "🎪", "🎨", "🏆", "🎈", "🍦"];

  const m = state.familyMembers.find((x) => x.id === sel);

  const add = () => {
    if (!f.title.trim()) return;
    addReward(f);
    setF({ title: "", description: "", pointsCost: 50, category: "treat", icon: "🎁" });
    setShowForm(false);
  };

  const redeem = (id: string) => {
    if (!sel) return;
    redeemReward(id, sel);
    setDoneId(id);
    setTimeout(() => setDoneId(null), 1200);
  };

  return (
    <div className="space-y-3 anim">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">المكافآت</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary text-xs px-4 py-2">
          <Plus size={14} /> جديد
        </button>
      </div>

      {/* Points */}
      {m && (
        <div className="glass-sm p-3 flex items-center gap-3" style={{ borderColor: "rgba(251,146,60,0.2)" }}>
          <div className="avatar w-9 h-9 text-xs" style={{ background: m.color || "var(--accent)" }}>{m.icon || m.name.charAt(0)}</div>
          <div className="flex-1">
            <p className="text-[10px]" style={{ color: "var(--text2)" }}>{m.name}</p>
            <div className="flex items-center gap-1">
              <Trophy size={14} style={{ color: "var(--orange)" }} />
              <span className="text-base font-bold" style={{ color: "var(--orange)" }}>{m.points.toLocaleString("ar")}</span>
            </div>
          </div>
          <select className="select w-auto text-xs py-2 px-3" value={sel} onChange={(e) => setSel(e.target.value)}>
            {state.familyMembers.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="glass p-4 anim-scale" style={{ borderColor: "rgba(124,108,255,0.3)" }}>
          <div className="space-y-3">
            <div className="flex gap-1.5 flex-wrap">
              {icons.map((i) => (
                <button key={i} onClick={() => setF((p) => ({ ...p, icon: i }))}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-base cursor-pointer border-none"
                  style={{ background: f.icon === i ? "rgba(124,108,255,0.2)" : "rgba(255,255,255,0.03)", border: f.icon === i ? "1px solid var(--accent)" : "0.5px solid rgba(255,255,255,0.06)" }}>
                  {i}
                </button>
              ))}
            </div>
            <input className="input" placeholder="اسم المكافأة" value={f.title} onChange={(e) => setF((p) => ({ ...p, title: e.target.value }))} />
            <textarea className="input" placeholder="الوصف (اختياري)" rows={2} value={f.description} onChange={(e) => setF((p) => ({ ...p, description: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] mb-1 block" style={{ color: "var(--text2)" }}>التكلفة</label>
                <input className="input" type="number" min={1} value={f.pointsCost} onChange={(e) => setF((p) => ({ ...p, pointsCost: +e.target.value }))} />
              </div>
              <div>
                <label className="text-[10px] mb-1 block" style={{ color: "var(--text2)" }}>الفئة</label>
                <select className="select" value={f.category} onChange={(e) => setF((p) => ({ ...p, category: e.target.value as typeof p.category }))}>
                  {cats.map((c) => <option key={c.v} value={c.v}>{c.i} {c.l}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={add} className="btn btn-primary flex-1 text-sm">حفظ</button>
              <button onClick={() => setShowForm(false)} className="btn btn-ghost text-sm">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {state.rewards.length === 0 ? (
          <div className="glass-sm p-8 text-center col-span-full">
            <p className="text-2xl mb-1">🎁</p>
            <p className="text-xs" style={{ color: "var(--text2)" }}>لا توجد مكافآت</p>
          </div>
        ) : state.rewards.map((r, i) => {
          const afford = (m?.points || 0) >= r.pointsCost;
          const finished = doneId === r.id;
          const cat = cats.find((c) => c.v === r.category);

          return (
            <div key={r.id} className={`glass-sm p-4 text-center anim-d${Math.min(i + 1, 5)}`} style={{ opacity: finished ? 0.4 : 1 }}>
              <div className="text-2xl mb-1.5">{r.icon}</div>
              <h3 className="text-sm font-bold">{r.title}</h3>
              {r.description && <p className="text-[10px] mt-0.5" style={{ color: "var(--text2)" }}>{r.description}</p>}
              <div className="flex items-center justify-center gap-1 my-1.5">
                <Coins size={11} style={{ color: "var(--orange)" }} />
                <span className="text-xs font-bold" style={{ color: "var(--orange)" }}>{r.pointsCost}</span>
              </div>
              <span className="badge mb-2" style={{ background: "rgba(124,108,255,0.08)", color: "var(--accent)" }}>
                {cat?.i} {cat?.l}
              </span>
              <div className="flex gap-1.5 mt-1.5">
                <button onClick={() => redeem(r.id)} disabled={!afford || finished}
                  className={`btn flex-1 text-[11px] py-1.5 ${afford && !finished ? "btn-success" : "btn-ghost"}`}
                  style={{ opacity: afford && !finished ? 1 : 0.35 }}>
                  {finished ? <><Check size={11} /> تم</> : afford ? <><ShoppingCart size={11} /> استبدال</> : <><Coins size={11} /> غير كافٍ</>}
                </button>
                <button onClick={() => removeReward(r.id)} className="btn btn-danger text-[11px] py-1.5 px-2">
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
