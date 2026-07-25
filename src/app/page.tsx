"use client";

import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Trophy, CheckCircle, Users, ArrowLeft, Star, TrendingUp, Gift } from "lucide-react";

export default function Dashboard() {
  const { state, isTaskCompletedOnDate, getMemberTasksForDate } = useStore();
  const router = useRouter();

  const today = new Date().toISOString().split("T")[0];
  const totalTasks = state.tasks.filter((t) => t.active).length;
  const totalPoints = state.familyMembers.reduce((sum, m) => sum + m.points, 0);

  const stats = [
    { label: "الأعضاء", value: state.familyMembers.length, icon: Users, color: "#7c6cff" },
    { label: "المهام", value: totalTasks, icon: CheckCircle, color: "#00d4aa" },
    { label: "النقاط", value: totalPoints.toLocaleString("ar"), icon: Trophy, color: "#ffb347" },
    { label: "المكافآت", value: state.rewards.length, icon: Gift, color: "#ff6b9d" },
  ];

  return (
    <div className="space-y-5 animate-in">
      <h1 className="text-xl font-bold">مرحباً 👋</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`card animate-in-${i + 1}`}
            >
              <Icon size={20} style={{ color: stat.color }} className="mb-3" />
              <div className="text-2xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Members progress */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">تقدم اليوم</h2>
          <button
            onClick={() => router.push("/tasks")}
            className="flex items-center gap-1 text-sm bg-transparent border-none cursor-pointer"
            style={{ color: "var(--accent)" }}
          >
            الكل <ArrowLeft size={14} />
          </button>
        </div>

        {state.familyMembers.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">👨‍👩‍👧‍👦</p>
            <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
              أضف أعضاء أسرتك للبدء
            </p>
            <button onClick={() => router.push("/family")} className="btn btn-primary">
              إضافة عضو
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {state.familyMembers.map((member, i) => {
              const memberTasks = getMemberTasksForDate(member.id, today);
              const completed = memberTasks.filter((t) =>
                isTaskCompletedOnDate(t.id, member.id, today)
              ).length;
              const total = memberTasks.length || 1;
              const percent = Math.round((completed / total) * 100);

              return (
                <div key={member.id} className={`animate-in-${Math.min(i + 1, 5)}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="avatar w-10 h-10 text-sm"
                      style={{ background: member.color || "var(--accent)" }}
                    >
                      {member.icon || member.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{member.name}</span>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Star size={12} style={{ color: "#ffb347" }} fill="#ffb347" />
                            <span className="text-xs font-bold" style={{ color: "#ffb347" }}>
                              {member.points.toLocaleString("ar")}
                            </span>
                          </div>
                          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                            {completed}/{memberTasks.length}
                          </span>
                        </div>
                      </div>
                      <div className="progress mt-2">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${percent}%`,
                            background: member.color || "var(--accent)",
                          }}
                        />
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
        <button
          onClick={() => router.push("/tasks")}
          className="card card-interactive text-center py-5"
        >
          <CheckCircle size={28} style={{ color: "var(--success)" }} className="mx-auto mb-2" />
          <span className="font-semibold text-sm">المهام</span>
        </button>
        <button
          onClick={() => router.push("/rewards")}
          className="card card-interactive text-center py-5"
        >
          <Gift size={28} style={{ color: "var(--accent2)" }} className="mx-auto mb-2" />
          <span className="font-semibold text-sm">المكافآت</span>
        </button>
      </div>
    </div>
  );
}
