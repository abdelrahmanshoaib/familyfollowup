"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Trophy, Plus, Trash2, ShoppingCart, Check, Coins } from "lucide-react";

export default function RewardsPage() {
  const { state, redeemReward, addReward, removeReward } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState(state.familyMembers[0]?.id || "");
  const [redeemedId, setRedeemedId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    pointsCost: 50,
    category: "treat" as "fun" | "treat" | "privilege" | "gift",
    icon: "🎁",
  });

  const categories = [
    { value: "treat", label: "تحفيز", icon: "🍪" },
    { value: "fun", label: "ترفيه", icon: "🎮" },
    { value: "privilege", label: "مزايا", icon: "⭐" },
    { value: "gift", label: "هدايا", icon: "🎁" },
  ];

  const icons = ["🎁", "🎮", "🍪", "🧸", "📱", "🎬", "🛍️", "🎪", "🎨", "🏆", "🎈", "🍦"];

  const handleAdd = () => {
    if (!form.title.trim()) return;
    addReward(form);
    setForm({ title: "", description: "", pointsCost: 50, category: "treat", icon: "🎁" });
    setShowForm(false);
  };

  const handleRedeem = (id: string) => {
    if (!selectedMember) return;
    redeemReward(id, selectedMember);
    setRedeemedId(id);
    setTimeout(() => setRedeemedId(null), 1500);
  };

  const member = state.familyMembers.find((m) => m.id === selectedMember);

  return (
    <div className="space-y-4 animate-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">المكافآت</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          <Plus size={16} /> جديد
        </button>
      </div>

      {/* Points + member selector */}
      {member && (
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255, 179, 71, 0.08)", border: "1px solid rgba(255, 179, 71, 0.15)" }}>
          <div className="avatar w-10 h-10 text-sm" style={{ background: member.color || "var(--accent)" }}>
            {member.icon || member.name.charAt(0)}
          </div>
          <div className="flex-1">
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{member.name}</p>
            <div className="flex items-center gap-1">
              <Trophy size={16} style={{ color: "#ffb347" }} />
              <span className="text-lg font-bold" style={{ color: "#ffb347" }}>{member.points.toLocaleString("ar")}</span>
            </div>
          </div>
          <select className="select w-auto text-sm" value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)}>
            {state.familyMembers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="card animate-in" style={{ borderColor: "var(--accent)" }}>
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              {icons.map((icon) => (
                <button key={icon} onClick={() => setForm((p) => ({ ...p, icon }))} className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer border-none"
                  style={{ background: form.icon === icon ? "rgba(124, 108, 255, 0.2)" : "var(--bg-card)", border: form.icon === icon ? "1px solid var(--accent)" : "1px solid var(--border)" }}>
                  {icon}
                </button>
              ))}
            </div>
            <input className="input" placeholder="اسم المكافأة" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            <textarea className="input" placeholder="الوصف (اختياري)" rows={2} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: "var(--text-secondary)" }}>التكلفة</label>
                <input className="input" type="number" min={1} value={form.pointsCost} onChange={(e) => setForm((p) => ({ ...p, pointsCost: +e.target.value }))} />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: "var(--text-secondary)" }}>الفئة</label>
                <select className="select" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as typeof p.category }))}>
                  {categories.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAdd} className="btn btn-primary flex-1">حفظ</button>
              <button onClick={() => setShowForm(false)} className="btn btn-secondary">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {state.rewards.length === 0 ? (
          <div className="card text-center py-10 col-span-full">
            <p className="text-3xl mb-2">🎁</p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>لا توجد مكافآت</p>
          </div>
        ) : (
          state.rewards.map((reward, i) => {
            const canAfford = (member?.points || 0) >= reward.pointsCost;
            const done = redeemedId === reward.id;
            const cat = categories.find((c) => c.value === reward.category);

            return (
              <div key={reward.id} className={`card text-center animate-in-${Math.min(i + 1, 5)}`} style={{ opacity: done ? 0.5 : 1 }}>
                <div className="text-3xl mb-2">{reward.icon}</div>
                <h3 className="font-bold text-sm">{reward.title}</h3>
                {reward.description && <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{reward.description}</p>}
                <div className="flex items-center justify-center gap-1 my-2">
                  <Coins size={12} style={{ color: "#ffb347" }} />
                  <span className="text-xs font-bold" style={{ color: "#ffb347" }}>{reward.pointsCost}</span>
                </div>
                <span className="badge mb-2" style={{ background: "rgba(124, 108, 255, 0.08)", color: "var(--accent)" }}>
                  {cat?.icon} {cat?.label}
                </span>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleRedeem(reward.id)} disabled={!canAfford || done}
                    className={`btn flex-1 text-xs py-1.5 ${canAfford && !done ? "btn-success" : "btn-secondary"}`}
                    style={{ opacity: canAfford && !done ? 1 : 0.4 }}>
                    {done ? <><Check size={12} /> تم</> : canAfford ? <><ShoppingCart size={12} /> استبدال</> : <><Coins size={12} /> غير كافٍ</>}
                  </button>
                  <button onClick={() => removeReward(reward.id)} className="btn btn-danger text-xs py-1.5 px-2">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
