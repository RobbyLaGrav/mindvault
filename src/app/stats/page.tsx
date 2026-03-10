"use client";

import { useMemo } from "react";
import { useStore } from "@/store/useStore";
import { motion } from "framer-motion";

function getLast7Days() {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function getStreak(completedDates: string[]): number {
  if (!completedDates.length) return 0;
  const sorted = [...completedDates].sort().reverse();
  const today = new Date().toISOString().split("T")[0];
  let streak = 0;
  const check = new Date(today);
  if (!sorted.includes(today)) check.setDate(check.getDate() - 1);
  for (let i = 0; i < 365; i++) {
    const dateStr = check.toISOString().split("T")[0];
    if (sorted.includes(dateStr)) {
      streak++;
      check.setDate(check.getDate() - 1);
    } else break;
  }
  return streak;
}

export default function StatsPage() {
  const notes = useStore((s) => s.notes);
  const ideas = useStore((s) => s.ideas);
  const businessIdeas = useStore((s) => s.businessIdeas);
  const tasks = useStore((s) => s.tasks);
  const habits = useStore((s) => s.habits);
  const goals = useStore((s) => s.goals);
  const inbox = useStore((s) => s.inbox);
  const vaultNotes = useStore((s) => s.vaultNotes);

  const today = new Date().toISOString().split("T")[0];
  const last7Days = useMemo(() => getLast7Days(), []);

  const stats = useMemo(() => {
    const completedTasks = tasks.filter((t) => t.completed).length;
    const activeTasks = tasks.filter((t) => !t.completed).length;
    const activeIdeas = ideas.filter((i) => !i.archived).length;
    const launchedIdeas = ideas.filter((i) => i.status === "Launched").length;
    const liveBiz = businessIdeas.filter((b) => b.stage === "Live").length;
    const habitsCompletedToday = habits.filter((h) => h.completedDates.includes(today)).length;

    let longestStreak = 0;
    habits.forEach((h) => {
      const streak = getStreak(h.completedDates);
      if (streak > longestStreak) longestStreak = streak;
    });

    const avgGoalProgress = goals.length > 0
      ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
      : 0;

    // Weekly task completion trend
    const weeklyCompletions = last7Days.map((day) => ({
      day,
      label: new Date(day + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" }),
      completed: tasks.filter((t) => t.completed && t.completedAt && t.completedAt.startsWith(day)).length,
    }));
    const maxCompletions = Math.max(...weeklyCompletions.map((d) => d.completed), 1);

    // Weekly habit completion trend
    const weeklyHabits = last7Days.map((day) => ({
      day,
      label: new Date(day + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" }),
      completed: habits.filter((h) => h.completedDates.includes(day)).length,
    }));
    const maxHabitsDay = Math.max(...weeklyHabits.map((d) => d.completed), 1);

    // Overdue tasks
    const overdueTasks = tasks.filter((t) => !t.completed && t.dueDate && t.dueDate < today);

    // Tasks due soon (next 3 days)
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const dueSoon = tasks.filter((t) => !t.completed && t.dueDate && t.dueDate >= today && t.dueDate <= threeDaysFromNow.toISOString().split("T")[0]);

    // Productivity score (0-100)
    const taskScore = completedTasks + activeTasks > 0 ? (completedTasks / (completedTasks + activeTasks)) * 30 : 0;
    const habitScore = habits.length > 0 ? (habitsCompletedToday / habits.length) * 30 : 0;
    const goalScore = avgGoalProgress * 0.2;
    const streakScore = Math.min(longestStreak * 2, 20);
    const productivityScore = Math.round(taskScore + habitScore + goalScore + streakScore);

    return {
      totalNotes: notes.length,
      activeIdeas,
      launchedIdeas,
      totalBusiness: businessIdeas.length,
      liveBiz,
      completedTasks,
      activeTasks,
      totalHabits: habits.length,
      habitsCompletedToday,
      longestStreak,
      totalGoals: goals.length,
      avgGoalProgress,
      inboxPending: inbox.filter((i) => !i.processed).length,
      vaultNotes: vaultNotes.length,
      weeklyCompletions,
      maxCompletions,
      weeklyHabits,
      maxHabitsDay,
      overdueTasks,
      dueSoon,
      productivityScore,
    };
  }, [notes, ideas, businessIdeas, tasks, habits, goals, inbox, vaultNotes, today, last7Days]);

  // Smart recommendations
  const recommendations = useMemo(() => {
    const recs: { text: string; type: "warning" | "success" | "info" }[] = [];

    if (stats.overdueTasks.length > 0) {
      recs.push({ text: `You have ${stats.overdueTasks.length} overdue task${stats.overdueTasks.length > 1 ? "s" : ""}. Time to tackle them!`, type: "warning" });
    }
    if (stats.habitsCompletedToday < stats.totalHabits && stats.totalHabits > 0) {
      recs.push({ text: `${stats.totalHabits - stats.habitsCompletedToday} habits left to complete today. Keep going!`, type: "info" });
    }
    if (stats.longestStreak >= 7) {
      recs.push({ text: `Amazing! ${stats.longestStreak}-day streak! Don't break it!`, type: "success" });
    }
    if (stats.inboxPending > 5) {
      recs.push({ text: `${stats.inboxPending} items in your inbox. Time to process them!`, type: "info" });
    }
    if (stats.completedTasks > 0 && stats.activeTasks === 0) {
      recs.push({ text: "All tasks completed! Time to set new goals.", type: "success" });
    }
    if (stats.avgGoalProgress >= 80) {
      recs.push({ text: `Goals are ${stats.avgGoalProgress}% complete. Almost there!`, type: "success" });
    }
    if (stats.dueSoon.length > 0) {
      recs.push({ text: `${stats.dueSoon.length} task${stats.dueSoon.length > 1 ? "s" : ""} due in the next 3 days.`, type: "warning" });
    }
    if (recs.length === 0) {
      recs.push({ text: "Everything looks great! Keep up the momentum.", type: "success" });
    }
    return recs;
  }, [stats]);

  const cards = [
    { label: "Notes Written", value: stats.totalNotes, icon: "🧠", color: "#3b82f6" },
    { label: "Active Ideas", value: stats.activeIdeas, icon: "⚡", color: "#eab308" },
    { label: "Ideas Launched", value: stats.launchedIdeas, icon: "🚀", color: "#22c55e" },
    { label: "Business Ideas", value: stats.totalBusiness, icon: "🏛️", color: "#a855f7" },
    { label: "Businesses Live", value: stats.liveBiz, icon: "💰", color: "#22c55e" },
    { label: "Tasks Completed", value: stats.completedTasks, icon: "✅", color: "#22c55e" },
    { label: "Tasks Active", value: stats.activeTasks, icon: "🔥", color: "#f97316" },
    { label: "Habits Tracked", value: stats.totalHabits, icon: "🔁", color: "#06b6d4" },
    { label: "Habits Done Today", value: `${stats.habitsCompletedToday}/${stats.totalHabits}`, icon: "📅", color: "#22c55e" },
    { label: "Longest Streak", value: `${stats.longestStreak} days`, icon: "🔥", color: "#f97316" },
    { label: "Goals Set", value: stats.totalGoals, icon: "🎯", color: "#a855f7" },
    { label: "Avg Goal Progress", value: `${stats.avgGoalProgress}%`, icon: "📈", color: "#22c55e" },
    { label: "Inbox Pending", value: stats.inboxPending, icon: "📥", color: "#eab308" },
    { label: "Vault Notes", value: stats.vaultNotes, icon: "🔒", color: "#888" },
  ];

  const recTypeStyles = {
    warning: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.15)", color: "#ef4444", icon: "⚠️" },
    success: { bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.15)", color: "#22c55e", icon: "🎉" },
    info: { bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.15)", color: "#3b82f6", icon: "💡" },
  };

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold tracking-tight mb-1">📊 Stats</h1>
      <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Your MINDVAULT at a glance</p>

      {/* Productivity Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 mb-6"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>Productivity Score</h3>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Based on tasks, habits, goals & streaks</p>
          </div>
          <div className="text-right">
            <motion.p className="text-4xl font-bold"
              style={{ color: stats.productivityScore >= 70 ? "#22c55e" : stats.productivityScore >= 40 ? "#eab308" : "#ef4444" }}
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.3 }}>
              {stats.productivityScore}
            </motion.p>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>/ 100</p>
          </div>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: "#222" }}>
          <motion.div className="h-full rounded-full"
            style={{
              background: stats.productivityScore >= 70 ? "#22c55e" : stats.productivityScore >= 40 ? "#eab308" : "#ef4444",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${stats.productivityScore}%` }}
            transition={{ duration: 1, delay: 0.5 }} />
        </div>
      </motion.div>

      {/* Smart Recommendations */}
      <div className="mb-6 space-y-2">
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>Smart Insights</h3>
        {recommendations.map((rec, i) => {
          const style = recTypeStyles[rec.type];
          return (
            <motion.div key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl p-3 flex items-center gap-3"
              style={{ background: style.bg, border: `1px solid ${style.border}` }}>
              <span>{style.icon}</span>
              <p className="text-sm" style={{ color: style.color }}>{rec.text}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Weekly Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Task Completions Chart */}
        <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-secondary)" }}>Tasks Completed (7 days)</h3>
          <div className="flex items-end gap-2 h-32">
            {stats.weeklyCompletions.map((d, i) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  className="w-full rounded-t-lg"
                  style={{ background: d.day === today ? "var(--accent)" : "var(--accent-dim, rgba(34,197,94,0.3))" }}
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.completed / stats.maxCompletions) * 100}%` }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                />
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{d.label}</span>
                <span className="text-[10px] font-bold" style={{ color: d.completed > 0 ? "var(--accent)" : "var(--text-muted)" }}>
                  {d.completed}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Habit Completions Chart */}
        <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-secondary)" }}>Habits Completed (7 days)</h3>
          <div className="flex items-end gap-2 h-32">
            {stats.weeklyHabits.map((d, i) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  className="w-full rounded-t-lg"
                  style={{ background: d.day === today ? "#a855f7" : "rgba(168,85,247,0.3)" }}
                  initial={{ height: 0 }}
                  animate={{ height: `${stats.maxHabitsDay > 0 ? (d.completed / stats.maxHabitsDay) * 100 : 0}%` }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                />
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{d.label}</span>
                <span className="text-[10px] font-bold" style={{ color: d.completed > 0 ? "#a855f7" : "var(--text-muted)" }}>
                  {d.completed}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card, i) => (
          <motion.div key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="rounded-2xl p-5"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{card.icon}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Task Completion Rate */}
      <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-secondary)" }}>Task Completion Rate</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-4 rounded-full overflow-hidden" style={{ background: "#222" }}>
              <motion.div className="h-full rounded-full"
                style={{ background: "var(--accent)" }}
                initial={{ width: 0 }}
                animate={{
                  width: stats.completedTasks + stats.activeTasks > 0
                    ? `${(stats.completedTasks / (stats.completedTasks + stats.activeTasks)) * 100}%`
                    : "0%"
                }}
                transition={{ duration: 1, delay: 0.5 }} />
            </div>
          </div>
          <span className="text-sm font-bold" style={{ color: "var(--accent)" }}>
            {stats.completedTasks + stats.activeTasks > 0
              ? Math.round((stats.completedTasks / (stats.completedTasks + stats.activeTasks)) * 100)
              : 0}%
          </span>
        </div>
      </div>
    </div>
  );
}
