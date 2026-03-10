"use client";

import { useState } from "react";
import { useStore, Goal } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import CircleCheckbox from "@/components/ui/CircleCheckbox";

const TYPE_LABELS: Record<Goal["type"], string> = {
  "90day": "90 Day",
  yearly: "Yearly",
  life: "Life",
};
const TYPE_COLORS: Record<Goal["type"], string> = {
  "90day": "#3b82f6",
  yearly: "#eab308",
  life: "#a855f7",
};

export default function GoalsPage() {
  const goals = useStore((s) => s.goals);
  const addGoal = useStore((s) => s.addGoal);
  const updateGoal = useStore((s) => s.updateGoal);
  const deleteGoal = useStore((s) => s.deleteGoal);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<Goal["type"]>("90day");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [milestoneInput, setMilestoneInput] = useState("");

  const submit = () => {
    if (!title.trim()) return;
    addGoal(title, type);
    setTitle("");
    setShowForm(false);
  };

  const addMilestone = (goalId: string) => {
    if (!milestoneInput.trim()) return;
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    updateGoal(goalId, {
      milestones: [...goal.milestones, { text: milestoneInput, done: false }],
    });
    setMilestoneInput("");
  };

  const toggleMilestone = (goalId: string, idx: number) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    const milestones = goal.milestones.map((m, i) => (i === idx ? { ...m, done: !m.done } : m));
    const progress = milestones.length > 0
      ? Math.round((milestones.filter((m) => m.done).length / milestones.length) * 100)
      : goal.progress;
    updateGoal(goalId, { milestones, progress });
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">🎯 Goals</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{goals.length} goals set</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: "var(--accent)", color: "#000" }}>
          + New Goal
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
            onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="w-full max-w-md rounded-2xl p-6"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
              onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-4">New Goal</h3>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What's the goal?" autoFocus
                className="w-full rounded-xl p-3 mb-3 text-sm outline-none"
                style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                onKeyDown={(e) => e.key === "Enter" && submit()} />
              <div className="flex gap-2 mb-4">
                {(["90day", "yearly", "life"] as Goal["type"][]).map((t) => (
                  <button key={t} onClick={() => setType(t)}
                    className="text-xs px-3 py-1.5 rounded-lg"
                    style={{
                      background: type === t ? TYPE_COLORS[t] + "22" : "var(--bg-card)",
                      color: type === t ? TYPE_COLORS[t] : "var(--text-secondary)",
                      border: `1px solid ${type === t ? TYPE_COLORS[t] : "var(--border)"}`,
                    }}>
                    {TYPE_LABELS[t]}
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

      {/* Goal cards */}
      <div className="space-y-4">
        {goals.map((goal) => (
          <motion.div key={goal.id} layout
            className="rounded-2xl p-5 cursor-pointer"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            onClick={() => setExpanded(expanded === goal.id ? null : goal.id)}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">{goal.title}</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ background: TYPE_COLORS[goal.type] + "22", color: TYPE_COLORS[goal.type] }}>
                  {TYPE_LABELS[goal.type]}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold" style={{ color: "var(--accent)" }}>{goal.progress}%</span>
                <button onClick={(e) => { e.stopPropagation(); deleteGoal(goal.id); }}
                  className="text-xs" style={{ color: "#ef4444" }}>✕</button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 rounded-full mb-2" style={{ background: "#222" }}>
              <motion.div className="h-full rounded-full"
                style={{ background: "var(--accent)" }}
                initial={{ width: 0 }}
                animate={{ width: `${goal.progress}%` }}
                transition={{ duration: 0.5 }} />
            </div>

            {/* Manual progress slider */}
            <input type="range" min="0" max="100" value={goal.progress}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => updateGoal(goal.id, { progress: parseInt(e.target.value) })}
              className="w-full h-1 rounded-lg appearance-none cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
              style={{ accentColor: "var(--accent)" }} />

            {/* Milestones (expanded) */}
            <AnimatePresence>
              {expanded === goal.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="pt-4 mt-2 border-t" style={{ borderColor: "var(--border)" }}>
                  <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>Milestones</p>
                  {goal.milestones.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-2 mb-2" onClick={(e) => e.stopPropagation()}>
                      <CircleCheckbox
                        checked={m.done}
                        onChange={() => toggleMilestone(goal.id, idx)}
                        size={18}
                        color="var(--accent)"
                      />
                      <span className="text-xs" style={{
                        color: m.done ? "var(--text-muted)" : "var(--text-secondary)",
                        textDecoration: m.done ? "line-through" : "none",
                      }}>{m.text}</span>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                    <input type="text" value={milestoneInput} onChange={(e) => setMilestoneInput(e.target.value)}
                      placeholder="Add milestone..."
                      className="flex-1 rounded-lg p-2 text-xs outline-none"
                      style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                      onKeyDown={(e) => e.key === "Enter" && addMilestone(goal.id)} />
                    <button onClick={() => addMilestone(goal.id)}
                      className="text-xs px-3 py-1 rounded-lg" style={{ background: "var(--accent)", color: "#000" }}>Add</button>
                  </div>

                  <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                    <textarea value={goal.description}
                      onChange={(e) => updateGoal(goal.id, { description: e.target.value })}
                      placeholder="Add notes about this goal..."
                      className="w-full rounded-lg p-2 text-xs outline-none resize-none"
                      style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)", minHeight: "60px" }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {goals.length === 0 && (
        <div className="rounded-2xl p-12 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="text-4xl mb-3">🎯</p>
          <p className="font-medium" style={{ color: "var(--text-secondary)" }}>No goals set</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Define your targets</p>
        </div>
      )}
    </div>
  );
}
