"use client";

// shorts.shiipiit — contrôles d'interface partagés.

import { useState } from "react";
import { Button, Chip } from "@/components/ds";
import { Ic, Icon } from "@/components/icons";
import {
  FILTERS,
  LANGS,
  SEGMENTS,
  T,
  tr,
  type I18n,
  type Locale,
  type SegmentTab,
} from "@/lib/i18n";

export function Wordmark({ size = 17, color = "var(--text-strong)" }: { size?: number; color?: string }) {
  return (
    <span style={{ font: `800 ${size}px/1 var(--font-sans)`, letterSpacing: "-.03em", color }}>shorts.shiipiit</span>
  );
}

export function LangSwitcher({
  lang,
  setLang,
  dense,
}: {
  lang: Locale;
  setLang: (l: Locale) => void;
  dense?: boolean;
}) {
  return (
    <div
      role="group"
      aria-label={tr(T.lang, lang)}
      style={{
        display: "flex",
        gap: 2,
        padding: 3,
        borderRadius: "var(--radius-pill)",
        background: "var(--surface-sunken)",
        border: "1px solid var(--border-default)",
      }}
    >
      {LANGS.map((l) => (
        <button
          key={l.id}
          type="button"
          aria-pressed={lang === l.id}
          onClick={() => setLang(l.id)}
          style={{
            minWidth: dense ? 40 : 46,
            minHeight: 40,
            padding: "0 8px",
            borderRadius: "var(--radius-pill)",
            border: 0,
            cursor: "pointer",
            font: "600 12px/1 var(--font-sans)",
            background: lang === l.id ? "var(--color-primary)" : "transparent",
            color: lang === l.id ? "var(--text-on-brand)" : "var(--text-body)",
            transition: "background var(--transition-base), color var(--transition-base)",
          }}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

export function ThemeToggle({ theme, setTheme }: { theme: "light" | "dark"; setTheme: (t: "light" | "dark") => void }) {
  const dark = theme === "dark";
  return (
    <button
      type="button"
      aria-label="Thème"
      aria-pressed={dark}
      onClick={() => setTheme(dark ? "light" : "dark")}
      style={{
        width: 40,
        height: 40,
        flex: "none",
        borderRadius: "var(--radius-pill)",
        border: "1px solid var(--border-default)",
        background: "var(--surface-card)",
        color: "var(--text-body)",
        cursor: "pointer",
        display: "grid",
        placeItems: "center",
        transition: "color var(--transition-base)",
      }}
    >
      <Icon d={dark ? Ic.sun : Ic.moon} size={18} />
    </button>
  );
}

export function SearchField({
  lang,
  value,
  onChange,
  onFocus,
  autoFocus,
  placeholderKey = "search",
}: {
  lang: Locale;
  value: string;
  onChange: (v: string) => void;
  onFocus?: () => void;
  autoFocus?: boolean;
  placeholderKey?: keyof typeof T;
}) {
  const [f, setF] = useState(false);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-2)",
        minHeight: 44,
        padding: "0 14px",
        borderRadius: "var(--radius-pill)",
        background: "var(--surface-card)",
        border: "1px solid " + (f ? "var(--border-focus)" : "var(--border-default)"),
        boxShadow: f ? "var(--focus-ring)" : "none",
        transition: "border-color var(--transition-base), box-shadow var(--transition-base)",
        flex: 1,
        minWidth: 0,
      }}
    >
      <Icon d={Ic.search} size={17} style={{ color: "var(--text-muted)" }} />
      <input
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          setF(true);
          onFocus && onFocus();
        }}
        onBlur={() => setF(false)}
        placeholder={tr(T[placeholderKey], lang)}
        style={{
          flex: 1,
          minWidth: 0,
          border: 0,
          outline: "none",
          background: "transparent",
          font: "500 14px/1.4 var(--font-sans)",
          color: "var(--text-strong)",
        }}
      />
      {value && (
        <button
          type="button"
          aria-label={tr(T.close, lang)}
          onClick={() => onChange("")}
          style={{
            border: 0,
            background: "transparent",
            cursor: "pointer",
            color: "var(--text-muted)",
            display: "grid",
            placeItems: "center",
            width: 24,
            height: 24,
            padding: 0,
          }}
        >
          <Icon d={Ic.x} size={15} />
        </button>
      )}
    </div>
  );
}

export function SegmentTabs({
  lang,
  seg,
  setSeg,
}: {
  lang: Locale;
  seg: SegmentTab;
  setSeg: (s: SegmentTab) => void;
}) {
  return (
    <div
      className="shp-hscroll"
      style={{ display: "flex", gap: "var(--space-2)", overflowX: "auto", scrollSnapType: "x proximity", padding: "0 0 2px" }}
    >
      {SEGMENTS.map((s) => (
        <button
          key={s.id}
          type="button"
          aria-pressed={seg === s.id}
          onClick={() => setSeg(s.id)}
          style={{
            scrollSnapAlign: "start",
            flex: "none",
            minHeight: 44,
            padding: "0 18px",
            borderRadius: "var(--radius-pill)",
            cursor: "pointer",
            font: "600 13px/1 var(--font-sans)",
            whiteSpace: "nowrap",
            transition: "background var(--transition-base), color var(--transition-base)",
            background: seg === s.id ? "var(--color-primary)" : "transparent",
            color: seg === s.id ? "var(--text-on-brand)" : "var(--text-body)",
            border: "1px solid " + (seg === s.id ? "transparent" : "var(--border-default)"),
          }}
        >
          {tr(s.label, lang)}
        </button>
      ))}
    </div>
  );
}

export function FilterChips({
  lang,
  active,
  toggle,
}: {
  lang: Locale;
  active: string[];
  toggle: (id: string) => void;
}) {
  return (
    <div className="shp-hscroll" style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
      {FILTERS.map((f) => (
        <Chip
          key={f.id}
          active={active.includes(f.id)}
          onClick={() => toggle(f.id)}
          style={{ minHeight: 44, padding: "0 16px", fontSize: "13px" }}
        >
          {tr(f.label, lang)}
        </Chip>
      ))}
    </div>
  );
}

export type SysState = "ok" | "loading" | "empty" | "error" | "offline";
type StateKind = "empty" | "none" | "error" | "offline";

export function StateBlock({
  kind,
  lang,
  onAction,
  compact,
}: {
  kind: StateKind;
  lang: Locale;
  onAction?: () => void;
  compact?: boolean;
}) {
  const map: Record<StateKind, { icon: string; tone: "neutral" | "accent"; title: I18n; body: I18n; action: I18n | null }> = {
    empty: { icon: Ic.layers, tone: "neutral", title: T.emptyTitle, body: T.emptyBody, action: null },
    none: { icon: Ic.search, tone: "neutral", title: T.noResTitle, body: T.noResBody, action: T.clearFilters },
    error: { icon: Ic.alert, tone: "accent", title: T.errTitle, body: T.errBody, action: T.retry },
    offline: { icon: Ic.wifi, tone: "neutral", title: T.offTitle, body: T.offBody, action: T.browseCache },
  };
  const m = map[kind];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: "var(--space-3)",
        padding: compact ? "var(--space-10) var(--space-5)" : "var(--space-16) var(--space-6)",
      }}
    >
      <span
        style={{
          width: 52,
          height: 52,
          borderRadius: 999,
          display: "grid",
          placeItems: "center",
          background: m.tone === "accent" ? "var(--surface-accent-soft)" : "var(--surface-sunken)",
          color: m.tone === "accent" ? "var(--color-danger)" : "var(--text-muted)",
        }}
      >
        <Icon d={m.icon} size={22} />
      </span>
      <h3 style={{ margin: 0, font: "var(--type-subtitle)", fontSize: "var(--text-lg)", letterSpacing: "var(--tracking-tight)", color: "var(--text-strong)" }}>
        {tr(m.title, lang)}
      </h3>
      <p style={{ margin: 0, maxWidth: 300, font: "var(--type-body)", fontSize: "var(--text-sm)", color: "var(--text-body)" }}>
        {tr(m.body, lang)}
      </p>
      {m.action && (
        <Button variant={kind === "error" ? "primary" : "neutral"} size="md" style={{ minHeight: 44 }} onClick={onAction}>
          {tr(m.action, lang)}
        </Button>
      )}
    </div>
  );
}

export function BottomNav({
  lang,
  tab,
  setTab,
}: {
  lang: Locale;
  tab: string;
  setTab: (t: "discover" | "search" | "universe") => void;
}) {
  const items = [
    { id: "discover", d: Ic.compass, l: T.discover },
    { id: "search", d: Ic.search, l: T.searchShort },
    { id: "universe", d: Ic.layers, l: T.universe },
  ] as const;
  return (
    <nav
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        borderTop: "1px solid var(--border-default)",
        background: "var(--surface-card)",
        paddingBottom: "env(safe-area-inset-bottom, 8px)",
      }}
    >
      {items.map((i) => {
        const on = tab === i.id;
        return (
          <button
            key={i.id}
            type="button"
            aria-current={on ? "page" : undefined}
            onClick={() => setTab(i.id)}
            style={{
              minHeight: 52,
              border: 0,
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              color: on ? "var(--color-primary)" : "var(--text-muted)",
              transition: "color var(--transition-base)",
            }}
          >
            <Icon d={i.d} size={20} width={on ? 2 : 1.75} />
            <span style={{ font: "600 10px/1 var(--font-sans)" }}>{tr(i.l, lang)}</span>
          </button>
        );
      })}
    </nav>
  );
}
