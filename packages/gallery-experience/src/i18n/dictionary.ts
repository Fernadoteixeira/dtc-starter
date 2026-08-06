export type GalleryLocale = "pt-BR" | "es-419";

export const DEFAULT_GALLERY_LOCALE: GalleryLocale = "pt-BR";

const LOCALE_ALIASES: Record<string, GalleryLocale> = {
  "pt-br": "pt-BR",
  pt_br: "pt-BR",
  pt: "pt-BR",
  br: "pt-BR",
  "es-419": "es-419",
  es_419: "es-419",
  es: "es-419",
  mx: "es-419",
  ar: "es-419",
  co: "es-419",
  cl: "es-419",
  pe: "es-419",
  uy: "es-419",
  ec: "es-419",
  ve: "es-419",
};

/**
 * Resolves any incoming locale/country code to a supported GalleryLocale.
 * Unknown or unmapped inputs (e.g. "dk") fall back to DEFAULT_GALLERY_LOCALE.
 */
export function resolveGalleryLocale(input?: string | null): GalleryLocale {
  if (!input) return DEFAULT_GALLERY_LOCALE;
  const normalized = input.trim().toLowerCase();
  return LOCALE_ALIASES[normalized] ?? DEFAULT_GALLERY_LOCALE;
}

export const galleryDictionaries: Record<GalleryLocale, Record<string, string>> = {
  "pt-BR": {
    "gallery.brand": "Fio Vivo",
    "gallery.collection": "Coleção n.º {number}",
    "gallery.tagline": "O crochê se move",
    "gallery.previous": "Anterior",
    "gallery.next": "Próximo",
    "gallery.viewDetails": "Ver detalhes",
    "gallery.cta": "Conhecer a peça",
    "gallery.scene.profile": "Perfil",
    "gallery.scene.gesture": "Gesto",
    "gallery.scene.detail": "Detalhe",
    "gallery.productCounter": "{current} de {total}",
  },
  "es-419": {
    "gallery.brand": "Fio Vivo",
    "gallery.collection": "Colección n.º {number}",
    "gallery.tagline": "El crochet se mueve",
    "gallery.previous": "Anterior",
    "gallery.next": "Siguiente",
    "gallery.viewDetails": "Ver detalles",
    "gallery.cta": "Conocer la pieza",
    "gallery.scene.profile": "Perfil",
    "gallery.scene.gesture": "Gesto",
    "gallery.scene.detail": "Detalle",
    "gallery.productCounter": "{current} de {total}",
  },
};

/**
 * Translates a dictionary key for the given locale, falling back to the
 * default locale and finally the raw key if nothing is found.
 */
export function translateGallery(
  locale: GalleryLocale,
  key: string,
  params?: Record<string, string | number>
): string {
  const template =
    galleryDictionaries[locale]?.[key] ??
    galleryDictionaries[DEFAULT_GALLERY_LOCALE]?.[key] ??
    key;

  if (!params) return template;

  return Object.entries(params).reduce(
    (acc, [paramKey, value]) => acc.replaceAll(`{${paramKey}}`, String(value)),
    template
  );
}

export interface FioVivoLocalizedTitles {
  pt_BR: string;
  es_419: string;
}

/**
 * Product title translations. "a informar" handles are intentionally not
 * localized (untranslated placeholders stay as-is).
 */
export const fioVivoTitleTranslations: Record<string, FioVivoLocalizedTitles> = {
  "espiral-dourada": { pt_BR: "Espiral dourada", es_419: "Espiral dorada" },
  "orbita-negra": { pt_BR: "Órbita negra", es_419: "Órbita negra" },
  "trama-solar": { pt_BR: "Trama solar", es_419: "Trama solar" },
  "fio-ancestral": { pt_BR: "Fio ancestral", es_419: "Hilo ancestral" },
  "tranca-ambar": { pt_BR: "Trança âmbar", es_419: "Trenza ámbar" },
  "duna-terracota": { pt_BR: "Duna terracota", es_419: "Duna terracota" },
};

export function translateFioVivoTitle(
  handle: string,
  fallbackTitle: string,
  locale: GalleryLocale
): string {
  const entry = fioVivoTitleTranslations[handle];
  if (!entry) return fallbackTitle;
  return locale === "es-419" ? entry.es_419 : entry.pt_BR;
}
