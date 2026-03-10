"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import { useAuthStore } from "@/store/useAuthStore";
import Sidebar from "./Sidebar";
import CommandPalette from "./CommandPalette";
import QuickCapture from "./QuickCapture";
import ToastContainer from "./ui/Toast";
import { FullPageLoader } from "./ui/LoadingSpinner";

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const accentColor = useStore((s) => s.accentColor);
  const themeMode = useStore((s) => s.themeMode);
  const fontSize = useStore((s) => s.fontSize);
  const fontFamily = useStore((s) => s.fontFamily);
  const spacing = useStore((s) => s.spacing);
  const customColors = useStore((s) => s.customColors);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const isLoading = useAuthStore((s) => s.isLoading);
  const syncFromServer = useStore((s) => s.syncFromServer);
  const setServerMode = useStore((s) => s.setServerMode);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuth().then(() => {
      const auth = useAuthStore.getState();
      if (auth.isAuthenticated) {
        setServerMode(true);
        syncFromServer();
      }
    });
  }, [checkAuth, syncFromServer, setServerMode]);

  // Auth pages get no shell
  const isAuthPage = pathname?.startsWith("/auth");

  if (!mounted) {
    return (
      <div data-accent={accentColor} data-theme={themeMode} data-font-size={fontSize} data-font-family={fontFamily} data-spacing={spacing}>
        <FullPageLoader />
      </div>
    );
  }

  if (isAuthPage) {
    return (
      <div data-accent={accentColor} data-theme={themeMode} data-font-size={fontSize} data-font-family={fontFamily} data-spacing={spacing}
        style={customColors ? { "--accent": customColors.accent, "--accent-dim": customColors.accentDim, "--accent-glow": customColors.accentGlow } as React.CSSProperties : undefined}>
        <ToastContainer />
        {children}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div data-accent={accentColor} data-theme={themeMode}>
        <FullPageLoader />
      </div>
    );
  }

  return (
    <div
      data-accent={accentColor}
      data-theme={themeMode}
      data-font-size={fontSize}
      data-font-family={fontFamily}
      data-spacing={spacing}
      style={customColors ? { "--accent": customColors.accent, "--accent-dim": customColors.accentDim, "--accent-glow": customColors.accentGlow } as React.CSSProperties : undefined}
    >
      <ToastContainer />
      <Sidebar />
      <CommandPalette />
      <QuickCapture />
      <motion.main
        className="ml-[260px] min-h-screen p-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        key={pathname}
      >
        {children}
      </motion.main>

      {/* Sync indicator */}
      {isAuthenticated && (
        <SyncIndicator />
      )}
    </div>
  );
}

function SyncIndicator() {
  const isSyncing = useStore((s) => s.isSyncing);
  if (!isSyncing) return null;
  return (
    <div className="fixed bottom-4 left-[274px] px-3 py-1.5 rounded-lg text-xs flex items-center gap-2"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
      <div className="w-2 h-2 rounded-full animate-pulse-soft" style={{ background: "var(--accent)" }} />
      Syncing...
    </div>
  );
}
