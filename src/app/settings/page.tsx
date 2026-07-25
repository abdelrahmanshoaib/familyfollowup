"use client";

import { useState, useRef } from "react";
import { useStore } from "@/lib/store";
import type { FamilyMember, ThemeSettings } from "@/lib/types";
import IconPicker from "@/components/IconPicker";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const MdIcons: Record<string, React.ComponentType> = require("react-icons/md");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const FaIcons: Record<string, React.ComponentType> = require("react-icons/fa");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const HiIcons: Record<string, React.ComponentType> = require("react-icons/hi");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const IoIcons: Record<string, React.ComponentType> = require("react-icons/io5");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const TbIcons: Record<string, React.ComponentType> = require("react-icons/tb");

const STORAGE_KEY = "familyfollowup-data";

const memberColors = [
  "#4f46e5", "#7c3aed", "#ec4899", "#ef4444",
  "#f59e0b", "#10b981", "#06b6d4", "#3b82f6",
  "#8b5cf6", "#f97316", "#14b8a6", "#6366f1",
];

const stitchThemes: { name: string; colors: string[]; theme: Partial<ThemeSettings> }[] = [
  { name: "كلاسيك", colors: ["#006C49", "#4A6741", "#B5C9B5"], theme: { primaryColor: "#006C49", secondaryColor: "#4A6741", accentColor: "#7A5800", backgroundColor: "#F8FAF5", surfaceColor: "#F0F4ED", textColor: "#1A1C1A" } },
  { name: "داكن", colors: ["#B5CCA3", "#8DB580", "#3A4A3A"], theme: { primaryColor: "#B5CCA3", secondaryColor: "#8DB580", accentColor: "#C8A850", backgroundColor: "#121A12", surfaceColor: "#1A2A1A", textColor: "#D8E8D0", darkMode: true } },
  { name: "محيط", colors: ["#006A6A", "#4A8080", "#A0C8C8"], theme: { primaryColor: "#006A6A", secondaryColor: "#4A8080", accentColor: "#D08040", backgroundColor: "#F5FAFA", surfaceColor: "#E8F4F4", textColor: "#1A1C1C" } },
  { name: "غابة", colors: ["#2E5A2E", "#5A8A3A", "#A8D080"], theme: { primaryColor: "#2E5A2E", secondaryColor: "#5A8A3A", accentColor: "#D4A840", backgroundColor: "#F0F8F0", surfaceColor: "#E0F0E0", textColor: "#1A2A1A" } },
];

function IconDisplay({ iconId, size = "text-2xl" }: { iconId: string; size?: string }) {
  const parts = iconId.split("-");
  if (parts.length >= 2) {
    const lib = parts[0];
    const name = parts.slice(1).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");
    const prefixes: Record<string, string> = { md: "Md", fa: "Fa", hi: "Hi", io: "Io", tb: "Tb" };
    const libs: Record<string, Record<string, React.ComponentType>> = {
      md: MdIcons as Record<string, React.ComponentType>,
      fa: FaIcons as Record<string, React.ComponentType>,
      hi: HiIcons as Record<string, React.ComponentType>,
      io: IoIcons as Record<string, React.ComponentType>,
      tb: TbIcons as Record<string, React.ComponentType>,
    };
    const prefix = prefixes[lib];
    const iconLib = libs[lib];
    if (prefix && iconLib) {
      const IconComponent = iconLib[`${prefix}${name}`];
      if (IconComponent) {
        return <span className={size}><IconComponent /></span>;
      }
    }
  }
  return <span className={size}>👤</span>;
}

export default function SettingsPage() {
  const {
    state,
    addFamilyMember,
    removeFamilyMember,
    updateFamilyMember,
    updateTheme,
    resetTheme,
    resetAllData,
  } = useStore();

  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [iconPickerFor, setIconPickerFor] = useState<"new" | string | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showFamilyMembers, setShowFamilyMembers] = useState(false);
  const [saved, setSaved] = useState(false);

  const [memberForm, setMemberForm] = useState({
    name: "",
    role: "child" as "parent" | "child",
    avatar: "MdPerson",
    age: "",
    phone: "",
    email: "",
    notes: "",
    color: memberColors[0],
    photo: "",
  });

  const photoRef = useRef<HTMLInputElement>(null);
  const newPhotoRef = useRef<HTMLInputElement>(null);

  const handleAddMember = () => {
    if (!memberForm.name.trim()) return;
    addFamilyMember({
      name: memberForm.name.trim(),
      role: memberForm.role,
      avatar: memberForm.avatar,
      age: memberForm.age ? parseInt(memberForm.age) : undefined,
      phone: memberForm.phone.trim() || undefined,
      email: memberForm.email.trim() || undefined,
      notes: memberForm.notes.trim() || undefined,
      color: memberForm.color,
      photo: memberForm.photo || undefined,
    });
    setMemberForm({
      name: "", role: "child", avatar: "MdPerson", age: "",
      phone: "", email: "", notes: "",
      color: memberColors[state.familyMembers.length % memberColors.length],
      photo: "",
    });
    setShowAddMember(false);
  };

  const handlePhotoUpload = (memberId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (memberId === "new") {
        setMemberForm({ ...memberForm, photo: result });
      } else {
        updateFamilyMember(memberId, { photo: result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `familyfollowup-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          window.location.reload();
        } catch {
          alert("الملف غير صالح");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleBackupNow = () => {
    handleExportData();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="page">
      <div className="space-y-6 max-w-2xl mx-auto">

        {/* Header */}
        <div className="anim">
          <h1 className="font-headline-lg" style={{ fontSize: 28, fontWeight: 700, color: "var(--on-surface)" }}>
            الإعدادات
          </h1>
          <p className="font-body-md" style={{ fontSize: 14, color: "var(--on-surface-variant)", marginTop: 4 }}>
            تخصيص وإدارة حساب عائلتك
          </p>
        </div>

        {/* ─── هوية العائلة ─── */}
        <div className="glass-card anim1" style={{ padding: 20 }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined filled-icon" style={{ fontSize: 20, color: "var(--primary)" }}>family_restroom</span>
            <span className="font-headline-sm" style={{ fontSize: 16, fontWeight: 600, color: "var(--on-surface)" }}>هوية العائلة</span>
          </div>

          {/* Family name input */}
          <div style={{ marginBottom: 16 }}>
            <label className="font-label-md" style={{ fontSize: 12, color: "var(--on-surface-variant)", display: "block", marginBottom: 6 }}>اسم العائلة</label>
            <input
              type="text"
              value={state.theme.familyName}
              onChange={(e) => updateTheme({ familyName: e.target.value })}
              placeholder="عائلتي"
              className="input-field"
              style={{ fontFamily: "Cairo, sans-serif" }}
            />
          </div>

          {/* Manage family members button */}
          <button
            onClick={() => setShowFamilyMembers(!showFamilyMembers)}
            className="glass-card"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 14,
              border: "none",
              cursor: "pointer",
              borderRadius: 16,
            }}
          >
            <div className="flex items-center gap-3">
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "var(--primary-container)",
                opacity: 0.1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--primary)", position: "absolute" }}>group</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className="font-body-lg" style={{ fontSize: 14, fontWeight: 600, color: "var(--on-surface)", display: "block" }}>
                  إدارة أفراد الأسرة
                </span>
                <span className="font-body-sm" style={{ fontSize: 12, color: "var(--on-surface-variant)" }}>
                  {state.familyMembers.length} أفراد
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--on-surface-variant)" }}>chevron_left</span>
          </button>

          {/* Family members panel (expanded) */}
          {showFamilyMembers && (
            <div style={{ marginTop: 16 }}>
              {/* Add member form */}
              {showAddMember && (
                <div className="glass-card anim" style={{ padding: 16, marginBottom: 12 }}>
                  <h3 className="font-headline-sm" style={{ fontSize: 15, fontWeight: 600, color: "var(--on-surface)", marginBottom: 12 }}>إضافة فرد جديد</h3>

                  <div className="flex items-center gap-4" style={{ marginBottom: 16 }}>
                    <div className="relative group">
                      <input type="file" ref={newPhotoRef} accept="image/*" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload("new", f); }} />
                      <button onClick={() => newPhotoRef.current?.click()}
                        className="w-20 h-20 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors"
                        style={{ borderColor: memberForm.photo ? memberForm.color : "var(--outline)" }}>
                        {memberForm.photo ? (
                          <img src={memberForm.photo} alt="صورة" className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined" style={{ fontSize: 24, color: "var(--on-surface-variant)" }}>camera_alt</span>
                        )}
                      </button>
                    </div>
                    <div className="flex-1">
                      <label className="font-label-md" style={{ fontSize: 12, color: "var(--on-surface-variant)", display: "block", marginBottom: 6 }}>الأيقونة والصورة</label>
                      <div className="flex flex-wrap gap-2 items-center">
                        <button onClick={() => setIconPickerFor("new")}
                          className="glass-card"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "8px 12px",
                            border: "1px dashed var(--primary)",
                            borderRadius: 12,
                            fontSize: 13,
                            color: "var(--primary)",
                            background: "transparent",
                            cursor: "pointer",
                          }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>grid_view</span>
                          اختر أيقونة
                        </button>
                        <div style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background: `${memberForm.color}15`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                          <IconDisplay iconId={memberForm.avatar} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <div>
                      <label className="font-label-md" style={{ fontSize: 12, color: "var(--on-surface-variant)", display: "block", marginBottom: 6 }}>الاسم *</label>
                      <input type="text" value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} placeholder="اسم الفرد" className="input-field" />
                    </div>
                    <div>
                      <label className="font-label-md" style={{ fontSize: 12, color: "var(--on-surface-variant)", display: "block", marginBottom: 6 }}>الصفة</label>
                      <select value={memberForm.role} onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value as "parent" | "child" })} className="select-field">
                        <option value="parent">والد/ة</option>
                        <option value="child">طفل</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <div>
                      <label className="font-label-md" style={{ fontSize: 12, color: "var(--on-surface-variant)", display: "block", marginBottom: 6 }}>العمر</label>
                      <input type="number" value={memberForm.age} onChange={(e) => setMemberForm({ ...memberForm, age: e.target.value })} placeholder="العمر" min="1" max="100" className="input-field" />
                    </div>
                    <div>
                      <label className="font-label-md" style={{ fontSize: 12, color: "var(--on-surface-variant)", display: "block", marginBottom: 6 }}>اللون المميز</label>
                      <div className="flex flex-wrap" style={{ gap: 6 }}>
                        {memberColors.map((c) => (
                          <button key={c} onClick={() => setMemberForm({ ...memberForm, color: c })}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              background: c,
                              border: memberForm.color === c ? "2px solid var(--on-surface)" : "2px solid transparent",
                              cursor: "pointer",
                              transform: memberForm.color === c ? "scale(1.1)" : "scale(1)",
                              transition: "transform 0.15s",
                            }} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <div>
                      <label className="font-label-md" style={{ fontSize: 12, color: "var(--on-surface-variant)", display: "block", marginBottom: 6 }}>رقم الهاتف</label>
                      <input type="tel" value={memberForm.phone} onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })} placeholder="05XXXXXXXX" className="input-field" />
                    </div>
                    <div>
                      <label className="font-label-md" style={{ fontSize: 12, color: "var(--on-surface-variant)", display: "block", marginBottom: 6 }}>البريد الإلكتروني</label>
                      <input type="email" value={memberForm.email} onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })} placeholder="email@example.com" className="input-field" />
                    </div>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label className="font-label-md" style={{ fontSize: 12, color: "var(--on-surface-variant)", display: "block", marginBottom: 6 }}>ملاحظات</label>
                    <textarea value={memberForm.notes} onChange={(e) => setMemberForm({ ...memberForm, notes: e.target.value })} placeholder="ملاحظات إضافية..." rows={2}
                      className="input-field" style={{ height: "auto", padding: "12px 16px", resize: "none" }} />
                  </div>

                  <div className="flex" style={{ gap: 8 }}>
                    <button onClick={handleAddMember}
                      className="font-label-md"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "10px 20px",
                        background: "var(--primary)",
                        color: "var(--on-primary)",
                        borderRadius: 12,
                        border: "none",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check</span>
                      حفظ
                    </button>
                    <button onClick={() => setShowAddMember(false)}
                      className="font-label-md"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "10px 20px",
                        background: "var(--surface-container-high)",
                        color: "var(--on-surface-variant)",
                        borderRadius: 12,
                        border: "none",
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: "pointer",
                      }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

              {/* Members list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {state.familyMembers.map((member) => (
                  <div key={member.id} className="glass-card" style={{ padding: 14 }}>
                    <div className="flex items-center" style={{ gap: 12 }}>
                      <div className="relative group" style={{ flexShrink: 0 }}>
                        <input type="file" accept="image/*" className="hidden" id={`photo-${member.id}`}
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(member.id, f); }} />
                        <label htmlFor={`photo-${member.id}`}
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 14,
                            overflow: "hidden",
                            border: `2px solid ${member.color || "var(--outline)"}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                          }}>
                          {member.photo ? (
                            <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            <IconDisplay iconId={member.avatar} size="text-xl" />
                          )}
                        </label>
                        <label htmlFor={`photo-${member.id}`}
                          className="absolute inset-0 flex items-center justify-center transition-opacity cursor-pointer"
                          style={{
                            borderRadius: 14,
                            background: "rgba(0,0,0,0.4)",
                            opacity: 0,
                          }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 18, color: "white" }}>camera_alt</span>
                        </label>
                      </div>

                      <div className="flex-1" style={{ minWidth: 0 }}>
                        <div className="flex items-center" style={{ gap: 8 }}>
                          <span className="font-body-md" style={{ fontSize: 14, fontWeight: 600, color: "var(--on-surface)" }}>{member.name}</span>
                          <span className="badge" style={{
                            background: `${member.color || "var(--primary)"}20`,
                            color: member.color || "var(--primary)",
                          }}>
                            {member.role === "parent" ? "والد/ة" : "طفل"}
                          </span>
                          {member.age && <span className="font-body-sm" style={{ fontSize: 11, color: "var(--on-surface-variant)" }}>{member.age} سنة</span>}
                        </div>
                        <div className="flex items-center" style={{ gap: 4, marginTop: 4 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 14, color: "var(--tertiary)" }}>emoji_events</span>
                          <span className="font-body-sm" style={{ fontSize: 12, color: "var(--tertiary)" }}>{member.points} نقطة</span>
                        </div>
                      </div>

                      <div className="flex items-center" style={{ gap: 4, flexShrink: 0 }}>
                        <button onClick={() => setExpandedMember(expandedMember === member.id ? null : member.id)}
                          style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "none", background: "transparent", cursor: "pointer" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--on-surface-variant)" }}>
                            {expandedMember === member.id ? "expand_less" : "expand_more"}
                          </span>
                        </button>
                        <button onClick={() => setIconPickerFor(member.id)}
                          style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "none", background: "transparent", cursor: "pointer" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--primary)" }}>palette</span>
                        </button>
                        <button onClick={() => removeFamilyMember(member.id)}
                          style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "none", background: "transparent", cursor: "pointer" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--error)" }}>delete</span>
                        </button>
                      </div>
                    </div>

                    {expandedMember === member.id && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--outline)" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          {member.phone && (
                            <div className="flex items-center" style={{ gap: 6 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 14, color: "var(--on-surface-variant)" }}>phone</span>
                              <span className="font-body-sm" style={{ fontSize: 13, color: "var(--on-surface-variant)" }}>{member.phone}</span>
                            </div>
                          )}
                          {member.email && (
                            <div className="flex items-center" style={{ gap: 6 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 14, color: "var(--on-surface-variant)" }}>mail</span>
                              <span className="font-body-sm" style={{ fontSize: 13, color: "var(--on-surface-variant)" }}>{member.email}</span>
                            </div>
                          )}
                        </div>
                        {member.notes && (
                          <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 12, background: "var(--surface-container-high)" }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 14, color: "var(--on-surface-variant)", marginLeft: 4 }}>description</span>
                            <span className="font-body-sm" style={{ fontSize: 13, color: "var(--on-surface-variant)" }}>{member.notes}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {state.familyMembers.length === 0 && (
                  <div className="glass-card" style={{ padding: 32, textAlign: "center" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--on-surface-variant)", opacity: 0.3 }}>family_restroom</span>
                    <p className="font-body-md" style={{ fontSize: 14, color: "var(--on-surface-variant)", marginTop: 8 }}>لم تضف أي فرد بعد</p>
                  </div>
                )}

                <button onClick={() => setShowAddMember(true)}
                  className="glass-card"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: 14,
                    border: "1px dashed var(--outline)",
                    borderRadius: 16,
                    background: "transparent",
                    cursor: "pointer",
                    color: "var(--primary)",
                  }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>person_add</span>
                  <span className="font-body-md" style={{ fontSize: 14, fontWeight: 600 }}>إضافة فرد</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─── المظهر ─── */}
        <div className="glass-card anim2" style={{ padding: 20 }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined filled-icon" style={{ fontSize: 20, color: "var(--primary)" }}>palette</span>
            <span className="font-headline-sm" style={{ fontSize: 16, fontWeight: 600, color: "var(--on-surface)" }}>المظهر</span>
          </div>

          {/* Dark mode toggle */}
          <div className="glass-card" style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 14,
            marginBottom: 16,
            borderRadius: 16,
          }}>
            <div className="flex items-center" style={{ gap: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "var(--primary-container)",
                opacity: 0.15,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}>
                <span className="material-symbols-outlined filled-icon" style={{ fontSize: 20, color: "var(--primary)", position: "absolute" }}>dark_mode</span>
              </div>
              <div>
                <span className="font-body-lg" style={{ fontSize: 14, fontWeight: 600, color: "var(--on-surface)", display: "block" }}>الوضع الليلي</span>
                <span className="font-body-sm" style={{ fontSize: 12, color: "var(--on-surface-variant)" }}>تفعيل المظهر الداكن</span>
              </div>
            </div>
            {/* iOS toggle */}
            <label style={{ position: "relative", display: "inline-block", width: 51, height: 31, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={state.theme.darkMode}
                onChange={() => updateTheme({ darkMode: !state.theme.darkMode })}
                style={{ display: "none" }}
              />
              <div style={{
                position: "absolute",
                inset: 0,
                borderRadius: 31,
                background: state.theme.darkMode ? "var(--primary)" : "var(--surface-container-high)",
                transition: "background 0.3s",
              }} />
              <div style={{
                position: "absolute",
                top: 2,
                left: state.theme.darkMode ? 22 : 2,
                width: 27,
                height: 27,
                borderRadius: "50%",
                background: "white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                transition: "left 0.3s",
              }} />
            </label>
          </div>

          {/* Theme selection */}
          <div style={{ marginBottom: 16 }}>
            <span className="font-label-md" style={{ fontSize: 12, color: "var(--on-surface-variant)", display: "block", marginBottom: 10 }}>سمة الألوان</span>
            <div className="chip-scroll">
              {stitchThemes.map((t) => {
                const isActive = state.theme.primaryColor === t.theme.primaryColor;
                return (
                  <button
                    key={t.name}
                    onClick={() => updateTheme(t.theme)}
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: 16,
                      border: isActive ? "2px solid var(--primary)" : "2px solid var(--outline)",
                      background: isActive ? "var(--primary-container)" : "var(--surface-container-high)",
                      cursor: "pointer",
                      flexShrink: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      transition: "border-color 0.2s, background 0.2s",
                    }}
                  >
                    <div className="flex items-center" style={{ gap: 4 }}>
                      {t.colors.map((c, i) => (
                        <div key={i} style={{
                          width: i === 0 ? 16 : 12,
                          height: i === 0 ? 16 : 12,
                          borderRadius: "50%",
                          background: c,
                        }} />
                      ))}
                    </div>
                    <span className="font-body-sm" style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: isActive ? "var(--primary)" : "var(--on-surface)",
                    }}>{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Corner radius slider */}
          <div className="glass-card" style={{ padding: 14, borderRadius: 16 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
              <span className="font-body-md" style={{ fontSize: 14, fontWeight: 500, color: "var(--on-surface)" }}>نصف قطر الزاوية</span>
              <span className="badge" style={{ background: "var(--primary-container)", color: "var(--primary)" }}>
                {state.theme.borderRadius}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={3}
              step={1}
              value={["none", "small", "medium", "large"].indexOf(state.theme.borderRadius)}
              onChange={(e) => {
                const vals = ["none", "small", "medium", "large"] as const;
                updateTheme({ borderRadius: vals[parseInt(e.target.value)] });
              }}
              style={{
                width: "100%",
                height: 4,
                borderRadius: 2,
                background: "var(--surface-container-high)",
                outline: "none",
                appearance: "none",
                cursor: "pointer",
              }}
            />
            <div className="flex justify-between" style={{ marginTop: 4 }}>
              {["none", "small", "medium", "large"].map((v) => (
                <span key={v} className="font-body-sm" style={{
                  fontSize: 10,
                  color: state.theme.borderRadius === v ? "var(--primary)" : "var(--on-surface-variant)",
                  fontWeight: state.theme.borderRadius === v ? 600 : 400,
                }}>
                  {{ none: "0", small: "8", medium: "16", large: "24" }[v]}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ─── النسخ الاحتياطي والمزامنة ─── */}
        <div className="anim3">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined filled-icon" style={{ fontSize: 20, color: "var(--primary)" }}>cloud</span>
            <span className="font-headline-sm" style={{ fontSize: 16, fontWeight: 600, color: "var(--on-surface)" }}>النسخ الاحتياطي والمزامنة</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {/* النسخ الآن */}
            <button onClick={handleBackupNow} className="glass-card anim1" style={{
              padding: 16,
              border: "none",
              cursor: "pointer",
              textAlign: "center",
              borderRadius: 16,
            }}>
              <span className="material-symbols-outlined" style={{
                fontSize: 28,
                color: "var(--primary)",
                background: "var(--primary-container)",
                borderRadius: 12,
                padding: 8,
                display: "inline-flex",
                marginBottom: 8,
              }}>backup</span>
              <p className="font-body-md" style={{ fontSize: 13, fontWeight: 600, color: "var(--on-surface)" }}>
                {saved ? "تم النسخ!" : "النسخ الآن"}
              </p>
            </button>

            {/* استعادة البيانات */}
            <button onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = ".json";
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  try {
                    const data = JSON.parse(ev.target?.result as string);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                    window.location.reload();
                  } catch {
                    alert("الملف غير صالح");
                  }
                };
                reader.readAsText(file);
              };
              input.click();
            }} className="glass-card anim2" style={{
              padding: 16,
              border: "none",
              cursor: "pointer",
              textAlign: "center",
              borderRadius: 16,
            }}>
              <span className="material-symbols-outlined" style={{
                fontSize: 28,
                color: "var(--secondary)",
                background: "var(--secondary-container)",
                borderRadius: 12,
                padding: 8,
                display: "inline-flex",
                marginBottom: 8,
              }}>restore</span>
              <p className="font-body-md" style={{ fontSize: 13, fontWeight: 600, color: "var(--on-surface)" }}>استعادة البيانات</p>
            </button>

            {/* استيراد */}
            <button onClick={handleImportData} className="glass-card anim3" style={{
              padding: 16,
              border: "none",
              cursor: "pointer",
              textAlign: "center",
              borderRadius: 16,
            }}>
              <span className="material-symbols-outlined" style={{
                fontSize: 28,
                color: "var(--tertiary)",
                background: "var(--tertiary-container)",
                borderRadius: 12,
                padding: 8,
                display: "inline-flex",
                marginBottom: 8,
              }}>file_upload</span>
              <p className="font-body-md" style={{ fontSize: 13, fontWeight: 600, color: "var(--on-surface)" }}>استيراد</p>
            </button>

            {/* تصدير */}
            <button onClick={handleExportData} className="glass-card anim4" style={{
              padding: 16,
              border: "none",
              cursor: "pointer",
              textAlign: "center",
              borderRadius: 16,
            }}>
              <span className="material-symbols-outlined" style={{
                fontSize: 28,
                color: "var(--on-surface-variant)",
                background: "var(--surface-container-high)",
                borderRadius: 12,
                padding: 8,
                display: "inline-flex",
                marginBottom: 8,
              }}>file_download</span>
              <p className="font-body-md" style={{ fontSize: 13, fontWeight: 600, color: "var(--on-surface)" }}>تصدير</p>
            </button>
          </div>
        </div>

        {/* ─── منطقة الخطر ─── */}
        <div className="glass-card anim5" style={{
          padding: 20,
          background: "rgba(255, 235, 238, 0.5)",
          border: "1px solid rgba(198, 40, 40, 0.15)",
        }}>
          <div className="flex items-center" style={{ gap: 8, marginBottom: 8 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--error)" }}>report_problem</span>
            <span className="font-headline-sm" style={{ fontSize: 16, fontWeight: 600, color: "var(--error)" }}>منطقة الخطر</span>
          </div>
          <p className="font-body-sm" style={{ fontSize: 13, color: "var(--on-surface-variant)", marginBottom: 14 }}>
            هذه الإجراءات لا يمكن التراجع عنها
          </p>
          <button
            onClick={() => {
              if (confirm("هل أنت متأكد من حذف جميع البيانات؟")) resetAllData();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              width: "100%",
              padding: "12px 16px",
              background: "var(--error)",
              color: "var(--on-error)",
              borderRadius: 14,
              border: "none",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "Tajawal, sans-serif",
              cursor: "pointer",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>delete_forever</span>
            حذف جميع البيانات
          </button>
        </div>

        {/* IconPicker modal */}
        {iconPickerFor !== null && (
          <IconPicker
            value=""
            onChange={(id) => {
              if (iconPickerFor === "new") {
                setMemberForm({ ...memberForm, avatar: id });
              } else {
                const member = state.familyMembers.find((m) => m.id === iconPickerFor);
                if (member) {
                  updateFamilyMember(iconPickerFor, { avatar: id });
                }
              }
              setIconPickerFor(null);
            }}
            onClose={() => setIconPickerFor(null)}
          />
        )}
      </div>
    </div>
  );
}
