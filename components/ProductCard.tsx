"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/types"
import { formatPriceCLP } from "@/lib/utils"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const handleWhatsAppRequest = () => {
    const message = `¡Hola! Estoy interesado/a en ${product.name}. ¿Podrías proporcionarme más información?`
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "1234567890"
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-orange-100 overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/products/${product.id}`}>
        <div className="aspect-square relative bg-orange-50">
          <Image
            src={product.images[0] || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      <div className="p-6">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-lg font-semibold text-orange-900 mb-2 hover:text-orange-700 transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="text-orange-700 text-sm mb-4 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-orange-800">{formatPriceCLP(product.price)}</span>

          <Button onClick={handleWhatsAppRequest} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
            Solicitar
          </Button>
        </div>
      </div>
    </div>
  )
}
