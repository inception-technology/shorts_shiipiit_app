// short.shiipiit — internationalisation (fr / en / zh)
// Dictionnaires de segments, filtres et chaînes d'interface, plus le helper `tr`.

export type Locale = "fr" | "en" | "zh";
export type I18n = Record<Locale, string>;

export type Segment = "electronics" | "furniture" | "audio" | "lighting" | "desk";
export type SegmentTab = "all" | Segment;

/** Résout une chaîne i18n vers la langue active (repli sur le français). */
export const tr = (o: I18n | undefined, lang: Locale): string => (o && (o[lang] || o.fr)) || "";

export const LANGS: { id: Locale; label: string }[] = [
  { id: "fr", label: "FR" },
  { id: "en", label: "EN" },
  { id: "zh", label: "中文" },
];

export const SEGMENTS: { id: SegmentTab; label: I18n }[] = [
  { id: "all", label: { fr: "Tout", en: "All", zh: "全部" } },
  { id: "electronics", label: { fr: "Electronics", en: "Electronics", zh: "电子产品" } },
  { id: "furniture", label: { fr: "Furniture", en: "Furniture", zh: "家具" } },
  { id: "audio", label: { fr: "Audio", en: "Audio", zh: "音频" } },
  { id: "lighting", label: { fr: "Éclairage", en: "Lighting", zh: "照明" } },
  { id: "desk", label: { fr: "Bureau", en: "Workspace", zh: "办公" } },
];

export const FILTERS: { id: string; label: I18n }[] = [
  { id: "new", label: { fr: "Nouveautés", en: "New in", zh: "新品" } },
  { id: "demo", label: { fr: "Démo produit", en: "Product demo", zh: "产品演示" } },
  { id: "unbox", label: { fr: "Déballage", en: "Unboxing", zh: "开箱" } },
  { id: "setup", label: { fr: "Installation", en: "Setup", zh: "安装" } },
  { id: "atelier", label: { fr: "Atelier", en: "Workshop", zh: "工坊" } },
  { id: "matiere", label: { fr: "Matières", en: "Materials", zh: "材质" } },
];

export const T: Record<string, I18n> = {
  brand: { fr: "short.shiipiit", en: "short.shiipiit", zh: "short.shiipiit" },
  search: { fr: "Rechercher une vidéo, une boutique…", en: "Search a video, a shop…", zh: "搜索视频或店铺…" },
  searchShort: { fr: "Rechercher", en: "Search", zh: "搜索" },
  discover: { fr: "Découvrir", en: "Discover", zh: "发现" },
  universe: { fr: "Univers", en: "Universes", zh: "专区" },
  universeLead: { fr: "Choisis un univers pour commencer.", en: "Pick a universe to start.", zh: "选择一个专区开始浏览。" },
  ctaBuy: { fr: "Voir le produit", en: "View product", zh: "查看商品" },
  ctaQuote: { fr: "Demander un devis", en: "Request a quote", zh: "索取报价" },
  close: { fr: "Fermer", en: "Close", zh: "关闭" },
  soundOn: { fr: "Son activé", en: "Sound on", zh: "声音已开启" },
  soundOff: { fr: "Son coupé", en: "Sound off", zh: "声音已关闭" },
  tapSound: { fr: "Touchez pour le son", en: "Tap for sound", zh: "轻触开启声音" },
  loading: { fr: "Chargement…", en: "Loading…", zh: "加载中…" },
  loadingMore: { fr: "Chargement de la suite…", en: "Loading more…", zh: "正在加载更多…" },
  results: { fr: "résultats", en: "results", zh: "条结果" },
  emptyTitle: { fr: "Rien à afficher pour l’instant", en: "Nothing to show yet", zh: "暂无内容" },
  emptyBody: { fr: "Cet univers n’a pas encore de vidéo. Reviens bientôt.", en: "This universe has no video yet. Come back soon.", zh: "该专区尚无视频，请稍后再来。" },
  noResTitle: { fr: "Aucun résultat", en: "No results", zh: "没有匹配结果" },
  noResBody: { fr: "Essaie un autre mot ou retire un filtre.", en: "Try another word or drop a filter.", zh: "换个关键词，或移除一个筛选。" },
  clearFilters: { fr: "Effacer les filtres", en: "Clear filters", zh: "清除筛选" },
  errTitle: { fr: "Le flux n’a pas pu charger", en: "The feed failed to load", zh: "内容加载失败" },
  errBody: { fr: "Une erreur est survenue de notre côté.", en: "Something went wrong on our side.", zh: "我们这边出了点问题。" },
  retry: { fr: "Réessayer", en: "Retry", zh: "重试" },
  offTitle: { fr: "Hors ligne", en: "Offline", zh: "离线" },
  offBody: { fr: "Vérifie ta connexion. Les vidéos déjà vues restent disponibles.", en: "Check your connection. Watched videos stay available.", zh: "请检查网络连接，已观看的视频仍可播放。" },
  browseCache: { fr: "Voir les vidéos hors ligne", en: "Browse offline videos", zh: "浏览离线视频" },
  footer: { fr: "shiipiit · Découverte produit en vidéo courte", en: "shiipiit · Product discovery in short video", zh: "shiipiit · 短视频商品发现" },
  legal: { fr: "Mentions légales", en: "Legal", zh: "法律声明" },
  privacy: { fr: "Confidentialité", en: "Privacy", zh: "隐私" },
  contact: { fr: "Contact", en: "Contact", zh: "联系我们" },
  lang: { fr: "Langue", en: "Language", zh: "语言" },
  filtersLabel: { fr: "Filtres", en: "Filters", zh: "筛选" },
  videos: { fr: "vidéos", en: "videos", zh: "个视频" },
  theme: { fr: "Thème", en: "Theme", zh: "主题" },
};
