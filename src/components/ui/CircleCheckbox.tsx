"use client";

import { motion } from "framer-motion";

interface CircleCheckboxProps {
  checked: boolean;
  onChange: () => void;
  size?: number;
  color?: string;
  disabled?: boolean;
}

export default function CircleCheckbox({
  checked,
  onChange,
  size = 22,
  color = "var(--accent)",
  disabled = false,
}: CircleCheckboxProps) {
  const strokeWidth = 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onChange();
      }}
      className="relative shrink-0 flex items-center justify-center"
      style={{
        width: size,
        height: size,
        cursor: disabled ? "default" : "pointer",
        background: "transparent",
        border: "none",
        padding: 0,
      }}
      aria-label={checked ? "Mark incomplete" : "Mark complete"}
      aria-checked={checked}
      role="checkbox"
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={checked ? color : "var(--border)"}
          strokeWidth={strokeWidth}
          opacity={checked ? 0.3 : 0.6}
        />
        {/* Animated progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill={checked ? color : "transparent"}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={false}
          animate={{
            strokeDashoffset: checked ? 0 : circumference,
            fill: checked ? color : "transparent",
          }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          style={{
            transformOrigin: "center",
            transform: "rotate(-90deg)",
          }}
        />
      </svg>
      {/* Checkmark */}
      <motion.svg
        width={size * 0.5}
        height={size * 0.5}
        viewBox="0 0 12 12"
        className="absolute"
        initial={false}
        animate={{
          scale: checked ? 1 : 0,
          opacity: checked ? 1 : 0,
        }}
        transition={{ duration: 0.2, delay: checked ? 0.15 : 0 }}
      >
        <motion.path
          d="M2.5 6L5 8.5L9.5 3.5"
          fill="none"
          stroke="#000"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.svg>
      {/* Hover ring */}
      {!disabled && !checked && (
        <div
          className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity"
          style={{
            border: `2px solid ${color}`,
            opacity: 0,
          }}
        />
      )}
    </button>
  );
}
