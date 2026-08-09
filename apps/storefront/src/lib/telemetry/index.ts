import { AddToCartEvent, BeginCheckoutEvent, PurchaseEvent, ViewItemEvent } from "./events"

export * from "./events"

export type TelemetryEvent =
  | { type: "view_item"; payload: ViewItemEvent }
  | { type: "add_to_cart"; payload: AddToCartEvent }
  | { type: "begin_checkout"; payload: BeginCheckoutEvent }
  | { type: "purchase"; payload: PurchaseEvent }

interface CustomWindow extends Window {
  dataLayer?: unknown[]
}

export function trackTelemetryEvent(event: TelemetryEvent) {
  if (typeof window !== "undefined") {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[Telemetry P0] Event: ${event.type}`, event.payload)
    }

    window.dispatchEvent(
      new CustomEvent("fio_vivo_telemetry", {
        detail: {
          timestamp: new Date().toISOString(),
          event: event.type,
          ...event.payload,
        },
      })
    )

    const customWin = window as CustomWindow
    if (Array.isArray(customWin.dataLayer)) {
      customWin.dataLayer.push({
        event: event.type,
        ecommerce: event.payload,
      })
    }
  }
}
