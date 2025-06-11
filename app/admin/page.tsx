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
import { useRouter } from "next/navigation"
import { formatPriceCLP } from "@/lib/utils"

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
      // Eliminar imágenes del storage
      if (product.images) {
        await Promise.all(product.images.map(deleteImage))
      }

      // Eliminar producto de Firestore
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
      // Continuar eliminando de la lista local aunque falle el storage
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
    })
    setError("")
    setSuccess("")
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
        {/* Navegación */}
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

          {/* Mensajes de estado */}
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

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Formulario de Producto */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-orange-100">
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

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-orange-900 mb-2">
                    Descripción *
                  </label>
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
                  <label htmlFor="dimensions" className="block text-sm font-medium text-orange-900 mb-2">
                    Dimensiones
                  </label>
                  <Input
                    id="dimensions"
                    type="text"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    className="border-orange-200 focus:border-orange-500"
                    placeholder="ej., 10cm x 15cm x 5cm"
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
                            className="w-full h-24 object-cover rounded border"
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

            {/* Lista de Productos */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-orange-100">
              <h2 className="text-2xl font-semibold text-orange-900 mb-6">Productos ({products.length})</h2>

              {products.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-orange-700 mb-4">No hay productos registrados.</p>
                  <p className="text-orange-600 text-sm">Agrega tu primer producto usando el formulario.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {products.map((product) => (
                    <div key={product.id} className="border border-orange-100 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-orange-900">{product.name}</h3>
                          <p className="text-orange-700 text-sm mt-1 line-clamp-2">{product.description}</p>
                          <p className="text-orange-800 font-medium mt-2">{formatPriceCLP(product.price)}</p>
                          {product.ageRecommendation && (
                            <p className="text-orange-600 text-sm mt-1">Edad: {product.ageRecommendation}</p>
                          )}
                          {product.createdAt && (
                            <p className="text-orange-500 text-xs mt-1">
                              Creado: {product.createdAt.toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        {product.images && product.images[0] && (
                          <Image
                            src={product.images[0] || "/placeholder.svg"}
                            alt={product.name}
                            width={60}
                            height={60}
                            className="w-15 h-15 object-cover rounded ml-4"
                          />
                        )}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => handleEdit(product)}
                          size="sm"
                          variant="outline"
                          className="border-orange-600 text-orange-600 hover:bg-orange-50"
                          disabled={isLoading}
                        >
                          Editar
                        </Button>
                        <Button
                          onClick={() => handleDelete(product)}
                          size="sm"
                          variant="outline"
                          className="border-red-600 text-red-600 hover:bg-red-50"
                          disabled={isLoading}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
