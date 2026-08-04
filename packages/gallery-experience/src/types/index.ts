export interface GalleryImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface GalleryScene {
  id: string;
  image: GalleryImage;
  label: string;
}

export interface GalleryPrice {
  amount: number;
  currencyCode: string;
  formatted: string;
  originalAmount?: number;
}

export type GalleryAvailability =
  | "available"
  | "low-stock"
  | "out-of-stock"
  | "preorder"
  | "unavailable";

export interface GalleryItem {
  id: string;
  handle: string;
  title: string;
  contextualName?: string;
  description?: string;
  artist?: string;
  material?: string;
  category?: string;
  year?: string | number;
  primaryImage: GalleryImage;
  scenes: GalleryScene[];
  price?: GalleryPrice;
  availability: GalleryAvailability;
  productUrl: string;
  tags?: string[];
  ambientColors?: readonly [string, string, string];
  metadata?: Record<string, unknown>;
}

export interface GalleryProgress {
  currentIndex: number;
  totalItems: number;
  activeSceneId?: string;
}

export interface GalleryExperienceProps {
  items: GalleryItem[];
  collectionTitle?: string;
  collectionNumber?: string;
  collectionNarrative?: string;
  initialItemHandle?: string;
  locale?: string;
  reducedMotion?: boolean;
  onItemView?: (item: GalleryItem, index: number) => void;
  onSceneView?: (item: GalleryItem, scene: GalleryScene) => void;
  onProductIntent?: (item: GalleryItem) => void;
  onShare?: (item: GalleryItem) => void;
  onProgressChange?: (progress: GalleryProgress) => void;
}
