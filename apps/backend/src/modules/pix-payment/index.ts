import PixPaymentProviderService from "./service"
import { ModuleProvider } from "@medusajs/framework/utils"

export default ModuleProvider("payment", {
  services: [PixPaymentProviderService],
})
