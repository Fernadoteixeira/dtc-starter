export type ViewItemEvent = {
  item_id: string
  item_name: string
  price: number
  currency: string
  category?: string
}

export type AddToCartEvent = {
  item_id: string
  item_name: string
  quantity: number
  price: number
  currency: string
}

export type BeginCheckoutEvent = {
  cart_id: string
  total_amount: number
  currency: string
  item_count: number
}

export type PurchaseEvent = {
  order_id: string
  total_amount: number
  currency: string
  payment_provider?: string
}
