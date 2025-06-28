"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { getAllParentProducts, getProductVariants } from "@/lib/firebase/products"
import type { ParentProduct, ProductVariant } from "@/lib/types"
import Link from "next/link"
import ProductCard from "@/components/ProductCard"
import { ChevronLeft } from "lucide-react"

// Define product categories with their display names and emojis
const CATEGORIES = {
  highlighted: { name: "Destacados", emoji: "🌟" },
  "early-childhood": { name: "Primera infancia", emoji: "🧸" },
  "on-the-move": { name: "En movimiento", emoji: "🚲" },
  "play-corners": { name: "Rincones de juego", emoji: "🏡" },
  "exploration-and-climbing": { name: "Exploración y escalada", emoji: "🧗‍♂️" },
}

// Define a type for products displayed in the list, combining parent and default variant
interface DisplayProduct {
  parent: ParentProduct;
  defaultVariant: ProductVariant;
}

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string

  const [displayProducts, setDisplayProducts] = useState<DisplayProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Determine the category details based on the slug
  const category = CATEGORIES[slug as keyof typeof CATEGORIES] || {
    name: "Categoría no encontrada",
    emoji: "❓",
  }

  // Load products when the component mounts or slug changes
  useEffect(() => {
    loadCategoryProductsAndVariants()
  }, [slug]) // Re-run effect if the category slug changes

  /**
   * Fetches parent products and their default variants for the current category, then updates state.
   */
  const loadCategoryProductsAndVariants = async () => {
    try {
      setError("")
      setLoading(true)
      const allParentProducts = await getAllParentProducts()

      // Filter parent products by the current category slug or highlighted status
      const filteredParents = filterParentsByCategory(allParentProducts, slug);

      const displayProductsPromises = filteredParents.map(async (parent) => {
        const variants = await getProductVariants(parent.id)
        let defaultVariant = variants.find(v => v.isDefault) || variants[0] // Find default or take first

        if (!defaultVariant) {
            console.warn(`No variants found for parent product: ${parent.name} (${parent.id}) in category ${slug}. Skipping.`);
            return null;
        }

        return { parent, defaultVariant }
      })

      const loadedDisplayProducts = (await Promise.all(displayProductsPromises)).filter(Boolean) as DisplayProduct[];

      setDisplayProducts(loadedDisplayProducts)
      setLoading(false)
    } catch (error: any) {
      console.error("Error al cargar productos de categoría:", error)
      setError(error.message || "Error al cargar productos de categoría")
      setLoading(false)
    }
  }

  /**
   * Filters a list of ParentProduct objects by category slug or highlighted status.
   * @param parentProducts The array of ParentProduct objects to filter.
   * @param categorySlug The slug of the category to filter by.
   * @returns An array of ParentProduct objects matching the category/highlighted status.
   */
  const filterParentsByCategory = (parentProducts: ParentProduct[], categorySlug: string) => {
    let filtered: ParentProduct[] = [];

    if (categorySlug === "highlighted") {
      // For the 'highlighted' slug, filter by the highlighted property
      filtered = parentProducts.filter((parent) => parent.highlighted);
    } else {
      // For other slugs, filter by the parent product's category
      filtered = parentProducts.filter((parent) => parent.category === categorySlug);
    }

    // Always sort by name for consistent display within a category
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
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
        {/* Back button to all products */}
        <div className="mb-8">
          <Link href="/products" className="inline-flex items-center text-orange-700 hover:text-orange-900">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver a todos los productos
          </Link>
        </div>

        {/* Category title and description */}
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
              <button onClick={loadCategoryProductsAndVariants} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
                Intentar de Nuevo
              </button>
            </div>
          </div>
        ) : displayProducts.length === 0 ? (
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
            {displayProducts.map((displayProduct) => (
              <ProductCard
                key={displayProduct.parent.id + "-" + displayProduct.defaultVariant.id}
                parentProduct={displayProduct.parent}
                variant={displayProduct.defaultVariant}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
