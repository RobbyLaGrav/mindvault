"use client";

import { useState } from "react";
import { useStore, Idea, IdeaStatus } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";

const STATUSES: IdeaStatus[] = ["Raw", "Developing", "Shelved", "Launched"];
const STATUS_COLORS: Record<IdeaStatus, string> = {
  Raw: "#3b82f6",
  Developing: "#eab308",
  Shelved: "#888",
  Launched: "#22c55e",
};

export default function SparkPage() {
  const ideas = useStore((s) => s.ideas);
  const addIdea = useStore((s) => s.addIdea);
  const updateIdea = useStore((s) => s.updateIdea);
  const deleteIdea = useStore((s) => s.deleteIdea);
  const promoteIdeaToBusiness = useStore((s) => s.promoteIdeaToBusiness);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("");
  const [statusFilter, setStatusFilter] = useState<IdeaStatus | "All">("All");
  const [editing, setEditing] = useState<Idea | null>(null);

  const visible = ideas.filter((i) => !i.archived && (statusFilter === "All" || i.status === statusFilter));

  const submit = () => {
    if (!title.trim()) return;
    if (editing) {
      updateIdea(editing.id, { title, description: desc, category: category || "General" });
      setEditing(null);
    } else {
      addIdea(title, desc, category || "General");
    }
    setTitle(""); setDesc(""); setCategory(""); setShowForm(false);
  };

  const startEdit = (idea: Idea) => {
    setEditing(idea); setTitle(idea.title); setDesc(idea.description); setCategory(idea.category); setShowForm(true);
  };

  return (
    <div className="max-w-5xl">
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">⚡ Spark</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{ideas.filter((i) => !i.archived).length} ideas</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setTitle(""); setDesc(""); setCategory(""); }}
          className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: "var(--accent)", color: "#000" }}>
          + New Idea
        </button>
      </motion.div>

      {/* Status filter */}
      <div className="flex gap-2 mb-6">
        {(["All", ...STATUSES] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
            style={{
              background: statusFilter === s ? "var(--accent-glow)" : "var(--bg-card)",
              color: statusFilter === s ? "var(--accent)" : "var(--text-secondary)",
              border: `1px solid ${statusFilter === s ? "var(--accent)" : "var(--border)"}`,
            }}>
            {s}
          </button>
        ))}
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
            onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="w-full max-w-lg card-modern"
              onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-4">{editing ? "Edit Idea" : "New Idea"}</h3>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Idea title"
                className="w-full rounded-xl p-3 mb-3 text-sm outline-none"
                style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Describe it..."
                className="w-full rounded-xl p-3 mb-3 text-sm outline-none resize-none"
                style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)", minHeight: "100px" }} />
              <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (e.g. Tech, Health)"
                className="w-full rounded-xl p-3 mb-4 text-sm outline-none"
                style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl text-sm" style={{ color: "var(--text-secondary)", border: "1px solid var(--border)" }}>Cancel</button>
                <button onClick={submit}
                  className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: "var(--accent)", color: "#000" }}>
                  {editing ? "Save" : "Create"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Masonry grid */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
        <AnimatePresence>
          {visible.map((idea) => (
            <motion.div key={idea.id} layout
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              className="break-inside-avoid glass cursor-pointer group rounded-2xl p-5"
              style={{ borderLeft: `3px solid ${idea.color}` }}
              onClick={() => startEdit(idea)}
              whileHover={{ y: -4 }}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm flex-1">{idea.title}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium ml-2"
                  style={{ background: STATUS_COLORS[idea.status] + "22", color: STATUS_COLORS[idea.status] }}>
                  {idea.status}
                </span>
              </div>
              <p className="text-xs mb-3 line-clamp-3" style={{ color: "var(--text-secondary)" }}>{idea.description}</p>

              {/* Heat meter */}
              <div className="flex items-center gap-1 mb-3">
                <span className="text-[10px] mr-1" style={{ color: "var(--text-muted)" }}>Heat:</span>
                {[1, 2, 3, 4, 5].map((h) => (
                  <button key={h} onClick={(e) => { e.stopPropagation(); updateIdea(idea.id, { heat: h }); }}
                    className="w-2 h-2 rounded-full transition-all"
                    style={{
                      background: h <= idea.heat ? "#f97316" : "#333",
                      boxShadow: h <= idea.heat ? "0 0 6px rgba(249,115,22,0.5)" : "none",
                    }} />
                ))}
              </div>

              <div className="flex items-center gap-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
                <span className="px-1.5 py-0.5 rounded" style={{ background: "var(--bg-primary)" }}>{idea.category}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                {STATUSES.map((s) => (
                  <button key={s} onClick={(e) => { e.stopPropagation(); updateIdea(idea.id, { status: s }); }}
                    className="text-[10px] px-2 py-0.5 rounded-md transition-colors"
                    style={{
                      background: idea.status === s ? STATUS_COLORS[s] + "22" : "var(--bg-primary)",
                      color: idea.status === s ? STATUS_COLORS[s] : "var(--text-muted)",
                      border: "1px solid var(--border)",
                    }}>
                    {s}
                  </button>
                ))}
                <button onClick={(e) => { e.stopPropagation(); promoteIdeaToBusiness(idea.id); }}
                  className="text-[10px] px-2 py-0.5 rounded-md ml-auto"
                  style={{ background: "var(--accent-glow)", color: "var(--accent)", border: "1px solid var(--accent)" }}>
                  🏛️ Promote
                </button>
                <button onClick={(e) => { e.stopPropagation(); deleteIdea(idea.id); }}
                  className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ color: "#ef4444" }}>✕</button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {visible.length === 0 && (
        <div className="rounded-2xl p-12 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="text-4xl mb-3">⚡</p>
          <p className="font-medium" style={{ color: "var(--text-secondary)" }}>No ideas here</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Capture your first spark</p>
        </div>
      )}
    </div>
  );
}
