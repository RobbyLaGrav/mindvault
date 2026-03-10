"use client";

import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import CircleCheckbox from "@/components/ui/CircleCheckbox";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getDaysInMonth(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  return days;
}

function dateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function CalendarPage() {
  const tasks = useStore((s) => s.tasks);
  const toggleTask = useStore((s) => s.toggleTask);
  const habits = useStore((s) => s.habits);
  const goals = useStore((s) => s.goals);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(new Date().toISOString().split("T")[0]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date().toISOString().split("T")[0];

  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, typeof tasks> = {};
    tasks.forEach((t) => {
      if (t.dueDate) {
        if (!map[t.dueDate]) map[t.dueDate] = [];
        map[t.dueDate].push(t);
      }
    });
    return map;
  }, [tasks]);

  const selectedTasks = selectedDate ? (tasksByDate[selectedDate] || []) : [];
  const selectedHabits = selectedDate ? habits.map((h) => ({
    ...h,
    completed: h.completedDates.includes(selectedDate),
  })) : [];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  const priorityColor = (p: string) => p === "URGENT" ? "#ef4444" : p === "Important" ? "#eab308" : "#22c55e";

  return (
    <div className="max-w-6xl">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          📅 Calendar
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          View your tasks and schedule at a glance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-5">
              <button onClick={prevMonth} className="px-3 py-1.5 rounded-lg text-sm"
                style={{ color: "var(--text-secondary)", background: "var(--bg-primary)" }}>
                ←
              </button>
              <div className="text-center">
                <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                  {MONTHS[month]} {year}
                </h2>
              </div>
              <div className="flex gap-2">
                <button onClick={goToday} className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ color: "var(--accent)", background: "var(--accent-glow)" }}>
                  Today
                </button>
                <button onClick={nextMonth} className="px-3 py-1.5 rounded-lg text-sm"
                  style={{ color: "var(--text-secondary)", background: "var(--bg-primary)" }}>
                  →
                </button>
              </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-xs font-medium py-2" style={{ color: "var(--text-muted)" }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, i) => {
                if (day === null) return <div key={`empty-${i}`} className="aspect-square" />;

                const ds = dateStr(year, month, day);
                const isToday = ds === today;
                const isSelected = ds === selectedDate;
                const dayTasks = tasksByDate[ds] || [];
                const hasUrgent = dayTasks.some((t) => t.priority === "URGENT" && !t.completed);
                const hasImportant = dayTasks.some((t) => t.priority === "Important" && !t.completed);
                const incompleteTasks = dayTasks.filter((t) => !t.completed);

                return (
                  <button
                    key={ds}
                    onClick={() => setSelectedDate(ds)}
                    className="aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all"
                    style={{
                      background: isSelected ? "var(--accent-glow)" : isToday ? "var(--bg-primary)" : "transparent",
                      border: isSelected ? "1px solid var(--accent)" : isToday ? "1px solid var(--border)" : "1px solid transparent",
                    }}
                  >
                    <span className="text-sm font-medium" style={{
                      color: isSelected ? "var(--accent)" : isToday ? "var(--text-primary)" : "var(--text-secondary)",
                    }}>
                      {day}
                    </span>

                    {/* Task indicators */}
                    {incompleteTasks.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {hasUrgent && <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#ef4444" }} />}
                        {hasImportant && <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#eab308" }} />}
                        {incompleteTasks.length > 0 && !hasUrgent && !hasImportant && (
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#22c55e" }} />
                        )}
                        {incompleteTasks.length > 2 && (
                          <span className="text-[8px]" style={{ color: "var(--text-muted)" }}>+{incompleteTasks.length - 1}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: "#ef4444" }} />
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Urgent</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: "#eab308" }} />
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Important</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: "#22c55e" }} />
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Chill</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="flex flex-col gap-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDate}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              {/* Selected Date Header */}
              <div className="rounded-2xl p-5 mb-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <h3 className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                  {selectedDate === today ? "Today" : selectedDate
                    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
                    : "Select a date"}
                </h3>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {selectedTasks.length} task{selectedTasks.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Tasks for selected date */}
              <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <h4 className="section-label mb-3">Tasks</h4>
                {selectedTasks.length === 0 ? (
                  <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>
                    No tasks for this date
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {selectedTasks.map((t) => (
                      <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: "var(--bg-primary)" }}>
                        <CircleCheckbox
                          checked={t.completed}
                          onChange={() => toggleTask(t.id)}
                          size={18}
                          color={t.completed ? "var(--text-muted)" : priorityColor(t.priority)}
                        />
                        <span className="text-sm flex-1 truncate" style={{
                          color: t.completed ? "var(--text-muted)" : "var(--text-primary)",
                          textDecoration: t.completed ? "line-through" : "none",
                        }}>
                          {t.title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                          style={{ color: priorityColor(t.priority) }}>
                          {t.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Habits for selected date */}
              {selectedHabits.length > 0 && (
                <div className="rounded-2xl p-5 mt-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  <h4 className="section-label mb-3">Habits</h4>
                  <div className="flex flex-col gap-2">
                    {selectedHabits.map((h) => (
                      <div key={h.id} className="flex items-center gap-3 p-2">
                        <CircleCheckbox
                          checked={h.completed}
                          onChange={() => {}}
                          size={18}
                          color={h.color}
                          disabled
                        />
                        <span className="text-sm" style={{ color: h.completed ? "var(--text-muted)" : "var(--text-primary)" }}>
                          {h.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
