"use client"

import { useState, useEffect } from "react"
import { getProducts } from "@/lib/firebase/products"
import { getDownloadUrlForFile } from "@/lib/firebase/storage"
import type { Product } from "@/lib/types"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import ProductCategoryCarousel from "@/components/ProductCategoryCarousel"
import ProductCard from "@/components/ProductCard"

const CATEGORIES = {
  highlighted: { name: "Destacados", emoji: "🌟", slug: "highlighted" },
  "early-childhood": { name: "Primera infancia", emoji: "🧸", slug: "early-childhood" },
  "on-the-move": { name: "En movimiento", emoji: "🚲", slug: "on-the-move" },
  "play-corners": { name: "Rincones de juego", emoji: "🏡", slug: "play-corners" },
  "exploration-and-climbing": { name: "Exploración y escalada", emoji: "🧗‍♂️", slug: "exploration-and-climbing" },
}

const CATEGORY_ORDER: CategoryKey[] = [
  "highlighted",
  "early-childhood",
  "on-the-move",
  "play-corners",
  "exploration-and-climbing",
]

type CategoryKey = keyof typeof CATEGORIES

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [pdfCatalogUrl, setPdfCatalogUrl] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [productsByCategory, setProductsByCategory] = useState<Record<string, Product[]>>({})

  useEffect(() => {
    loadProducts()
    loadPdfCatalogUrl()
  }, [])
  
  useEffect(() => {
    if (products.length > 0) {
      const grouped = groupProductsByCategory(products)
      setProductsByCategory(grouped)

      if (searchQuery === "") {
        setFilteredProducts(products)
      }
    }
  }, [products])

  const normalizeString = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  useEffect(() => {
    setFilteredProducts(
      products.filter((product) => normalizeString(product.name).includes(normalizeString(searchQuery)))
    )
  }, [products, searchQuery])

  const loadProducts = async () => {
    try {
      setError("")
      const productsData = await getProducts()
      setProducts(productsData)
    } catch (error: any) {
      console.error("Error al cargar productos:", error)
      setError(error.message || "Error al cargar productos")
    } finally {
      setLoading(false)
    }
  }

  const loadPdfCatalogUrl = async () => {
    try {
      const url = await getDownloadUrlForFile("catalogs/santis_catalog.pdf")
      setPdfCatalogUrl(url)
    } catch (err) {
      console.error("Error loading PDF catalog URL:", err)
      setPdfCatalogUrl(null)
    }
  }

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

  const groupProductsByCategory = (products: Product[]) => {
    const grouped: Record<string, Product[]> = {
      highlighted: [],
      "early-childhood": [],
      "on-the-move": [],
      "play-corners": [],
      "exploration-and-climbing": []
    }
  
    products.forEach((product) => {
      if (product.highlighted) {
        grouped.highlighted.push(product)
      }
    
      const categoryKey = Object.keys(CATEGORIES).find(
        (key) => product.category === CATEGORIES[key as CategoryKey].slug
      ) as CategoryKey | undefined
    
      if (categoryKey && grouped[categoryKey]) {
        grouped[categoryKey].push(product)
      } else {
        const fallbackKey: CategoryKey = "play-corners"
        grouped[fallbackKey].push(product)
      }      
    })
  
    Object.keys(grouped).forEach((category) => {
      if (category !== "highlighted") {
        grouped[category].sort((a, b) => a.name.localeCompare(b.name))
      }
    })
  
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
          {/* {pdfCatalogUrl && (
            <div className="mt-6">
              <Button
                variant="outline"
                className="border-orange-600 text-orange-600 hover:bg-orange-50"
                onClick={handleDownloadPdf}
                disabled={isDownloading}
              >
                {isDownloading ? "Descargando..." : "¡Descarga nuestro catálogo!"}
              </Button>
            </div>
          )} */}
        </div>

        <div className="mb-8">
          <Input
            type="text"
            placeholder="Buscar productos por nombre"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
        ) : (searchQuery && filteredProducts.length === 0) ? (

          <div className="text-center py-12">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-orange-800 mb-2">No se encontraron productos</h3>
              <p className="text-orange-700">
                No hay productos que coincidan con &quot;{searchQuery}&quot;.
              </p>
            </div>
          </div>
        ) : products.length === 0 && !searchQuery ? (
          <div className="text-center py-12">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-orange-800 mb-2">No Hay Productos</h3>
              <p className="text-orange-700">
                Aún no hay productos disponibles para mostrar.
              </p>
            </div>
          </div>
        ) : searchQuery ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="space-y-12">
            {CATEGORY_ORDER.map((key) => {
              const category = CATEGORIES[key]
              return (
                <ProductCategoryCarousel
                  key={key}
                  title={category.name}
                  emoji={category.emoji}
                  products={productsByCategory[key] || []}
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
