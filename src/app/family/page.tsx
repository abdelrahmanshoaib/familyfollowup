"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import IconPicker from "@/components/IconPicker";

const COLORS = [
  "#8b5cf6", "#ec4899", "#22c55e", "#f59e0b", "#3b82f6",
  "#a78bfa", "#f472b6", "#2dd4bf", "#e879f9", "#38bdf8",
];

const EMOJIS = ["👦", "👧", "👨", "👩", "🧑", "👶", "🧒", "👴", "👵", "🦸", "🦹", "🧑‍🎓"];

const CIRCUMFERENCE = 2 * Math.PI * 20;

export default function FamilyPage() {
  const { state, addFamilyMember, updateFamilyMember, removeFamilyMember } = useStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    role: "child" as "parent" | "child",
    color: "#8b5cf6",
    icon: "",
    age: "",
    phone: "",
  });

  const resetForm = () =>
    setForm({ name: "", role: "child", color: "#8b5cf6", icon: "", age: "", phone: "" });

  const handleSave = () => {
    if (!form.name.trim()) return;
    addFamilyMember({
      name: form.name,
      role: form.role,
      avatar: form.icon || form.name.charAt(0),
      color: form.color,
      icon: form.icon,
      age: form.age ? Number(form.age) : undefined,
      phone: form.phone || undefined,
    });
    resetForm();
    setSheetOpen(false);
  };

  const completedCount = useMemo(() => {
    const counts: Record<string, number> = {};
    state.completedTasks.forEach((ct) => {
      counts[ct.memberId] = (counts[ct.memberId] || 0) + 1;
    });
    return counts;
  }, [state.completedTasks]);

  const memberProgress = useMemo(() => {
    const pcts: Record<string, number> = {};
    state.familyMembers.forEach((m) => {
      const totalTasks = state.tasks.filter((t) => t.active && t.assignedTo.includes(m.id)).length;
      const doneTasks = state.completedTasks.filter((ct) => ct.memberId === m.id).length;
      pcts[m.id] = totalTasks > 0 ? Math.min(Math.round((doneTasks / totalTasks) * 100), 100) : 0;
    });
    return pcts;
  }, [state.familyMembers, state.tasks, state.completedTasks]);

  const getLevel = (points: number) => Math.floor(points / 100) + 1;
  const getProgress = (points: number) => Math.min((points % 100), 100);

  return (
    <div className="space-y-6">
      <div className="anim">
        <h1 className="font-headline-lg" style={{ fontSize: 28, fontWeight: 700, color: "var(--on-surface)" }}>
          الأسرة
        </h1>
        <p className="font-body-md mt-1" style={{ fontSize: 14, color: "var(--on-surface-variant)" }}>
          إدارة أفراد العائلة وبياناتهم
        </p>
      </div>

      {state.familyMembers.length === 0 && (
        <div className="glass-card p-6 text-center anim1">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--primary-container)" }}
          >
            <span className="material-symbols-outlined filled-icon" style={{ fontSize: 32, color: "var(--primary)" }}>
              family_restroom
            </span>
          </div>
          <p className="font-headline-sm" style={{ fontSize: 16, fontWeight: 600, color: "var(--on-surface)" }}>
            لا يوجد أفراد بعد
          </p>
          <p className="font-body-sm mt-1" style={{ fontSize: 13, color: "var(--on-surface-variant)" }}>
            أضف أول فرد من العائلة
          </p>
        </div>
      )}

      {state.familyMembers.map((member, i) => {
        const level = getLevel(member.points);
        const progress = memberProgress[member.id] ?? 0;
        const dashoffset = CIRCUMFERENCE * (1 - progress / 100);
        const animClass = `anim${Math.min(i + 1, 5)}`;

        return (
          <div key={member.id} className={`glass-card p-4 space-y-4 ${animClass}`}>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div
                  className="w-16 h-16 rounded-full border-2 flex items-center justify-center font-headline-sm"
                  style={{
                    borderColor: member.color || "var(--primary)",
                    background: `${member.color || "var(--primary)"}18`,
                    color: member.color || "var(--primary)",
                    fontSize: 20,
                    fontWeight: 700,
                  }}
                >
                  {member.icon || member.name.charAt(0)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-headline-sm truncate" style={{ fontSize: 16, fontWeight: 700, color: "var(--on-surface)" }}>
                    {member.name}
                  </h3>
                  <span
                    className="badge"
                    style={{
                      background: member.role === "parent" ? "var(--secondary-fixed)" : "var(--primary-container)",
                      color: member.role === "parent" ? "var(--on-secondary-fixed)" : "var(--on-primary-container)",
                    }}
                  >
                    {member.role === "parent" ? "والد/ة" : "طفل/ة"}
                  </span>
                </div>
                {member.age !== undefined && (
                  <p className="font-body-sm mt-0.5" style={{ fontSize: 12, color: "var(--on-surface-variant)" }}>
                    العمر: {member.age} سنة
                  </p>
                )}
              </div>

              <div className="w-12 h-12 shrink-0">
                <svg width="48" height="48" viewBox="0 0 48 48">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    strokeWidth="4"
                    className="progress-ring-bg"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="progress-ring-fill"
                    style={{
                      stroke: member.color || "var(--primary)",
                      strokeDasharray: CIRCUMFERENCE,
                      strokeDashoffset: dashoffset,
                      transform: "rotate(-90deg)",
                      transformOrigin: "center",
                    }}
                  />
                  <text
                    x="24"
                    y="24"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="font-headline-sm"
                    style={{ fontSize: 12, fontWeight: 700, fill: "var(--on-surface)" }}
                  >
                    {progress.toLocaleString("ar")}٪
                  </text>
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3" style={{ background: "rgba(255,255,255,0.3)", borderRadius: 12, padding: 8 }}>
              {[
                { label: "النقاط", value: member.points.toLocaleString("ar"), color: "var(--primary)" },
                { label: "المستوى", value: level.toLocaleString("ar"), color: "var(--tertiary)" },
                { label: "المهام", value: (completedCount[member.id] || 0).toLocaleString("ar"), color: "var(--secondary)" },
              ].map((stat, si) => (
                <div
                  key={stat.label}
                  className="text-center"
                  style={{
                    padding: 8,
                    ...(si === 1 ? { borderLeft: "1px solid rgba(255,255,255,0.4)", borderRight: "1px solid rgba(255,255,255,0.4)" } : {}),
                  }}
                >
                  <p className="font-label-md" style={{ fontSize: 12, color: "var(--on-surface-variant)" }}>
                    {stat.label}
                  </p>
                  <p className="font-headline-sm" style={{ fontSize: 20, fontWeight: 700, color: stat.color }}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setDetailId(detailId === member.id ? null : member.id)}
                className="flex-1 h-10 rounded-xl border-none cursor-pointer font-label-md"
                style={{
                  background: "rgba(255,255,255,0.5)",
                  color: "var(--on-surface)",
                  fontSize: 13,
                  fontWeight: 500,
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                تعديل
              </button>
              <button
                onClick={() => setDetailId(detailId === member.id ? null : member.id)}
                className="flex-1 h-10 rounded-xl border-none cursor-pointer font-label-md"
                style={{
                  background: "var(--primary)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                عرض التفاصيل
              </button>
            </div>

            {detailId === member.id && (
              <div className="space-y-3 pt-2" style={{ borderTop: "1px solid var(--outline-variant)" }}>
                <div className="space-y-2">
                  {member.phone && (
                    <div className="flex items-center gap-2 font-body-sm" style={{ fontSize: 13, color: "var(--on-surface-variant)" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>phone</span>
                      {member.phone}
                    </div>
                  )}
                  {member.email && (
                    <div className="flex items-center gap-2 font-body-sm" style={{ fontSize: 13, color: "var(--on-surface-variant)" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>email</span>
                      {member.email}
                    </div>
                  )}
                  {member.notes && (
                    <div className="flex items-center gap-2 font-body-sm" style={{ fontSize: 13, color: "var(--on-surface-variant)" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>notes</span>
                      {member.notes}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    className="input-field flex-1"
                    style={{ height: 44, fontSize: 13 }}
                    defaultValue={member.name}
                    onBlur={(e) => {
                      if (e.target.value.trim() && e.target.value !== member.name) {
                        updateFamilyMember(member.id, { name: e.target.value });
                      }
                    }}
                    placeholder="تعديل الاسم"
                  />
                  <select
                    className="select-field"
                    style={{ height: 44, fontSize: 13, width: "auto", minWidth: 100 }}
                    defaultValue={member.role}
                    onChange={(e) =>
                      updateFamilyMember(member.id, { role: e.target.value as "parent" | "child" })
                    }
                  >
                    <option value="parent">والد/ة</option>
                    <option value="child">طفل/ة</option>
                  </select>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => updateFamilyMember(member.id, { color: c })}
                      className="w-7 h-7 rounded-full cursor-pointer border-none"
                      style={{
                        background: c,
                        border: member.color === c ? "2px solid var(--on-surface)" : "2px solid transparent",
                        transform: member.color === c ? "scale(1.15)" : "scale(1)",
                        transition: "transform 0.15s",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      <button className="fab" onClick={() => setSheetOpen(true)}>
        <span className="material-symbols-outlined">person_add</span>
      </button>

      <div className={`sheet-overlay ${sheetOpen ? "open" : ""}`} onClick={() => setSheetOpen(false)} />

      <div className={`bottom-sheet ${sheetOpen ? "open" : ""}`}>
        <div className="w-12 h-1.5 rounded-full mx-auto mb-4" style={{ background: "var(--outline-variant)" }} />

        <div className="flex items-center justify-between mb-6">
          <h2 className="font-headline-md" style={{ fontSize: 20, fontWeight: 700, color: "var(--on-surface)" }}>
            إضافة فرد جديد
          </h2>
          <button
            onClick={() => { setSheetOpen(false); resetForm(); }}
            className="w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer"
            style={{ background: "var(--surface-container-high)", color: "var(--on-surface-variant)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>close</span>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="font-label-md block mb-2" style={{ fontSize: 13, color: "var(--on-surface-variant)" }}>
              الاسم
            </label>
            <input
              className="input-field"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="اسم الفرد"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-label-md block mb-2" style={{ fontSize: 13, color: "var(--on-surface-variant)" }}>
                العمر
              </label>
              <input
                className="input-field"
                type="number"
                value={form.age}
                onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
                placeholder="العمر"
              />
            </div>
            <div>
              <label className="font-label-md block mb-2" style={{ fontSize: 13, color: "var(--on-surface-variant)" }}>
                الدور
              </label>
              <select
                className="select-field"
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as "parent" | "child" }))}
              >
                <option value="parent">والد/ة</option>
                <option value="child">طفل/ة</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-label-md block mb-2" style={{ fontSize: 13, color: "var(--on-surface-variant)" }}>
              رقم الجوال
            </label>
            <input
              className="input-field"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              placeholder="05xxxxxxxx"
              dir="ltr"
            />
          </div>

          <div>
            <label className="font-label-md block mb-2" style={{ fontSize: 13, color: "var(--on-surface-variant)" }}>
              اللون
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setForm((p) => ({ ...p, color: c }))}
                  className="w-8 h-8 rounded-full cursor-pointer border-none"
                  style={{
                    background: c,
                    border: form.color === c ? "2.5px solid var(--on-surface)" : "2.5px solid transparent",
                    transform: form.color === c ? "scale(1.15)" : "scale(1)",
                    transition: "transform 0.15s",
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="font-label-md block mb-2" style={{ fontSize: 13, color: "var(--on-surface-variant)" }}>
              الأيقونة
            </label>
            <div className="flex gap-2 flex-wrap">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setForm((p) => ({ ...p, icon: emoji }))}
                  className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer border-none"
                  style={{
                    background: form.icon === emoji ? "var(--primary-container)" : "var(--surface-container-high)",
                    fontSize: 20,
                    border: form.icon === emoji ? "2px solid var(--primary)" : "2px solid transparent",
                  }}
                >
                  {emoji}
                </button>
              ))}
              <button
                onClick={() => setShowPicker(true)}
                className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer border-none"
                style={{ background: "var(--surface-container-high)" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--on-surface-variant)" }}>
                  more_horiz
                </span>
              </button>
            </div>
            {form.icon && (
              <div className="flex items-center gap-2 mt-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-headline-sm"
                  style={{
                    background: `${form.color}18`,
                    color: form.color,
                    fontSize: 20,
                  }}
                >
                  {form.icon}
                </div>
                <button
                  onClick={() => setForm((p) => ({ ...p, icon: "" }))}
                  className="font-body-sm border-none bg-transparent cursor-pointer flex items-center gap-1"
                  style={{ fontSize: 12, color: "var(--error)" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                  إزالة
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            className="w-full h-12 rounded-2xl border-none cursor-pointer font-body-md flex items-center justify-center gap-2"
            style={{
              background: "var(--primary)",
              color: "var(--on-primary)",
              fontSize: 15,
              fontWeight: 600,
              opacity: form.name.trim() ? 1 : 0.5,
            }}
            disabled={!form.name.trim()}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>check</span>
            حفظ
          </button>
        </div>
      </div>

      {showPicker && (
        <IconPicker
          value={form.icon}
          onChange={(icon) => {
            setForm((p) => ({ ...p, icon }));
            setShowPicker(false);
          }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
