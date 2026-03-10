"use client";

import { useState } from "react";
import { useStore, Note, NOTE_COLORS, NOTE_CATEGORIES, NoteCategory } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import CircleCheckbox from "@/components/ui/CircleCheckbox";

const CATEGORY_ICONS: Record<NoteCategory, string> = {
  General: "📝",
  Personal: "👤",
  Work: "💼",
  Ideas: "💡",
  Journal: "📖",
  Reference: "📚",
};

export default function BrainDumpPage() {
  const notes = useStore((s) => s.notes);
  const addNote = useStore((s) => s.addNote);
  const updateNote = useStore((s) => s.updateNote);
  const deleteNote = useStore((s) => s.deleteNote);
  const addChecklistItem = useStore((s) => s.addChecklistItem);
  const toggleChecklistItem = useStore((s) => s.toggleChecklistItem);
  const deleteChecklistItem = useStore((s) => s.deleteChecklistItem);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [editing, setEditing] = useState<Note | null>(null);
  const [filter, setFilter] = useState<"all" | "pinned" | "starred">("all");
  const [categoryFilter, setCategoryFilter] = useState<NoteCategory | "all">("all");
  const [selectedColor, setSelectedColor] = useState("default");
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory>("General");
  const [checklistInput, setChecklistInput] = useState("");
  const [expandedNote, setExpandedNote] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const visible = notes.filter((n) => {
    if (n.archived) return false;
    if (filter === "pinned") return n.pinned;
    if (filter === "starred") return n.starred;
    if (categoryFilter !== "all" && (n.category || "General") !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q));
    }
    return true;
  });

  const sorted = [...visible].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const submit = () => {
    if (!title.trim()) return;
    const tags = tagInput.split(",").map((t) => t.trim()).filter(Boolean);
    if (editing) {
      updateNote(editing.id, { title, content, tags, category: selectedCategory, color: selectedColor });
      setEditing(null);
    } else {
      addNote(title, content, tags, selectedCategory, selectedColor);
    }
    setTitle("");
    setContent("");
    setTagInput("");
    setSelectedColor("default");
    setSelectedCategory("General");
    setShowForm(false);
  };

  const startEdit = (n: Note) => {
    setEditing(n);
    setTitle(n.title);
    setContent(n.content);
    setTagInput(n.tags.join(", "));
    setSelectedColor(n.color || "default");
    setSelectedCategory((n.category as NoteCategory) || "General");
    setShowForm(true);
  };

  const getNoteColor = (colorKey: string) => {
    return NOTE_COLORS.find((c) => c.key === colorKey)?.color || "var(--bg-card)";
  };

  const categoryStats = NOTE_CATEGORIES.map((cat) => ({
    category: cat,
    count: notes.filter((n) => !n.archived && (n.category || "General") === cat).length,
  })).filter((s) => s.count > 0);

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">🧠 Brain Dump</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {notes.filter((n) => !n.archived).length} notes
          </p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setTitle(""); setContent(""); setTagInput(""); setSelectedColor("default"); setSelectedCategory("General"); }}
          className="px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: "var(--accent)", color: "#000" }}>
          + New Note
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Search notes..."
          className="w-full rounded-xl p-3 text-sm outline-none"
          style={{ background: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(["all", "pinned", "starred"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all capitalize"
            style={{
              background: filter === f ? "var(--accent-glow)" : "var(--bg-card)",
              color: filter === f ? "var(--accent)" : "var(--text-secondary)",
              border: `1px solid ${filter === f ? "var(--accent)" : "var(--border)"}`,
            }}>
            {f === "pinned" ? "📌 Pinned" : f === "starred" ? "⭐ Starred" : "All"}
          </button>
        ))}
        <div className="w-px mx-1" style={{ background: "var(--border)" }} />
        <button onClick={() => setCategoryFilter("all")}
          className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
          style={{
            background: categoryFilter === "all" ? "var(--accent-glow)" : "var(--bg-card)",
            color: categoryFilter === "all" ? "var(--accent)" : "var(--text-secondary)",
            border: `1px solid ${categoryFilter === "all" ? "var(--accent)" : "var(--border)"}`,
          }}>
          All Categories
        </button>
        {categoryStats.map((s) => (
          <button key={s.category} onClick={() => setCategoryFilter(s.category)}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
            style={{
              background: categoryFilter === s.category ? "var(--accent-glow)" : "var(--bg-card)",
              color: categoryFilter === s.category ? "var(--accent)" : "var(--text-secondary)",
              border: `1px solid ${categoryFilter === s.category ? "var(--accent)" : "var(--border)"}`,
            }}>
            {CATEGORY_ICONS[s.category]} {s.category} ({s.count})
          </button>
        ))}
      </div>

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
            onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl p-6 max-h-[85vh] overflow-y-auto"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
              onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-4">{editing ? "Edit Note" : "New Note"}</h3>

              {/* Category selector */}
              <div className="mb-3">
                <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>Category</p>
                <div className="flex gap-1.5 flex-wrap">
                  {NOTE_CATEGORIES.map((cat) => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)}
                      className="text-xs px-2.5 py-1.5 rounded-lg transition-all"
                      style={{
                        background: selectedCategory === cat ? "var(--accent-glow)" : "var(--bg-card)",
                        color: selectedCategory === cat ? "var(--accent)" : "var(--text-secondary)",
                        border: `1px solid ${selectedCategory === cat ? "var(--accent)" : "var(--border)"}`,
                      }}>
                      {CATEGORY_ICONS[cat]} {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color selector */}
              <div className="mb-3">
                <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>Color</p>
                <div className="flex gap-2">
                  {NOTE_COLORS.map((c) => (
                    <button key={c.key} onClick={() => setSelectedColor(c.key)}
                      className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                      style={{
                        background: c.key === "default" ? "var(--bg-card)" : c.color,
                        border: `2px solid ${selectedColor === c.key ? "var(--accent)" : "var(--border)"}`,
                      }}
                      title={c.label} />
                  ))}
                </div>
              </div>

              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" autoFocus
                className="w-full rounded-xl p-3 mb-3 text-sm outline-none"
                style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
              <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your thoughts..."
                className="w-full rounded-xl p-3 mb-3 text-sm outline-none resize-none"
                style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)", minHeight: "150px" }} />
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Tags (comma separated)"
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

      {/* Notes grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {sorted.map((note) => {
            const isExpanded = expandedNote === note.id;
            const noteColor = getNoteColor(note.color || "default");
            const checklist = note.checklist || [];
            const checklistDone = checklist.filter((c) => c.done).length;

            return (
              <motion.div key={note.id} layout
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-2xl p-5 cursor-pointer group flex flex-col"
                style={{ background: noteColor, border: "1px solid var(--border)" }}
                onClick={() => setExpandedNote(isExpanded ? null : note.id)}>

                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-xs">{CATEGORY_ICONS[(note.category as NoteCategory) || "General"]}</span>
                    <h3 className="font-semibold text-sm truncate flex-1">{note.title}</h3>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); updateNote(note.id, { pinned: !note.pinned }); }}
                      className="text-xs p-1 rounded" style={{ color: note.pinned ? "var(--accent)" : "var(--text-muted)" }}>📌</button>
                    <button onClick={(e) => { e.stopPropagation(); updateNote(note.id, { starred: !note.starred }); }}
                      className="text-xs p-1 rounded" style={{ color: note.starred ? "#eab308" : "var(--text-muted)" }}>⭐</button>
                    <button onClick={(e) => { e.stopPropagation(); startEdit(note); }}
                      className="text-xs p-1 rounded" style={{ color: "var(--text-muted)" }}>✏️</button>
                    <button onClick={(e) => { e.stopPropagation(); updateNote(note.id, { archived: true }); }}
                      className="text-xs p-1 rounded" style={{ color: "var(--text-muted)" }}>📦</button>
                    <button onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                      className="text-xs p-1 rounded" style={{ color: "#ef4444" }}>✕</button>
                  </div>
                </div>

                {/* Content preview */}
                <p className={`text-xs mb-3 ${isExpanded ? "whitespace-pre-wrap" : "line-clamp-3"}`} style={{ color: "var(--text-secondary)" }}>
                  {note.content}
                </p>

                {/* Checklist */}
                {checklist.length > 0 && (
                  <div className="mb-3">
                    {isExpanded ? (
                      <div className="flex flex-col gap-1.5">
                        {checklist.map((item) => (
                          <div key={item.id} className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <CircleCheckbox
                              checked={item.done}
                              onChange={() => toggleChecklistItem(note.id, item.id)}
                              size={18}
                              color="var(--accent)"
                            />
                            <span className="text-xs flex-1" style={{
                              color: item.done ? "var(--text-muted)" : "var(--text-secondary)",
                              textDecoration: item.done ? "line-through" : "none",
                            }}>{item.text}</span>
                            <button onClick={() => deleteChecklistItem(note.id, item.id)}
                              className="text-[10px] opacity-0 group-hover:opacity-100" style={{ color: "#ef4444" }}>✕</button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ background: "var(--bg-primary)" }}>
                          <div className="h-full rounded-full" style={{
                            background: "var(--accent)",
                            width: `${checklist.length > 0 ? (checklistDone / checklist.length) * 100 : 0}%`,
                          }} />
                        </div>
                        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                          {checklistDone}/{checklist.length}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Add checklist item (expanded) */}
                {isExpanded && (
                  <div className="mb-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={checklistInput}
                        onChange={(e) => setChecklistInput(e.target.value)}
                        placeholder="Add checklist item..."
                        className="flex-1 rounded-lg p-2 text-xs outline-none"
                        style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && checklistInput.trim()) {
                            addChecklistItem(note.id, checklistInput.trim());
                            setChecklistInput("");
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (checklistInput.trim()) {
                            addChecklistItem(note.id, checklistInput.trim());
                            setChecklistInput("");
                          }
                        }}
                        className="text-xs px-3 py-1 rounded-lg"
                        style={{ background: "var(--accent)", color: "#000" }}>
                        +
                      </button>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {note.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-auto">
                    {note.tags.map((tag) => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md"
                        style={{ background: "var(--bg-primary)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: "var(--text-muted)" }}>
                    {(note.category as string) || "General"}
                  </span>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {sorted.length === 0 && (
        <div className="rounded-2xl p-12 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="text-4xl mb-3">🧠</p>
          <p className="font-medium" style={{ color: "var(--text-secondary)" }}>No notes yet</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Start dumping your brain</p>
        </div>
      )}
    </div>
  );
}
