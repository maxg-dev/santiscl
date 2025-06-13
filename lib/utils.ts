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

export function getCategoryDisplay(category: string, withEmoji = true): string {
  const categories: Record<string, { label: string; emoji: string }> = {
    "early-childhood": { label: "Primera infancia", emoji: "🧸" },
    "on-the-move": { label: "En movimiento", emoji: "🚲" },
    "play-corners": { label: "Rincones de juego", emoji: "🏡" },
    "exploration-and-climbing": { label: "Exploración y escalada", emoji: "🧗‍♂️" },
    "all": { label: "Todos los productos", emoji: "📦" },
  }

  const data = categories[category]
  if (!data) return withEmoji ? `📦 ${category}` : category

  return withEmoji ? `${data.emoji} ${data.label}` : data.label
}