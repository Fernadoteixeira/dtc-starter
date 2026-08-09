import { MedusaService } from "@medusajs/framework/utils"
import ArtisanPricing from "./models/artisan-pricing"

class PricingEngineModuleService extends MedusaService({
  ArtisanPricing,
}) {
  async calculatePrice(artisanFloorPrice: number, regionalMultiplier: number = 1.0): Promise<number> {
    const finalPrice = Math.round(artisanFloorPrice * regionalMultiplier * 100) / 100
    return finalPrice
  }
}

export default PricingEngineModuleService
