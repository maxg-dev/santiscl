"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { getProducts } from "@/lib/firebase/products"
import type { Product } from "@/lib/types"
import Link from "next/link"
import ProductCard from "@/components/ProductCard"
import { ChevronLeft } from "lucide-react"

const CATEGORIES = {
  highlighted: { name: "Destacados", emoji: "🌟" },
  "early-childhood": { name: "Primera infancia", emoji: "🧸" },
  "on-the-move": { name: "En movimiento", emoji: "🚲" },
  "play-corners": { name: "Rincones de juego", emoji: "🏡" },
  "exploration-and-climbing": { name: "Exploración y escalada", emoji: "🧗‍♂️" },
}

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const category = CATEGORIES[slug as keyof typeof CATEGORIES] || {
    name: "Category Not Found",
    emoji: "❓",
  }

  useEffect(() => {
    loadProducts()
  }, [slug])

  const loadProducts = async () => {
    try {
      setError("")
      setLoading(true)
      const allProducts = await getProducts()
      const filteredProducts = filterProductsByCategory(allProducts, slug)

      setProducts(filteredProducts)
    } catch (error: any) {
      console.error("Error al cargar productos:", error)
      setError(error.message || "Error al cargar productos")
    } finally {
      setLoading(false)
    }
  }

  const filterProductsByCategory = (products: Product[], categorySlug: string) => {
    if (categorySlug === "highlighted") {
      return products.filter((product) => product.highlighted)
    }
  
    return products
      .filter((product) => product.category === categorySlug)
      .sort((a, b) => a.name.localeCompare(b.name))
  }  

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
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
        <div className="mb-8">
          <Link href="/products" className="inline-flex items-center text-orange-700 hover:text-orange-900">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver a todos los productos
          </Link>
        </div>

        <div className="mb-12">
          <h1 className="text-3xl font-bold text-orange-900 mb-4">
            {category.emoji} {category.name}
          </h1>
          <p className="text-lg text-orange-700">Explora nuestra colección de productos en esta categoría.</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-orange-700">Cargando productos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error al Cargar Productos</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button onClick={loadProducts} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
                Intentar de Nuevo
              </button>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-orange-800 mb-2">No Hay Productos</h3>
              <p className="text-orange-700">
                Aún no hay productos disponibles en esta categoría. Vuelve pronto para ver nuestras novedades.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
