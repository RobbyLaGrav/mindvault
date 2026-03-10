"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { motion } from "framer-motion";
import ModernInput from "@/components/ui/ModernInput";
import ModernButton from "@/components/ui/ModernButton";

const floatingIcons = ["🧠", "⚡", "🔥", "🎯", "🔁"];

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [floatingItems, setFloatingItems] = useState<{ id: number; x: number; y: number; icon: string }[]>([]);

  // Generate floating background items
  useEffect(() => {
    const items = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      icon: floatingIcons[Math.floor(Math.random() * floatingIcons.length)],
    }));
    setFloatingItems(items);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!email || !password) {
      setFormError("Please fill in all fields");
      return;
    }

    try {
      const result = await login(email, password);
      if (result.error) {
        setFormError(result.error);
      } else {
        router.push("/");
      }
    } catch (err) {
      setFormError("Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, rgba(34,197,94,0.05) 0%, rgba(59,130,246,0.05) 50%, rgba(168,85,247,0.05) 100%)",
          }}
        />
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{
            background: "linear-gradient(135deg, var(--accent) 0%, #3b82f6 100%)",
            filter: "blur(40px)",
          }}
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-10"
          style={{
            background: "linear-gradient(135deg, #a855f7 0%, #f97316 100%)",
            filter: "blur(40px)",
          }}
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        />
      </div>

      {/* Floating icons */}
      {floatingItems.map((item) => (
        <motion.div
          key={item.id}
          className="fixed text-4xl opacity-20 pointer-events-none"
          style={{ left: `${item.x}%`, top: `${item.y}%` }}
          animate={{
            y: [0, -20, 0],
            x: [0, Math.random() > 0.5 ? 10 : -10, 0],
          }}
          transition={{
            duration: 6 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        >
          {item.icon}
        </motion.div>
      ))}

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Glass card */}
        <motion.div
          className="rounded-3xl p-8 backdrop-blur-xl border border-white/10 shadow-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
          }}
          whileHover={{ boxShadow: "0 20px 60px rgba(34,197,94,0.2)" }}
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <motion.div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
              style={{
                background: "linear-gradient(135deg, var(--accent) 0%, rgba(34,197,94,0.6) 100%)",
              }}
              whileHover={{ scale: 1.1, rotate: 10 }}
            >
              🧠
            </motion.div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              Welcome Back
            </h1>
            <p style={{ color: "var(--text-muted)" }}>
              Access your personal command center
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Email
              </label>
              <ModernInput
                type="email"
                icon="📧"
                placeholder="you@example.com"
                value={email}
                onChange={setEmail}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Password
              </label>
              <ModernInput
                type="password"
                icon="🔐"
                placeholder="Your password"
                value={password}
                onChange={setPassword}
                onEnter={handleSubmit as any}
              />
            </motion.div>

            {/* Error message */}
            {formError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}
              >
                <p style={{ color: "#ef4444", fontSize: "0.875rem" }}>{formError}</p>
              </motion.div>
            )}

            {/* Remember & Forgot */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-between text-sm"
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" />
                <span style={{ color: "var(--text-muted)" }}>Remember me</span>
              </label>
              <Link href="/auth/forgot-password" style={{ color: "var(--accent)" }} className="hover:underline">
                Forgot password?
              </Link>
            </motion.div>

            {/* Submit button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <button
                type="submit"
                disabled={isLoading}
                className="w-full"
                style={{
                  background: "linear-gradient(135deg, var(--accent) 0%, rgba(34,197,94,0.8) 100%)",
                  color: "#000",
                  padding: "1rem 2rem",
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  borderRadius: "1rem",
                  border: "1px solid rgba(255,255,255,0.2)",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.5 : 1,
                  transition: "all 0.3s ease",
                  backdropFilter: "blur(10px)",
                }}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center gap-3 mb-6"
          >
            <div style={{ height: "1px", flex: 1, background: "var(--border)" }} />
            <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Or</span>
            <div style={{ height: "1px", flex: 1, background: "var(--border)" }} />
          </motion.div>

          {/* OAuth buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-3 gap-3 mb-6"
          >
            {[
              { icon: "🔵", label: "Google" },
              { icon: "⬛", label: "GitHub" },
              { icon: "🍎", label: "Apple" },
            ].map((provider, i) => (
              <motion.button
                key={provider.label}
                className="p-3 rounded-xl transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
                whileHover={{ scale: 1.05, background: "rgba(255,255,255,0.1)" }}
                whileTap={{ scale: 0.95 }}
                transition={{ delay: 0.8 + i * 0.1 }}
              >
                <span className="text-xl">{provider.icon}</span>
              </motion.button>
            ))}
          </motion.div>

          {/* Sign up link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-center text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              style={{ color: "var(--accent)" }}
              className="font-semibold hover:underline"
            >
              Sign up
            </Link>
          </motion.p>
        </motion.div>

        {/* Stats footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-8 grid grid-cols-3 gap-4 text-center"
        >
          {[
            { label: "Users", value: "10K+" },
            { label: "Tasks", value: "1M+" },
            { label: "Uptime", value: "99.9%" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -5 }}
              className="p-4 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <p className="text-2xl font-bold" style={{ color: "var(--accent)" }}>
                {stat.value}
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
