"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getProducts, addProduct, updateProduct, deleteProduct } from "@/lib/firebase/products"
import { uploadImage, deleteImage } from "@/lib/firebase/storage"
import { signOutAdmin } from "@/lib/firebase/auth"
import { useAuth } from "@/hooks/useAuth"
import ProtectedRoute from "@/components/ProtectedRoute"
import type { Product } from "@/lib/types"
import Image from "next/image"
import Link from "next/link"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Info } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatPriceCLP } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { getCategoryDisplay } from "@/lib/utils"

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    ageRecommendation: "",
    dimensions: "",
    images: [] as string[],
    category: "",
    highlighted: false,
    stock: "",
  })

  useEffect(() => {
    if (user) {
      loadProducts()
    }
  }, [user])

  const loadProducts = async () => {
    try {
      setError("")
      const productsData = await getProducts()
      setProducts(productsData)
    } catch (error: any) {
      console.error("Error al cargar productos:", error)
      setError(error.message || "Error al cargar productos")
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setIsLoading(true)
    setError("")

    try {
      const uploadPromises = Array.from(files).map(uploadImage)
      const uploadedUrls = await Promise.all(uploadPromises)
      setFormData({ ...formData, images: [...formData.images, ...uploadedUrls] })
      setSuccess("Imágenes subidas exitosamente")
    } catch (error: any) {
      console.error("Error al subir imágenes:", error)
      setError(error.message || "Error al subir imágenes")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!formData.name || !formData.description || !formData.price) {
      setError("Por favor completa todos los campos requeridos")
      return
    }

    setIsLoading(true)

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        ageRecommendation: formData.ageRecommendation,
        dimensions: formData.dimensions,
        images: formData.images,
        category: formData.category,
        highlighted: formData.highlighted,
        stock: formData.stock ? Number(formData.stock) : 0,
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData)
        setSuccess("Producto actualizado exitosamente")
      } else {
        await addProduct(productData)
        setSuccess("Producto agregado exitosamente")
      }

      setFormData({
        name: "",
        description: "",
        price: "",
        ageRecommendation: "",
        dimensions: "",
        images: [],
        category: "",
        highlighted: false,
        stock: ""
      })
      setEditingProduct(null)
      await loadProducts()
    } catch (error: any) {
      console.error("Error al guardar producto:", error)
      setError(error.message || "Error al guardar producto")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      ageRecommendation: product.ageRecommendation || "",
      dimensions: product.dimensions || "",
      images: product.images || [],
      category: product.category || "",
      highlighted: product.highlighted || false,
      stock: product.stock?.toString() || ""
    })
    setError("")
    setSuccess("")
  }

  const handleDelete = async (product: Product) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${product.name}"?`)) {
      return
    }

    setIsLoading(true)
    setError("")

    try {
      if (product.images) {
        await Promise.all(product.images.map(deleteImage))
      }

      await deleteProduct(product.id)
      setSuccess("Producto eliminado exitosamente")
      await loadProducts()
    } catch (error: any) {
      console.error("Error al eliminar producto:", error)
      setError(error.message || "Error al eliminar producto")
    } finally {
      setIsLoading(false)
    }
  }

  const removeImage = async (index: number) => {
    const imageUrl = formData.images[index]
    try {
      await deleteImage(imageUrl)
      const newImages = formData.images.filter((_, i) => i !== index)
      setFormData({ ...formData, images: newImages })
    } catch (error) {
      console.error("Error al eliminar imagen:", error)
      const newImages = formData.images.filter((_, i) => i !== index)
      setFormData({ ...formData, images: newImages })
    }
  }

  const handleSignOut = async () => {
    try {
      await signOutAdmin()
      router.push("/admin/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  const cancelEdit = () => {
    setEditingProduct(null)
    setFormData({
      name: "",
      description: "",
      price: "",
      ageRecommendation: "",
      dimensions: "",
      images: [],
      category: "",
      highlighted: false,
      stock: ""
    })
    setError("")
    setSuccess("")
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
        <nav className="bg-white shadow-sm border-b border-orange-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-2xl font-bold text-orange-800">
                Santi's - Admin
              </Link>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-orange-700">Bienvenido, {user?.email}</span>
                <Link href="/" className="text-orange-700 hover:text-orange-900 font-medium">
                  Ir al Sitio
                </Link>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="border-orange-600 text-orange-600 hover:bg-orange-50"
                >
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-orange-900 mb-4">Panel de Administración</h1>
            <p className="text-xl text-orange-700">Gestiona los productos de Santi's</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-700">{success}</p>
            </div>
          )}

          <div className="admin-grid">
            <div className="admin-form">
              <h2 className="text-2xl font-semibold text-orange-900 mb-6">
                {editingProduct ? "Editar Producto" : "Agregar Nuevo Producto"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-orange-900 mb-2">
                    Nombre del Producto *
                  </label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="border-orange-200 focus:border-orange-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="early-childhood">🧸 Primera infancia</SelectItem>
                      <SelectItem value="on-the-move">🚲 En movimiento</SelectItem>
                      <SelectItem value="play-corners">🏡 Rincones de juego</SelectItem>
                      <SelectItem value="exploration-and-climbing">🧗‍♂️ Exploración y escalada</SelectItem>
                      <SelectItem value="all">Todos los productos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <label htmlFor="description" className="block text-sm font-medium text-orange-900">
                      Descripción *
                    </label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-orange-600 ml-2 cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs text-xs">
                          <h4 className="font-bold mb-1">Guía de Markdown:</h4>
                          <ul className="list-disc list-inside space-y-0.5 pl-4">
                            <li>Encabezado 1: # Título</li>
                            <li>Encabezado 2: ## Subtítulo</li>
                            <li>Negrita: **texto**</li>
                            <li>Cursiva: *texto*</li>
                            <li>Código inline: `code`</li>
                            <li>Listas: - item</li>
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Textarea
                    id="description"
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="border-orange-200 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-orange-900 mb-2">
                    Precio ($) *
                  </label>
                  <Input
                    id="price"
                    type="number"
                    step="10"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="border-orange-200 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-orange-900 mb-2">
                    Stock disponible
                  </label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="border-orange-200 focus:border-orange-500"
                    placeholder="ej., 10"
                  />
                </div>

                <div>
                  <label htmlFor="ageRecommendation" className="block text-sm font-medium text-orange-900 mb-2">
                    Edad Recomendada
                  </label>
                  <Input
                    id="ageRecommendation"
                    type="text"
                    value={formData.ageRecommendation}
                    onChange={(e) => setFormData({ ...formData, ageRecommendation: e.target.value })}
                    className="border-orange-200 focus:border-orange-500"
                    placeholder="ej., 3-6 años"
                  />
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <label htmlFor="dimensions" className="block text-sm font-medium text-orange-900">
                      Especificaciones *
                    </label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-orange-600 ml-2 cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs text-xs">
                          <h4 className="font-bold mb-1">Guía de Markdown:</h4>
                          <ul className="list-disc list-inside space-y-0.5 pl-4">
                            <li>Encabezado 1: # Título</li>
                            <li>Encabezado 2: ## Subtítulo</li>
                            <li>Negrita: **texto**</li>
                            <li>Cursiva: *texto*</li>
                            <li>Código inline: `code`</li>
                            <li>Listas: - item</li>
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Textarea
                    id="dimensions"
                    rows={4}
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    className="border-orange-200 focus:border-orange-500"
                    placeholder="ej., Material: Madera de pino, Peso: 1.5 kg, Certificaciones: CE"
                  />
                </div>

                <div>
                  <label htmlFor="images" className="block text-sm font-medium text-orange-900 mb-2">
                    Imágenes del Producto
                  </label>
                  <Input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="border-orange-200 focus:border-orange-500"
                  />
                  <p className="text-sm text-orange-600 mt-1">Máximo 5MB por imagen. Formatos: JPG, PNG, WebP</p>

                  {formData.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative">
                          <Image
                            src={image || "/placeholder.svg"}
                            alt={`Imagen del producto ${index + 1}`}
                            width={100}
                            height={100}
                            className="w-full h-24 object-contain rounded border"
                          />
                          <Button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs p-0"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="highlighted"
                    checked={formData.highlighted}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, highlighted: checked }))}
                  />
                  <Label htmlFor="highlighted">Marcar como producto destacado</Label>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
                  >
                    {isLoading ? "Guardando..." : editingProduct ? "Actualizar Producto" : "Agregar Producto"}
                  </Button>
                  {editingProduct && (
                    <Button
                      type="button"
                      onClick={cancelEdit}
                      variant="outline"
                      className="border-orange-600 text-orange-600 hover:bg-orange-50"
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>
            </div>

            <div className="admin-product-list">
              <div className="admin-product-list-header">
                <h2 className="text-2xl font-semibold text-orange-900">Productos ({products.length})</h2>
              </div>

              <div className="admin-product-list-content">
                {products.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-orange-700 mb-4">No hay productos registrados.</p>
                    <p className="text-orange-600 text-sm">Agrega tu primer producto usando el formulario.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="border border-orange-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            <Image
                              src={product.images?.[0] || "/placeholder.svg"}
                              alt={product.name}
                              width={120}
                              height={120}
                              className="w-30 h-30 object-contain rounded-lg"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-orange-900 mb-2 truncate">{product.name}</h3>

                            {(product.category || product.highlighted) && (
                              <div className="flex items-center gap-2 mb-2">
                                {product.category && (
                                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                                    {getCategoryDisplay(product.category)}
                                  </span>
                                )}
                                {product.highlighted && (
                                  <span className="text-yellow-500 text-lg" title="Producto destacado">
                                    ⭐
                                  </span>
                                )}
                              </div>
                            )}

                            <p className="text-orange-700 text-sm mb-2 line-clamp-2">{product.description}</p>

                            <p className="text-sm text-orange-700">
                              Stock: {product.stock ?? "No especificado"}
                            </p>

                            <div className="flex items-center justify-between">
                              <p className="text-xl font-bold text-orange-800">{formatPriceCLP(product.price)}</p>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleEdit(product)}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs border-orange-600 text-orange-600 hover:bg-orange-50"
                                  disabled={isLoading}
                                >
                                  Editar
                                </Button>
                                <Button
                                  onClick={() => handleDelete(product)}
                                  variant="destructive"
                                  size="sm"
                                  className="text-xs"
                                  disabled={isLoading}
                                >
                                  Eliminar
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
