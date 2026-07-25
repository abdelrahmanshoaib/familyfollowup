"use client";

import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { state, isTaskCompletedOnDate, getMemberTasksForDate } = useStore();
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const todayDate = new Date();
  const dayName = todayDate.toLocaleDateString("ar-SA", { weekday: "long" });
  const dateStr = todayDate.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });

  const totalTasks = state.tasks.filter((t) => t.active).length;
  const completedToday = state.familyMembers.reduce((sum, m) => {
    const mt = getMemberTasksForDate(m.id, today);
    return sum + mt.filter((t) => isTaskCompletedOnDate(t.id, m.id, today)).length;
  }, 0);
  const totalPts = state.familyMembers.reduce((s, m) => s + m.points, 0);

  const weekDays = ["س", "ح", "ن", "ث", "ر", "خ", "ج"];
  const now = new Date();
  const weekData = weekDays.map((label, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    const ds = d.toISOString().split("T")[0];
    const count = state.familyMembers.reduce((sum, m) => {
      const mt = getMemberTasksForDate(m.id, ds);
      return sum + mt.filter((t) => isTaskCompletedOnDate(t.id, m.id, ds)).length;
    }, 0);
    return { label, count };
  });
  const maxWeek = Math.max(...weekData.map((d) => d.count), 1);

  const circumference = 2 * Math.PI * 28;

  return (
    <div className="space-y-6 anim">
      {/* 1. Welcome Section */}
      <div className="anim1">
        <h1
          className="font-headline-lg-mobile"
          style={{ color: "var(--primary)", fontWeight: 700, fontSize: 28, margin: 0 }}
        >
          السلام عليكم 👋
        </h1>
        <p className="font-body-md" style={{ color: "var(--on-surface-variant)", marginTop: 4 }}>
          {dayName} — {dateStr}
        </p>
      </div>

      {/* 2. Family Summary Card */}
      {state.familyMembers.length > 0 && (
        <div className="glass-card anim2" style={{ padding: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* عدد أفراد الأسرة */}
            <button
              onClick={() => router.push("/family")}
              className="anim1"
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                background: "transparent", border: "none", cursor: "pointer", padding: 12,
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 28, color: "var(--primary)", background: "color-mix(in srgb, var(--primary) 12%, transparent)", borderRadius: 12, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                group
              </span>
              <span className="font-headline-sm" style={{ color: "var(--primary)", fontSize: 22, fontWeight: 700 }}>
                {state.familyMembers.length}
              </span>
              <span className="font-body-sm" style={{ color: "var(--on-surface-variant)" }}>عدد أفراد الأسرة</span>
            </button>

            {/* المهام النشطة */}
            <button
              onClick={() => router.push("/tasks")}
              className="anim2"
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                background: "transparent", border: "none", cursor: "pointer", padding: 12,
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 28, color: "var(--secondary)", background: "color-mix(in srgb, var(--secondary) 12%, transparent)", borderRadius: 12, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                assignment
              </span>
              <span className="font-headline-sm" style={{ color: "var(--secondary)", fontSize: 22, fontWeight: 700 }}>
                {totalTasks}
              </span>
              <span className="font-body-sm" style={{ color: "var(--on-surface-variant)" }}>المهام النشطة</span>
            </button>

            {/* المهام المكتملة */}
            <div className="anim3" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: 12 }}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 28, color: "var(--tertiary)", background: "color-mix(in srgb, var(--tertiary) 12%, transparent)", borderRadius: 12, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                task_alt
              </span>
              <span className="font-headline-sm" style={{ color: "var(--tertiary)", fontSize: 22, fontWeight: 700 }}>
                {completedToday}
              </span>
              <span className="font-body-sm" style={{ color: "var(--on-surface-variant)" }}>المهام المكتملة</span>
            </div>

            {/* إجمالي النقاط */}
            <button
              onClick={() => router.push("/rewards")}
              className="anim4"
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                background: "transparent", border: "none", cursor: "pointer", padding: 12,
              }}
            >
              <span
                className="material-symbols-outlined filled-icon"
                style={{ fontSize: 28, color: "var(--primary)", background: "color-mix(in srgb, var(--primary) 12%, transparent)", borderRadius: 12, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                military_tech
              </span>
              <span className="font-headline-sm" style={{ color: "var(--primary)", fontSize: 22, fontWeight: 700 }}>
                {totalPts.toLocaleString("ar")}
              </span>
              <span className="font-body-sm" style={{ color: "var(--on-surface-variant)" }}>إجمالي النقاط</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Today Progress */}
      <div className="anim3">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h2 className="font-headline-sm" style={{ margin: 0, fontWeight: 700 }}>تقدم اليوم</h2>
          <button
            onClick={() => router.push("/tasks")}
            className="font-body-sm"
            style={{ color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}
          >
            عرض الكل
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>open_in_new</span>
          </button>
        </div>

        {state.familyMembers.length === 0 ? (
          <div className="glass-card" style={{ textAlign: "center", padding: 40 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--primary)", opacity: 0.5 }}>group</span>
            <p className="font-body-md" style={{ color: "var(--on-surface-variant)", marginTop: 8 }}>لا يوجد أعضاء بعد</p>
            <button
              onClick={() => router.push("/family")}
              className="chip"
              style={{ marginTop: 12, color: "var(--primary)", cursor: "pointer", border: "1px solid var(--primary)" }}
            >
              إضافة عضو
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
            {state.familyMembers.map((m, i) => {
              const mt = getMemberTasksForDate(m.id, today);
              const done = mt.filter((t) => isTaskCompletedOnDate(t.id, m.id, today)).length;
              const total = mt.length || 1;
              const pct = Math.round((done / total) * 100);
              const offset = circumference - (pct / 100) * circumference;

              return (
                <div
                  key={m.id}
                  className={`glass-card anim${Math.min(i + 1, 5)}`}
                  style={{
                    minWidth: 120, flex: "0 0 auto", display: "flex", flexDirection: "column",
                    alignItems: "center", padding: 16, gap: 8, cursor: "pointer",
                  }}
                  onClick={() => router.push("/tasks")}
                >
                  <div style={{ position: "relative", width: 48, height: 48 }}>
                    <svg width={48} height={48} style={{ transform: "rotate(-90deg)" }}>
                      <circle cx={24} cy={24} r={28} fill="none" stroke="color-mix(in srgb, var(--on-surface) 10%, transparent)" strokeWidth={4} />
                      <circle
                        cx={24} cy={24} r={28} fill="none"
                        stroke={m.color || "var(--primary)"}
                        strokeWidth={4}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div
                      style={{
                        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                        borderRadius: "50%", background: m.color || "var(--primary)", color: "#fff",
                        fontSize: 16, fontWeight: 700,
                      }}
                    >
                      {m.icon || m.name.charAt(0)}
                    </div>
                  </div>
                  <span className="font-body-md" style={{ fontWeight: 600, fontSize: 13 }}>{m.name}</span>
                  <span className="font-body-sm" style={{ color: "var(--on-surface-variant)", fontSize: 11 }}>{m.role || "عضو"}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                    <span className="material-symbols-outlined filled-icon" style={{ fontSize: 14, color: "var(--tertiary)" }}>bolt</span>
                    <span className="font-label-md" style={{ color: "var(--tertiary)", fontSize: 11, fontWeight: 700 }}>{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="anim4">
        <button
          onClick={() => router.push("/tasks")}
          className="glass-card"
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            padding: 20, border: "none", cursor: "pointer", background: "var(--primary-container)", color: "#fff",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 28 }}>add_task</span>
          <span className="font-body-md" style={{ fontWeight: 600 }}>إضافة مهمة</span>
        </button>
        <button
          onClick={() => router.push("/rewards")}
          className="glass-card"
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            padding: 20, border: "none", cursor: "pointer", background: "var(--tertiary-container)", color: "#fff",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 28 }}>card_giftcard</span>
          <span className="font-body-md" style={{ fontWeight: 600 }}>إضافة مكافأة</span>
        </button>
        <button
          onClick={() => router.push("/calendar")}
          className="glass-card"
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            padding: 20, border: "none", cursor: "pointer", background: "var(--secondary-container)", color: "#fff",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 28 }}>calendar_today</span>
          <span className="font-body-md" style={{ fontWeight: 600 }}>التقويم</span>
        </button>
        <button
          onClick={() => router.push("/family")}
          className="glass-card"
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            padding: 20, border: "none", cursor: "pointer", background: "var(--surface-container-high)", color: "var(--on-surface)",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 28 }}>family_history</span>
          <span className="font-body-md" style={{ fontWeight: 600 }}>إدارة الأسرة</span>
        </button>
      </div>

      {/* 5. Today Tasks */}
      <div className="anim5">
        <h2 className="font-headline-sm" style={{ marginBottom: 12, fontWeight: 700 }}>مهام اليوم</h2>
        {state.tasks.filter((t) => t.active).length === 0 ? (
          <div className="glass-card" style={{ textAlign: "center", padding: 32 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 40, color: "var(--on-surface-variant)", opacity: 0.4 }}>assignment</span>
            <p className="font-body-md" style={{ color: "var(--on-surface-variant)", marginTop: 8 }}>لا توجد مهام نشطة</p>
          </div>
        ) : (
          state.tasks
            .filter((t) => t.active)
            .map((task) => {
              const isCompleted = state.completedTasks.some(
                (ct) => ct.taskId === task.id && ct.date === today
              );
              const assignedMembers = state.familyMembers.filter(
                (m) => task.assignedTo.includes(m.id)
              );

              return (
                <div
                  key={task.id}
                  className="glass-card"
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: 14, marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                      border: `2px solid ${isCompleted ? "var(--primary)" : "var(--outline)"}`,
                      background: isCompleted ? "var(--primary)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                    }}
                  >
                    {isCompleted && (
                      <span className="material-symbols-outlined filled-icon" style={{ fontSize: 16, color: "#fff" }}>check</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="font-body-md" style={{ fontWeight: 600, fontSize: 14, textDecoration: isCompleted ? "line-through" : "none", opacity: isCompleted ? 0.6 : 1 }}>
                      {task.title}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                      <span
                        className="chip"
                        style={{ fontSize: 10, padding: "2px 8px", background: "color-mix(in srgb, var(--primary) 12%, transparent)", color: "var(--primary)" }}
                      >
                        {task.category}
                      </span>
                      <span className="font-body-sm" style={{ color: "var(--on-surface-variant)" }}>
                        {task.points} نقطة
                      </span>
                    </div>
                  </div>
                  {assignedMembers.length > 0 && (
                    <div style={{ display: "flex", marginLeft: 4 }}>
                      {assignedMembers.slice(0, 3).map((m) => (
                        <div
                          key={m.id}
                          style={{
                            width: 28, height: 28, borderRadius: "50%", background: m.color || "var(--primary)",
                            color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center",
                            justifyContent: "center", border: "2px solid var(--surface)", marginLeft: -6,
                          }}
                        >
                          {m.icon || m.name.charAt(0)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
        )}
      </div>

      {/* 6. Weekly Progress */}
      <div className="glass-card anim1" style={{ padding: 20 }}>
        <h2 className="font-headline-sm" style={{ marginBottom: 16, fontWeight: 700 }}>التقدم الأسبوعي</h2>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: 120, gap: 8 }}>
          {weekData.map((d, i) => {
            const h = maxWeek > 0 ? (d.count / maxWeek) * 100 : 0;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <span className="font-label-md" style={{ fontSize: 11, color: "var(--on-surface-variant)" }}>{d.count}</span>
                <div
                  style={{
                    width: "100%", maxWidth: 28, borderRadius: 8,
                    height: `${Math.max(h, 8)}%`,
                    background: i === weekData.length - 1 ? "var(--primary)" : "color-mix(in srgb, var(--primary) 30%, transparent)",
                    transition: "height 0.3s ease",
                  }}
                />
                <span className="font-label-md" style={{ fontSize: 12, color: "var(--on-surface-variant)" }}>{d.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. Recent Activities */}
      <div className="anim2">
        <h2 className="font-headline-sm" style={{ marginBottom: 12, fontWeight: 700 }}>الأنشطة الأخيرة</h2>
        {state.completedTasks.length === 0 ? (
          <div className="glass-card" style={{ textAlign: "center", padding: 24 }}>
            <p className="font-body-sm" style={{ color: "var(--on-surface-variant)" }}>لا توجد أنشطة بعد</p>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: 16 }}>
            {state.completedTasks
              .slice(-5)
              .reverse()
              .map((ct, i) => {
                const member = state.familyMembers.find((m) => m.id === ct.memberId);
                const task = state.tasks.find((t) => t.id === ct.taskId);
                if (!member || !task) return null;
                return (
                  <div
                    key={`${ct.taskId}-${ct.memberId}-${ct.date}-${i}`}
                    style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: i < 4 ? 14 : 0 }}
                  >
                    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div
                        style={{
                          width: 10, height: 10, borderRadius: "50%",
                          background: "var(--primary)", flexShrink: 0, marginTop: 4,
                        }}
                      />
                      {i < 4 && <div style={{ width: 2, height: 24, background: "var(--outline)", opacity: 0.3, marginTop: 4 }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p className="font-body-md" style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>
                        <strong>{member.name}</strong> أكملت <strong>{task.title}</strong>
                      </p>
                      <span className="font-body-sm" style={{ color: "var(--on-surface-variant)", fontSize: 11 }}>
                        {ct.pointsEarned} نقطة · {ct.date}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* 8. Motivation Card */}
      <div
        className="glass-card anim3"
        style={{
          background: "linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--secondary) 60%, var(--primary)))",
          color: "#fff",
          padding: 24,
          textAlign: "center",
        }}
      >
        <span className="material-symbols-outlined filled-icon" style={{ fontSize: 40, opacity: 0.8, marginBottom: 8, display: "block" }}>format_quote</span>
        <p className="font-headline-sm" style={{ fontWeight: 700, fontSize: 18, margin: 0, lineHeight: 1.6 }}>
          {state.tasks.filter((t) => t.active).length > 0
            ? "إنما الأعمال بالنيات، كل مهمة تكملها تقرّب أسرتك من السعادة"
            : "ابدأ بإضافة مهام لأسرتك وتابع تقدمهم يومياً"}
        </p>
        <button
          onClick={() => router.push("/tasks")}
          style={{
            marginTop: 16, padding: "10px 28px", borderRadius: 24,
            background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)",
            cursor: "pointer", fontWeight: 600, fontSize: 14, backdropFilter: "blur(8px)",
          }}
        >
         بدأ اليوم
        </button>
      </div>
    </div>
  );
}
