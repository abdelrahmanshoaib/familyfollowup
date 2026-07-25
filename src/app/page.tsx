"use client";

import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Trophy, CheckCircle, Users, Star, Gift, ArrowUpLeft } from "lucide-react";

export default function Dashboard() {
  const { state, isTaskCompletedOnDate, getMemberTasksForDate } = useStore();
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const totalTasks = state.tasks.filter((t) => t.active).length;
  const totalPts = state.familyMembers.reduce((s, m) => s + m.points, 0);

  return (
    <div className="space-y-5 anim">
      {/* Greeting */}
      <div>
        <h1 className="title">مرحباً 👋</h1>
        <p className="subtitle mt-0.5">تتبع مهام أسرتك اليومية</p>
      </div>

      {/* Stats row */}
      <div className="stat-grid">
        {[
          { icon: Users, n: state.familyMembers.length, l: "أعضاء", color: "var(--accent)", bg: "var(--accent-dim)" },
          { icon: CheckCircle, n: totalTasks, l: "مهام", color: "var(--green)", bg: "var(--green-dim)" },
          { icon: Trophy, n: totalPts.toLocaleString("ar"), l: "نقطة", color: "var(--orange)", bg: "var(--orange-dim)" },
          { icon: Gift, n: state.rewards.length, l: "مكافأة", color: "var(--pink)", bg: "var(--pink-dim)" },
        ].map((s, i) => {
          const I = s.icon;
          return (
            <div key={s.l} className={`stat-item anim${i + 1}`}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2.5" style={{ background: s.bg }}>
                <I size={17} style={{ color: s.color }} />
              </div>
              <div className="text-xl font-extrabold" style={{ color: s.color }}>{s.n}</div>
              <div className="label mt-1">{s.l}</div>
            </div>
          );
        })}
      </div>

      {/* Members progress */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-extrabold">تقدم اليوم</h2>
          <button onClick={() => router.push("/tasks")} className="flex items-center gap-1 text-xs font-semibold bg-transparent border-none cursor-pointer" style={{ color: "var(--accent)" }}>
            عرض الكل <ArrowUpLeft size={13} />
          </button>
        </div>

        {state.familyMembers.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "var(--accent-dim)" }}>
              <Users size={28} style={{ color: "var(--accent)" }} />
            </div>
            <p className="text-sm font-semibold mb-1">لا يوجد أعضاء بعد</p>
            <p className="text-xs mb-4" style={{ color: "var(--text2)" }}>أضف أعضاء أسرتك للبدء</p>
            <button onClick={() => router.push("/family")} className="btn btn-primary btn-sm">إضافة عضو</button>
          </div>
        ) : (
          <div className="space-y-4">
            {state.familyMembers.map((m, i) => {
              const mt = getMemberTasksForDate(m.id, today);
              const done = mt.filter((t) => isTaskCompletedOnDate(t.id, m.id, today)).length;
              const total = mt.length || 1;
              const pct = Math.round((done / total) * 100);

              return (
                <div key={m.id} className={`anim${Math.min(i + 1, 5)}`}>
                  <div className="flex items-center gap-3">
                    <div className="avatar w-11 h-11 text-sm" style={{ background: m.color || "var(--accent)" }}>
                      {m.icon || m.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-bold truncate">{m.name}</span>
                        <div className="flex items-center gap-2.5 shrink-0">
                          <div className="flex items-center gap-1">
                            <Star size={11} fill="var(--orange)" style={{ color: "var(--orange)" }} />
                            <span className="text-xs font-extrabold" style={{ color: "var(--orange)" }}>{m.points.toLocaleString("ar")}</span>
                          </div>
                          <span className="text-[11px] font-semibold" style={{ color: "var(--text2)" }}>{done}/{mt.length}</span>
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
        <button onClick={() => router.push("/tasks")} className="card text-center py-6 cursor-pointer" style={{ border: "1px solid var(--border)" }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2.5" style={{ background: "var(--green-dim)" }}>
            <CheckCircle size={22} style={{ color: "var(--green)" }} />
          </div>
          <span className="text-sm font-bold">المهام</span>
        </button>
        <button onClick={() => router.push("/rewards")} className="card text-center py-6 cursor-pointer" style={{ border: "1px solid var(--border)" }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2.5" style={{ background: "var(--pink-dim)" }}>
            <Gift size={22} style={{ color: "var(--pink)" }} />
          </div>
          <span className="text-sm font-bold">المكافآت</span>
        </button>
      </div>
    </div>
  );
}
