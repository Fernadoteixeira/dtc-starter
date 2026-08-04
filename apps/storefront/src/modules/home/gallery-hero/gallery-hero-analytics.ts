import { GalleryItem, GalleryScene } from "@dtc/gallery-experience";

export function trackGalleryEvent(
  eventName: string,
  payload: {
    item?: GalleryItem;
    scene?: GalleryScene;
    index?: number;
    locale?: string;
  }
) {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", eventName, {
      product_id: payload.item?.id,
      product_handle: payload.item?.handle,
      index: payload.index,
      scene_id: payload.scene?.id,
      locale: payload.locale,
      timestamp: Date.now(),
    });
  }
}
