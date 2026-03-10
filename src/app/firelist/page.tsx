"use client";

import { useState } from "react";
import { useStore, TaskPriority, TaskStatus } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import CircleCheckbox from "@/components/ui/CircleCheckbox";

const PRIORITY_STYLES: Record<TaskPriority, { color: string; bg: string; label: string }> = {
  Chill: { color: "#22c55e", bg: "rgba(34,197,94,0.1)", label: "Chill" },
  Important: { color: "#eab308", bg: "rgba(234,179,8,0.1)", label: "Important" },
  URGENT: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", label: "URGENT" },
};

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; icon: string }> = {
  todo: { label: "To Do", color: "#6b7280", icon: "📋" },
  in_progress: { label: "In Progress", color: "#3b82f6", icon: "🔄" },
  done: { label: "Done", color: "#22c55e", icon: "✅" },
};

type ViewMode = "list" | "kanban";

export default function FireListPage() {
  const tasks = useStore((s) => s.tasks);
  const addTask = useStore((s) => s.addTask);
  const toggleTask = useStore((s) => s.toggleTask);
  const updateTask = useStore((s) => s.updateTask);
  const deleteTask = useStore((s) => s.deleteTask);
  const addSubtask = useStore((s) => s.addSubtask);
  const toggleSubtask = useStore((s) => s.toggleSubtask);
  const deleteSubtask = useStore((s) => s.deleteSubtask);

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("Chill");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState<"active" | "completed" | "all">("active");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [subtaskInput, setSubtaskInput] = useState("");

  const submit = () => {
    if (!title.trim()) return;
    addTask(title, priority, dueDate || null);
    setTitle("");
    setDueDate("");
  };

  const visible = tasks.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const sorted = [...visible].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const pOrder = { URGENT: 0, Important: 1, Chill: 2 };
    return pOrder[a.priority] - pOrder[b.priority];
  });

  const kanbanColumns: TaskStatus[] = ["todo", "in_progress", "done"];

  const moveToStatus = (taskId: string, status: TaskStatus) => {
    const completed = status === "done";
    updateTask(taskId, {
      status,
      completed,
      completedAt: completed ? new Date().toISOString() : null,
    });
  };

  return (
    <div className="max-w-5xl">
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">🔥 Fire List</h1>
        <div className="flex gap-1 p-1 rounded-lg glass-md">
          <button onClick={() => setViewMode("list")}
            className="text-xs px-3 py-1.5 rounded-md font-medium transition-all"
            style={{
              background: viewMode === "list" ? "var(--accent-glow)" : "transparent",
              color: viewMode === "list" ? "var(--accent)" : "var(--text-muted)",
            }}>
            List
          </button>
          <button onClick={() => setViewMode("kanban")}
            className="text-xs px-3 py-1.5 rounded-md font-medium transition-all"
            style={{
              background: viewMode === "kanban" ? "var(--accent-glow)" : "transparent",
              color: viewMode === "kanban" ? "var(--accent)" : "var(--text-muted)",
            }}>
            Kanban
          </button>
        </div>
      </motion.div>
      <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
        {tasks.filter((t) => !t.completed).length} active / {tasks.filter((t) => t.completed).length} completed
      </p>

      {/* Add form */}
      <motion.div
        className="card-modern mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex gap-2 mb-3">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to get done?"
            className="flex-1 rounded-xl p-3 text-sm outline-none"
            style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
            onKeyDown={(e) => e.key === "Enter" && submit()} />
          <button onClick={submit}
            className="px-4 py-2 rounded-xl text-sm font-semibold shrink-0"
            style={{ background: "var(--accent)", color: "#000" }}>
            Add
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {(["Chill", "Important", "URGENT"] as TaskPriority[]).map((p) => (
              <button key={p} onClick={() => setPriority(p)}
                className="text-xs px-3 py-1 rounded-lg font-medium transition-all"
                style={{
                  background: priority === p ? PRIORITY_STYLES[p].bg : "transparent",
                  color: priority === p ? PRIORITY_STYLES[p].color : "var(--text-muted)",
                  border: `1px solid ${priority === p ? PRIORITY_STYLES[p].color : "var(--border)"}`,
                }}>
                {p === "URGENT" ? "🔴 " : ""}{p}
              </button>
            ))}
          </div>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
            className="text-xs rounded-lg p-1.5 outline-none"
            style={{ background: "var(--bg-primary)", color: "var(--text-secondary)", border: "1px solid var(--border)" }} />
        </div>
      </motion.div>

      {/* Filter (list mode only) */}
      {viewMode === "list" && (
        <div className="flex gap-2 mb-4">
          {(["active", "completed", "all"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all capitalize"
              style={{
                background: filter === f ? "var(--accent-glow)" : "var(--bg-card)",
                color: filter === f ? "var(--accent)" : "var(--text-secondary)",
                border: `1px solid ${filter === f ? "var(--accent)" : "var(--border)"}`,
              }}>
              {f}
            </button>
          ))}
        </div>
      )}

      {/* KANBAN VIEW */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {kanbanColumns.map((status) => {
            const columnTasks = tasks.filter((t) => (t.status || (t.completed ? "done" : "todo")) === status);
            const config = STATUS_CONFIG[status];
            return (
              <motion.div
                key={status}
                className="card-modern"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span>{config.icon}</span>
                    <h3 className="text-sm font-semibold" style={{ color: config.color }}>{config.label}</h3>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: config.color + "22", color: config.color }}>
                    {columnTasks.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2 min-h-[100px]">
                  <AnimatePresence>
                    {columnTasks.map((task) => {
                      const subtasks = task.subtasks || [];
                      const subtasksDone = subtasks.filter((s) => s.done).length;
                      return (
                        <motion.div key={task.id} layout
                          initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="rounded-xl p-3 group glass"
                        >
                          <div className="flex items-start gap-2 mb-2">
                            <CircleCheckbox
                              checked={task.completed}
                              onChange={() => toggleTask(task.id)}
                              size={20}
                              color={PRIORITY_STYLES[task.priority].color}
                            />
                            <p className="text-xs flex-1" style={{
                              color: task.completed ? "var(--text-muted)" : "var(--text-primary)",
                              textDecoration: task.completed ? "line-through" : "none",
                            }}>{task.title}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-[10px] px-1.5 py-0.5 rounded"
                              style={{ background: PRIORITY_STYLES[task.priority].bg, color: PRIORITY_STYLES[task.priority].color }}>
                              {task.priority}
                            </span>
                            {task.dueDate && (
                              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                                {new Date(task.dueDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                            )}
                            {subtasks.length > 0 && (
                              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                                {subtasksDone}/{subtasks.length}
                              </span>
                            )}
                          </div>
                          {/* Move buttons */}
                          <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {kanbanColumns.filter((s) => s !== status).map((s) => (
                              <button key={s} onClick={() => moveToStatus(task.id, s)}
                                className="text-[10px] px-2 py-1 rounded-md"
                                style={{ background: STATUS_CONFIG[s].color + "22", color: STATUS_CONFIG[s].color }}>
                                → {STATUS_CONFIG[s].label}
                              </button>
                            ))}
                            <button onClick={() => deleteTask(task.id)}
                              className="text-[10px] ml-auto" style={{ color: "#ef4444" }}>✕</button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === "list" && (
        <div className="space-y-2">
          <AnimatePresence>
            {sorted.map((task) => {
              const isExpanded = expandedTask === task.id;
              const subtasks = task.subtasks || [];
              const subtasksDone = subtasks.filter((s) => s.done).length;

              return (
                <motion.div key={task.id} layout
                  initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }}
                  className="card-modern group"
                >

                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => setExpandedTask(isExpanded ? null : task.id)}>
                    {/* Checkbox */}
                    <CircleCheckbox
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      size={24}
                      color={task.completed ? "var(--accent)" : PRIORITY_STYLES[task.priority].color}
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm" style={{
                        color: task.completed ? "var(--text-muted)" : "var(--text-primary)",
                        textDecoration: task.completed ? "line-through" : "none",
                      }}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background: PRIORITY_STYLES[task.priority].bg, color: PRIORITY_STYLES[task.priority].color }}>
                          {task.priority}
                        </span>
                        {task.dueDate && (
                          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                            Due: {new Date(task.dueDate + "T00:00:00").toLocaleDateString()}
                          </span>
                        )}
                        {subtasks.length > 0 && (
                          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                            Subtasks: {subtasksDone}/{subtasks.length}
                          </span>
                        )}
                        <span className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background: STATUS_CONFIG[task.status || "todo"].color + "22", color: STATUS_CONFIG[task.status || "todo"].color }}>
                          {STATUS_CONFIG[task.status || "todo"].label}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {(["Chill", "Important", "URGENT"] as TaskPriority[]).map((p) => (
                        <button key={p} onClick={(e) => { e.stopPropagation(); updateTask(task.id, { priority: p }); }}
                          className="w-2 h-2 rounded-full" style={{ background: PRIORITY_STYLES[p].color, opacity: task.priority === p ? 1 : 0.3 }} />
                      ))}
                      <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                        className="text-xs ml-2" style={{ color: "#ef4444" }}>✕</button>
                    </div>
                  </div>

                  {/* Expanded: Subtasks + Status */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>

                        {/* Status selector */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Status:</span>
                          {kanbanColumns.map((s) => (
                            <button key={s} onClick={() => moveToStatus(task.id, s)}
                              className="text-xs px-2.5 py-1 rounded-lg transition-all"
                              style={{
                                background: (task.status || "todo") === s ? STATUS_CONFIG[s].color + "22" : "var(--bg-primary)",
                                color: (task.status || "todo") === s ? STATUS_CONFIG[s].color : "var(--text-muted)",
                                border: `1px solid ${(task.status || "todo") === s ? STATUS_CONFIG[s].color : "var(--border)"}`,
                              }}>
                              {STATUS_CONFIG[s].icon} {STATUS_CONFIG[s].label}
                            </button>
                          ))}
                        </div>

                        {/* Subtasks */}
                        <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>Subtasks</p>
                        {subtasks.map((st) => (
                          <div key={st.id} className="flex items-center gap-2 mb-1.5">
                            <CircleCheckbox
                              checked={st.done}
                              onChange={() => toggleSubtask(task.id, st.id)}
                              size={16}
                              color="var(--accent)"
                            />
                            <span className="text-xs flex-1" style={{
                              color: st.done ? "var(--text-muted)" : "var(--text-secondary)",
                              textDecoration: st.done ? "line-through" : "none",
                            }}>{st.text}</span>
                            <button onClick={() => deleteSubtask(task.id, st.id)}
                              className="text-[10px]" style={{ color: "#ef4444" }}>✕</button>
                          </div>
                        ))}

                        {/* Add subtask */}
                        <div className="flex gap-2 mt-2">
                          <input
                            type="text"
                            value={subtaskInput}
                            onChange={(e) => setSubtaskInput(e.target.value)}
                            placeholder="Add subtask..."
                            className="flex-1 rounded-lg p-2 text-xs outline-none"
                            style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && subtaskInput.trim()) {
                                addSubtask(task.id, subtaskInput.trim());
                                setSubtaskInput("");
                              }
                            }}
                          />
                          <button
                            onClick={() => {
                              if (subtaskInput.trim()) {
                                addSubtask(task.id, subtaskInput.trim());
                                setSubtaskInput("");
                              }
                            }}
                            className="text-xs px-3 py-1 rounded-lg"
                            style={{ background: "var(--accent)", color: "#000" }}>
                            Add
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {sorted.length === 0 && viewMode === "list" && (
        <motion.div
          className="card-modern p-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-4xl mb-3">🔥</p>
          <p className="font-medium" style={{ color: "var(--text-secondary)" }}>
            {filter === "completed" ? "Nothing completed yet" : "All clear!"}
          </p>
        </motion.div>
      )}
    </div>
  );
}
