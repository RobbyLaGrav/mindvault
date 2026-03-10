"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore, AccentColor } from "@/store/useStore";
import { useAuthStore } from "@/store/useAuthStore";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const NAV_SECTIONS = [
  {
    label: "Home",
    items: [
      { href: "/", icon: "🏠", label: "Dashboard", desc: "Overview & upcoming" },
    ],
  },
  {
    label: "Productivity",
    items: [
      { href: "/firelist", icon: "🔥", label: "Fire List", desc: "Tasks & priorities" },
      { href: "/calendar", icon: "📅", label: "Calendar", desc: "Schedule & deadlines" },
      { href: "/rituals", icon: "🔁", label: "Rituals", desc: "Daily habits & streaks" },
      { href: "/goals", icon: "🎯", label: "Goals", desc: "Milestones & progress" },
    ],
  },
  {
    label: "Knowledge",
    items: [
      { href: "/braindump", icon: "🧠", label: "Brain Dump", desc: "Notes & thoughts" },
      { href: "/spark", icon: "⚡", label: "Spark", desc: "Ideas & innovation" },
      { href: "/empire", icon: "🏛️", label: "Empire", desc: "Business ventures" },
    ],
  },
  {
    label: "Private",
    items: [
      { href: "/vault", icon: "🔒", label: "Vault", desc: "Encrypted notes" },
      { href: "/stats", icon: "📊", label: "Stats", desc: "Analytics & metrics" },
    ],
  },
];

const ACCENTS: { key: AccentColor; color: string }[] = [
  { key: "green", color: "#22c55e" },
  { key: "blue", color: "#3b82f6" },
  { key: "coral", color: "#f97316" },
  { key: "purple", color: "#a855f7" },
  { key: "amber", color: "#eab308" },
  { key: "rose", color: "#f43f5e" },
  { key: "cyan", color: "#06b6d4" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const accentColor = useStore((s) => s.accentColor);
  const setAccentColor = useStore((s) => s.setAccentColor);
  const themeMode = useStore((s) => s.themeMode);
  const setThemeMode = useStore((s) => s.setThemeMode);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-[260px] flex flex-col py-5 px-3 z-50 overflow-y-auto backdrop-blur-sm"
      style={{ background: "linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)", borderRight: "1px solid var(--border)" }}
    >
      {/* Logo */}
      <motion.div
        className="px-3 mb-6 rounded-2xl p-3 transition-all"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
          border: "1px solid rgba(255,255,255,0.06)"
        }}
        whileHover={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)",
          boxShadow: "0 8px 16px rgba(34,197,94,0.1)"
        }}
      >
        <div className="flex items-center gap-2">
          <motion.div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{ background: "var(--accent)", color: "#000" }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            M
          </motion.div>
          <div>
            <h1 className="text-base font-bold tracking-tight" style={{ color: "var(--accent)" }}>
              MINDVAULT
            </h1>
            <p className="text-[10px] leading-none" style={{ color: "var(--text-muted)" }}>
              Personal command center
            </p>
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-4">
            <p className="section-label px-3 mb-2">{section.label}</p>
            {section.items.map((item) => {
              const active = pathname === item.href;
              return (
                <motion.div key={item.href}>
                  <Link
                    href={item.href}
                    className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 no-underline group"
                    style={{
                      color: active ? "var(--text-primary)" : "var(--text-secondary)",
                      background: active ? "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)" : "transparent",
                      border: active ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
                    }}
                    whileHover={{ x: 4 }}
                  >
                    {active && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                        style={{ background: "var(--accent)" }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    <motion.span
                      className="text-base"
                      whileHover={{ scale: 1.2 }}
                    >
                      {item.icon}
                    </motion.span>
                    <div className="flex-1 min-w-0">
                      <span className="block">{item.label}</span>
                      <span className="block text-[10px] leading-tight opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: "var(--text-muted)" }}>
                        {item.desc}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Theme controls */}
      <div className="px-3 pt-3 border-t flex flex-col gap-3" style={{ borderColor: "var(--border)" }}>
        {/* Theme mode toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: "var(--bg-primary)" }}>
          {(["dark", "light", "system"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setThemeMode(mode)}
              className="flex-1 py-1.5 rounded-md text-xs font-medium transition-all"
              style={{
                background: themeMode === mode ? "var(--accent-glow)" : "transparent",
                color: themeMode === mode ? "var(--text-primary)" : "var(--text-muted)",
                border: themeMode === mode ? "1px solid var(--border)" : "1px solid transparent",
              }}
            >
              {mode === "dark" ? "🌙" : mode === "light" ? "☀️" : "💻"} {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>

        {/* Accent colors */}
        <div>
          <p className="text-[10px] mb-1.5" style={{ color: "var(--text-muted)" }}>Accent</p>
          <div className="flex gap-1.5 flex-wrap">
            {ACCENTS.map((a) => (
              <button
                key={a.key}
                onClick={() => setAccentColor(a.key)}
                className="w-5 h-5 rounded-full transition-transform hover:scale-110"
                style={{
                  background: a.color,
                  outline: accentColor === a.key ? `2px solid ${a.color}` : "none",
                  outlineOffset: "2px",
                }}
              />
            ))}
          </div>
        </div>

        {/* Settings link */}
        <Link href="/settings"
          className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium no-underline transition-colors"
          style={{ color: "var(--text-secondary)", background: pathname === "/settings" ? "var(--accent-glow)" : "transparent" }}>
          ⚙️ Settings
        </Link>
      </div>

      {/* User section */}
      <div className="mt-3 pt-3 border-t px-3" style={{ borderColor: "var(--border)" }}>
        {isAuthenticated && user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-xl transition-colors text-left"
              style={{ background: showUserMenu ? "var(--bg-card)" : "transparent" }}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: "var(--accent-glow)", color: "var(--accent)", border: "1px solid var(--border)" }}>
                {(user.name || user.email)[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                  {user.name || "User"}
                </p>
                <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>
                  {user.email}
                </p>
              </div>
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute bottom-full left-0 right-0 mb-1 rounded-xl p-1 shadow-lg"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                >
                  <Link href="/settings" onClick={() => setShowUserMenu(false)}
                    className="block px-3 py-2 rounded-lg text-sm no-underline transition-colors"
                    style={{ color: "var(--text-secondary)" }}>
                    ⚙️ Settings
                  </Link>
                  <button onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                    style={{ color: "#ef4444" }}>
                    🚪 Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link href="/auth/login"
              className="flex-1 text-center py-2 rounded-xl text-xs font-medium no-underline"
              style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
              Sign in
            </Link>
            <Link href="/auth/signup"
              className="flex-1 text-center py-2 rounded-xl text-xs font-medium no-underline"
              style={{ background: "var(--accent)", color: "#000" }}>
              Sign up
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
