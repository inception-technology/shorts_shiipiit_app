"use client";

// short.shiipiit — composants du design system portés en React/TS.
// Rendu fidèle au bundle shiipiit (_ds_bundle.js) : mêmes variantes, tailles et tokens.

import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

type Variant = "cta" | "primary" | "secondary" | "gradient" | "neutral" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, CSSProperties> = {
  cta: { background: "var(--color-accent)", color: "var(--text-on-accent)", border: "1px solid transparent", boxShadow: "var(--shadow-accent)" },
  primary: { background: "var(--color-primary)", color: "var(--text-on-brand)", border: "1px solid transparent" },
  secondary: { background: "var(--color-secondary)", color: "var(--text-on-brand)", border: "1px solid transparent" },
  gradient: { background: "var(--gradient-brand)", color: "var(--text-on-brand)", border: "1px solid transparent", boxShadow: "var(--shadow-brand)" },
  neutral: { background: "var(--surface-card)", color: "var(--text-strong)", border: "1px solid var(--border-default)", boxShadow: "var(--shadow-xs)" },
  outline: { background: "transparent", color: "var(--color-primary)", border: "1px solid var(--color-primary)" },
  ghost: { background: "transparent", color: "var(--text-strong)", border: "1px solid transparent" },
};

const SIZES: Record<Size, CSSProperties> = {
  sm: { padding: "7px 14px", fontSize: "var(--text-xs)" },
  md: { padding: "10px 18px", fontSize: "var(--text-sm)" },
  lg: { padding: "13px 24px", fontSize: "var(--text-base)" },
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  disabled = false,
  fullWidth = false,
  style,
  children,
  ...rest
}: ButtonProps) {
  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--space-2)",
    fontFamily: "var(--font-sans)",
    fontWeight: "var(--weight-bold)" as unknown as number,
    letterSpacing: "var(--tracking-snug)",
    lineHeight: 1.2,
    borderRadius: "var(--radius-md)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.45 : 1,
    width: fullWidth ? "100%" : undefined,
    whiteSpace: "nowrap",
    transition: "transform var(--transition-fast), filter var(--transition-fast), background var(--transition-base)",
    ...SIZES[size],
    ...VARIANTS[variant],
    ...style,
  };
  return (
    <button
      type="button"
      disabled={disabled}
      style={base}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = "scale(.97)"; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = "none"; }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.filter = "brightness(.94)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.filter = "none"; e.currentTarget.style.transform = "none"; }}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}

const CHIP_TONES = {
  neutral: { background: "var(--surface-card)", color: "var(--text-body)", border: "1px solid var(--border-default)" },
  info: { background: "var(--surface-primary-soft)", color: "var(--color-primary)", border: "1px solid transparent" },
} satisfies Record<string, CSSProperties>;

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  tone?: keyof typeof CHIP_TONES;
}

export function Chip({ active = false, tone = "neutral", style, children, ...rest }: ChipProps) {
  const s: CSSProperties = active
    ? { background: "var(--color-primary)", color: "var(--text-on-brand)", border: "1px solid transparent" }
    : CHIP_TONES[tone];
  return (
    <button
      type="button"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-2)",
        padding: "6px 16px",
        borderRadius: "var(--radius-pill)",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-xs)",
        fontWeight: "var(--weight-semibold)" as unknown as number,
        transition: "background var(--transition-base), color var(--transition-base)",
        ...s,
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

const BADGE_TONES = {
  info: { background: "var(--surface-primary-soft)", color: "var(--color-primary)" },
  brand: { background: "var(--violet-100)", color: "var(--color-secondary)" },
  accent: { background: "var(--surface-accent-soft)", color: "var(--coral-strong)" },
  neutral: { background: "var(--surface-sunken)", color: "var(--text-body)" },
} satisfies Record<string, CSSProperties>;

export function Badge({
  tone = "info",
  style,
  children,
}: {
  tone?: keyof typeof BADGE_TONES;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: "var(--radius-pill)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-xs)",
        fontWeight: "var(--weight-semibold)" as unknown as number,
        lineHeight: 1.4,
        ...BADGE_TONES[tone],
        ...style,
      }}
    >
      {children}
    </span>
  );
}
