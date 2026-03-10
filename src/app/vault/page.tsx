"use client";

import { useState } from "react";
import { useStore, VaultNote } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";

export default function VaultPage() {
  const vaultNotes = useStore((s) => s.vaultNotes);
  const addVaultNote = useStore((s) => s.addVaultNote);
  const updateVaultNote = useStore((s) => s.updateVaultNote);
  const deleteVaultNote = useStore((s) => s.deleteVaultNote);
  const vaultPin = useStore((s) => s.vaultPin);
  const vaultUnlocked = useStore((s) => s.vaultUnlocked);
  const setVaultPin = useStore((s) => s.setVaultPin);
  const unlockVault = useStore((s) => s.unlockVault);
  const lockVault = useStore((s) => s.lockVault);

  const [pinInput, setPinInput] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editing, setEditing] = useState<VaultNote | null>(null);
  const [error, setError] = useState("");

  const handleUnlock = () => {
    if (!vaultPin) {
      setVaultPin(pinInput);
      unlockVault();
      setPinInput("");
    } else if (pinInput === vaultPin) {
      unlockVault();
      setPinInput("");
      setError("");
    } else {
      setError("Wrong PIN");
      setPinInput("");
    }
  };

  const submit = () => {
    if (!title.trim()) return;
    if (editing) {
      updateVaultNote(editing.id, { title, content });
      setEditing(null);
    } else {
      addVaultNote(title, content);
    }
    setTitle(""); setContent(""); setShowForm(false);
  };

  const startEdit = (n: VaultNote) => {
    setEditing(n); setTitle(n.title); setContent(n.content); setShowForm(true);
  };

  if (!vaultUnlocked) {
    return (
      <div className="max-w-sm mx-auto mt-32 text-center">
        <p className="text-6xl mb-6">🔒</p>
        <h1 className="text-2xl font-bold mb-2">Vault</h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          {vaultPin ? "Enter your PIN to unlock" : "Set a PIN to protect your vault"}
        </p>
        <input type="password" value={pinInput} onChange={(e) => setPinInput(e.target.value)}
          placeholder={vaultPin ? "Enter PIN" : "Set a new PIN"}
          className="w-full rounded-xl p-3 mb-3 text-center text-lg tracking-[0.5em] outline-none"
          style={{ background: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
          onKeyDown={(e) => e.key === "Enter" && handleUnlock()} />
        {error && <p className="text-xs mb-3" style={{ color: "#ef4444" }}>{error}</p>}
        <button onClick={handleUnlock}
          className="w-full px-4 py-3 rounded-xl text-sm font-semibold"
          style={{ background: "var(--accent)", color: "#000" }}>
          {vaultPin ? "Unlock" : "Set PIN & Enter"}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <motion.div className="flex items-center justify-between mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">🔒 Vault</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{vaultNotes.length} secured notes</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => lockVault()}
            className="px-3 py-2 rounded-xl text-xs" style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            Lock
          </button>
          <button onClick={() => { setShowForm(true); setEditing(null); setTitle(""); setContent(""); }}
            className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: "var(--accent)", color: "#000" }}>
            + New
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
            onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="w-full max-w-lg card-modern"
              onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-4">{editing ? "Edit" : "New Secured Note"}</h3>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" autoFocus
                className="w-full rounded-xl p-3 mb-3 text-sm outline-none"
                style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
              <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content..."
                className="w-full rounded-xl p-3 mb-4 text-sm outline-none resize-none"
                style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)", minHeight: "150px" }} />
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

      <div className="space-y-3">
        {vaultNotes.map((note) => (
          <motion.div key={note.id} layout className="card-modern cursor-pointer group" onClick={() => startEdit(note)} whileHover={{ y: -4 }}>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-1">{note.title}</h3>
                <p className="text-xs line-clamp-2" style={{ color: "var(--text-secondary)" }}>{note.content}</p>
                <p className="text-[10px] mt-2" style={{ color: "var(--text-muted)" }}>
                  {new Date(note.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); deleteVaultNote(note.id); }}
                className="text-xs opacity-0 group-hover:opacity-100 transition-opacity ml-2" style={{ color: "#ef4444" }}>✕</button>
            </div>
          </motion.div>
        ))}
      </div>

      {vaultNotes.length === 0 && (
        <motion.div className="card-modern p-12 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-4xl mb-3">🔐</p>
          <p className="font-medium" style={{ color: "var(--text-secondary)" }}>Vault is empty</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Store your private notes securely</p>
        </motion.div>
      )}
    </div>
  );
}
