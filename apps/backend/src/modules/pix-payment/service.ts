import { AbstractPaymentProvider } from "@medusajs/framework/utils"

export default class PixPaymentProviderService extends AbstractPaymentProvider {
  static identifier = "pix"

  constructor(container: any, options?: any) {
    // @ts-ignore
    super(container, options)
  }

  async initiatePayment(input: any): Promise<any> {
    const amount = input?.amount ?? 0
    const currency_code = input?.currency_code ?? "brl"
    
    const pixCopyPasteKey = `00020126580014br.gov.bcb.pix0136fio-vivo-${Date.now()}520400005303986540${Number(amount).toFixed(2)}5802BR5913FIO VIVO ART6009SAO PAULO62070503***6304`
    
    return {
      data: {
        status: "pending",
        pix_copy_paste_key: pixCopyPasteKey,
        qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixCopyPasteKey)}`,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        amount,
        currency_code,
      },
    }
  }

  async authorizePayment(paymentSessionData: any): Promise<any> {
    return {
      status: "authorized",
      data: {
        ...(paymentSessionData || {}),
        status: "authorized",
        authorized_at: new Date().toISOString(),
      },
    }
  }

  async capturePayment(paymentSessionData: any): Promise<any> {
    return {
      ...(paymentSessionData || {}),
      status: "captured",
      captured_at: new Date().toISOString(),
    }
  }

  async refundPayment(input: any): Promise<any> {
    return {
      ...(typeof input === "object" ? input : {}),
      status: "refunded",
    }
  }

  async cancelPayment(paymentSessionData: any): Promise<any> {
    return {
      ...(paymentSessionData || {}),
      status: "canceled",
    }
  }

  async deletePayment(paymentSessionData: any): Promise<any> {
    return {
      ...(paymentSessionData || {}),
      status: "deleted",
    }
  }

  async retrievePayment(paymentSessionData: any): Promise<any> {
    return paymentSessionData
  }

  async updatePayment(paymentSessionData: any): Promise<any> {
    return paymentSessionData
  }

  async getWebhookActionAndData(data: any): Promise<any> {
    return {
      action: "not_supported",
      data,
    }
  }

  async getPaymentStatus(paymentSessionData: any): Promise<any> {
    const status = paymentSessionData?.status as string
    if (status === "captured") return "captured"
    if (status === "authorized") return "authorized"
    if (status === "canceled") return "canceled"
    return "pending"
  }
}
