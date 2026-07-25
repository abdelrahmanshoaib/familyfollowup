"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type {
  AppState,
  FamilyMember,
  Task,
  Reward,
  CompletedTask,
  ThemeSettings,
} from "./types";

const STORAGE_KEY = "familyfollowup-data";

const defaultTheme: ThemeSettings = {
  primaryColor: "#4f46e5",
  secondaryColor: "#7c3aed",
  accentColor: "#f59e0b",
  backgroundColor: "#f8fafc",
  surfaceColor: "#ffffff",
  textColor: "#1e293b",
  fontFamily: "system",
  borderRadius: "medium",
  darkMode: false,
  familyName: "عائلتي",
};

const defaultState: AppState = {
  familyMembers: [],
  tasks: [],
  rewards: [],
  completedTasks: [],
  theme: defaultTheme,
};

function loadState(): AppState {
  if (typeof window === "undefined") return defaultState;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...defaultState,
        ...parsed,
        theme: { ...defaultTheme, ...parsed.theme },
      };
    }
  } catch {}
  return defaultState;
}

function saveState(state: AppState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

interface StoreContextValue {
  state: AppState;
  addFamilyMember: (member: Omit<FamilyMember, "id" | "points">) => void;
  removeFamilyMember: (id: string) => void;
  updateFamilyMember: (id: string, updates: Partial<FamilyMember>) => void;
  addTask: (task: Omit<Task, "id" | "createdAt" | "completedBy" | "active">) => void;
  removeTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  completeTask: (taskId: string, memberId: string) => void;
  undoCompleteTask: (taskId: string, memberId: string) => void;
  addReward: (reward: Omit<Reward, "id">) => void;
  removeReward: (id: string) => void;
  redeemReward: (rewardId: string, memberId: string) => void;
  getMemberTasksForDate: (memberId: string, date: string) => Task[];
  isTaskCompletedOnDate: (taskId: string, memberId: string, date: string) => boolean;
  updateTheme: (updates: Partial<ThemeSettings>) => void;
  resetTheme: () => void;
  resetAllData: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    if (typeof window === "undefined") return defaultState;
    return loadState();
  });

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    applyTheme(state.theme);
  }, [state.theme]);

  const addFamilyMember = useCallback(
    (member: Omit<FamilyMember, "id" | "points">) => {
      setState((prev) => ({
        ...prev,
        familyMembers: [
          ...prev.familyMembers,
          { ...member, id: Date.now().toString(), points: 0 },
        ],
      }));
    },
    []
  );

  const removeFamilyMember = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      familyMembers: prev.familyMembers.filter((m) => m.id !== id),
    }));
  }, []);

  const updateFamilyMember = useCallback(
    (id: string, updates: Partial<FamilyMember>) => {
      setState((prev) => ({
        ...prev,
        familyMembers: prev.familyMembers.map((m) =>
          m.id === id ? { ...m, ...updates } : m
        ),
      }));
    },
    []
  );

  const addTask = useCallback(
    (task: Omit<Task, "id" | "createdAt" | "completedBy" | "active">) => {
      setState((prev) => ({
        ...prev,
        tasks: [
          ...prev.tasks,
          {
            ...task,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            completedBy: {},
            active: true,
          },
        ],
      }));
    },
    []
  );

  const removeTask = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  }, []);

  const completeTask = useCallback((taskId: string, memberId: string) => {
    const today = getToday();
    setState((prev) => {
      const task = prev.tasks.find((t) => t.id === taskId);
      if (!task) return prev;

      const alreadyDone = prev.completedTasks.some(
        (ct) => ct.taskId === taskId && ct.memberId === memberId && ct.date === today
      );
      if (alreadyDone) return prev;

      const newCompleted: CompletedTask = {
        memberId,
        taskId,
        date: today,
        pointsEarned: task.points,
      };

      return {
        ...prev,
        completedTasks: [...prev.completedTasks, newCompleted],
        familyMembers: prev.familyMembers.map((m) =>
          m.id === memberId ? { ...m, points: m.points + task.points } : m
        ),
      };
    });
  }, []);

  const undoCompleteTask = useCallback((taskId: string, memberId: string) => {
    const today = getToday();
    setState((prev) => {
      const completed = prev.completedTasks.find(
        (ct) => ct.taskId === taskId && ct.memberId === memberId && ct.date === today
      );
      if (!completed) return prev;

      return {
        ...prev,
        completedTasks: prev.completedTasks.filter(
          (ct) => !(ct.taskId === taskId && ct.memberId === memberId && ct.date === today)
        ),
        familyMembers: prev.familyMembers.map((m) =>
          m.id === memberId
            ? { ...m, points: m.points - completed.pointsEarned }
            : m
        ),
      };
    });
  }, []);

  const addReward = useCallback((reward: Omit<Reward, "id">) => {
    setState((prev) => ({
      ...prev,
      rewards: [
        ...prev.rewards,
        { ...reward, id: Date.now().toString() },
      ],
    }));
  }, []);

  const removeReward = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      rewards: prev.rewards.filter((r) => r.id !== id),
    }));
  }, []);

  const redeemReward = useCallback(
    (rewardId: string, memberId: string) => {
      setState((prev) => {
        const reward = prev.rewards.find((r) => r.id === rewardId);
        const member = prev.familyMembers.find((m) => m.id === memberId);
        if (!reward || !member || member.points < reward.pointsCost) return prev;

        return {
          ...prev,
          familyMembers: prev.familyMembers.map((m) =>
            m.id === memberId
              ? { ...m, points: m.points - reward.pointsCost }
              : m
          ),
        };
      });
    },
    []
  );

  const getMemberTasksForDate = useCallback(
    (memberId: string, date: string): Task[] => {
      const dayOfWeek = new Date(date).getDay();
      return state.tasks.filter((task) => {
        if (!task.active) return false;
        if (!task.assignedTo.includes(memberId)) return false;
        if (task.frequency === "once") {
          return task.createdAt.split("T")[0] === date;
        }
        if (task.frequency === "weekly") {
          const createdDay = new Date(task.createdAt).getDay();
          return dayOfWeek === createdDay;
        }
        return true;
      });
    },
    [state.tasks]
  );

  const isTaskCompletedOnDate = useCallback(
    (taskId: string, memberId: string, date: string): boolean => {
      return state.completedTasks.some(
        (ct) =>
          ct.taskId === taskId && ct.memberId === memberId && ct.date === date
      );
    },
    [state.completedTasks]
  );

  const updateTheme = useCallback((updates: Partial<ThemeSettings>) => {
    setState((prev) => ({
      ...prev,
      theme: { ...prev.theme, ...updates },
    }));
  }, []);

  const resetTheme = useCallback(() => {
    setState((prev) => ({
      ...prev,
      theme: defaultTheme,
    }));
  }, []);

  const resetAllData = useCallback(() => {
    setState(defaultState);
  }, []);

  return (
    <StoreContext.Provider
      value={{
        state,
        addFamilyMember,
        removeFamilyMember,
        updateFamilyMember,
        addTask,
        removeTask,
        updateTask,
        completeTask,
        undoCompleteTask,
        addReward,
        removeReward,
        redeemReward,
        getMemberTasksForDate,
        isTaskCompletedOnDate,
        updateTheme,
        resetTheme,
        resetAllData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

const googleFontMap: Record<string, string> = {
  Tajawal: "Tajawal:wght@300;400;500;700;800;900",
  "IBM Plex Sans Arabic": "IBM+Plex+Sans+Arabic:wght@300;400;500;600;700",
  Noto: "Noto+Kufi+Arabic:wght@300;400;500;600;700;800;900",
  Almarai: "Almarai:wght@300;400;700;800",
  Changa: "Changa:wght@300;400;500;600;700;800",
  Harmattan: "Aref+Harmattan:wght@400;700",
  ElMessiri: "El+Messiri:wght@400;500;600;700",
  Lalezar: "Lalezar:wght@400",
  Mada: "Mada:wght@300;400;500;600;700;800;900",
  Amiri: "Amiri:wght@400;700",
  Reem: "Reem+Kufi:wght@400;500;600;700",
  Rubik: "Rubik:wght@300;400;500;600;700;800;900",
  Cairo: "Cairo:wght@300;400;500;600;700;800;900",
};

function loadGoogleFont(fontFamily: string) {
  if (typeof window === "undefined" || fontFamily === "system" || fontFamily === "Arial")
    return;

  const fontQuery = googleFontMap[fontFamily];
  if (!fontQuery) return;

  const existing = document.getElementById(`google-font-${fontFamily}`);
  if (existing) return;

  const link = document.createElement("link");
  link.id = `google-font-${fontFamily}`;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${fontQuery}&display=swap`;
  document.head.appendChild(link);
}

function applyTheme(theme: ThemeSettings) {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--primary", theme.primaryColor);
  root.style.setProperty("--secondary", theme.secondaryColor);
  root.style.setProperty("--accent", theme.accentColor);
  root.style.setProperty("--background", theme.backgroundColor);
  root.style.setProperty("--surface", theme.surfaceColor);
  root.style.setProperty("--foreground", theme.textColor);

  const radiusMap = { none: "0px", small: "4px", medium: "8px", large: "16px" };
  root.style.setProperty("--radius", radiusMap[theme.borderRadius]);

  const fontFamilyMap: Record<string, string> = {
    system: "system-ui, -apple-system, sans-serif",
    Arial: "Arial, Helvetica, sans-serif",
    Cairo: "'Cairo', sans-serif",
    Tajawal: "'Tajawal', sans-serif",
    "IBM Plex Sans Arabic": "'IBM Plex Sans Arabic', sans-serif",
    Noto: "'Noto Kufi Arabic', sans-serif",
    Almarai: "'Almarai', sans-serif",
    Changa: "'Changa', sans-serif",
    Harmattan: "'Aref Harmattan', serif",
    ElMessiri: "'El Messiri', sans-serif",
    Lalezar: "'Lalezar', cursive",
    Mada: "'Mada', sans-serif",
    Amiri: "'Amiri', serif",
    Reem: "'Reem Kufi', sans-serif",
    Rubik: "'Rubik', sans-serif",
  };

  const fontStack = fontFamilyMap[theme.fontFamily] || fontFamilyMap.system;
  root.style.setProperty("--font-family", fontStack);
  document.body.style.fontFamily = fontStack;

  loadGoogleFont(theme.fontFamily);

  if (theme.darkMode) {
    root.classList.add("dark");
    root.style.setProperty("--background", "#0f172a");
    root.style.setProperty("--surface", "#1e293b");
    root.style.setProperty("--foreground", "#e2e8f0");
  } else {
    root.classList.remove("dark");
  }
}
