"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";

function getStreak(completedDates: string[]): number {
  if (!completedDates.length) return 0;
  const sorted = [...completedDates].sort().reverse();
  const today = new Date().toISOString().split("T")[0];
  let streak = 0;
  let check = new Date(today);

  // If today isn't done yet, start from yesterday
  if (!sorted.includes(today)) {
    check.setDate(check.getDate() - 1);
  }

  for (let i = 0; i < 365; i++) {
    const dateStr = check.toISOString().split("T")[0];
    if (sorted.includes(dateStr)) {
      streak++;
      check.setDate(check.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function getLast30Days(): string[] {
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

export default function RitualsPage() {
  const habits = useStore((s) => s.habits);
  const addHabit = useStore((s) => s.addHabit);
  const toggleHabitDate = useStore((s) => s.toggleHabitDate);
  const deleteHabit = useStore((s) => s.deleteHabit);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [freq, setFreq] = useState<"daily" | "weekly">("daily");

  const today = new Date().toISOString().split("T")[0];
  const last30 = useMemo(() => getLast30Days(), []);

  const submit = () => {
    if (!name.trim()) return;
    addHabit(name, freq);
    setName("");
    setShowForm(false);
  };

  return (
    <div className="max-w-4xl">
      <motion.div className="flex items-center justify-between mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">🔁 Rituals</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{habits.length} habits tracked</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: "var(--accent)", color: "#000" }}>
          + New Habit
        </button>
      </motion.div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
            onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="w-full max-w-md card-modern"
              onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-4">New Habit</h3>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Habit name (e.g. Meditate, Read, Exercise)"
                autoFocus
                className="w-full rounded-xl p-3 mb-3 text-sm outline-none"
                style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                onKeyDown={(e) => e.key === "Enter" && submit()} />
              <div className="flex gap-2 mb-4">
                {(["daily", "weekly"] as const).map((f) => (
                  <button key={f} onClick={() => setFreq(f)}
                    className="text-xs px-3 py-1.5 rounded-lg capitalize"
                    style={{
                      background: freq === f ? "var(--accent-glow)" : "var(--bg-card)",
                      color: freq === f ? "var(--accent)" : "var(--text-secondary)",
                      border: `1px solid ${freq === f ? "var(--accent)" : "var(--border)"}`,
                    }}>
                    {f}
                  </button>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl text-sm" style={{ color: "var(--text-secondary)", border: "1px solid var(--border)" }}>Cancel</button>
                <button onClick={submit}
                  className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: "var(--accent)", color: "#000" }}>Create</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Habits */}
      <div className="space-y-4">
        {habits.map((habit) => {
          const streak = getStreak(habit.completedDates);
          const doneToday = habit.completedDates.includes(today);
          return (
            <motion.div key={habit.id} layout className="card-modern" whileHover={{ y: -4 }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleHabitDate(habit.id, today)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all"
                    style={{
                      background: doneToday ? "var(--accent)" : "transparent",
                      border: `2px solid ${doneToday ? "var(--accent)" : "var(--border)"}`,
                      color: doneToday ? "#000" : "var(--text-muted)",
                    }}>
                    {doneToday && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>✓</motion.span>}
                  </button>
                  <div>
                    <h3 className="font-semibold text-sm">{habit.name}</h3>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{habit.frequency}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {streak > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-lg" style={{ animation: "flicker 1s ease-in-out infinite" }}>🔥</span>
                      <span className="text-sm font-bold" style={{ color: "var(--accent)" }}>{streak}</span>
                    </div>
                  )}
                  <button onClick={() => deleteHabit(habit.id)}
                    className="text-xs" style={{ color: "#ef4444" }}>✕</button>
                </div>
              </div>

              {/* Calendar heatmap (last 30 days) */}
              <div className="flex gap-1 flex-wrap">
                {last30.map((day) => {
                  const done = habit.completedDates.includes(day);
                  return (
                    <button key={day} onClick={() => toggleHabitDate(habit.id, day)}
                      className="w-4 h-4 rounded-sm transition-all"
                      title={day}
                      style={{
                        background: done ? habit.color : "#1a1a1a",
                        opacity: done ? 1 : 0.5,
                      }} />
                  );
                })}
              </div>
              <p className="text-[10px] mt-2 flex justify-between" style={{ color: "var(--text-muted)" }}>
                <span>30 days ago</span>
                <span>Today</span>
              </p>
            </motion.div>
          );
        })}
      </div>

      {habits.length === 0 && (
        <div className="rounded-2xl p-12 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="text-4xl mb-3">🔁</p>
          <p className="font-medium" style={{ color: "var(--text-secondary)" }}>No habits yet</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Build your daily rituals</p>
        </div>
      )}
    </div>
  );
}
