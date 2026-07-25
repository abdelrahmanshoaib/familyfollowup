"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import type { Reward } from "@/lib/types";

const categories = [
  { v: "all" as const, l: "الكل", icon: "apps" },
  { v: "fun" as const, l: "ترفيه", icon: "sports_esports" },
  { v: "gift" as const, l: "هدايا", icon: "redeem" },
  { v: "privilege" as const, l: "امتيازات", icon: "workspace_premium" },
  { v: "treat" as const, l: "تحفيز", icon: "cookie" },
];

const categoryLabel = (c: Reward["category"]) =>
  categories.find((x) => x.v === c)?.l ?? c;

const categoryIcon = (c: Reward["category"]) =>
  categories.find((x) => x.v === c)?.icon ?? "category";

const levelThresholds = [0, 100, 300, 600, 1000, 1500, 2500];

function getLevel(points: number) {
  let level = 1;
  for (let i = levelThresholds.length - 1; i >= 0; i--) {
    if (points >= levelThresholds[i]) {
      level = i + 1;
      break;
    }
  }
  const current = levelThresholds[level - 1] ?? 0;
  const next = levelThresholds[level] ?? current + 500;
  const pct = Math.min(100, Math.round(((points - current) / (next - current)) * 100));
  return { level, current, next, pct };
}

export default function RewardsPage() {
  const { state, redeemReward, addReward, removeReward } = useStore();
  const [selectedMemberId, setSelectedMemberId] = useState(state.familyMembers[0]?.id ?? "");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [redeemTarget, setRedeemTarget] = useState<Reward | null>(null);
  const [completedId, setCompletedId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    pointsCost: 50,
    category: "treat" as Reward["category"],
    icon: "emoji_events",
  });

  const member = state.familyMembers.find((m) => m.id === selectedMemberId);
  const totalPoints = member?.points ?? 0;
  const { level, pct } = getLevel(totalPoints);

  const filteredRewards =
    activeCategory === "all"
      ? state.rewards
      : state.rewards.filter((r) => r.category === activeCategory);

  const handleAddReward = () => {
    if (!form.title.trim()) return;
    addReward(form);
    setForm({ title: "", description: "", pointsCost: 50, category: "treat", icon: "emoji_events" });
    setShowAddForm(false);
  };

  const handleConfirmRedeem = () => {
    if (!redeemTarget || !selectedMemberId) return;
    redeemReward(redeemTarget.id, selectedMemberId);
    setCompletedId(redeemTarget.id);
    setRedeemTarget(null);
    setTimeout(() => setCompletedId(null), 1200);
  };

  const usedPoints = state.completedTasks.reduce(
    (sum, ct) => sum + ct.pointsEarned,
    0
  );

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="font-headline-lg" style={{ fontSize: 28, fontWeight: 700 }}>
          المكافآت
        </h1>
        <p className="font-body-md mt-1" style={{ color: "var(--on-surface-variant)" }}>
          استبدل نقاطك بمكافآت رائعة
        </p>
      </div>

      {/* ── Points Summary Card ── */}
      {member && (
        <div className="glass-card p-6 relative overflow-hidden">
          <div
            className="absolute -top-6 -right-6 w-24 h-24 rounded-full"
            style={{ background: "var(--primary)", opacity: 0.12, filter: "blur(30px)" }}
          />
          <div
            className="absolute -bottom-8 -left-8 w-20 h-20 rounded-full"
            style={{ background: "var(--tertiary)", opacity: 0.1, filter: "blur(25px)" }}
          />

          <div className="relative z-10">
            {/* top row */}
            <div className="flex items-center justify-between mb-1">
              <span className="font-body-sm" style={{ color: "var(--on-surface-variant)" }}>
                إجمالي النقاط
              </span>
              <span
                className="font-headline-md px-3 py-0.5 rounded-full flex items-center gap-1.5"
                style={{
                  background: "var(--primary-container)",
                  color: "var(--primary)",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <span className="material-symbols-outlined filled-icon" style={{ fontSize: 16 }}>
                  star
                </span>
                المستوى {level}
              </span>
            </div>
            <p className="font-headline-lg" style={{ fontSize: 32, fontWeight: 700, color: "var(--primary)" }}>
              {totalPoints.toLocaleString("ar")}
            </p>

            {/* progress bar */}
            <div className="mt-4">
              <div className="flex justify-between mb-1.5">
                <span className="font-body-sm" style={{ color: "var(--on-surface-variant)" }}>
                  التقدم للمستوى التالي
                </span>
                <span className="font-label-md" style={{ color: "var(--primary)" }}>
                  {pct}%
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>

            {/* bottom stats */}
            <div className="grid grid-cols-2 gap-4 mt-5 pt-4" style={{ borderTop: "1px solid var(--outline-variant)" }}>
              <div className="text-center">
                <p className="font-body-sm mb-1" style={{ color: "var(--on-surface-variant)" }}>
                  نقاط متاحة
                </p>
                <p className="font-headline-md" style={{ color: "var(--primary)", fontWeight: 700 }}>
                  {totalPoints.toLocaleString("ar")}
                </p>
              </div>
              <div className="text-center">
                <p className="font-body-sm mb-1" style={{ color: "var(--on-surface-variant)" }}>
                  نقاط مستخدمة
                </p>
                <p className="font-headline-md" style={{ color: "var(--error)", fontWeight: 700 }}>
                  {usedPoints.toLocaleString("ar")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Member Selector (horizontal scroll) ── */}
      {state.familyMembers.length > 1 && (
        <div className="chip-scroll">
          {state.familyMembers.map((m) => {
            const isActive = m.id === selectedMemberId;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMemberId(m.id)}
                className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer bg-transparent border-none"
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center font-headline-md text-lg ${
                    isActive ? "ring-4 shadow-md" : ""
                  }`}
                  style={{
                    background: m.color ?? "var(--primary-container)",
                    color: "var(--on-primary)",
                    border: isActive ? "2px solid var(--primary)" : "2px solid transparent",
                  }}
                >
                  {m.icon ?? m.name.charAt(0)}
                </div>
                <span className="font-body-sm" style={{ color: isActive ? "var(--primary)" : "var(--on-surface-variant)" }}>
                  {m.name}
                </span>
                <span className="font-label-md" style={{ color: "var(--on-surface-variant)", fontSize: 11 }}>
                  {m.points.toLocaleString("ar")} نقطة
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Category Filter ── */}
      <div className="chip-scroll">
        {categories.map((c) => (
          <button
            key={c.v}
            onClick={() => setActiveCategory(c.v)}
            className={`chip ${activeCategory === c.v ? "on" : ""}`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {c.icon}
            </span>
            {c.l}
          </button>
        ))}
      </div>

      {/* ── Add Reward Button ── */}
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="glass-card w-full p-4 flex items-center justify-center gap-2 cursor-pointer border-none font-body-md"
        style={{
          background: showAddForm ? "var(--primary)" : "var(--secondary-container)",
          color: showAddForm ? "var(--on-primary)" : "var(--secondary)",
          transition: "all 0.2s",
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
          {showAddForm ? "close" : "add_circle"}
        </span>
        {showAddForm ? "إلغاء" : "إضافة مكافأة جديدة"}
      </button>

      {/* ── Add Reward Form ── */}
      {showAddForm && (
        <div className="glass-card p-5 space-y-4 anim1">
          <div>
            <label className="font-label-md block mb-2" style={{ color: "var(--on-surface-variant)" }}>
              اسم المكافأة
            </label>
            <input
              className="input-field"
              placeholder="مثال: ساعة لعب"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            />
          </div>
          <div>
            <label className="font-label-md block mb-2" style={{ color: "var(--on-surface-variant)" }}>
              الوصف (اختياري)
            </label>
            <input
              className="input-field"
              placeholder="وصف المكافأة"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-label-md block mb-2" style={{ color: "var(--on-surface-variant)" }}>
                التكلفة (نقاط)
              </label>
              <input
                className="input-field"
                type="number"
                min={1}
                value={form.pointsCost}
                onChange={(e) => setForm((p) => ({ ...p, pointsCost: +e.target.value }))}
              />
            </div>
            <div>
              <label className="font-label-md block mb-2" style={{ color: "var(--on-surface-variant)" }}>
                الفئة
              </label>
              <select
                className="select-field"
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as Reward["category"] }))}
              >
                {categories.filter((c) => c.v !== "all").map((c) => (
                  <option key={c.v} value={c.v}>
                    {c.l}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleAddReward}
            className="w-full py-3 rounded-xl font-body-md font-semibold cursor-pointer border-none"
            style={{ background: "var(--primary)", color: "var(--on-primary)" }}
          >
            حفظ المكافأة
          </button>
        </div>
      )}

      {/* ── Reward Cards ── */}
      {filteredRewards.length === 0 ? (
        <div className="glass-card text-center py-12 p-5">
          <span
            className="material-symbols-outlined block mx-auto mb-3"
            style={{ fontSize: 48, color: "var(--on-surface-variant)", opacity: 0.4 }}
          >
            featured_play_list
          </span>
          <p className="font-body-md font-bold mb-1" style={{ color: "var(--on-surface)" }}>
            لا توجد مكافآت
          </p>
          <p className="font-body-sm" style={{ color: "var(--on-surface-variant)" }}>
            أضف مكافأة للبدء
          </p>
        </div>
      ) : (
        filteredRewards.map((r, i) => {
          const canAfford = (member?.points ?? 0) >= r.pointsCost;
          const justCompleted = completedId === r.id;

          return (
            <div
              key={r.id}
              className={`glass-card overflow-hidden anim${Math.min(i + 1, 5)}`}
              style={{ opacity: justCompleted ? 0.35 : 1 }}
            >
              {/* image area with price badge */}
              <div
                className="h-48 relative flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, var(--primary-container), var(--secondary-container))`,
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 56, color: "var(--primary)", opacity: 0.5 }}
                >
                  {categoryIcon(r.category)}
                </span>
                <span
                  className="absolute top-3 left-3 px-3 py-1 rounded-full font-label-md animate-pulse-soft"
                  style={{
                    background: "var(--primary)",
                    color: "var(--on-primary)",
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  <span className="material-symbols-outlined filled-icon" style={{ fontSize: 14, verticalAlign: "middle", marginLeft: 4 }}>
                    payments
                  </span>
                  {r.pointsCost}
                </span>
              </div>

              {/* content */}
              <div className="p-5">
                <h3 className="font-headline-sm mb-1" style={{ fontWeight: 700 }}>
                  {r.title}
                </h3>
                {r.description && (
                  <p className="font-body-sm mb-3" style={{ color: "var(--on-surface-variant)" }}>
                    {r.description}
                  </p>
                )}

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      if (canAfford && !justCompleted) setRedeemTarget(r);
                    }}
                    disabled={!canAfford || justCompleted}
                    className="flex-1 py-2.5 rounded-xl font-body-md font-semibold cursor-pointer border-none flex items-center justify-center gap-1.5"
                    style={{
                      background: canAfford && !justCompleted ? "var(--primary)" : "var(--surface-variant)",
                      color: canAfford && !justCompleted ? "var(--on-primary)" : "var(--on-surface-variant)",
                      opacity: canAfford && !justCompleted ? 1 : 0.5,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      {justCompleted ? "check_circle" : canAfford ? "shopping_cart" : "block"}
                    </span>
                    {justCompleted ? "تم" : canAfford ? "استبدال" : "غير كافٍ"}
                  </button>
                  <button
                    onClick={() => removeReward(r.id)}
                    className="px-4 py-2.5 rounded-xl font-body-sm cursor-pointer flex items-center gap-1.5"
                    style={{
                      background: "transparent",
                      color: "var(--on-surface-variant)",
                      border: "1px solid var(--outline-variant)",
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      delete
                    </span>
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* ── Bottom Sheet: Redeem Confirmation ── */}
      {redeemTarget && (
        <>
          <div
            className="sheet-overlay"
            onClick={() => setRedeemTarget(null)}
          />
          <div className="bottom-sheet">
            <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: "var(--outline-variant)" }} />
            <h2 className="font-headline-md mb-5" style={{ fontWeight: 700 }}>
              تأكيد الاستبدال
            </h2>

            {/* reward preview */}
            <div
              className="glass-card p-4 flex items-center gap-4 mb-5"
              style={{ background: "var(--surface-variant)" }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "var(--primary-container)" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 28, color: "var(--primary)" }}>
                  {categoryIcon(redeemTarget.category)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body-md font-bold truncate">{redeemTarget.title}</p>
                <p className="font-body-sm" style={{ color: "var(--primary)" }}>
                  {redeemTarget.pointsCost} نقطة
                </p>
              </div>
            </div>

            {/* calculation */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-body-md" style={{ color: "var(--on-surface-variant)" }}>
                  رصيدك الحالي
                </span>
                <span className="font-body-md font-bold" style={{ color: "var(--on-surface)" }}>
                  {(member?.points ?? 0).toLocaleString("ar")} نقطة
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-body-md" style={{ color: "var(--on-surface-variant)" }}>
                  تكلفة المكافأة
                </span>
                <span className="font-body-md font-bold" style={{ color: "var(--error)" }}>
                  -{redeemTarget.pointsCost.toLocaleString("ar")} نقطة
                </span>
              </div>
              <div
                className="flex justify-between items-center pt-3"
                style={{ borderTop: "1px solid var(--outline-variant)" }}
              >
                <span className="font-body-md" style={{ color: "var(--on-surface-variant)" }}>
                  الرصيد المتبقي
                </span>
                <span className="font-headline-sm font-bold" style={{ color: "var(--primary)" }}>
                  {((member?.points ?? 0) - redeemTarget.pointsCost).toLocaleString("ar")} نقطة
                </span>
              </div>
            </div>

            {/* confirm */}
            <button
              onClick={handleConfirmRedeem}
              className="w-full py-3 rounded-xl font-body-md font-semibold cursor-pointer border-none mb-3"
              style={{ background: "var(--primary)", color: "var(--on-primary)" }}
            >
              تأكيد الاستبدال
            </button>
            <button
              onClick={() => setRedeemTarget(null)}
              className="w-full py-3 rounded-xl font-body-md cursor-pointer bg-transparent"
              style={{
                color: "var(--on-surface-variant)",
                border: "1px solid var(--outline-variant)",
              }}
            >
              إلغاء
            </button>
          </div>
        </>
      )}
    </div>
  );
}
