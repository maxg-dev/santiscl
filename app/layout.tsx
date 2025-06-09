import type React from "react"
import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import "./globals.css"

const montserrat = Montserrat({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Santi's - Materiales Educativos Montessori",
  description:
    "Descubre hermosos juguetes y materiales educativos inspirados en los principios Montessori. Nutre la curiosidad natural de tu hijo y su amor por el aprendizaje.",
  keywords: "Montessori, juguetes educativos, niños, materiales de aprendizaje, productos para bebés",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={montserrat.className}>{children}</body>
    </html>
  )
}
