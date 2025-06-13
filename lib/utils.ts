import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPriceCLP(price: number): string {
  const integerPrice = Math.round(price)

  const formattedPrice = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(integerPrice)

  return formattedPrice.replace("CLP", "$").trim()
}

// 👇 Agrega getCategoryDisplay como función separada aquí
export function getCategoryDisplay(category: string): string {
  const categories: Record<string, string> = {
    "early-childhood": "🧸 Primera infancia",
    "on-the-move": "🚲 En movimiento",
    "play-corners": "🏡 Rincones de juego",
    "exploration-and-climbing": "🧗‍♂️ Exploración y escalada",
    "all": "📦 Todos los productos",
  }
  return categories[category] || `📦 ${category}`
}
