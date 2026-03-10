"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { motion } from "framer-motion";
import ModernInput from "@/components/ui/ModernInput";
import ModernButton from "@/components/ui/ModernButton";

const floatingIcons = ["🧠", "⚡", "🔥", "🎯", "🔁"];

interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string;
}

const checkPasswordStrength = (password: string): PasswordStrength => {
  let score = 0 as any;
  if (!password) return { score: 0, label: "No password", color: "#6b7280" };
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password) && /[^a-zA-Z\d]/.test(password)) score++;

  const strengths: PasswordStrength[] = [
    { score: 0, label: "Too weak", color: "#ef4444" },
    { score: 1, label: "Weak", color: "#f97316" },
    { score: 2, label: "Fair", color: "#eab308" },
    { score: 3, label: "Good", color: "#3b82f6" },
    { score: 4, label: "Strong", color: "#22c55e" },
  ];

  return strengths[score];
};

export default function SignupPage() {
  const router = useRouter();
  const { signup, isLoading, error } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [floatingItems, setFloatingItems] = useState<{ id: number; x: number; y: number; icon: string }[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const passwordStrength = checkPasswordStrength(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

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

    if (!name || !email || !password || !confirmPassword) {
      setFormError("Please fill in all fields");
      return;
    }

    if (!agreedToTerms) {
      setFormError("You must agree to the terms of service");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    if (passwordStrength.score < 2) {
      setFormError("Password is too weak");
      return;
    }

    try {
      await signup(email, password, name);
      router.push("/");
    } catch (err) {
      setFormError(error || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12">
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
              🚀
            </motion.div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              Get Started
            </h1>
            <p style={{ color: "var(--text-muted)" }}>
              Join thousands organizing their life
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            {/* Name */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Full Name
              </label>
              <ModernInput
                icon="👤"
                placeholder="John Doe"
                value={name}
                onChange={setName}
              />
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
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

            {/* Password */}
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
                placeholder="Choose a strong password"
                value={password}
                onChange={setPassword}
              />
              {password && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 flex items-center gap-2"
                >
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-primary)" }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: passwordStrength.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(passwordStrength.score + 1) * 25}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <span className="text-xs" style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </span>
                </motion.div>
              )}
            </motion.div>

            {/* Confirm Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
            >
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Confirm Password
              </label>
              <ModernInput
                type="password"
                icon="🔐"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                success={passwordsMatch && password.length > 0}
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

            {/* Terms checkbox */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-start gap-3"
            >
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 rounded mt-1"
              />
              <label htmlFor="terms" className="text-xs" style={{ color: "var(--text-muted)" }}>
                I agree to the{" "}
                <Link href="/terms" style={{ color: "var(--accent)" }} className="underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" style={{ color: "var(--accent)" }} className="underline">
                  Privacy Policy
                </Link>
              </label>
            </motion.div>

            {/* Submit button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <ModernButton
                fullWidth
                size="lg"
                loading={isLoading}
                onClick={handleSubmit}
                disabled={!agreedToTerms || !passwordsMatch}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </ModernButton>
            </motion.div>
          </form>

          {/* Sign in link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Already have an account?{" "}
            <Link
              href="/auth/login"
              style={{ color: "var(--accent)" }}
              className="font-semibold hover:underline"
            >
              Sign in
            </Link>
          </motion.p>
        </motion.div>

        {/* Features list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-8 grid grid-cols-2 gap-3"
        >
          {[
            { icon: "✅", text: "Task Management" },
            { icon: "📝", text: "Smart Notes" },
            { icon: "📊", text: "Analytics" },
            { icon: "🔄", text: "Habit Tracking" },
          ].map((feature, i) => (
            <motion.div
              key={feature.text}
              whileHover={{ y: -5 }}
              className="p-4 rounded-2xl text-center"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              transition={{ delay: 1 + i * 0.1 }}
            >
              <p className="text-2xl mb-2">{feature.icon}</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                {feature.text}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
