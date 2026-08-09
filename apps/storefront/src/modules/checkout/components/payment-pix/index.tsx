"use client"

import { useState } from "react"
import { CheckCircleSolid, DocumentText } from "@medusajs/icons"

type PixPaymentDisplayProps = {
  pixCopyPasteKey?: string
  qrCodeUrl?: string
  expiresAt?: string
}

export default function PixPaymentDisplay({
  pixCopyPasteKey = "00020126580014br.gov.bcb.pix0136fio-vivo-demo-key-520400005303986540150.005802BR5913FIO VIVO ART6009SAO PAULO62070503***6304",
  qrCodeUrl,
  expiresAt,
}: PixPaymentDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixCopyPasteKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback if clipboard API is not available
      setCopied(false)
    }
  }

  const computedQrCodeUrl =
    qrCodeUrl ||
    `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
      pixCopyPasteKey
    )}`

  return (
    <div className="mt-4 p-6 bg-neutral-50 border border-neutral-200 rounded-lg flex flex-col items-center text-center space-y-5">
      <div className="flex items-center gap-x-2">
        <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
        <h3 className="text-lg font-semibold text-neutral-900">
          Pagamento via Pix Instantâneo
        </h3>
      </div>

      <p className="text-sm text-neutral-600 max-w-md">
        Leia o QR Code abaixo com o aplicativo do seu banco ou copie a chave Pix para realizar o pagamento.
      </p>

      {/* QR Code Display */}
      <div className="p-3 bg-white border border-neutral-200 rounded-xl shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={computedQrCodeUrl}
          alt="QR Code Pix Fio Vivo"
          className="w-48 h-48 object-contain"
        />
      </div>

      {expiresAt && (
        <p className="text-xs text-neutral-500">
          Esta chave expira em:{" "}
          <span className="font-medium text-neutral-700">
            {new Date(expiresAt).toLocaleTimeString("pt-BR")}
          </span>
        </p>
      )}

      {/* Pix Copy & Paste Key Box */}
      <div className="w-full max-w-md space-y-2 text-left">
        <label className="text-xs font-medium text-neutral-700">
          Chave Copia e Cola (Pix)
        </label>
        <div className="flex items-center gap-x-2">
          <input
            type="text"
            readOnly
            value={pixCopyPasteKey}
            className="flex-1 px-3 py-2 text-xs font-mono bg-white border border-neutral-300 rounded-md text-neutral-800 focus:outline-none select-all truncate"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors flex items-center gap-x-1.5 shrink-0"
          >
            {copied ? (
              <>
                <CheckCircleSolid className="w-4 h-4 text-emerald-400" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <DocumentText className="w-4 h-4" />
                <span>Copiar Chave</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="w-full max-w-md p-4 bg-emerald-50/60 border border-emerald-100 rounded-lg text-left text-xs text-neutral-700 space-y-1.5">
        <p className="font-semibold text-emerald-900 mb-1">Como pagar:</p>
        <ol className="list-decimal list-inside space-y-1 text-neutral-600">
          <li>Acesse o app do seu banco ou instituição financeira</li>
          <li>Escolha a opção <strong>Pix</strong> e selecione <strong>Copia e Cola</strong> ou <strong>Ler QR Code</strong></li>
          <li>Cole a chave acima ou aponte a câmera para o QR Code</li>
          <li>Confira os dados do destinatário e confirme a transferência</li>
        </ol>
      </div>
    </div>
  )
}
