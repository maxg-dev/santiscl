"use client"

import { useState, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import ProductCard from "@/components/ProductCard"
import type { Product } from "@/lib/types"

interface ProductCategoryCarouselProps {
  title: string
  emoji: string
  products: Product[]
  categorySlug: string
}

export default function ProductCategoryCarousel({
  title,
  emoji,
  products,
  categorySlug,
}: ProductCategoryCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const scroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return

    const scrollAmount = 300
    const currentScroll = carouselRef.current.scrollLeft
    const newScroll = direction === "left" ? currentScroll - scrollAmount : currentScroll + scrollAmount

    carouselRef.current.scrollTo({
      left: newScroll,
      behavior: "smooth",
    })

    setTimeout(() => {
      if (!carouselRef.current) return

      setShowLeftArrow(carouselRef.current.scrollLeft > 0)
      setShowRightArrow(
        carouselRef.current.scrollLeft < carouselRef.current.scrollWidth - carouselRef.current.clientWidth - 10,
      )
    }, 300)
  }

  if (products.length === 0) return null

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-orange-900">
          {emoji} {title}
        </h2>
        {products.length > 4 && (
          <Link href={`/products/category/${categorySlug}`}>
            <Button variant="link" className="text-orange-600 hover:text-orange-800">
              Ver productos
            </Button>
          </Link>
        )}
      </div>

      <div className="relative">
        {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
            aria-label="Desplazar a la izquierda"
          >
            <ChevronLeft className="h-6 w-6 text-orange-700" />
          </button>
        )}

        <div
          ref={carouselRef}
          className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onScroll={() => {
            if (!carouselRef.current) return
            setShowLeftArrow(carouselRef.current.scrollLeft > 0)
            setShowRightArrow(
              carouselRef.current.scrollLeft < carouselRef.current.scrollWidth - carouselRef.current.clientWidth - 10,
            )
          }}
        >
          {products.map((product) => (
            <div key={product.id} className="min-w-[250px] max-w-[250px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
            aria-label="Desplazar a la derecha"
          >
            <ChevronRight className="h-6 w-6 text-orange-700" />
          </button>
        )}
      </div>
    </div>
  )
}
