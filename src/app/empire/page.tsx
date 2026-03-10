"use client";

import { useState } from "react";
import { useStore, BusinessIdea, BusinessStage } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";

const STAGES: BusinessStage[] = ["Concept", "Validating", "Building", "Live"];
const STAGE_COLORS: Record<BusinessStage, string> = {
  Concept: "#3b82f6",
  Validating: "#eab308",
  Building: "#f97316",
  Live: "#22c55e",
};

export default function EmpirePage() {
  const businessIdeas = useStore((s) => s.businessIdeas);
  const addBusinessIdea = useStore((s) => s.addBusinessIdea);
  const updateBusinessIdea = useStore((s) => s.updateBusinessIdea);
  const deleteBusinessIdea = useStore((s) => s.deleteBusinessIdea);

  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [view, setView] = useState<"board" | "list">("board");

  const create = () => {
    if (!newTitle.trim()) return;
    addBusinessIdea(newTitle);
    setNewTitle("");
    setShowForm(false);
  };

  const boardView = (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {STAGES.map((stage) => {
        const items = businessIdeas.filter((b) => b.stage === stage);
        return (
          <div key={stage}>
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-2 h-2 rounded-full" style={{ background: STAGE_COLORS[stage] }} />
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                {stage}
              </h3>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{items.length}</span>
            </div>
            <div className="space-y-3">
              {items.map((biz) => (
                <motion.div key={biz.id} layout
                  className="rounded-xl p-4 cursor-pointer group glass"
                  onClick={() => setExpanded(expanded === biz.id ? null : biz.id)}
                  whileHover={{ y: -2 }}
                >
                  <h4 className="text-sm font-medium mb-1">{biz.title}</h4>
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Viability:</span>
                    <div className="flex gap-0.5">
                      {[...Array(10)].map((_, i) => (
                        <div key={i} className="w-1.5 h-3 rounded-sm cursor-pointer"
                          style={{ background: i < biz.viability ? "var(--accent)" : "#333" }}
                          onClick={(e) => { e.stopPropagation(); updateBusinessIdea(biz.id, { viability: i + 1 }); }} />
                      ))}
                    </div>
                  </div>
                  <AnimatePresence>
                    {expanded === biz.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                        <div className="pt-3 space-y-2 text-xs border-t" style={{ borderColor: "var(--border)" }}>
                          <EditField label="Problem" value={biz.problem}
                            onChange={(v) => updateBusinessIdea(biz.id, { problem: v })} />
                          <EditField label="Audience" value={biz.audience}
                            onChange={(v) => updateBusinessIdea(biz.id, { audience: v })} />
                          <EditField label="Revenue Model" value={biz.revenue}
                            onChange={(v) => updateBusinessIdea(biz.id, { revenue: v })} />
                          <EditField label="Resources" value={biz.resources}
                            onChange={(v) => updateBusinessIdea(biz.id, { resources: v })} />
                          <div>
                            <p className="text-[10px] mb-1 font-medium" style={{ color: "var(--text-muted)" }}>Next 3 Steps:</p>
                            {biz.nextSteps.map((step, i) => (
                              <input key={i} type="text" value={step}
                                onChange={(e) => {
                                  const steps = [...biz.nextSteps];
                                  steps[i] = e.target.value;
                                  updateBusinessIdea(biz.id, { nextSteps: steps });
                                }}
                                placeholder={`Step ${i + 1}`}
                                className="w-full rounded-lg p-2 mb-1 text-xs outline-none"
                                style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                                onClick={(e) => e.stopPropagation()} />
                            ))}
                          </div>
                          <div className="flex gap-1 pt-2">
                            {STAGES.map((s) => (
                              <button key={s}
                                onClick={(e) => { e.stopPropagation(); updateBusinessIdea(biz.id, { stage: s }); }}
                                className="text-[10px] px-2 py-1 rounded-md"
                                style={{
                                  background: biz.stage === s ? STAGE_COLORS[s] + "22" : "var(--bg-primary)",
                                  color: biz.stage === s ? STAGE_COLORS[s] : "var(--text-muted)",
                                  border: "1px solid var(--border)",
                                }}>
                                {s}
                              </button>
                            ))}
                            <button onClick={(e) => { e.stopPropagation(); deleteBusinessIdea(biz.id); }}
                              className="text-[10px] px-2 py-1 rounded-md ml-auto" style={{ color: "#ef4444" }}>Delete</button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="max-w-6xl">
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">🏛️ Empire</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{businessIdeas.length} business ideas</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView(view === "board" ? "list" : "board")}
            className="px-3 py-2 rounded-xl text-xs" style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            {view === "board" ? "List" : "Board"}
          </button>
          <button onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: "var(--accent)", color: "#000" }}>
            + New
          </button>
        </div>
      </motion.div>

      {/* Quick add */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
            onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="w-full max-w-md card-modern"
              onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-4">New Business Idea</h3>
              <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="What's the idea?"
                autoFocus
                className="w-full rounded-xl p-3 mb-4 text-sm outline-none"
                style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                onKeyDown={(e) => e.key === "Enter" && create()} />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl text-sm" style={{ color: "var(--text-secondary)", border: "1px solid var(--border)" }}>Cancel</button>
                <button onClick={create}
                  className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: "var(--accent)", color: "#000" }}>Create</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {boardView}

      {businessIdeas.length === 0 && (
        <motion.div className="card-modern p-12 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-4xl mb-3">🏛️</p>
          <p className="font-medium" style={{ color: "var(--text-secondary)" }}>No business ideas yet</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Build your empire</p>
        </motion.div>
      )}
    </div>
  );
}

function EditField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="text-[10px] mb-1 font-medium" style={{ color: "var(--text-muted)" }}>{label}:</p>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter ${label.toLowerCase()}...`}
        className="w-full rounded-lg p-2 text-xs outline-none"
        style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()} />
    </div>
  );
}
