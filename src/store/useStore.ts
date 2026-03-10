import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuid } from "uuid";

// ─── Types ───────────────────────────────────────────────────
export type AccentColor = "green" | "blue" | "coral" | "purple" | "amber" | "rose" | "cyan" | "custom";
export type ThemeMode = "dark" | "light" | "system";

export interface NoteChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export type NoteCategory = "General" | "Personal" | "Work" | "Ideas" | "Journal" | "Reference";

export const NOTE_COLORS = [
  { key: "default", color: "var(--bg-card)", label: "Default" },
  { key: "blue", color: "rgba(59,130,246,0.12)", label: "Blue" },
  { key: "green", color: "rgba(34,197,94,0.12)", label: "Green" },
  { key: "purple", color: "rgba(168,85,247,0.12)", label: "Purple" },
  { key: "amber", color: "rgba(234,179,8,0.12)", label: "Amber" },
  { key: "rose", color: "rgba(244,63,94,0.12)", label: "Rose" },
  { key: "cyan", color: "rgba(6,182,212,0.12)", label: "Cyan" },
];

export const NOTE_CATEGORIES: NoteCategory[] = ["General", "Personal", "Work", "Ideas", "Journal", "Reference"];

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  starred: boolean;
  archived: boolean;
  category: NoteCategory;
  color: string;
  checklist: NoteChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export type IdeaStatus = "Raw" | "Developing" | "Shelved" | "Launched";
export interface Idea {
  id: string;
  title: string;
  description: string;
  heat: number;
  status: IdeaStatus;
  category: string;
  color: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BusinessStage = "Concept" | "Validating" | "Building" | "Live";
export interface BusinessIdea {
  id: string;
  title: string;
  problem: string;
  audience: string;
  revenue: string;
  nextSteps: string[];
  resources: string;
  viability: number;
  stage: BusinessStage;
  createdAt: string;
  updatedAt: string;
}

export type TaskPriority = "Chill" | "Important" | "URGENT";
export type TaskStatus = "todo" | "in_progress" | "done";

export interface TaskSubtask {
  id: string;
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  content?: string;
  completed: boolean;
  completedAt?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  dueTime?: string | null;
  recurring: string | null;
  recurrenceEnd?: string | null;
  snoozedUntil: string | null;
  subtasks: TaskSubtask[];
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  frequency: "daily" | "weekly";
  completedDates: string[];
  createdAt: string;
  color: string;
}

export interface VaultNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  type: "90day" | "yearly" | "life";
  progress: number;
  milestones: { text: string; done: boolean }[];
  imageUrl: string | null;
  createdAt: string;
}

export type InboxItemType = "text" | "voice" | "photo";
export interface InboxItem {
  id: string;
  type: InboxItemType;
  content: string;
  processed: boolean;
  createdAt: string;
}

// ─── Store ───────────────────────────────────────────────────
interface AppState {
  // Settings
  accentColor: AccentColor;
  themeMode: ThemeMode;
  fontSize: "small" | "normal" | "large";
  fontFamily: "system" | "serif" | "mono";
  spacing: "compact" | "normal" | "spacious";
  customColors: { accent: string; accentDim: string; accentGlow: string } | null;
  vaultPin: string | null;
  vaultUnlocked: boolean;

  // Sync
  isServerMode: boolean;
  isSyncing: boolean;
  lastSyncAt: string | null;

  // Data
  notes: Note[];
  ideas: Idea[];
  businessIdeas: BusinessIdea[];
  tasks: Task[];
  habits: Habit[];
  vaultNotes: VaultNote[];
  goals: Goal[];
  inbox: InboxItem[];

  // Sync actions
  setServerMode: (mode: boolean) => void;
  syncFromServer: () => Promise<void>;

  // Settings actions
  setAccentColor: (c: AccentColor) => void;
  setThemeMode: (m: ThemeMode) => void;
  setFontSize: (s: "small" | "normal" | "large") => void;
  setFontFamily: (f: "system" | "serif" | "mono") => void;
  setSpacing: (s: "compact" | "normal" | "spacious") => void;
  setCustomColors: (c: { accent: string; accentDim: string; accentGlow: string } | null) => void;
  setVaultPin: (pin: string) => void;
  unlockVault: () => void;
  lockVault: () => void;

  // Notes
  addNote: (title: string, content: string, tags?: string[], category?: NoteCategory, color?: string) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  addChecklistItem: (noteId: string, text: string) => void;
  toggleChecklistItem: (noteId: string, itemId: string) => void;
  deleteChecklistItem: (noteId: string, itemId: string) => void;

  // Ideas
  addIdea: (title: string, description: string, category?: string) => void;
  updateIdea: (id: string, updates: Partial<Idea>) => void;
  deleteIdea: (id: string) => void;
  promoteIdeaToBusiness: (id: string) => void;

  // Business Ideas
  addBusinessIdea: (title: string) => void;
  updateBusinessIdea: (id: string, updates: Partial<BusinessIdea>) => void;
  deleteBusinessIdea: (id: string) => void;

  // Tasks
  addTask: (title: string, priority?: TaskPriority, dueDate?: string | null) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addSubtask: (taskId: string, text: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;

  // Habits
  addHabit: (name: string, frequency?: "daily" | "weekly") => void;
  toggleHabitDate: (id: string, date: string) => void;
  deleteHabit: (id: string) => void;

  // Vault
  addVaultNote: (title: string, content: string) => void;
  updateVaultNote: (id: string, updates: Partial<VaultNote>) => void;
  deleteVaultNote: (id: string) => void;

  // Goals
  addGoal: (title: string, type: Goal["type"]) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  // Inbox
  addInboxItem: (content: string, type?: InboxItemType) => void;
  processInboxItem: (id: string) => void;
  deleteInboxItem: (id: string) => void;
}

const IDEA_COLORS = ["#22c55e", "#3b82f6", "#f97316", "#a855f7", "#ef4444", "#eab308", "#06b6d4"];

// Helper for server sync
async function apiCall(endpoint: string, method: string, body?: unknown) {
  try {
    const res = await fetch(`/api/${endpoint}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.ok) return res.json();
  } catch (e) {
    console.error(`API call failed: ${method} ${endpoint}`, e);
  }
  return null;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Settings
      accentColor: "green",
      themeMode: "dark",
      fontSize: "normal",
      fontFamily: "system",
      spacing: "normal",
      customColors: null,
      vaultPin: null,
      vaultUnlocked: false,

      // Sync
      isServerMode: false,
      isSyncing: false,
      lastSyncAt: null,

      // Data
      notes: [],
      ideas: [],
      businessIdeas: [],
      tasks: [],
      habits: [],
      vaultNotes: [],
      goals: [],
      inbox: [],

      // Sync actions
      setServerMode: (mode) => set({ isServerMode: mode }),

      syncFromServer: async () => {
        set({ isSyncing: true });
        try {
          const [notes, ideas, businessIdeas, tasks, habits, vaultNotes, goals, inbox] = await Promise.all([
            apiCall("notes", "GET"),
            apiCall("ideas", "GET"),
            apiCall("business-ideas", "GET"),
            apiCall("tasks", "GET"),
            apiCall("habits", "GET"),
            apiCall("vault-notes", "GET"),
            apiCall("goals", "GET"),
            apiCall("inbox", "GET"),
          ]);

          set({
            notes: notes || [],
            ideas: ideas || [],
            businessIdeas: businessIdeas || [],
            tasks: tasks || [],
            habits: habits || [],
            vaultNotes: vaultNotes || [],
            goals: goals || [],
            inbox: inbox || [],
            lastSyncAt: new Date().toISOString(),
            isSyncing: false,
          });
        } catch {
          set({ isSyncing: false });
        }
      },

      // Settings actions
      setAccentColor: (c) => {
        set({ accentColor: c });
        if (get().isServerMode) apiCall("user/settings", "PUT", { accentColor: c });
      },
      setThemeMode: (m) => {
        set({ themeMode: m });
        if (get().isServerMode) apiCall("user/settings", "PUT", { themeMode: m });
      },
      setFontSize: (s) => {
        set({ fontSize: s });
        if (get().isServerMode) apiCall("user/settings", "PUT", { fontSize: s });
      },
      setFontFamily: (f) => {
        set({ fontFamily: f });
        if (get().isServerMode) apiCall("user/settings", "PUT", { fontFamily: f });
      },
      setSpacing: (s) => {
        set({ spacing: s });
        if (get().isServerMode) apiCall("user/settings", "PUT", { spacing: s });
      },
      setCustomColors: (c) => {
        set({ customColors: c });
        if (get().isServerMode) apiCall("user/settings", "PUT", { customColors: c ? JSON.stringify(c) : null });
      },
      setVaultPin: (pin) => {
        set({ vaultPin: pin });
        if (get().isServerMode) apiCall("user/settings", "PUT", { vaultPin: pin });
      },
      unlockVault: () => set({ vaultUnlocked: true }),
      lockVault: () => set({ vaultUnlocked: false }),

      // Notes
      addNote: (title, content, tags = [], category = "General", color = "default") => {
        const id = uuid();
        const now = new Date().toISOString();
        const note: Note = { id, title, content, tags, pinned: false, starred: false, archived: false, category, color, checklist: [], createdAt: now, updatedAt: now };
        set((s) => ({ notes: [note, ...s.notes] }));
        if (get().isServerMode) {
          apiCall("notes", "POST", { title, content, tags }).then((res) => {
            if (res) set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...res, category, color, checklist: [] } : n)) }));
          });
        }
      },
      updateNote: (id, updates) => {
        set((s) => ({
          notes: s.notes.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n)),
        }));
        if (get().isServerMode) apiCall("notes", "PUT", { id, ...updates });
      },
      addChecklistItem: (noteId, text) => {
        const itemId = uuid();
        set((s) => ({
          notes: s.notes.map((n) => n.id === noteId ? {
            ...n,
            checklist: [...(n.checklist || []), { id: itemId, text, done: false }],
            updatedAt: new Date().toISOString(),
          } : n),
        }));
      },
      toggleChecklistItem: (noteId, itemId) => {
        set((s) => ({
          notes: s.notes.map((n) => n.id === noteId ? {
            ...n,
            checklist: (n.checklist || []).map((c) => c.id === itemId ? { ...c, done: !c.done } : c),
            updatedAt: new Date().toISOString(),
          } : n),
        }));
      },
      deleteChecklistItem: (noteId, itemId) => {
        set((s) => ({
          notes: s.notes.map((n) => n.id === noteId ? {
            ...n,
            checklist: (n.checklist || []).filter((c) => c.id !== itemId),
            updatedAt: new Date().toISOString(),
          } : n),
        }));
      },
      deleteNote: (id) => {
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
        if (get().isServerMode) apiCall("notes", "DELETE", { id });
      },

      // Ideas
      addIdea: (title, description, category = "General") => {
        const id = uuid();
        const now = new Date().toISOString();
        const idea: Idea = {
          id, title, description, heat: 3, status: "Raw", category,
          color: IDEA_COLORS[get().ideas.length % IDEA_COLORS.length],
          archived: false, createdAt: now, updatedAt: now,
        };
        set((s) => ({ ideas: [idea, ...s.ideas] }));
        if (get().isServerMode) {
          apiCall("ideas", "POST", { title, description, category, color: idea.color }).then((res) => {
            if (res) set((s) => ({ ideas: s.ideas.map((i) => (i.id === id ? { ...res } : i)) }));
          });
        }
      },
      updateIdea: (id, updates) => {
        set((s) => ({
          ideas: s.ideas.map((i) => (i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i)),
        }));
        if (get().isServerMode) apiCall("ideas", "PUT", { id, ...updates });
      },
      deleteIdea: (id) => {
        set((s) => ({ ideas: s.ideas.filter((i) => i.id !== id) }));
        if (get().isServerMode) apiCall("ideas", "DELETE", { id });
      },
      promoteIdeaToBusiness: (id) => {
        const idea = get().ideas.find((i) => i.id === id);
        if (!idea) return;
        const bizId = uuid();
        const now = new Date().toISOString();
        set((s) => ({
          ideas: s.ideas.filter((i) => i.id !== id),
          businessIdeas: [
            { id: bizId, title: idea.title, problem: idea.description, audience: "", revenue: "", nextSteps: ["", "", ""], resources: "", viability: 5, stage: "Concept" as BusinessStage, createdAt: now, updatedAt: now },
            ...s.businessIdeas,
          ],
        }));
        if (get().isServerMode) {
          apiCall("ideas", "DELETE", { id });
          apiCall("business-ideas", "POST", { title: idea.title, problem: idea.description });
        }
      },

      // Business Ideas
      addBusinessIdea: (title) => {
        const id = uuid();
        const now = new Date().toISOString();
        const biz: BusinessIdea = { id, title, problem: "", audience: "", revenue: "", nextSteps: ["", "", ""], resources: "", viability: 5, stage: "Concept", createdAt: now, updatedAt: now };
        set((s) => ({ businessIdeas: [biz, ...s.businessIdeas] }));
        if (get().isServerMode) {
          apiCall("business-ideas", "POST", { title }).then((res) => {
            if (res) set((s) => ({ businessIdeas: s.businessIdeas.map((b) => (b.id === id ? { ...res } : b)) }));
          });
        }
      },
      updateBusinessIdea: (id, updates) => {
        set((s) => ({
          businessIdeas: s.businessIdeas.map((b) => (b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b)),
        }));
        if (get().isServerMode) apiCall("business-ideas", "PUT", { id, ...updates });
      },
      deleteBusinessIdea: (id) => {
        set((s) => ({ businessIdeas: s.businessIdeas.filter((b) => b.id !== id) }));
        if (get().isServerMode) apiCall("business-ideas", "DELETE", { id });
      },

      // Tasks
      addTask: (title, priority = "Chill", dueDate = null) => {
        const id = uuid();
        const task: Task = { id, title, completed: false, priority, status: "todo", dueDate, recurring: null, snoozedUntil: null, subtasks: [], createdAt: new Date().toISOString() };
        set((s) => ({ tasks: [task, ...s.tasks] }));
        if (get().isServerMode) {
          apiCall("tasks", "POST", { title, priority, dueDate }).then((res) => {
            if (res) set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...res, status: "todo", subtasks: [] } : t)) }));
          });
        }
      },
      updateTask: (id, updates) => {
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)) }));
        if (get().isServerMode) apiCall("tasks", "PUT", { id, ...updates });
      },
      toggleTask: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;
        const completed = !task.completed;
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, completed, status: completed ? "done" : "todo", completedAt: completed ? new Date().toISOString() : null } : t)),
        }));
        if (get().isServerMode) apiCall("tasks", "PUT", { id, completed });
      },
      deleteTask: (id) => {
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
        if (get().isServerMode) apiCall("tasks", "DELETE", { id });
      },
      addSubtask: (taskId, text) => {
        const subtaskId = uuid();
        set((s) => ({
          tasks: s.tasks.map((t) => t.id === taskId ? {
            ...t,
            subtasks: [...(t.subtasks || []), { id: subtaskId, text, done: false }],
          } : t),
        }));
      },
      toggleSubtask: (taskId, subtaskId) => {
        set((s) => ({
          tasks: s.tasks.map((t) => t.id === taskId ? {
            ...t,
            subtasks: (t.subtasks || []).map((s) => s.id === subtaskId ? { ...s, done: !s.done } : s),
          } : t),
        }));
      },
      deleteSubtask: (taskId, subtaskId) => {
        set((s) => ({
          tasks: s.tasks.map((t) => t.id === taskId ? {
            ...t,
            subtasks: (t.subtasks || []).filter((s) => s.id !== subtaskId),
          } : t),
        }));
      },

      // Habits
      addHabit: (name, frequency = "daily") => {
        const id = uuid();
        const habit: Habit = { id, name, frequency, completedDates: [], createdAt: new Date().toISOString(), color: IDEA_COLORS[get().habits.length % IDEA_COLORS.length] };
        set((s) => ({ habits: [habit, ...s.habits] }));
        if (get().isServerMode) {
          apiCall("habits", "POST", { name, frequency, color: habit.color }).then((res) => {
            if (res) set((s) => ({ habits: s.habits.map((h) => (h.id === id ? { ...res } : h)) }));
          });
        }
      },
      toggleHabitDate: (id, date) => {
        const habit = get().habits.find((h) => h.id === id);
        if (!habit) return;
        const completedDates = habit.completedDates.includes(date)
          ? habit.completedDates.filter((d) => d !== date)
          : [...habit.completedDates, date];
        set((s) => ({
          habits: s.habits.map((h) => (h.id === id ? { ...h, completedDates } : h)),
        }));
        if (get().isServerMode) apiCall("habits", "PUT", { id, completedDates });
      },
      deleteHabit: (id) => {
        set((s) => ({ habits: s.habits.filter((h) => h.id !== id) }));
        if (get().isServerMode) apiCall("habits", "DELETE", { id });
      },

      // Vault
      addVaultNote: (title, content) => {
        const id = uuid();
        const now = new Date().toISOString();
        set((s) => ({ vaultNotes: [{ id, title, content, createdAt: now, updatedAt: now }, ...s.vaultNotes] }));
        if (get().isServerMode) {
          apiCall("vault-notes", "POST", { title, content }).then((res) => {
            if (res) set((s) => ({ vaultNotes: s.vaultNotes.map((v) => (v.id === id ? { ...res } : v)) }));
          });
        }
      },
      updateVaultNote: (id, updates) => {
        set((s) => ({
          vaultNotes: s.vaultNotes.map((v) => (v.id === id ? { ...v, ...updates, updatedAt: new Date().toISOString() } : v)),
        }));
        if (get().isServerMode) apiCall("vault-notes", "PUT", { id, ...updates });
      },
      deleteVaultNote: (id) => {
        set((s) => ({ vaultNotes: s.vaultNotes.filter((v) => v.id !== id) }));
        if (get().isServerMode) apiCall("vault-notes", "DELETE", { id });
      },

      // Goals
      addGoal: (title, type) => {
        const id = uuid();
        const goal: Goal = { id, title, description: "", type, progress: 0, milestones: [], imageUrl: null, createdAt: new Date().toISOString() };
        set((s) => ({ goals: [goal, ...s.goals] }));
        if (get().isServerMode) {
          apiCall("goals", "POST", { title, type }).then((res) => {
            if (res) set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...res } : g)) }));
          });
        }
      },
      updateGoal: (id, updates) => {
        set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)) }));
        if (get().isServerMode) apiCall("goals", "PUT", { id, ...updates });
      },
      deleteGoal: (id) => {
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) }));
        if (get().isServerMode) apiCall("goals", "DELETE", { id });
      },

      // Inbox
      addInboxItem: (content, type = "text") => {
        const id = uuid();
        set((s) => ({ inbox: [{ id, type, content, processed: false, createdAt: new Date().toISOString() }, ...s.inbox] }));
        if (get().isServerMode) {
          apiCall("inbox", "POST", { content, type }).then((res) => {
            if (res) set((s) => ({ inbox: s.inbox.map((i) => (i.id === id ? { ...res } : i)) }));
          });
        }
      },
      processInboxItem: (id) => {
        set((s) => ({ inbox: s.inbox.map((i) => (i.id === id ? { ...i, processed: true } : i)) }));
        if (get().isServerMode) apiCall("inbox", "PUT", { id, processed: true });
      },
      deleteInboxItem: (id) => {
        set((s) => ({ inbox: s.inbox.filter((i) => i.id !== id) }));
        if (get().isServerMode) apiCall("inbox", "DELETE", { id });
      },
    }),
    {
      name: "mindvault-storage",
    }
  )
);
