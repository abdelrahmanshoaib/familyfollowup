export interface FamilyMember {
  id: string;
  name: string;
  role: "parent" | "child";
  avatar: string;
  icon?: string;
  points: number;
  age?: number;
  phone?: string;
  email?: string;
  notes?: string;
  photo?: string;
  color?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string[];
  points: number;
  frequency: "daily" | "weekly" | "once";
  category: "routine" | "chore" | "homework" | "behavior" | "custom";
  completedBy: Record<string, string[]>;
  createdAt: string;
  active: boolean;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  icon: string;
  category: "fun" | "treat" | "privilege" | "gift";
}

export interface CompletedTask {
  memberId: string;
  taskId: string;
  date: string;
  pointsEarned: number;
}

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: "none" | "small" | "medium" | "large";
  darkMode: boolean;
  familyName: string;
}

export interface AppState {
  familyMembers: FamilyMember[];
  tasks: Task[];
  rewards: Reward[];
  completedTasks: CompletedTask[];
  theme: ThemeSettings;
}
