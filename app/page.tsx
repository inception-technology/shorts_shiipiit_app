"use client";

// shorts.shiipiit — écran produit. Grille masonry de vidéos courtes → lecteur
// vertical immersif. Objectif du test : mesurer le CTR sortant par segment et
// par type de CTA (voir README / VALIDATION). Le suivi passe par lib/analytics
// et la route serveur /go/[id].

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ITEMS, type VideoItem } from "@/lib/data";
import {
  SEGMENTS,
  T,
  tr,
  type Locale,
  type SegmentTab,
} from "@/lib/i18n";
import { track } from "@/lib/analytics";
import MasonryGrid, { SkeletonGrid } from "@/components/VideoGrid";
import ImmersivePlayer from "@/components/ImmersivePlayer";
import {
  BottomNav,
  FilterChips,
  LangSwitcher,
  SearchField,
  SegmentTabs,
  StateBlock,
  ThemeToggle,
  Wordmark,
} from "@/components/ui";

/* ---------- hooks ---------- */

/** true sous 900 px. Rendu SSR = desktop (false) → pas de mismatch d'hydratation. */
function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 899px)");
    const on = () => setMobile(mq.matches); // setState bails if unchanged → resize spam is harmless
    on();
    mq.addEventListener("change", on);
    window.addEventListener("resize", on);
    return () => {
      mq.removeEventListener("change", on);
      window.removeEventListener("resize", on);
    };
  }, []);
  return mobile;
}

interface FeedArgs {
  seg: SegmentTab;
  query: string;
  filters: string[];
  loading: boolean;
}

function useFeed({ seg, query, filters, loading }: FeedArgs) {
  const [pages, setPages] = useState(1);
  const key = seg + "|" + query + "|" + filters.join(",") + "|" + loading;
  useEffect(() => {
    setPages(1);
  }, [key]);

  const base = useMemo(
    () =>
      ITEMS.filter((it) => {
        if (seg !== "all" && it.seg !== seg) return false;
        if (filters.length && !filters.some((f) => it.tags.includes(f))) return false;
        if (query.trim()) {
          const q = query.trim().toLowerCase();
          return (it.shop + " " + it.title.fr + " " + it.title.en + " " + it.title.zh).toLowerCase().includes(q);
        }
        return true;
      }),
    [seg, query, filters]
  );

  const PAGE = 8;
  const list = base.slice(0, PAGE * pages);
  return { base, list, canMore: list.length < base.length, more: () => setPages((p) => p + 1) };
}

/* ---------- sous-composants ---------- */

function InfiniteSentinel({ lang, onHit, canLoad }: { lang: Locale; onHit: () => void; canLoad: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !canLoad) return;
    const io = new IntersectionObserver(
      (e) => {
        if (e[0].isIntersecting && !busy.current) {
          busy.current = true;
          setTimeout(() => {
            busy.current = false;
            onHit();
          }, 500);
        }
      },
      { rootMargin: "120px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [canLoad, onHit]);
  if (!canLoad) return null;
  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "var(--space-8) 0 var(--space-4)",
        font: "var(--type-caption)",
        color: "var(--text-muted)",
      }}
    >
      <span className="shp-spin" />
      {tr(T.loadingMore, lang)}
    </div>
  );
}

function Footer({ lang }: { lang: Locale }) {
  return (
    <footer
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--space-4)",
        paddingTop: "var(--space-6)",
        marginTop: "var(--space-10)",
        borderTop: "1px solid var(--border-default)",
      }}
    >
      <span style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>{tr(T.footer, lang)}</span>
      <div style={{ display: "flex", gap: "var(--space-5)" }}>
        {[T.legal, T.privacy, T.contact].map((l, i) => (
          <a key={i} href="#" onClick={(e) => e.preventDefault()} style={{ font: "var(--type-caption)" }}>
            {tr(l, lang)}
          </a>
        ))}
      </div>
    </footer>
  );
}

type OpenFn = (item: VideoItem, el: HTMLElement | null, list: VideoItem[]) => void;

interface AppProps {
  lang: Locale;
  setLang: (l: Locale) => void;
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  loading: boolean;
  seg: SegmentTab;
  setSeg: (s: SegmentTab) => void;
  onOpen: OpenFn;
}

/* ---------- MOBILE ---------- */

function MobileApp({ lang, setLang, theme, setTheme, loading, seg, setSeg, onOpen }: AppProps) {
  const [tab, setTab] = useState<"discover" | "search" | "universe">("discover");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<string[]>([]);
  const feed = useFeed({
    seg,
    query: tab === "search" ? query : "",
    filters: tab === "search" ? filters : [],
    loading,
  });
  const toggle = (id: string) => setFilters((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  const open = (it: VideoItem, el: HTMLElement | null) => onOpen(it, el, feed.list);

  const body = () => {
    if (loading) return <div style={{ padding: "var(--space-4)" }}><SkeletonGrid cols={2} count={6} /></div>;
    if (feed.base.length === 0 && tab !== "search") return <StateBlock kind="empty" lang={lang} compact />;

    if (tab === "universe")
      return (
        <div style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <p style={{ margin: 0, font: "var(--type-body)", fontSize: "var(--text-sm)", color: "var(--text-body)" }}>
            {tr(T.universeLead, lang)}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
            {SEGMENTS.filter((s) => s.id !== "all").map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSeg(s.id);
                  setTab("discover");
                }}
                style={{
                  position: "relative",
                  minHeight: 104,
                  borderRadius: "var(--radius-lg)",
                  border: 0,
                  cursor: "pointer",
                  padding: "var(--space-4)",
                  textAlign: "left",
                  color: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  gap: 2,
                  background:
                    i % 3 === 0 ? "var(--gradient-brand)" : i % 3 === 1 ? "var(--anthracite)" : "var(--gradient-warm)",
                }}
              >
                <span style={{ font: "800 15px/1.2 var(--font-sans)", letterSpacing: "-.02em" }}>{tr(s.label, lang)}</span>
                <span style={{ font: "600 11px/1 var(--font-sans)", color: "rgba(255,255,255,.72)" }}>
                  {ITEMS.filter((x) => x.seg === s.id).length} {tr(T.videos, lang)}
                </span>
              </button>
            ))}
          </div>
        </div>
      );

    if (tab === "search")
      return (
        <div style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <FilterChips lang={lang} active={filters} toggle={toggle} />
          {feed.base.length === 0 ? (
            <StateBlock
              kind="none"
              lang={lang}
              compact
              onAction={() => {
                setFilters([]);
                setQuery("");
              }}
            />
          ) : (
            <>
              <span aria-live="polite" style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>
                {feed.base.length} {tr(T.results, lang)}
              </span>
              <MasonryGrid items={feed.list} lang={lang} onOpen={open} cols={2} />
              <InfiniteSentinel lang={lang} canLoad={feed.canMore} onHit={feed.more} />
            </>
          )}
        </div>
      );

    return (
      <div style={{ padding: "var(--space-4)" }}>
        <MasonryGrid items={feed.list} lang={lang} onOpen={open} cols={2} />
        <InfiniteSentinel lang={lang} canLoad={feed.canMore} onHit={feed.more} />
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh", background: "var(--surface-page)" }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "var(--surface-card)",
          borderBottom: "1px solid var(--border-default)",
          padding: "var(--space-3) var(--space-4)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <Wordmark size={17} />
          <div style={{ flex: 1 }} />
          <ThemeToggle theme={theme} setTheme={setTheme} />
          <LangSwitcher lang={lang} setLang={setLang} dense />
        </div>
        {tab === "search" ? (
          <SearchField lang={lang} value={query} onChange={setQuery} autoFocus />
        ) : (
          <SegmentTabs lang={lang} seg={seg} setSeg={setSeg} />
        )}
      </header>
      <div style={{ flex: 1, minHeight: 0 }}>{body()}</div>
      <div style={{ position: "sticky", bottom: 0, zIndex: 20 }}>
        <BottomNav lang={lang} tab={tab} setTab={setTab} />
      </div>
    </div>
  );
}

/* ---------- DESKTOP ---------- */

function DesktopApp({ lang, setLang, theme, setTheme, loading, seg, setSeg, onOpen }: AppProps) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<string[]>([]);
  const searching = query.trim().length > 0 || filters.length > 0;
  const feed = useFeed({ seg, query, filters, loading });
  const toggle = (id: string) => setFilters((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  const open = (it: VideoItem, el: HTMLElement | null) => onOpen(it, el, feed.list);

  const body = () => {
    if (loading) return <SkeletonGrid cols={5} count={10} />;
    if (feed.base.length === 0)
      return searching ? (
        <StateBlock
          kind="none"
          lang={lang}
          onAction={() => {
            setFilters([]);
            setQuery("");
          }}
        />
      ) : (
        <StateBlock kind="empty" lang={lang} />
      );
    return (
      <>
        {searching && (
          <span aria-live="polite" style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>
            {feed.base.length} {tr(T.results, lang)}
          </span>
        )}
        <MasonryGrid items={feed.list} lang={lang} onOpen={open} />
        <InfiniteSentinel lang={lang} canLoad={feed.canMore} onHit={feed.more} />
      </>
    );
  };

  return (
    <div style={{ minHeight: "100dvh", background: "var(--surface-page)" }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "var(--surface-card)",
          borderBottom: "1px solid var(--border-default)",
        }}
      >
        <div
          style={{
            maxWidth: "var(--container-max)",
            margin: "0 auto",
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-6)",
          }}
        >
          <Wordmark size={19} />
          <div style={{ flex: 1, maxWidth: 440, display: "flex" }}>
            <SearchField lang={lang} value={query} onChange={setQuery} />
          </div>
          <div style={{ flex: 1 }} />
          <ThemeToggle theme={theme} setTheme={setTheme} />
          <LangSwitcher lang={lang} setLang={setLang} />
        </div>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "0 24px 12px" }}>
          <SegmentTabs lang={lang} seg={seg} setSeg={setSeg} />
        </div>
      </header>
      <main
        style={{
          maxWidth: "var(--container-max)",
          margin: "0 auto",
          padding: "var(--space-6) 24px var(--space-10)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <span style={{ font: "var(--type-label)", color: "var(--text-strong)" }}>{tr(T.filtersLabel, lang)}</span>
          <FilterChips lang={lang} active={filters} toggle={toggle} />
        </div>
        {body()}
        <Footer lang={lang} />
      </main>
    </div>
  );
}

/* ---------- coquille ---------- */

export default function Home() {
  const isMobile = useIsMobile();
  const [lang, setLang] = useState<Locale>("fr");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [seg, setSegState] = useState<SegmentTab>("all");
  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState<{ list: VideoItem[]; index: number } | null>(null);

  // Vue d'ensemble : page_view + court squelette d'amorçage (perçu comme un vrai chargement).
  useEffect(() => {
    track("page_view", { path: "/" });
    const to = setTimeout(() => setLoading(false), 550);
    return () => clearTimeout(to);
  }, []);

  // Applique le thème au document (fond de page cohérent hors conteneur).
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setSeg = useCallback((s: SegmentTab) => {
    setSegState(s);
    track("segment_switch", { segment: s });
  }, []);

  const changeLang = useCallback((l: Locale) => {
    setLang(l);
    track("lang_switch", { lang: l });
  }, []);

  const onOpen: OpenFn = useCallback((item, _el, list) => {
    const queue = list.filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i);
    const index = Math.max(0, queue.findIndex((v) => v.id === item.id));
    track("video_open", { id: item.id, segment: item.seg });
    setPlayer({ list: queue, index });
  }, []);

  const appProps: AppProps = {
    lang,
    setLang: changeLang,
    theme,
    setTheme,
    loading,
    seg,
    setSeg,
    onOpen,
  };

  return (
    <>
      {isMobile ? <MobileApp {...appProps} /> : <DesktopApp {...appProps} />}
      {player && (
        <ImmersivePlayer
          items={player.list}
          startIndex={player.index}
          lang={lang}
          desktop={!isMobile}
          onClose={() => setPlayer(null)}
        />
      )}
    </>
  );
}
