"use client";

import { useState } from "react";
import { useStore, AccentColor } from "@/store/useStore";
import { useAuthStore } from "@/store/useAuthStore";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/Toast";

const ACCENTS: { key: AccentColor; color: string; label: string }[] = [
  { key: "green", color: "#22c55e", label: "Green" },
  { key: "blue", color: "#3b82f6", label: "Blue" },
  { key: "coral", color: "#f97316", label: "Coral" },
  { key: "purple", color: "#a855f7", label: "Purple" },
  { key: "amber", color: "#eab308", label: "Amber" },
  { key: "rose", color: "#f43f5e", label: "Rose" },
  { key: "cyan", color: "#06b6d4", label: "Cyan" },
];

export default function SettingsPage() {
  const [tab, setTab] = useState<"appearance" | "account" | "notifications" | "data">("appearance");
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const accentColor = useStore((s) => s.accentColor);
  const setAccentColor = useStore((s) => s.setAccentColor);
  const themeMode = useStore((s) => s.themeMode);
  const setThemeMode = useStore((s) => s.setThemeMode);
  const fontSize = useStore((s) => s.fontSize);
  const setFontSize = useStore((s) => s.setFontSize);
  const fontFamily = useStore((s) => s.fontFamily);
  const setFontFamily = useStore((s) => s.setFontFamily);
  const spacing = useStore((s) => s.spacing);
  const setSpacing = useStore((s) => s.setSpacing);

  // Account form
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    const updates: Record<string, string> = {};
    if (name !== user?.name) updates.name = name;
    if (email !== user?.email) updates.email = email;
    if (newPassword) {
      updates.currentPassword = currentPassword;
      updates.newPassword = newPassword;
    }
    const result = await updateProfile(updates);
    if (result.error) {
      toast(result.error, "error");
    } else {
      toast("Profile updated", "success");
      setCurrentPassword("");
      setNewPassword("");
    }
    setSaving(false);
  };

  const tabs = [
    { key: "appearance" as const, label: "Appearance", icon: "🎨" },
    { key: "account" as const, label: "Account", icon: "👤" },
    { key: "notifications" as const, label: "Notifications", icon: "🔔" },
    { key: "data" as const, label: "Data", icon: "💾" },
  ];

  return (
    <div className="max-w-4xl">
      <motion.div className="mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          ⚙️ Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Customize your MindVault experience
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: "var(--bg-card)" }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5"
            style={{
              background: tab === t.key ? "var(--accent-glow)" : "transparent",
              color: tab === t.key ? "var(--text-primary)" : "var(--text-muted)",
              border: tab === t.key ? "1px solid var(--border)" : "1px solid transparent",
            }}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Appearance Tab */}
      {tab === "appearance" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
          {/* Theme Mode */}
          <div className="card-modern">
            <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Theme Mode</h3>
            <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>Choose between dark, light, or system preference</p>
            <div className="flex gap-3">
              {(["dark", "light", "system"] as const).map((mode) => (
                <button key={mode} onClick={() => setThemeMode(mode)}
                  className="flex-1 p-4 rounded-xl text-center transition-all"
                  style={{
                    background: themeMode === mode ? "var(--accent-glow)" : "var(--bg-primary)",
                    border: themeMode === mode ? "2px solid var(--accent)" : "2px solid var(--border)",
                  }}>
                  <span className="text-2xl block mb-2">{mode === "dark" ? "🌙" : mode === "light" ? "☀️" : "💻"}</span>
                  <span className="text-sm font-medium" style={{ color: themeMode === mode ? "var(--text-primary)" : "var(--text-secondary)" }}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Accent Color */}
          <div className="card-modern">
            <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Accent Color</h3>
            <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>Personalize the accent color throughout the app</p>
            <div className="grid grid-cols-7 gap-3">
              {ACCENTS.map((a) => (
                <button key={a.key} onClick={() => setAccentColor(a.key)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all"
                  style={{
                    background: accentColor === a.key ? "var(--accent-glow)" : "transparent",
                    border: accentColor === a.key ? `2px solid ${a.color}` : "2px solid transparent",
                  }}>
                  <div className="w-8 h-8 rounded-full" style={{ background: a.color }} />
                  <span className="text-[10px] font-medium" style={{ color: accentColor === a.key ? a.color : "var(--text-muted)" }}>
                    {a.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div className="card-modern">
            <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Typography</h3>
            <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>Adjust font size and family</p>

            <div className="mb-4">
              <label className="text-xs font-medium mb-2 block" style={{ color: "var(--text-secondary)" }}>Font Size</label>
              <div className="flex gap-2">
                {(["small", "normal", "large"] as const).map((s) => (
                  <button key={s} onClick={() => setFontSize(s)}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: fontSize === s ? "var(--accent-glow)" : "var(--bg-primary)",
                      border: fontSize === s ? "1px solid var(--accent)" : "1px solid var(--border)",
                      color: fontSize === s ? "var(--text-primary)" : "var(--text-secondary)",
                      fontSize: s === "small" ? "13px" : s === "large" ? "17px" : "15px",
                    }}>
                    {s === "small" ? "A" : s === "large" ? "A" : "A"} {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-medium mb-2 block" style={{ color: "var(--text-secondary)" }}>Font Family</label>
              <div className="flex gap-2">
                {(["system", "serif", "mono"] as const).map((f) => (
                  <button key={f} onClick={() => setFontFamily(f)}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: fontFamily === f ? "var(--accent-glow)" : "var(--bg-primary)",
                      border: fontFamily === f ? "1px solid var(--accent)" : "1px solid var(--border)",
                      color: fontFamily === f ? "var(--text-primary)" : "var(--text-secondary)",
                      fontFamily: f === "serif" ? "Georgia, serif" : f === "mono" ? "monospace" : "system-ui",
                    }}>
                    {f === "system" ? "Sans" : f === "serif" ? "Serif" : "Mono"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: "var(--text-secondary)" }}>Spacing</label>
              <div className="flex gap-2">
                {(["compact", "normal", "spacious"] as const).map((s) => (
                  <button key={s} onClick={() => setSpacing(s)}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: spacing === s ? "var(--accent-glow)" : "var(--bg-primary)",
                      border: spacing === s ? "1px solid var(--accent)" : "1px solid var(--border)",
                      color: spacing === s ? "var(--text-primary)" : "var(--text-secondary)",
                    }}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Account Tab */}
      {tab === "account" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
          {isAuthenticated ? (
            <>
              <div className="card-modern">
                <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Profile</h3>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                    {!user?.emailVerified && (
                      <p className="text-xs mt-1" style={{ color: "#eab308" }}>Email not verified</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="card-modern">
                <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Change Password</h3>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>Current password</label>
                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>New password</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                  </div>
                </div>
              </div>

              <button onClick={handleSaveProfile} disabled={saving}
                className="self-start px-6 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: "var(--accent)", color: "#000", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <div className="rounded-2xl p-8 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <p className="text-4xl mb-3">👤</p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Sign in to manage your account</p>
              <a href="/auth/login" className="inline-block mt-4 px-6 py-2.5 rounded-xl text-sm font-medium no-underline"
                style={{ background: "var(--accent)", color: "#000" }}>
                Sign In
              </a>
            </div>
          )}
        </motion.div>
      )}

      {/* Notifications Tab */}
      {tab === "notifications" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="card-modern">
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Email Notifications</h3>
            <div className="flex flex-col gap-4">
              {[
                { label: "Daily Digest", desc: "Receive a daily email with your tasks, habits, and goals overview", key: "dailyDigest" },
                { label: "Task Reminders", desc: "Get notified when tasks are due soon or overdue", key: "taskReminders" },
                { label: "Goal Reminders", desc: "Periodic reminders about your goal progress", key: "goalReminders" },
                { label: "Weekly Report", desc: "A weekly summary of your productivity metrics", key: "weeklyReport" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--bg-primary)" }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
                  </div>
                  <ToggleSwitch defaultOn={item.key === "dailyDigest" || item.key === "taskReminders"} />
                </div>
              ))}
            </div>
            {!isAuthenticated && (
              <p className="text-xs mt-4 text-center" style={{ color: "var(--text-muted)" }}>
                Sign in to enable email notifications
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Data Tab */}
      {tab === "data" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
          <div className="card-modern">
            <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Export Data</h3>
            <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>Download all your data as JSON</p>
            <button onClick={() => {
              const data = useStore.getState();
              const blob = new Blob([JSON.stringify({
                notes: data.notes, ideas: data.ideas, businessIdeas: data.businessIdeas,
                tasks: data.tasks, habits: data.habits, goals: data.goals, inbox: data.inbox,
              }, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url; a.download = "mindvault-export.json"; a.click();
              toast("Data exported", "success");
            }}
              className="px-4 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: "var(--accent)", color: "#000" }}>
              Export as JSON
            </button>
          </div>

          <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <h3 className="text-sm font-semibold mb-1" style={{ color: "#ef4444" }}>Danger Zone</h3>
            <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>These actions are irreversible</p>
            <button className="px-4 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
              Delete All Data
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function ToggleSwitch({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button onClick={() => setOn(!on)} className="relative w-11 h-6 rounded-full transition-colors shrink-0"
      style={{ background: on ? "var(--accent)" : "var(--border)" }}>
      <motion.div className="absolute top-0.5 w-5 h-5 rounded-full shadow"
        animate={{ left: on ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{ background: on ? "#000" : "var(--text-muted)" }} />
    </button>
  );
}
