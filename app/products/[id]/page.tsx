"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { notFound, useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, useRef, useMemo } from "react"
import { getProductAndVariants } from "@/lib/firebase/products"
import type { ParentProduct, ProductVariant } from "@/lib/types"
import Link from "next/link"
import { marked } from "marked"
import { formatPriceCLP, getCategoryDisplay } from "@/lib/utils"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface ProductDetailPageProps {
  params: {
    id: string
  }
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const parentProductId = params.id
  const router = useRouter()
  const searchParams = useSearchParams()

  const [parentProduct, setParentProduct] = useState<ParentProduct | null>(null)
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [mainDisplayedImage, setMainDisplayedImage] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [isZoomed, setIsZoomed] = useState(false)
  const [transformOrigin, setTransformOrigin] = useState("center center")
  const zoomLevel = 2
  const imageContainerRef = useRef<HTMLDivElement>(null)

  const availableAttributes = useMemo(() => {
    const attributesMap: { [key: string]: Map<string, { originalValue: string, representativeVariant: ProductVariant }> } = {};

    const allAttributeKeys: Set<string> = new Set();
    variants.forEach(variant => {
        for (const key in variant.attributes) {
            if (Object.prototype.hasOwnProperty.call(variant.attributes, key)) {
                allAttributeKeys.add(key);
            }
        }
    });

    allAttributeKeys.forEach(attrKey => {
        attributesMap[attrKey] = new Map();
        variants.forEach(variant => {
            const rawValue = variant.attributes?.[attrKey as keyof typeof variant.attributes];
            const normalizedValue = (rawValue === null || rawValue === undefined || rawValue === '') ? "__STANDARD_ATTR_VALUE__" : String(rawValue).toLowerCase();

            if (!attributesMap[attrKey].has(normalizedValue)) {
                attributesMap[attrKey].set(normalizedValue, {
                    originalValue: String(rawValue === null || rawValue === undefined || rawValue === '' ? 'Estándar' : rawValue), // Store user-friendly original value for display
                    representativeVariant: variant
                });
            }
        });
    });

    const result: { [key: string]: { normalizedValue: string, originalValue: string, representativeVariant: ProductVariant }[] } = {};
    for (const key in attributesMap) {
        result[key] = Array.from(attributesMap[key].entries())
            .map(([normalizedVal, data]) => ({
                normalizedValue: normalizedVal,
                originalValue: data.originalValue,
                representativeVariant: data.representativeVariant
            }))
            .sort((a, b) => {
                if (a.normalizedValue === "__STANDARD_ATTR_VALUE__") return -1;
                if (b.normalizedValue === "__STANDARD_ATTR_VALUE__") return 1;
                return a.originalValue.localeCompare(b.originalValue); // Sort other values alphabetically
            });
    }
    return result;
  }, [variants]);


  useEffect(() => {
    console.log("ProductDetailPage: useEffect [parentProductId] triggered. Fetching data for:", parentProductId);
    loadProductDetails();
  }, [parentProductId]);

  useEffect(() => {
    console.log("ProductDetailPage: useEffect [variants, searchParams] triggered for URL sync.");
    if (variants.length > 0) {
      const variantIdFromUrl = searchParams.get('variantId');
      let targetVariant = null;

      if (variantIdFromUrl) {
        targetVariant = variants.find(v => v.id === variantIdFromUrl);
        console.log("ProductDetailPage: Found variant from URL for sync:", targetVariant?.id);
      }

      if (!targetVariant && selectedVariant) {
          targetVariant = selectedVariant;
      } else if (!targetVariant) {
          targetVariant = variants.find(v => v.isDefault) || variants[0];
          console.log("ProductDetailPage: Falling back to default/first for sync:", targetVariant?.id);
      }

      if (targetVariant && targetVariant.id !== selectedVariant?.id) {
        setSelectedVariant(targetVariant);
        updateUrl(targetVariant.id);
        console.log("ProductDetailPage: Syncing selected variant and URL to:", targetVariant.id);
      } else if (targetVariant && searchParams.get('variantId') !== targetVariant.id) {
          updateUrl(targetVariant.id);
          console.log("ProductDetailPage: URL not synced, updating to:", targetVariant.id);
      }
    }
  }, [variants, searchParams, router]);

  useEffect(() => {
    if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
      setMainDisplayedImage(selectedVariant.images[0]);
    } else {
      setMainDisplayedImage("/placeholder.svg");
    }
  }, [selectedVariant]);


  const loadProductDetails = async () => {
    try {
      setError("")
      setLoading(true)
      console.log("Fetching product and variants for ID:", parentProductId);
      const data = await getProductAndVariants(parentProductId)

      console.log("Fetched data:", data);

      if (!data || !data.parent) {
        console.error("ProductDetailPage: No data or no parent product found for ID:", parentProductId);
        notFound()
      }

      setParentProduct(data.parent)
      setVariants(data.variants)

      const variantIdFromUrl = searchParams.get('variantId');
      let initialSelectedVariant = null;

      if (variantIdFromUrl) {
        initialSelectedVariant = data.variants.find(v => v.id === variantIdFromUrl);
        console.log("ProductDetailPage (loadDetails): Found variant from URL for initial selection:", initialSelectedVariant?.id);
      }

      if (!initialSelectedVariant) {
        initialSelectedVariant = data.variants.find(v => v.isDefault) || data.variants[0];
        console.log("ProductDetailPage (loadDetails): Falling back to default/first for initial selection:", initialSelectedVariant?.id);
      }

      if (initialSelectedVariant) {
          setSelectedVariant(initialSelectedVariant);
          updateUrl(initialSelectedVariant.id);
          console.log("ProductDetailPage (loadDetails): Initial selected variant set to:", initialSelectedVariant.id);
          setMainDisplayedImage(initialSelectedVariant.images?.[0] || "/placeholder.svg");
      } else {
          console.error("ProductDetailPage (loadDetails): No variants found for initial selection, despite parent existing.");
          notFound();
      }

      setLoading(false)
    } catch (fetchError: any) {
      console.error("Error al cargar detalles del producto:", fetchError)
      setError(fetchError.message || "Error al cargar el producto")
      setLoading(false)
    }
  }

  const updateUrl = (variantId: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('variantId', variantId);
    router.replace(`?${newSearchParams.toString()}`);
  };

  const handleVariantSelection = (variantId: string) => {
    const chosenVariant = variants.find(v => v.id === variantId);
    if (chosenVariant) {
      setSelectedVariant(chosenVariant);
      updateUrl(chosenVariant.id);
      setIsZoomed(false);
    }
  };

  const handleThumbnailClick = (imageUrl: string) => {
    setMainDisplayedImage(imageUrl);
    setIsZoomed(false);
  };

  const handleWhatsAppRequest = () => {
    if (!parentProduct || !selectedVariant) return
    const message = `¡Hola! Estoy interesado/a en ${parentProduct.name} - ${selectedVariant.variantName}. ¿Podrías proporcionarme más información?`
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "1234567890"
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !imageContainerRef.current) return

    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    setTransformOrigin(`${x}% ${y}%`)
  }

  const handleImageClick = () => {
    setIsZoomed(!isZoomed)
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
          <button onClick={loadProductDetails} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
            Intentar de Nuevo
          </button>
        </div>
      </div>
    )
  }

  if (!parentProduct || !selectedVariant) {
    console.log("ProductDetailPage: calling notFound() because parentProduct or selectedVariant is null (final check).");
    notFound()
  }

  const imagesToDisplay = selectedVariant.images || []

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
        <div className="grid md:grid-cols-2 gap-12">
          {/* Image Gallery Column */}
          <div className="space-y-4">
            <div
              ref={imageContainerRef}
              onClick={handleImageClick}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setIsZoomed(false)}
              className={`aspect-square relative bg-white rounded-lg overflow-hidden shadow-sm border border-orange-100
                ${isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"}
              `}
            >
              <Image
                src={mainDisplayedImage || "/placeholder.svg"}
                alt={`${parentProduct.name} ${selectedVariant.variantName}`}
                fill
                className="object-contain transition-transform duration-300 ease-out"
                style={{
                  transform: isZoomed ? `scale(${zoomLevel})` : "scale(1)",
                  transformOrigin: transformOrigin,
                }}
              />
            </div>

            {imagesToDisplay.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {imagesToDisplay.slice(0, 10).map((image, index) => (
                  <div
                    key={index}
                    className={`aspect-square relative bg-white rounded-lg overflow-hidden cursor-pointer w-20 h-20
                      ${mainDisplayedImage === image ? "border-2 border-orange-500 shadow-md" : "border border-orange-100 hover:border-orange-300"}
                    `}
                    onClick={() => handleThumbnailClick(image)}
                  >
                    <Image
                      src={image || "/placeholder.svg?height=400&width=400"}
                      alt={`${parentProduct.name} ${selectedVariant.variantName} thumbnail ${index + 1}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-orange-900 mb-3">
                {selectedVariant.variantName}
              </h1>

              <div className="flex items-center gap-3 mb-4">
                {parentProduct.highlighted && (
                  <div className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-full text-sm font-medium">
                    <span className="text-yellow-500 mr-1.5">⭐</span>
                    Destacado
                  </div>
                )}

                {parentProduct.category && (
                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1.5 rounded-full">
                    {getCategoryDisplay(parentProduct.category)}
                  </span>
                )}
              </div>

              <p className="text-2xl font-semibold text-orange-700">{formatPriceCLP(selectedVariant.price)}</p>
              {typeof selectedVariant.stock === "number" && (
                <p className="text-sm text-orange-700 mt-1">
                  Stock: {selectedVariant.stock} unidad{selectedVariant.stock === 1 ? "" : "es"}
                </p>
              )}
            </div>

            {Object.keys(availableAttributes).length > 0 && variants.length > 1 && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-100 space-y-4">
                    {Object.keys(availableAttributes).map(attrKey => (
                        <div key={attrKey}>
                            {/* Dynamic Container Title */}
                            <h2 className="text-xl font-semibold text-orange-900 mb-3 capitalize">
                                {attrKey}:
                            </h2>
                            <RadioGroup
                                value={((selectedVariant.attributes?.[attrKey as keyof typeof selectedVariant.attributes]) === null ||
                                        (selectedVariant.attributes?.[attrKey as keyof typeof selectedVariant.attributes]) === undefined ||
                                        (selectedVariant.attributes?.[attrKey as keyof typeof selectedVariant.attributes]) === '')
                                        ? "__STANDARD_ATTR_VALUE__"
                                        : String(selectedVariant.attributes?.[attrKey as keyof typeof selectedVariant.attributes]).toLowerCase()
                                }
                                onValueChange={(selectedValue) => {
                                    const normalizedSelectedValue = selectedValue;

                                    const currentAttributes = Object.keys(selectedVariant.attributes).reduce((acc, key) => {
                                        const val = selectedVariant.attributes[key as keyof typeof selectedVariant.attributes];
                                        acc[key as keyof typeof selectedVariant.attributes] = (val === null || val === undefined || val === '') ? "__STANDARD_ATTR_VALUE__" : String(val).toLowerCase();
                                        return acc;
                                    }, {} as { [key: string]: string });
                                    currentAttributes[attrKey] = normalizedSelectedValue;

                                    const newSelectedVariant = variants.find(v => {
                                        return Object.keys(currentAttributes).every(k => {
                                            const variantAttrValue = v.attributes?.[k as keyof typeof v.attributes];
                                            const normalizedVariantAttrValue = (variantAttrValue === null || variantAttrValue === undefined || variantAttrValue === '') ? "__STANDARD_ATTR_VALUE__" : String(variantAttrValue).toLowerCase();
                                            return currentAttributes[k] === normalizedVariantAttrValue;
                                        });
                                    });

                                    if (newSelectedVariant) {
                                        handleVariantSelection(newSelectedVariant.id);
                                    } else {
                                        console.warn(`No variant found matching attributes: ${JSON.stringify(currentAttributes)}`);
                                    }
                                }}
                                className="flex flex-wrap gap-4"
                            >
                                {availableAttributes[attrKey].map(attrOption => (
                                    <Label
                                        key={attrOption.normalizedValue}
                                        htmlFor={`${attrKey}-${attrOption.normalizedValue}`}
                                        className={`
                                            flex flex-col items-center p-2 rounded-md border text-sm font-medium cursor-pointer min-w-[120px] text-center
                                            ${((selectedVariant.attributes?.[attrKey as keyof typeof selectedVariant.attributes]) === null ||
                                               (selectedVariant.attributes?.[attrKey as keyof typeof selectedVariant.attributes]) === undefined ||
                                               (selectedVariant.attributes?.[attrKey as keyof typeof selectedVariant.attributes]) === '')
                                                ? (attrOption.normalizedValue === "__STANDARD_ATTR_VALUE__" ? 'bg-amber-400 text-white border-amber-400' : 'bg-white text-orange-700 border-orange-200 hover:bg-orange-50')
                                                : (String(selectedVariant.attributes?.[attrKey as keyof typeof selectedVariant.attributes]).toLowerCase() === attrOption.normalizedValue
                                                    ? 'bg-yellow-50 text-orange-700 border-yellow-400'
                                                    : 'bg-white text-orange-700 border-orange-200 hover:bg-yellow-50'
                                                  )
                                            }
                                        `}
                                    >
                                        <RadioGroupItem
                                            value={attrOption.normalizedValue}
                                            id={`${attrKey}-${attrOption.normalizedValue}`}
                                            className="sr-only"
                                        />
                                        {/* Display Variant's Main Image (made larger) */}
                                        {attrOption.representativeVariant.images?.[0] && (
                                            <div className="relative w-24 h-24 mb-2 rounded-md overflow-hidden border border-orange-100">
                                                <Image
                                                    src={attrOption.representativeVariant.images[0]}
                                                    alt={`${parentProduct.name} ${attrOption.representativeVariant.variantName}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}
                                        {/* Display Attribute Value (Original Casing) */}
                                        <span className="font-semibold text-base">
                                            {attrOption.originalValue}
                                        </span>
                                        {/* Display Variant's Price */}
                                        <span className="text-xs text-muted-foreground mt-1">
                                            {formatPriceCLP(attrOption.representativeVariant.price)}
                                        </span>
                                    </Label>
                                ))}
                            </RadioGroup>
                        </div>
                    ))}
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-100">
              <h2 className="text-xl font-semibold text-orange-900 mb-3">Descripción</h2>
              <div
                className="text-orange-700 leading-relaxed prose prose-orange"
                dangerouslySetInnerHTML={{ __html: marked.parse(selectedVariant.description || parentProduct.description || "", { breaks: true }) }}
              />
            </div>

            {parentProduct.ageRecommendation && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-100">
                <h2 className="text-xl font-semibold text-orange-900 mb-3">Edad Recomendada</h2>
                <p className="text-orange-700">{parentProduct.ageRecommendation}</p>
              </div>
            )}

            {selectedVariant.dimensions && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-100">
                <h2 className="text-xl font-semibold text-orange-900 mb-3">Especificaciones</h2>
                <div
                  className="text-orange-700 leading-relaxed prose prose-orange"
                  dangerouslySetInnerHTML={{ __html: marked.parse(selectedVariant.dimensions || "", { breaks: true }) }}
                />
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
