export function isGalleryHeroEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_GALLERY_HERO_ENABLED === "false") {
    return false;
  }
  return true;
}

export function getGalleryHeaderMode(): "commerce-bar" | "immersive-overlay" {
  if (process.env.NEXT_PUBLIC_GALLERY_HEADER_MODE === "immersive-overlay") {
    return "immersive-overlay";
  }
  return "commerce-bar";
}
