import { GalleryItem, GalleryScene } from "@dtc/gallery-experience";

declare global {
  interface Window {
    gtag?: (command: string, action: string, params?: Record<string, unknown>) => void;
  }
}

export function trackGalleryEvent(
  eventName: string,
  payload: {
    item?: GalleryItem;
    scene?: GalleryScene;
    index?: number;
    locale?: string;
  }
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, {
      product_id: payload.item?.id,
      product_handle: payload.item?.handle,
      index: payload.index,
      scene_id: payload.scene?.id,
      locale: payload.locale,
      timestamp: Date.now(),
    });
  }
}
