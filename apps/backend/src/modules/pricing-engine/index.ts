import PricingEngineModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const PRICING_ENGINE_MODULE = "pricingEngine"

export default Module(PRICING_ENGINE_MODULE, {
  service: PricingEngineModuleService,
})
