"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface ModernInputProps {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  icon?: string;
  error?: string;
  success?: boolean;
  onEnter?: () => void;
}

export default function ModernInput({
  type = "text",
  placeholder,
  value,
  onChange,
  icon,
  error,
  success,
  onEnter,
}: ModernInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative">
      <motion.div
        className="relative rounded-2xl overflow-hidden"
        animate={{
          boxShadow: focused
            ? "0 20px 40px rgba(0,0,0,0.3)"
            : "0 10px 20px rgba(0,0,0,0.1)",
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Background gradient */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: focused
              ? "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)"
              : "rgba(255,255,255,0.05)",
            backdropFilter: "blur(10px)",
          }}
          animate={{ opacity: focused ? 1 : 0.7 }}
        />

        {/* Border gradient */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background:
              error ? "#ef4444"
              : success ? "#22c55e"
              : focused ? "var(--accent)"
              : "var(--border)",
            opacity: 0.3,
            padding: "1px",
            borderRadius: "16px",
            WebkitMask: "linear-gradient(to right, black, black, transparent)",
          }}
        />

        <div className="relative flex items-center px-5 py-4">
          {icon && <span className="mr-3 text-xl">{icon}</span>}
          <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
            className="flex-1 bg-transparent outline-none text-base"
            style={{ color: "var(--text-primary)" }}
          />
          {success && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-3 text-xl"
            >
              ✅
            </motion.span>
          )}
          {error && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-3 text-xl"
            >
              ⚠️
            </motion.span>
          )}
        </div>
      </motion.div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs mt-2"
          style={{ color: "#ef4444" }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
