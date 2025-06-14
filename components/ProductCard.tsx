"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/types"
import { cn, formatPriceCLP, getCategoryDisplay } from "@/lib/utils"

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
    
    <div 
      className={cn(
        "bg-white rounded-lg shadow-sm border border-orange-100",
        "overflow-hidden hover:shadow-md hover:scale-[1.02]",
        "transition-transform duration-300 flex flex-col h-full"
      )}
    >
      <Link href={`/products/${product.id}`}>
        <div className="aspect-square relative bg-orange-50">
          <Image
            src={product.images?.[0] || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
          />
          {product.highlighted && (
            <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 rounded-full p-1">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
            </div>
          )}
        </div>
      </Link>

      <div className="p-6 flex flex-col flex-1">
        <Link href={`/products/${product.id}`}>
        <h3 className="text-lg font-semibold text-orange-900 mb-2 hover:text-orange-700 transition-colors">
          {product.name}
        </h3>
        </Link>

        <div className="mb-2">
        {product.category && (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
            {getCategoryDisplay(product.category, true)}
          </span>
        )}
        </div>

        <p className="text-orange-700 text-sm mb-4 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-xl font-bold text-orange-800">{formatPriceCLP(product.price)}</span>

          <Button onClick={handleWhatsAppRequest} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
            <span className="hidden sm:inline">Solicitar</span>
            <span className="sm:hidden">💬</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
