"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { notFound } from "next/navigation"
import { useState, useEffect } from "react"
import { getProduct } from "@/lib/firebase/products"
import type { Product } from "@/lib/types"
import Link from "next/link"

interface ProductDetailPageProps {
  params: {
    id: string
  }
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadProduct()
  }, [params.id])

  const loadProduct = async () => {
    try {
      setError("")
      const productData = await getProduct(params.id)
      if (!productData) {
        notFound()
      }
      setProduct(productData)
    } catch (error: any) {
      console.error("Error al cargar producto:", error)
      setError(error.message || "Error al cargar producto")
    } finally {
      setLoading(false)
    }
  }

  const handleWhatsAppRequest = () => {
    if (!product) return
    const message = `¡Hola! Estoy interesado/a en ${product.name}. ¿Podrías proporcionarme más información?`
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "1234567890"
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-orange-700">Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error al Cargar Producto</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <Link href="/products" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
            Volver a Productos
          </Link>
        </div>
      </div>
    )
  }

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Navegación */}
      <nav className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-orange-800">
              Santi's
            </Link>
            <div className="flex space-x-6">
              <Link href="/" className="text-orange-700 hover:text-orange-900 font-medium">
                Inicio
              </Link>
              <Link href="/products" className="text-orange-700 hover:text-orange-900 font-medium">
                Productos
              </Link>
              <Link href="/contact" className="text-orange-700 hover:text-orange-900 font-medium">
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Imágenes del Producto */}
          <div className="space-y-4">
            <div className="aspect-square relative bg-white rounded-lg overflow-hidden shadow-sm border border-orange-100">
              <Image
                src={product.images?.[0] || "/placeholder.svg?height=400&width=400"}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-3 gap-4">
                {product.images.slice(1, 4).map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square relative bg-white rounded-lg overflow-hidden shadow-sm border border-orange-100"
                  >
                    <Image
                      src={image || "/placeholder.svg?height=400&width=400"}
                      alt={`${product.name} ${index + 2}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detalles del Producto */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-orange-900 mb-2">{product.name}</h1>
              <p className="text-2xl font-semibold text-orange-700">${product.price}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-100">
              <h2 className="text-xl font-semibold text-orange-900 mb-3">Descripción</h2>
              <p className="text-orange-700 leading-relaxed">{product.description}</p>
            </div>

            {product.ageRecommendation && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-100">
                <h2 className="text-xl font-semibold text-orange-900 mb-3">Edad Recomendada</h2>
                <p className="text-orange-700">{product.ageRecommendation}</p>
              </div>
            )}

            {product.dimensions && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-100">
                <h2 className="text-xl font-semibold text-orange-900 mb-3">Dimensiones</h2>
                <p className="text-orange-700">{product.dimensions}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleWhatsAppRequest}
                className="bg-green-600 hover:bg-green-700 text-white flex-1"
                size="lg"
              >
                Solicitar por WhatsApp
              </Button>
              <Button
                variant="outline"
                className="border-orange-600 text-orange-600 hover:bg-orange-50 flex-1"
                size="lg"
              >
                Enviar Consulta
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
