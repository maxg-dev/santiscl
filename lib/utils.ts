import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPriceCLP(price: number): string {
  // Ensure the price is an integer (no decimals for CLP)
  const integerPrice = Math.round(price);

  // Use Intl.NumberFormat for locale-aware formatting
  // 'es-CL' locale for Chilean Spanish
  // style: 'currency' will handle the currency symbol and its position
  // currency: 'CLP' specifies Chilean Peso
  // minimumFractionDigits and maximumFractionDigits are set to 0 for no decimals
  // useGrouping: true ensures the thousands separator (dot in es-CL)
  const formattedPrice = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(integerPrice);

  // Intl.NumberFormat might return "$199.990" or "CLP 199.990".
  // We want "$ 199.990". For CLP, 'es-CL' usually gives "$ 199.990".
  // If it outputs "CLP", replace it.
  // This step might be redundant if the locale behaves as expected but is safer.
  return formattedPrice.replace('CLP', '$').trim();
}
