"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Trophy, Plus, Trash2, ShoppingCart, Check, Coins } from "lucide-react";

const cats = [
  { v: "treat", l: "تحفيز", i: "🍪" }, { v: "fun", l: "ترفيه", i: "🎮" },
  { v: "privilege", l: "مزايا", i: "⭐" }, { v: "gift", l: "هدايا", i: "🎁" },
];
const icons = ["🎁", "🎮", "🍪", "🧸", "📱", "🎬", "🛍️", "🎪", "🎨", "🏆", "🎈", "🍦"];

export default function RewardsPage() {
  const { state, redeemReward, addReward, removeReward } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [sel, setSel] = useState(state.familyMembers[0]?.id || "");
  const [doneId, setDoneId] = useState<string | null>(null);

  const [f, setF] = useState({ title: "", description: "", pointsCost: 50, category: "treat" as "fun" | "treat" | "privilege" | "gift", icon: "🎁" });
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
    <div className="space-y-4 anim">
      <div className="flex items-center justify-between">
        <h1 className="title">المكافآت</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm">
          <Plus size={14} /> جديد
        </button>
      </div>

      {m && (
        <div className="card-accent flex items-center gap-3">
          <div className="avatar w-11 h-11 text-sm" style={{ background: m.color || "var(--accent)" }}>
            {m.icon || m.name.charAt(0)}
          </div>
          <div className="flex-1">
            <p className="label">نقاط {m.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Trophy size={18} style={{ color: "var(--orange)" }} />
              <span className="text-2xl font-extrabold" style={{ color: "var(--orange)" }}>{m.points.toLocaleString("ar")}</span>
            </div>
          </div>
          <select className="select w-auto text-sm py-2 px-3" value={sel} onChange={(e) => setSel(e.target.value)}>
            {state.familyMembers.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </div>
      )}

      {showForm && (
        <div className="card anim" style={{ borderColor: "rgba(139,92,246,0.25)" }}>
          <div className="space-y-3">
            <div className="grid grid-cols-6 gap-2">
              {icons.map((i) => (
                <button key={i} onClick={() => setF((p) => ({ ...p, icon: i }))}
                  className="aspect-square rounded-xl flex items-center justify-center text-xl cursor-pointer border-none"
                  style={{ background: f.icon === i ? "var(--accent-dim)" : "var(--card2)", border: f.icon === i ? "1.5px solid var(--accent)" : "1px solid var(--border)" }}>
                  {i}
                </button>
              ))}
            </div>
            <input className="input" placeholder="اسم المكافأة" value={f.title} onChange={(e) => setF((p) => ({ ...p, title: e.target.value }))} />
            <textarea className="input" placeholder="الوصف (اختياري)" rows={2} value={f.description} onChange={(e) => setF((p) => ({ ...p, description: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label mb-1.5 block">التكلفة</label>
                <input className="input" type="number" min={1} value={f.pointsCost} onChange={(e) => setF((p) => ({ ...p, pointsCost: +e.target.value }))} />
              </div>
              <div>
                <label className="label mb-1.5 block">الفئة</label>
                <select className="select" value={f.category} onChange={(e) => setF((p) => ({ ...p, category: e.target.value as typeof p.category }))}>
                  {cats.map((c) => <option key={c.v} value={c.v}>{c.i} {c.l}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={add} className="btn btn-primary flex-1">حفظ</button>
              <button onClick={() => setShowForm(false)} className="btn btn-ghost">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <div className="reward-grid">
        {state.rewards.length === 0 ? (
          <div className="card-sm text-center py-10 col-span-full">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "var(--pink-dim)" }}>
              <Trophy size={24} style={{ color: "var(--pink)" }} />
            </div>
            <p className="text-sm font-bold mb-0.5">لا توجد مكافآت</p>
            <p className="text-xs" style={{ color: "var(--text2)" }}>أضف مكافأة للبدء</p>
          </div>
        ) : state.rewards.map((r, i) => {
          const afford = (m?.points || 0) >= r.pointsCost;
          const finished = doneId === r.id;
          const cat = cats.find((c) => c.v === r.category);

          return (
            <div key={r.id} className={`card-sm text-center anim${Math.min(i + 1, 5)}`} style={{ opacity: finished ? 0.35 : 1 }}>
              <div className="text-3xl mb-2">{r.icon}</div>
              <h3 className="text-sm font-bold mb-0.5">{r.title}</h3>
              {r.description && <p className="text-[11px] mb-1.5" style={{ color: "var(--text2)" }}>{r.description}</p>}
              <div className="flex items-center justify-center gap-1 mb-2">
                <Coins size={12} style={{ color: "var(--orange)" }} />
                <span className="text-sm font-extrabold" style={{ color: "var(--orange)" }}>{r.pointsCost}</span>
              </div>
              <span className="badge mb-3" style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
                {cat?.i} {cat?.l}
              </span>
              <div className="flex gap-2">
                <button onClick={() => redeem(r.id)} disabled={!afford || finished}
                  className={`btn flex-1 btn-sm ${afford && !finished ? "btn-success" : "btn-ghost"}`}
                  style={{ opacity: afford && !finished ? 1 : 0.3 }}>
                  {finished ? <><Check size={12} /> تم</> : afford ? <><ShoppingCart size={12} /> استبدال</> : <><Coins size={12} /> غير كافٍ</>}
                </button>
                <button onClick={() => removeReward(r.id)} className="btn btn-danger btn-sm px-2.5">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
