import { model } from "@medusajs/framework/utils"

const ArtisanPricing = model.define("artisan_pricing", {
  id: model.id().primaryKey(),
  variant_id: model.text().nullable(),
  artisan_floor_price: model.number(),
  regional_multiplier: model.number().default(1.0),
  craft_category: model.text().nullable(),
  calculated_final_price: model.number(),
})

export default ArtisanPricing
