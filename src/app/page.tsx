"use client";

import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Trophy, CheckCircle, Users, ArrowLeft, Star, TrendingUp, Gift } from "lucide-react";

export default function Dashboard() {
  const { state, isTaskCompletedOnDate, getMemberTasksForDate } = useStore();
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const totalTasks = state.tasks.filter((t) => t.active).length;
  const totalPoints = state.familyMembers.reduce((s, m) => s + m.points, 0);

  const stats = [
    { label: "الأعضاء", value: state.familyMembers.length, icon: Users, color: "var(--accent)" },
    { label: "المهام", value: totalTasks, icon: CheckCircle, color: "var(--green)" },
    { label: "النقاط", value: totalPoints.toLocaleString("ar"), icon: Trophy, color: "var(--orange)" },
    { label: "المكافآت", value: state.rewards.length, icon: Gift, color: "var(--accent2)" },
  ];

  return (
    <div className="space-y-4 anim">
      <h1 className="text-lg font-bold">مرحباً 👋</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2.5">
        {stats.map((s, i) => {
          const I = s.icon;
          return (
            <div key={s.label} className={`glass-sm p-3 text-center anim-d${i + 1}`}>
              <I size={18} style={{ color: s.color }} className="mx-auto mb-2" />
              <div className="text-xl font-bold leading-tight" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[10px] mt-0.5" style={{ color: "var(--text2)" }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Members */}
      <div className="glass p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold">تقدم اليوم</h2>
          <button onClick={() => router.push("/tasks")} className="flex items-center gap-1 text-xs bg-transparent border-none cursor-pointer" style={{ color: "var(--accent)" }}>
            الكل <ArrowLeft size={12} />
          </button>
        </div>

        {state.familyMembers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">👨‍👩‍👧‍👦</p>
            <p className="text-xs mb-3" style={{ color: "var(--text2)" }}>أضف أعضاء أسرتك</p>
            <button onClick={() => router.push("/family")} className="btn btn-primary btn-sm text-xs">إضافة</button>
          </div>
        ) : (
          <div className="space-y-3">
            {state.familyMembers.map((m, i) => {
              const mt = getMemberTasksForDate(m.id, today);
              const done = mt.filter((t) => isTaskCompletedOnDate(t.id, m.id, today)).length;
              const total = mt.length || 1;
              const pct = Math.round((done / total) * 100);

              return (
                <div key={m.id} className={`anim-d${Math.min(i + 1, 5)}`}>
                  <div className="flex items-center gap-3">
                    <div className="avatar w-10 h-10 text-xs" style={{ background: m.color || "var(--accent)" }}>
                      {m.icon || m.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold truncate">{m.name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-0.5">
                            <Star size={10} fill="var(--orange)" style={{ color: "var(--orange)" }} />
                            <span className="text-[11px] font-bold" style={{ color: "var(--orange)" }}>{m.points.toLocaleString("ar")}</span>
                          </div>
                          <span className="text-[10px]" style={{ color: "var(--text2)" }}>{done}/{mt.length}</span>
                        </div>
                      </div>
                      <div className="progress">
                        <div className="progress-fill" style={{ width: `${pct}%`, background: m.color || "var(--accent)" }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => router.push("/tasks")} className="glass p-5 text-center" style={{ border: "none", cursor: "pointer", width: "100%" }}>
          <CheckCircle size={26} style={{ color: "var(--green)" }} className="mx-auto mb-2" />
          <span className="text-sm font-semibold">المهام</span>
        </button>
        <button onClick={() => router.push("/rewards")} className="glass p-5 text-center" style={{ border: "none", cursor: "pointer", width: "100%" }}>
          <Gift size={26} style={{ color: "var(--accent2)" }} className="mx-auto mb-2" />
          <span className="text-sm font-semibold">المكافآت</span>
        </button>
      </div>
    </div>
  );
}
