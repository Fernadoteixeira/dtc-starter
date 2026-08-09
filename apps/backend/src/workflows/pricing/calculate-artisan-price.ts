import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { PRICING_ENGINE_MODULE } from "../../modules/pricing-engine"
import PricingEngineModuleService from "../../modules/pricing-engine/service"

export type CalculateArtisanPriceInput = {
  artisan_floor_price: number
  regional_multiplier?: number
  craft_category?: string
  variant_id?: string
}

export type CalculateArtisanPriceOutput = {
  artisan_floor_price: number
  regional_multiplier: number
  craft_category?: string
  calculated_final_price: number
}

export const calculateArtisanPriceStep = createStep(
  "calculate-artisan-price",
  async (input: CalculateArtisanPriceInput, { container }) => {
    const pricingEngineService: PricingEngineModuleService = container.resolve(PRICING_ENGINE_MODULE)
    const multiplier = input.regional_multiplier ?? 1.0
    const finalPrice = await pricingEngineService.calculatePrice(input.artisan_floor_price, multiplier)

    return new StepResponse({
      artisan_floor_price: input.artisan_floor_price,
      regional_multiplier: multiplier,
      craft_category: input.craft_category,
      calculated_final_price: finalPrice,
    })
  }
)

export const calculateArtisanPriceWorkflow = createWorkflow(
  "calculate-artisan-price",
  function (input: CalculateArtisanPriceInput) {
    const result = calculateArtisanPriceStep(input)
    return new WorkflowResponse(result)
  }
)
