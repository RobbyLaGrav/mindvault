"use client";

import { useStore } from "@/store/useStore";
import { useAuthStore } from "@/store/useAuthStore";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import Link from "next/link";
import CircleCheckbox from "@/components/ui/CircleCheckbox";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const tasks = useStore((s) => s.tasks);
  const habits = useStore((s) => s.habits);
  const goals = useStore((s) => s.goals);
  const ideas = useStore((s) => s.ideas);
  const notes = useStore((s) => s.notes);
  const inbox = useStore((s) => s.inbox);
  const businessIdeas = useStore((s) => s.businessIdeas);
  const processInboxItem = useStore((s) => s.processInboxItem);
  const deleteInboxItem = useStore((s) => s.deleteInboxItem);
  const addNote = useStore((s) => s.addNote);
  const addIdea = useStore((s) => s.addIdea);
  const addTask = useStore((s) => s.addTask);
  const toggleTask = useStore((s) => s.toggleTask);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const weekFromNow = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  }, []);

  const overdueTasks = useMemo(() =>
    tasks.filter((t) => !t.completed && t.dueDate && t.dueDate < today)
      .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || "")), [tasks, today]);

  const todayTasks = useMemo(() =>
    tasks.filter((t) => !t.completed && t.dueDate === today), [tasks, today]);

  const upcomingTasks = useMemo(() =>
    tasks.filter((t) => !t.completed && t.dueDate && t.dueDate > today && t.dueDate <= weekFromNow)
      .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || "")), [tasks, today, weekFromNow]);

  const completedToday = useMemo(() =>
    tasks.filter((t) => t.completed && t.completedAt && t.completedAt.startsWith(today)).length, [tasks, today]);

  const todayHabits = useMemo(() =>
    habits.map((h) => ({ ...h, doneToday: h.completedDates.includes(today) })), [habits, today]);
  const habitsCompletedToday = todayHabits.filter((h) => h.doneToday).length;

  const activeGoals = useMemo(() => goals.slice(0, 4), [goals]);
  const avgGoalProgress = useMemo(() =>
    goals.length > 0 ? Math.round(goals.reduce((a, g) => a + g.progress, 0) / goals.length) : 0, [goals]);

  const unprocessedInbox = inbox.filter((i) => !i.processed);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  }, []);

  const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const priorityColor = (p: string) => p === "URGENT" ? "#ef4444" : p === "Important" ? "#eab308" : "#22c55e";
  const priorityBg = (p: string) => p === "URGENT" ? "rgba(239,68,68,0.1)" : p === "Important" ? "rgba(234,179,8,0.1)" : "rgba(34,197,94,0.1)";

  const sendTo = (item: typeof inbox[0], target: "note" | "idea" | "task") => {
    if (target === "note") addNote(item.content.slice(0, 50), item.content);
    else if (target === "idea") addIdea(item.content.slice(0, 50), item.content);
    else addTask(item.content);
    processInboxItem(item.id);
  };

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          {greeting}{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{dateStr}</p>
      </div>

      {/* Overdue Banner */}
      {overdueTasks.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 mb-6"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">🚨</span>
            <h3 className="text-sm font-semibold" style={{ color: "#ef4444" }}>
              {overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? "s" : ""}
            </h3>
          </div>
          <div className="flex flex-col gap-2">
            {overdueTasks.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center gap-3">
                <CircleCheckbox checked={false} onChange={() => toggleTask(t.id)} size={18} color="#ef4444" />
                <span className="text-sm flex-1 truncate" style={{ color: "var(--text-primary)" }}>{t.title}</span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{t.dueDate}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Due Today", value: todayTasks.length, icon: "📋", color: "#3b82f6", href: "/firelist" },
          { label: "Completed Today", value: completedToday, icon: "✅", color: "#22c55e", href: "/firelist" },
          { label: "Habits Done", value: `${habitsCompletedToday}/${habits.length}`, icon: "🔁", color: "#a855f7", href: "/rituals" },
          { label: "Goal Progress", value: `${avgGoalProgress}%`, icon: "🎯", color: "#eab308", href: "/goals" },
        ].map((stat, i) => (
          <Link key={stat.label} href={stat.href} className="no-underline">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl p-4 transition-all hover:scale-[1.02]"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-2"><span className="text-lg">{stat.icon}</span></div>
              <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Today's Focus */}
          <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                🎯 Today&apos;s Focus
              </h2>
              <Link href="/firelist" className="text-xs no-underline" style={{ color: "var(--accent)" }}>View all</Link>
            </div>
            {todayTasks.length === 0 && !overdueTasks.length ? (
              <p className="text-sm py-4 text-center" style={{ color: "var(--text-muted)" }}>
                No tasks due today. You&apos;re ahead of schedule! 🎉
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {todayTasks.map((t) => (
                  <motion.div key={t.id} layout className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--bg-primary)" }}>
                    <CircleCheckbox checked={false} onChange={() => toggleTask(t.id)} size={22} color={priorityColor(t.priority)} />
                    <span className="text-sm flex-1" style={{ color: "var(--text-primary)" }}>{t.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: priorityBg(t.priority), color: priorityColor(t.priority) }}>
                      {t.priority}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming This Week */}
          <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                📅 Upcoming This Week
              </h2>
              <Link href="/calendar" className="text-xs no-underline" style={{ color: "var(--accent)" }}>Calendar</Link>
            </div>
            {upcomingTasks.length === 0 ? (
              <p className="text-sm py-4 text-center" style={{ color: "var(--text-muted)" }}>No upcoming tasks this week</p>
            ) : (
              <div className="flex flex-col gap-2">
                {upcomingTasks.slice(0, 8).map((t) => (
                  <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: priorityColor(t.priority) }} />
                    <span className="text-sm flex-1 truncate" style={{ color: "var(--text-primary)" }}>{t.title}</span>
                    <span className="text-xs shrink-0" style={{ color: "var(--text-muted)" }}>
                      {t.dueDate ? new Date(t.dueDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inbox */}
          {unprocessedInbox.length > 0 && (
            <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                📥 Inbox <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--accent)", color: "#000" }}>{unprocessedInbox.length}</span>
              </h2>
              <AnimatePresence>
                {unprocessedInbox.slice(0, 5).map((item) => (
                  <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -50 }}
                    className="p-3 rounded-xl mb-2" style={{ background: "var(--bg-primary)" }}>
                    <p className="text-sm mb-2" style={{ color: "var(--text-primary)" }}>{item.content}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>Route to:</span>
                      {(["note", "idea", "task"] as const).map((t) => (
                        <button key={t} onClick={() => sendTo(item, t)} className="text-xs px-2.5 py-1 rounded-lg"
                          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                          {t === "note" ? "🧠" : t === "idea" ? "⚡" : "🔥"} {t}
                        </button>
                      ))}
                      <button onClick={() => deleteInboxItem(item.id)} className="ml-auto text-xs" style={{ color: "#ef4444" }}>Delete</button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Habits */}
          <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>🔁 Today&apos;s Habits</h2>
              <Link href="/rituals" className="text-xs no-underline" style={{ color: "var(--accent)" }}>All</Link>
            </div>
            {todayHabits.length === 0 ? (
              <p className="text-sm text-center py-3" style={{ color: "var(--text-muted)" }}>No habits yet</p>
            ) : (
              <div className="flex flex-col gap-2">
                {todayHabits.map((h) => (
                  <div key={h.id} className="flex items-center gap-3 p-2 rounded-lg">
                    <CircleCheckbox checked={h.doneToday} onChange={() => {}} size={22} color={h.color} disabled />
                    <span className="text-sm" style={{ color: h.doneToday ? "var(--text-muted)" : "var(--text-primary)", textDecoration: h.doneToday ? "line-through" : "none" }}>{h.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Goals */}
          <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>🎯 Goals</h2>
              <Link href="/goals" className="text-xs no-underline" style={{ color: "var(--accent)" }}>All</Link>
            </div>
            {activeGoals.length === 0 ? (
              <p className="text-sm text-center py-3" style={{ color: "var(--text-muted)" }}>Set some goals!</p>
            ) : (
              <div className="flex flex-col gap-3">
                {activeGoals.map((g) => (
                  <div key={g.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm truncate" style={{ color: "var(--text-primary)" }}>{g.title}</span>
                      <span className="text-xs shrink-0" style={{ color: "var(--text-muted)" }}>{g.progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: "var(--bg-primary)" }}>
                      <motion.div className="h-full rounded-full" style={{ background: "var(--accent)", width: `${g.progress}%` }}
                        initial={{ width: 0 }} animate={{ width: `${g.progress}%` }} transition={{ duration: 0.6 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Overview */}
          <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>📊 Overview</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Notes", value: notes.length, href: "/braindump" },
                { label: "Ideas", value: ideas.filter((i) => !i.archived).length, href: "/spark" },
                { label: "Ventures", value: businessIdeas.length, href: "/empire" },
                { label: "Active Tasks", value: tasks.filter((t) => !t.completed).length, href: "/firelist" },
              ].map((s) => (
                <Link key={s.label} href={s.href} className="no-underline p-3 rounded-xl text-center" style={{ background: "var(--bg-primary)" }}>
                  <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{s.value}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
