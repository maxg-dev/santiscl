"use client"

import { useState, useEffect } from "react"
import { getAllParentProducts, getProductVariants } from "@/lib/firebase/products"
import { getDownloadUrlForFile } from "@/lib/firebase/storage"
import type { ParentProduct, ProductVariant } from "@/lib/types"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import ProductCategoryCarousel from "@/components/ProductCategoryCarousel"
import ProductCard from "@/components/ProductCard"

// Define product categories with their display names and emojis
const CATEGORIES = {
  highlighted: { name: "Destacados", emoji: "🌟", slug: "highlighted" },
  "early-childhood": { name: "Primera infancia", emoji: "🧸", slug: "early-childhood" },
  "on-the-move": { name: "En movimiento", emoji: "🚲", slug: "on-the-move" },
  "play-corners": { name: "Rincones de juego", emoji: "🏡", slug: "play-corners" },
  "exploration-and-climbing": { name: "Exploración y escalada", emoji: "🧗‍♂️", slug: "exploration-and-climbing" },
}

// Define the order in which categories should appear on the page
const CATEGORY_ORDER: CategoryKey[] = [
  "highlighted",
  "early-childhood",
  "on-the-move",
  "play-corners",
  "exploration-and-climbing",
]

type CategoryKey = keyof typeof CATEGORIES

interface DisplayProduct {
  parent: ParentProduct;
  defaultVariant: ProductVariant;
}

export default function ProductsPage() {
  const [allDisplayProducts, setAllDisplayProducts] = useState<DisplayProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredDisplayProducts, setFilteredDisplayProducts] = useState<DisplayProduct[]>([])
  const [pdfCatalogUrl, setPdfCatalogUrl] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [productsByCategory, setProductsByCategory] = useState<Record<string, DisplayProduct[]>>({})

  // Load products and PDF catalog URL on component mount
  useEffect(() => {
    loadProductsAndVariants()
    loadPdfCatalogUrl()
  }, [])

  // Filter products whenever allDisplayProducts or searchQuery changes
  useEffect(() => {
    if (searchQuery === "") {
      setFilteredDisplayProducts(allDisplayProducts);
    } else {
      setFilteredDisplayProducts(
        allDisplayProducts.filter((displayProduct) =>
          normalizeString(displayProduct.parent.name).includes(normalizeString(searchQuery)) ||
          normalizeString(displayProduct.defaultVariant.variantName).includes(normalizeString(searchQuery))
        )
      );
    }
    // Group products by category whenever allDisplayProducts or filteredDisplayProducts changes
    // This needs to run AFTER filtering to group the currently visible products
    const grouped = groupProductsByCategory(searchQuery ? filteredDisplayProducts : allDisplayProducts);
    setProductsByCategory(grouped);
  }, [allDisplayProducts, searchQuery]) // Depend on allDisplayProducts and searchQuery

  // Helper function to normalize strings for search (lowercase and remove diacritics)
  const normalizeString = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  /**
   * Fetches all parent products and their default variants, then updates state.
   */
  const loadProductsAndVariants = async () => {
    try {
      setError("")
      setLoading(true)
      const parentProducts = await getAllParentProducts()

      const displayProductsPromises = parentProducts.map(async (parent) => {
        const variants = await getProductVariants(parent.id)
        let defaultVariant = variants.find(v => v.isDefault) || variants[0] // Find default or take first

        // If no variants exist for a parent, we might want to skip it or handle it.
        // For now, if no variant, defaultVariant will be undefined, so the ProductCard will handle it.
        if (!defaultVariant) {
            console.warn(`No variants found for parent product: ${parent.name} (${parent.id})`);
            return null; // Skip this product if it has no variants
        }

        return { parent, defaultVariant }
      })

      const loadedDisplayProducts = (await Promise.all(displayProductsPromises)).filter(Boolean) as DisplayProduct[];

      setAllDisplayProducts(loadedDisplayProducts)
      setLoading(false)
    } catch (error: any) {
      console.error("Error al cargar productos y variantes:", error)
      setError(error.message || "Error al cargar productos y variantes")
      setLoading(false)
    }
  }

  /**
   * Loads the PDF catalog download URL from Firebase Storage.
   */
  const loadPdfCatalogUrl = async () => {
    try {
      const url = await getDownloadUrlForFile("catalogs/santis_catalog.pdf")
      setPdfCatalogUrl(url)
    } catch (err) {
      console.error("Error loading PDF catalog URL:", err)
      setPdfCatalogUrl(null)
    }
  }

  /**
   * Handles the PDF catalog download.
   */
  const handleDownloadPdf = async () => {
    if (!pdfCatalogUrl) {
      console.error("PDF catalog URL is not available.")
      return
    }

    setIsDownloading(true)
    try {
      const response = await fetch(pdfCatalogUrl)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const blob = await response.blob()

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "Catálogo de Productos Santi's.pdf"
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Error during PDF download:", err)
      setError("Error al descargar el catálogo. Por favor, inténtalo de nuevo.")
    } finally {
      setIsDownloading(false)
    }
  }

  /**
   * Groups a list of DisplayProduct objects by their categories.
   * @param productsToGroup The array of DisplayProduct objects to group.
   * @returns A record mapping category slug to an array of DisplayProduct.
   */
  const groupProductsByCategory = (productsToGroup: DisplayProduct[]) => {
    const grouped: Record<string, DisplayProduct[]> = {
      highlighted: [],
      "early-childhood": [],
      "on-the-move": [],
      "play-corners": [],
      "exploration-and-climbing": []
    }

    productsToGroup.forEach((displayProduct) => {
      // Add to highlighted if marked
      if (displayProduct.parent.highlighted) {
        grouped.highlighted.push(displayProduct)
      }

      // Add to its specific category
      const categoryKey = Object.keys(CATEGORIES).find(
        (key) => displayProduct.parent.category === CATEGORIES[key as CategoryKey].slug
      ) as CategoryKey | undefined

      if (categoryKey && grouped[categoryKey]) {
        grouped[categoryKey].push(displayProduct)
      } else {
        // Fallback for uncategorized products or products with unknown categories
        const fallbackKey: CategoryKey = "play-corners" // Or create a "misc" category
        grouped[fallbackKey].push(displayProduct)
      }
    })

    // Sort products within each category (except highlighted, which might have its own order logic later)
    Object.keys(grouped).forEach((category) => {
      if (category !== "highlighted") {
        grouped[category].sort((a, b) => a.parent.name.localeCompare(b.parent.name));
      }
    });

    return grouped
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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-orange-900 mb-4">Nuestros Productos</h1>
          <p className="text-xl text-orange-700 max-w-2xl mx-auto">
            Explora nuestra colección cuidadosamente seleccionada de materiales educativos inspirados en Montessori.
          </p>
          {/* PDF Catalog Download Button
          {pdfCatalogUrl && (
            <div className="mt-6">
              <button
                // Using a regular button instead of custom Button component for direct download behavior
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-orange-600 text-orange-600 hover:bg-orange-50 px-4 py-2"
                onClick={handleDownloadPdf}
                disabled={isDownloading}
              >
                {isDownloading ? "Descargando..." : "¡Descarga nuestro catálogo!"}
              </button>
            </div>
          )} */}
        </div>

        <div className="mb-8">
          <Input
            type="text"
            placeholder="Buscar productos por nombre o variante"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
              <button onClick={loadProductsAndVariants} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
                Intentar de Nuevo
              </button>
            </div>
          </div>
        ) : (searchQuery && filteredDisplayProducts.length === 0) ? (
          <div className="text-center py-12">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-orange-800 mb-2">No se encontraron productos</h3>
              <p className="text-orange-700">
                No hay productos que coincidan con &quot;{searchQuery}&quot;.
              </p>
            </div>
          </div>
        ) : allDisplayProducts.length === 0 && !searchQuery ? ( // Check allDisplayProducts, not filtered
          <div className="text-center py-12">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-orange-800 mb-2">No Hay Productos</h3>
              <p className="text-orange-700">
                Aún no hay productos disponibles para mostrar.
              </p>
            </div>
          </div>
        ) : searchQuery ? ( // If there's a search query, show filtered products directly
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDisplayProducts.map((displayProduct) => (
              <ProductCard
                key={displayProduct.parent.id + "-" + displayProduct.defaultVariant.id}
                parentProduct={displayProduct.parent}
                variant={displayProduct.defaultVariant}
              />
            ))}
          </div>
        ) : ( // Otherwise, display by category carousel
          <div className="space-y-12">
            {CATEGORY_ORDER.map((key) => {
              const category = CATEGORIES[key]
              const productsForCategory = productsByCategory[key] || [];
              // Only render carousel if there are products in the category
              if (productsForCategory.length === 0) return null;

              return (
                <ProductCategoryCarousel
                  key={key}
                  title={category.name}
                  emoji={category.emoji}
                  products={productsForCategory}
                  categorySlug={category.slug}
                />
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
