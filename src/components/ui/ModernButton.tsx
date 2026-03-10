"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ModernButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

const sizeStyles = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

const variantStyles = {
  primary: {
    background: "linear-gradient(135deg, var(--accent) 0%, rgba(34,197,94,0.8) 100%)",
    textColor: "#000",
    hoverShadow: "0 20px 40px rgba(34,197,94,0.3)",
  },
  secondary: {
    background: "rgba(255,255,255,0.1)",
    textColor: "var(--text-primary)",
    hoverShadow: "0 20px 40px rgba(0,0,0,0.2)",
  },
  ghost: {
    background: "transparent",
    textColor: "var(--text-primary)",
    hoverShadow: "none",
  },
};

export default function ModernButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  icon,
  loading,
  disabled,
  fullWidth,
}: ModernButtonProps) {
  const styles = variantStyles[variant];

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      className={`relative rounded-2xl font-semibold transition-all ${sizeStyles[size]} ${fullWidth ? "w-full" : ""}`}
      style={{
        background: styles.background,
        color: styles.textColor,
        backdropFilter: "blur(10px)",
        border: variant === "ghost" ? "1px solid var(--border)" : "1px solid rgba(255,255,255,0.2)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onHoverStart={() => {
        if (!disabled && styles.hoverShadow !== "none") {
          document.documentElement.style.setProperty("--button-shadow", styles.hoverShadow);
        }
      }}
    >
      {/* Animated background on hover */}
      {variant === "primary" && (
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
          }}
          whileHover={{ opacity: 0.2 }}
        />
      )}

      <div className="relative flex items-center justify-center gap-2">
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-5 h-5 border-2 border-transparent border-t-current rounded-full"
          />
        ) : (
          <>
            {icon && <span>{icon}</span>}
            {children}
          </>
        )}
      </div>
    </motion.button>
  );
}
