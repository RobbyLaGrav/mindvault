"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";

type ResultType = "Note" | "Idea" | "Business" | "Task" | "Goal" | "Habit" | "Navigate" | "Action";

interface SearchResult {
  type: ResultType;
  title: string;
  subtitle?: string;
  href: string;
  icon: string;
  priority?: number;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [activeFilter, setActiveFilter] = useState<ResultType | "all">("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const notes = useStore((s) => s.notes);
  const ideas = useStore((s) => s.ideas);
  const businessIdeas = useStore((s) => s.businessIdeas);
  const tasks = useStore((s) => s.tasks);
  const goals = useStore((s) => s.goals);
  const habits = useStore((s) => s.habits);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIdx(0);
      setActiveFilter("all");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const results = useMemo(() => {
    const items: SearchResult[] = [];
    const q = query.toLowerCase().trim();

    if (!q) {
      // Show quick actions when no query
      items.push(
        { type: "Action", title: "New Task", subtitle: "Create a new task", href: "/firelist", icon: "🔥" },
        { type: "Action", title: "New Note", subtitle: "Write a new note", href: "/braindump", icon: "🧠" },
        { type: "Action", title: "New Idea", subtitle: "Capture an idea", href: "/spark", icon: "⚡" },
        { type: "Action", title: "New Goal", subtitle: "Set a new goal", href: "/goals", icon: "🎯" },
      );

      // Show overdue tasks
      const today = new Date().toISOString().split("T")[0];
      tasks.filter((t) => !t.completed && t.dueDate && t.dueDate < today)
        .slice(0, 3)
        .forEach((t) => items.push({ type: "Task", title: t.title, subtitle: `Overdue: ${t.dueDate}`, href: "/firelist", icon: "🔴", priority: 0 }));

      // Nav shortcuts
      const navItems = [
        { label: "Dashboard", href: "/", icon: "🏠" },
        { label: "Fire List", href: "/firelist", icon: "🔥" },
        { label: "Brain Dump", href: "/braindump", icon: "🧠" },
        { label: "Spark / Ideas", href: "/spark", icon: "⚡" },
        { label: "Empire / Business", href: "/empire", icon: "🏛️" },
        { label: "Rituals / Habits", href: "/rituals", icon: "🔁" },
        { label: "Goals", href: "/goals", icon: "🎯" },
        { label: "Calendar", href: "/calendar", icon: "📅" },
        { label: "Vault", href: "/vault", icon: "🔒" },
        { label: "Stats", href: "/stats", icon: "📊" },
        { label: "Settings", href: "/settings", icon: "⚙️" },
      ];
      navItems.forEach((n) => items.push({ type: "Navigate", title: n.label, href: n.href, icon: n.icon }));
      return items;
    }

    // Search through everything
    notes.filter((n) => !n.archived && (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags.some((t) => t.toLowerCase().includes(q))))
      .slice(0, 5).forEach((n) => items.push({
        type: "Note",
        title: n.title,
        subtitle: n.content.slice(0, 60) + (n.content.length > 60 ? "..." : ""),
        href: "/braindump",
        icon: "🧠",
      }));

    ideas.filter((i) => !i.archived && (i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)))
      .slice(0, 5).forEach((i) => items.push({
        type: "Idea",
        title: i.title,
        subtitle: `${i.status} - Heat: ${i.heat}/5`,
        href: "/spark",
        icon: "⚡",
      }));

    businessIdeas.filter((b) => b.title.toLowerCase().includes(q) || b.problem.toLowerCase().includes(q))
      .slice(0, 5).forEach((b) => items.push({
        type: "Business",
        title: b.title,
        subtitle: `${b.stage} - Viability: ${b.viability}/10`,
        href: "/empire",
        icon: "🏛️",
      }));

    tasks.filter((t) => t.title.toLowerCase().includes(q) || (t.content && t.content.toLowerCase().includes(q)))
      .slice(0, 5).forEach((t) => items.push({
        type: "Task",
        title: t.title,
        subtitle: `${t.priority}${t.completed ? " ✅" : ""}${t.dueDate ? ` - Due: ${t.dueDate}` : ""}`,
        href: "/firelist",
        icon: t.completed ? "✅" : "🔥",
      }));

    goals.filter((g) => g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q))
      .slice(0, 5).forEach((g) => items.push({
        type: "Goal",
        title: g.title,
        subtitle: `${g.progress}% - ${g.type}`,
        href: "/goals",
        icon: "🎯",
      }));

    habits.filter((h) => h.name.toLowerCase().includes(q))
      .slice(0, 5).forEach((h) => items.push({
        type: "Habit",
        title: h.name,
        subtitle: `${h.frequency} - ${h.completedDates.length} completions`,
        href: "/rituals",
        icon: "🔁",
      }));

    // Nav shortcuts
    const navItems = [
      { label: "Dashboard", href: "/", icon: "🏠" },
      { label: "Fire List / Tasks", href: "/firelist", icon: "🔥" },
      { label: "Brain Dump / Notes", href: "/braindump", icon: "🧠" },
      { label: "Spark / Ideas", href: "/spark", icon: "⚡" },
      { label: "Empire / Business", href: "/empire", icon: "🏛️" },
      { label: "Rituals / Habits", href: "/rituals", icon: "🔁" },
      { label: "Goals", href: "/goals", icon: "🎯" },
      { label: "Calendar", href: "/calendar", icon: "📅" },
      { label: "Vault", href: "/vault", icon: "🔒" },
      { label: "Stats", href: "/stats", icon: "📊" },
      { label: "Settings", href: "/settings", icon: "⚙️" },
    ];
    navItems
      .filter((n) => n.label.toLowerCase().includes(q))
      .forEach((n) => items.push({ type: "Navigate", title: n.label, href: n.href, icon: n.icon }));

    return items;
  }, [query, notes, ideas, businessIdeas, tasks, goals, habits]);

  const filteredResults = activeFilter === "all" ? results : results.filter((r) => r.type === activeFilter);
  const availableTypes = [...new Set(results.map((r) => r.type))];

  const go = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((prev) => Math.min(prev + 1, filteredResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && filteredResults[selectedIdx]) {
      go(filteredResults[selectedIdx].href);
    }
  };

  useEffect(() => {
    setSelectedIdx(0);
  }, [query, activeFilter]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh]"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="w-[600px] max-w-[90vw] rounded-2xl overflow-hidden"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <span style={{ color: "var(--text-muted)" }}>🔍</span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search everything... (tasks, notes, ideas, goals)"
                className="flex-1 bg-transparent outline-none text-base"
                style={{ color: "var(--text-primary)" }}
              />
              <kbd className="text-xs px-2 py-1 rounded-md" style={{ background: "var(--bg-card)", color: "var(--text-muted)" }}>ESC</kbd>
            </div>

            {/* Type filters */}
            {query && availableTypes.length > 1 && (
              <div className="flex gap-1.5 px-4 py-2 border-b overflow-x-auto" style={{ borderColor: "var(--border)" }}>
                <button onClick={() => setActiveFilter("all")}
                  className="text-[10px] px-2.5 py-1 rounded-lg shrink-0 font-medium"
                  style={{
                    background: activeFilter === "all" ? "var(--accent-glow)" : "var(--bg-card)",
                    color: activeFilter === "all" ? "var(--accent)" : "var(--text-muted)",
                  }}>
                  All ({results.length})
                </button>
                {availableTypes.map((type) => {
                  const count = results.filter((r) => r.type === type).length;
                  return (
                    <button key={type} onClick={() => setActiveFilter(type)}
                      className="text-[10px] px-2.5 py-1 rounded-lg shrink-0 font-medium"
                      style={{
                        background: activeFilter === type ? "var(--accent-glow)" : "var(--bg-card)",
                        color: activeFilter === type ? "var(--accent)" : "var(--text-muted)",
                      }}>
                      {type} ({count})
                    </button>
                  );
                })}
              </div>
            )}

            {/* Results */}
            {filteredResults.length > 0 && (
              <div className="max-h-[50vh] overflow-y-auto p-2">
                {filteredResults.map((r, i) => (
                  <button
                    key={`${r.type}-${r.title}-${i}`}
                    onClick={() => go(r.href)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors"
                    style={{
                      color: "var(--text-primary)",
                      background: i === selectedIdx ? "var(--bg-card)" : "transparent",
                    }}
                    onMouseEnter={() => setSelectedIdx(i)}
                  >
                    <span className="text-base">{r.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{r.title}</p>
                      {r.subtitle && (
                        <p className="text-[10px] truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
                          {r.subtitle}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md shrink-0" style={{ background: "var(--bg-card)", color: "var(--text-muted)" }}>
                      {r.type}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {query && filteredResults.length === 0 && (
              <div className="p-8 text-center" style={{ color: "var(--text-muted)" }}>
                No results found for &quot;{query}&quot;
              </div>
            )}

            {/* Footer */}
            <div className="px-4 py-2 border-t flex items-center gap-4" style={{ borderColor: "var(--border)" }}>
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                <kbd className="px-1.5 py-0.5 rounded" style={{ background: "var(--bg-card)" }}>↑↓</kbd> Navigate
              </span>
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                <kbd className="px-1.5 py-0.5 rounded" style={{ background: "var(--bg-card)" }}>Enter</kbd> Open
              </span>
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                <kbd className="px-1.5 py-0.5 rounded" style={{ background: "var(--bg-card)" }}>Esc</kbd> Close
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
