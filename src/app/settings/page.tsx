"use client";

import { useState, useRef } from "react";
import { useStore } from "@/lib/store";
import type { FamilyMember, ThemeSettings } from "@/lib/types";
import IconPicker from "@/components/IconPicker";
import {
  UserPlus,
  Trash2,
  Trophy,
  Edit3,
  X,
  Check,
  Palette,
  Users,
  RotateCcw,
  Download,
  Upload,
  Camera,
  Phone,
  Mail,
  FileText,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Save,
  Grid,
} from "lucide-react";
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

const memberColors = [
  "#4f46e5", "#7c3aed", "#ec4899", "#ef4444",
  "#f59e0b", "#10b981", "#06b6d4", "#3b82f6",
  "#8b5cf6", "#f97316", "#14b8a6", "#6366f1",
];

const presetThemes: { name: string; theme: Partial<ThemeSettings> }[] = [
  { name: "كلاسيكي", theme: { primaryColor: "#4f46e5", secondaryColor: "#7c3aed", accentColor: "#f59e0b", backgroundColor: "#f8fafc", surfaceColor: "#ffffff", textColor: "#1e293b" } },
  { name: "داكن", theme: { primaryColor: "#818cf8", secondaryColor: "#a78bfa", accentColor: "#fbbf24", backgroundColor: "#0f172a", surfaceColor: "#1e293b", textColor: "#e2e8f0", darkMode: true } },
  { name: "وردي", theme: { primaryColor: "#ec4899", secondaryColor: "#f472b6", accentColor: "#fbbf24", backgroundColor: "#fdf2f8", surfaceColor: "#ffffff", textColor: "#1e293b" } },
  { name: "أخضر طبيعي", theme: { primaryColor: "#059669", secondaryColor: "#10b981", accentColor: "#f59e0b", backgroundColor: "#ecfdf5", surfaceColor: "#ffffff", textColor: "#1e293b" } },
  { name: "محيط", theme: { primaryColor: "#0891b2", secondaryColor: "#06b6d4", accentColor: "#f97316", backgroundColor: "#ecfeff", surfaceColor: "#ffffff", textColor: "#1e293b" } },
  { name: "مشمس", theme: { primaryColor: "#ea580c", secondaryColor: "#f97316", accentColor: "#eab308", backgroundColor: "#fffbeb", surfaceColor: "#ffffff", textColor: "#1c1917" } },
  { name: "بنفسجي", theme: { primaryColor: "#7c3aed", secondaryColor: "#a855f7", accentColor: "#f43f5e", backgroundColor: "#faf5ff", surfaceColor: "#ffffff", textColor: "#1e293b" } },
  { name: "نيلي", theme: { primaryColor: "#2563eb", secondaryColor: "#3b82f6", accentColor: "#10b981", backgroundColor: "#eff6ff", surfaceColor: "#ffffff", textColor: "#1e293b" } },
  { name: "نار", theme: { primaryColor: "#dc2626", secondaryColor: "#ef4444", accentColor: "#f59e0b", backgroundColor: "#fef2f2", surfaceColor: "#ffffff", textColor: "#1e293b" } },
];

const fontOptions = [
  { value: "system", label: "النظام الافتراضي" },
  { value: "Arial", label: "Arial" },
  { value: "Cairo", label: "Cairo" },
  { value: "Tajawal", label: "Tajawal" },
  { value: "IBM Plex Sans Arabic", label: "IBM Plex Arabic" },
  { value: "Noto", label: "Noto Kufi Arabic" },
  { value: "Almarai", label: "Almarai" },
  { value: "Changa", label: "Changa" },
  { value: "Harmattan", label: "Aref Harmattan" },
  { value: "ElMessiri", label: "El Messiri" },
  { value: "Lalezar", label: "Lalezar" },
  { value: "Mada", label: "Mada" },
  { value: "Amiri", label: "Amiri" },
  { value: "Reem", label: "Reem Kufi" },
  { value: "Rubik", label: "Rubik" },
];

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

  const [activeTab, setActiveTab] = useState<"family" | "theme">("family");
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [iconPickerFor, setIconPickerFor] = useState<"new" | string | null>(null);
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

  const handleSaveTheme = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: "family" as const, label: "أفراد العائلة", icon: Users },
    { id: "theme" as const, label: "التخصيص والثيم", icon: Palette },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: "var(--primary)" }}>
          الإعدادات ⚙️
        </h1>
        <p className="mt-1" style={{ color: "var(--foreground)", opacity: 0.6 }}>تخصيص العائلة والمظهر</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-white shadow-lg"
                  : "text-zinc-600 hover:bg-zinc-50 border border-zinc-200"
              }`}
              style={
                activeTab === tab.id
                  ? { backgroundColor: "var(--primary)" }
                  : { backgroundColor: "var(--surface)" }
              }
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "family" && (
        <FamilyTab
          members={state.familyMembers}
          showAdd={showAddMember}
          setShowAdd={setShowAddMember}
          editingMember={editingMember}
          setEditingMember={setEditingMember}
          expandedMember={expandedMember}
          setExpandedMember={setExpandedMember}
          memberForm={memberForm}
          setMemberForm={setMemberForm}
          iconPickerFor={iconPickerFor}
          setIconPickerFor={setIconPickerFor}
          onAddMember={handleAddMember}
          onUpdateMember={updateFamilyMember}
          onRemoveMember={removeFamilyMember}
          onExport={handleExportData}
          onImport={handleImportData}
          onReset={resetAllData}
        />
      )}

      {activeTab === "theme" && (
        <ThemeTab
          theme={state.theme}
          onUpdateTheme={updateTheme}
          onResetTheme={resetTheme}
          onSave={handleSaveTheme}
          saved={saved}
        />
      )}

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
  );
}

const STORAGE_KEY = "familyfollowup-data";

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

function FamilyTab({
  members,
  showAdd,
  setShowAdd,
  editingMember,
  setEditingMember,
  expandedMember,
  setExpandedMember,
  memberForm,
  setMemberForm,
  iconPickerFor,
  setIconPickerFor,
  onAddMember,
  onUpdateMember,
  onRemoveMember,
  onExport,
  onImport,
  onReset,
}: {
  members: FamilyMember[];
  showAdd: boolean;
  setShowAdd: (v: boolean) => void;
  editingMember: string | null;
  setEditingMember: (id: string | null) => void;
  expandedMember: string | null;
  setExpandedMember: (id: string | null) => void;
  memberForm: {
    name: string;
    role: "parent" | "child";
    avatar: string;
    age: string;
    phone: string;
    email: string;
    notes: string;
    color: string;
    photo: string;
  };
  setMemberForm: (f: typeof memberForm) => void;
  iconPickerFor: string | null;
  setIconPickerFor: (id: string | null) => void;
  onAddMember: () => void;
  onUpdateMember: (id: string, updates: Partial<FamilyMember>) => void;
  onRemoveMember: (id: string) => void;
  onExport: () => void;
  onImport: () => void;
  onReset: () => void;
}) {
  const photoRef = useRef<HTMLInputElement>(null);
  const newPhotoRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (memberId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (memberId === "new") {
        setMemberForm({ ...memberForm, photo: result });
      } else {
        onUpdateMember(memberId, { photo: result });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>أفراد العائلة</h2>
        <div className="flex gap-2">
          <button onClick={onExport} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors" style={{ backgroundColor: "var(--primary)", color: "white", opacity: 0.9 }}>
            <Download className="w-4 h-4" /> تصدير
          </button>
          <button onClick={onImport} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors" style={{ backgroundColor: "var(--secondary)", color: "white", opacity: 0.9 }}>
            <Upload className="w-4 h-4" /> استيراد
          </button>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-colors" style={{ backgroundColor: "var(--primary)" }}>
            <UserPlus className="w-4 h-4" /> إضافة فرد
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="rounded-2xl border border-zinc-200 p-6 mb-6 shadow-sm" style={{ backgroundColor: "var(--surface)" }}>
          <h3 className="font-bold mb-4" style={{ color: "var(--foreground)" }}>إضافة فرد جديد</h3>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative group">
              <input type="file" ref={newPhotoRef} accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload("new", f); }} />
              <button onClick={() => newPhotoRef.current?.click()}
                className="w-20 h-20 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors"
                style={{ borderColor: memberForm.photo ? memberForm.color : "#d4d4d8" }}>
                {memberForm.photo ? (
                  <img src={memberForm.photo} alt="صورة" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-6 h-6" style={{ color: "var(--foreground)", opacity: 0.4 }} />
                )}
              </button>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)", opacity: 0.7 }}>الأيقونة والصورة</label>
              <div className="flex flex-wrap gap-2 items-center">
                <button onClick={() => setIconPickerFor("new")}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-dashed text-sm transition-all hover:opacity-80"
                  style={{ borderColor: "var(--primary)", color: "var(--primary)" }}>
                  <Grid className="w-4 h-4" /> اختر أيقونة
                </button>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${memberForm.color}20` }}>
                  <IconDisplay iconId={memberForm.avatar} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)", opacity: 0.7 }}>الاسم *</label>
              <input type="text" value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} placeholder="اسم الفرد"
                className="w-full px-3 py-2.5 border border-zinc-300 rounded-xl text-right focus:ring-2 outline-none transition-all" style={{ ["--tw-ring-color" as string]: "var(--primary)" }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)", opacity: 0.7 }}>الصفة</label>
              <select value={memberForm.role} onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value as "parent" | "child" })}
                className="w-full px-3 py-2.5 border border-zinc-300 rounded-xl text-right focus:ring-2 outline-none transition-all">
                <option value="parent">والد/ة</option>
                <option value="child">طفل</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)", opacity: 0.7 }}>العمر</label>
              <input type="number" value={memberForm.age} onChange={(e) => setMemberForm({ ...memberForm, age: e.target.value })} placeholder="العمر" min="1" max="100"
                className="w-full px-3 py-2.5 border border-zinc-300 rounded-xl text-right focus:ring-2 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)", opacity: 0.7 }}>اللون المميز</label>
              <div className="flex flex-wrap gap-1.5">
                {memberColors.map((c) => (
                  <button key={c} onClick={() => setMemberForm({ ...memberForm, color: c })}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${memberForm.color === c ? "border-zinc-900 scale-110" : "border-transparent hover:scale-105"}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-1" style={{ color: "var(--foreground)", opacity: 0.7 }}>
                <Phone className="w-3.5 h-3.5" /> رقم الهاتف
              </label>
              <input type="tel" value={memberForm.phone} onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })} placeholder="05XXXXXXXX"
                className="w-full px-3 py-2.5 border border-zinc-300 rounded-xl text-right focus:ring-2 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-1" style={{ color: "var(--foreground)", opacity: 0.7 }}>
                <Mail className="w-3.5 h-3.5" /> البريد الإلكتروني
              </label>
              <input type="email" value={memberForm.email} onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })} placeholder="email@example.com"
                className="w-full px-3 py-2.5 border border-zinc-300 rounded-xl text-right focus:ring-2 outline-none transition-all" />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 flex items-center gap-1" style={{ color: "var(--foreground)", opacity: 0.7 }}>
              <FileText className="w-3.5 h-3.5" /> ملاحظات
            </label>
            <textarea value={memberForm.notes} onChange={(e) => setMemberForm({ ...memberForm, notes: e.target.value })} placeholder="ملاحظات إضافية..." rows={2}
              className="w-full px-3 py-2.5 border border-zinc-300 rounded-xl text-right focus:ring-2 outline-none transition-all resize-none" />
          </div>

          <div className="flex gap-2">
            <button onClick={onAddMember} className="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-colors" style={{ backgroundColor: "var(--primary)" }}>
              <Check className="w-4 h-4" /> حفظ
            </button>
            <button onClick={() => setShowAdd(false)} className="flex items-center gap-2 px-4 py-2.5 bg-zinc-100 text-zinc-700 rounded-xl text-sm font-medium hover:bg-zinc-200 transition-colors">
              <X className="w-4 h-4" /> إلغاء
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {members.map((member) => (
          <div key={member.id} className="rounded-2xl border border-zinc-200 overflow-hidden transition-all shadow-sm hover:shadow-md" style={{ backgroundColor: "var(--surface)" }}>
            <div className="flex items-center gap-4 p-4">
              <div className="relative group flex-shrink-0">
                <input type="file" accept="image/*" className="hidden" id={`photo-${member.id}`}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(member.id, f); }} />
                <label htmlFor={`photo-${member.id}`}
                  className="w-14 h-14 rounded-xl overflow-hidden border-2 flex items-center justify-center text-2xl transition-all hover:opacity-80 cursor-pointer"
                  style={{ borderColor: member.color || "#e4e4e7" }}>
                  {member.photo ? (
                    <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <IconDisplay iconId={member.avatar} size="text-xl" />
                  )}
                </label>
                <label htmlFor={`photo-${member.id}`}
                  className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                  <Camera className="w-4 h-4 text-white" />
                </label>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold" style={{ color: "var(--foreground)" }}>{member.name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: member.color || "var(--primary)" }}>
                    {member.role === "parent" ? "والد/ة" : "طفل"}
                  </span>
                  {member.age && <span className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>{member.age} سنة</span>}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Trophy className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
                  <span className="text-xs font-medium" style={{ color: "var(--accent)" }}>{member.points} نقطة</span>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => setExpandedMember(expandedMember === member.id ? null : member.id)} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 rounded-lg transition-colors">
                  {expandedMember === member.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button onClick={() => setIconPickerFor(member.id)} className="p-2 text-zinc-400 hover:text-[var(--primary)] hover:bg-zinc-50 rounded-lg transition-colors" title="تغيير الأيقونة">
                  <Grid className="w-4 h-4" />
                </button>
                <button onClick={() => onRemoveMember(member.id)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {expandedMember === member.id && (
              <div className="px-4 pb-4 pt-0 border-t border-zinc-100">
                <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                  {member.phone && <div className="flex items-center gap-2" style={{ color: "var(--foreground)", opacity: 0.7 }}><Phone className="w-3.5 h-3.5" /><span>{member.phone}</span></div>}
                  {member.email && <div className="flex items-center gap-2" style={{ color: "var(--foreground)", opacity: 0.7 }}><Mail className="w-3.5 h-3.5" /><span>{member.email}</span></div>}
                </div>
                {member.notes && (
                  <div className="mt-2 p-2 rounded-lg text-sm" style={{ backgroundColor: "var(--background)" }}>
                    <FileText className="w-3.5 h-3.5 inline ml-1" />{member.notes}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {members.length === 0 && (
          <div className="text-center py-16 rounded-2xl border border-zinc-200" style={{ backgroundColor: "var(--surface)" }}>
            <span className="text-6xl">👨‍👩‍👧‍👦</span>
            <h3 className="text-lg font-bold mt-4" style={{ color: "var(--foreground)" }}>لم تضف أي فرد بعد</h3>
            <p className="mt-1" style={{ color: "var(--foreground)", opacity: 0.5 }}>أضف أفراد عائلتك لتبدأ</p>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-200">
        <button onClick={() => { if (confirm("هل أنت متأكد من حذف جميع البيانات؟")) onReset(); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors">
          <Trash2 className="w-4 h-4" /> حذف جميع البيانات
        </button>
      </div>
    </div>
  );
}

function ThemeTab({
  theme,
  onUpdateTheme,
  onResetTheme,
  onSave,
  saved,
}: {
  theme: ThemeSettings;
  onUpdateTheme: (updates: Partial<ThemeSettings>) => void;
  onResetTheme: () => void;
  onSave: () => void;
  saved: boolean;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
          <Sparkles className="w-5 h-5" style={{ color: "var(--primary)" }} />
          ثيمات جاهزة
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {presetThemes.map((preset) => (
            <button key={preset.name} onClick={() => onUpdateTheme(preset.theme)}
              className="p-4 rounded-2xl border-2 border-zinc-200 hover:border-zinc-300 transition-all text-right group hover:scale-105"
              style={{ backgroundColor: preset.theme.backgroundColor }}>
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-5 h-5 rounded-full" style={{ backgroundColor: preset.theme.primaryColor }} />
                <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: preset.theme.secondaryColor }} />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.theme.accentColor }} />
              </div>
              <p className="text-xs font-bold" style={{ color: preset.theme.textColor }}>{preset.name}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 p-6" style={{ backgroundColor: "var(--surface)" }}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
          <Palette className="w-5 h-5" style={{ color: "var(--primary)" }} />
          الألوان
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "اللون الأساسي", value: theme.primaryColor, key: "primaryColor" },
            { label: "اللون الثانوي", value: theme.secondaryColor, key: "secondaryColor" },
            { label: "لون التمييز", value: theme.accentColor, key: "accentColor" },
            { label: "لون الخلفية", value: theme.backgroundColor, key: "backgroundColor" },
            { label: "لون الأسطح", value: theme.surfaceColor, key: "surfaceColor" },
            { label: "لون النص", value: theme.textColor, key: "textColor" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: "var(--background)" }}>
              <label className="text-sm font-medium" style={{ color: "var(--foreground)", opacity: 0.8 }}>{item.label}</label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono" style={{ color: "var(--foreground)", opacity: 0.5 }}>{item.value}</span>
                <input type="color" value={item.value} onChange={(e) => onUpdateTheme({ [item.key]: e.target.value })} className="w-10 h-10 rounded-lg cursor-pointer" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 p-6" style={{ backgroundColor: "var(--surface)" }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: "var(--foreground)" }}>إعدادات إضافية</h2>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)", opacity: 0.7 }}>اسم العائلة</label>
            <input type="text" value={theme.familyName} onChange={(e) => onUpdateTheme({ familyName: e.target.value })} placeholder="عائلتي"
              className="w-full max-w-sm px-3 py-2.5 border border-zinc-300 rounded-xl text-right focus:ring-2 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)", opacity: 0.7 }}>الخط</label>
            <div className="flex flex-wrap gap-2">
              {fontOptions.map((font) => (
                <button key={font.value} onClick={() => onUpdateTheme({ fontFamily: font.value })}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                    theme.fontFamily === font.value ? "text-white" : "text-zinc-600 border-zinc-200 hover:border-zinc-300"
                  }`}
                  style={
                    theme.fontFamily === font.value
                      ? { backgroundColor: "var(--primary)", borderColor: "var(--primary)" }
                      : { backgroundColor: "var(--background)" }
                  }>
                  {font.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)", opacity: 0.7 }}>استدارة الزوايا</label>
            <div className="flex gap-2">
              {(["none", "small", "medium", "large"] as const).map((r) => (
                <button key={r} onClick={() => onUpdateTheme({ borderRadius: r })}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                    theme.borderRadius === r ? "text-white" : "text-zinc-600 border-zinc-200 hover:border-zinc-300"
                  }`}
                  style={
                    theme.borderRadius === r
                      ? { backgroundColor: "var(--primary)", borderColor: "var(--primary)" }
                      : { backgroundColor: "var(--background)" }
                  }>
                  {{ none: "مستقيم", small: "قليل", medium: "متوسط", large: "كثير" }[r]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: "var(--background)" }}>
            <div>
              <p className="font-medium" style={{ color: "var(--foreground)" }}>الوضع الداكن</p>
              <p className="text-sm" style={{ color: "var(--foreground)", opacity: 0.5 }}>تفعيل المظهر الداكن</p>
            </div>
            <button onClick={() => onUpdateTheme({ darkMode: !theme.darkMode })}
              className={`w-12 h-6 rounded-full transition-colors relative ${theme.darkMode ? "" : "bg-zinc-300"}`}
              style={theme.darkMode ? { backgroundColor: "var(--primary)" } : undefined}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${theme.darkMode ? "left-6" : "left-0.5"}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 p-6" style={{ backgroundColor: "var(--surface)" }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: "var(--foreground)" }}>معاينة</h2>
        <div className="rounded-xl p-6 border border-zinc-200 space-y-3" style={{ backgroundColor: theme.backgroundColor }}>
          <div className="p-4 rounded-xl" style={{ backgroundColor: theme.surfaceColor }}>
            <h3 className="font-bold mb-1" style={{ color: theme.textColor }}>بطاقة تجريبية</h3>
            <p className="text-sm" style={{ color: theme.textColor, opacity: 0.7 }}>هذا نموذج لكيفية ظهور العناصر</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button className="px-4 py-2 text-white rounded-lg text-sm font-medium" style={{ backgroundColor: theme.primaryColor }}>زر أساسي</button>
            <button className="px-4 py-2 text-white rounded-lg text-sm font-medium" style={{ backgroundColor: theme.secondaryColor }}>زر ثانوي</button>
            <button className="px-4 py-2 text-white rounded-lg text-sm font-medium" style={{ backgroundColor: theme.accentColor }}>زر تمييز</button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sticky bottom-4">
        <button onClick={onSave}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl text-base font-bold shadow-lg transition-all hover:scale-[1.02]"
          style={{ backgroundColor: "var(--primary)" }}>
          {saved ? (
            <><Check className="w-5 h-5" /> تم الحفظ!</>
          ) : (
            <><Save className="w-5 h-5" /> حفظ الثيم</>
          )}
        </button>
        <button onClick={onResetTheme}
          className="flex items-center gap-2 px-4 py-3 bg-zinc-100 text-zinc-700 rounded-xl text-sm font-medium hover:bg-zinc-200 transition-colors">
          <RotateCcw className="w-4 h-4" /> إعادة تعيين
        </button>
      </div>
    </div>
  );
}
