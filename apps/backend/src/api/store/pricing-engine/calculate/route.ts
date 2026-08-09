import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { calculateArtisanPriceWorkflow } from "../../../../workflows/pricing/calculate-artisan-price"

export async function POST(
  req: MedusaRequest<{
    artisan_floor_price: number
    regional_multiplier?: number
    craft_category?: string
    variant_id?: string
  }>,
  res: MedusaResponse
) {
  const { artisan_floor_price, regional_multiplier, craft_category, variant_id } = req.body

  if (typeof artisan_floor_price !== "number") {
    return res.status(400).json({
      message: "artisan_floor_price is required and must be a number",
    })
  }

  const { result } = await calculateArtisanPriceWorkflow(req.scope).run({
    input: {
      artisan_floor_price,
      regional_multiplier,
      craft_category,
      variant_id,
    },
  })

  return res.status(200).json({
    pricing: result,
  })
}
