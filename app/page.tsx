import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-orange-900 mb-6">Bienvenidos a Santi's</h1>
          <p className="text-xl text-orange-700 mb-8 max-w-2xl mx-auto">
            Descubre hermosos juguetes y materiales educativos inspirados en los principios Montessori. Nutre la
            curiosidad natural de tu hijo y su amor por el aprendizaje.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 text-lg">
                Ver Productos
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="border-orange-600 text-orange-600 hover:bg-orange-50 px-8 py-3 text-lg"
              >
                Contáctanos
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-orange-100">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🧸</span>
            </div>
            <h3 className="text-xl font-semibold text-orange-900 mb-2">Materiales de Calidad</h3>
            <p className="text-orange-700">
              Materiales cuidadosamente seleccionados, seguros y duraderos para una exploración infinita.
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-orange-100">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🌱</span>
            </div>
            <h3 className="text-xl font-semibold text-orange-900 mb-2">Enfoque Educativo</h3>
            <p className="text-orange-700">Cada producto apoya el desarrollo natural y el aprendizaje independiente.</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-orange-100">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💝</span>
            </div>
            <h3 className="text-xl font-semibold text-orange-900 mb-2">Servicio Personalizado</h3>
            <p className="text-orange-700">Obtén recomendaciones personalizadas y apoyo para el viaje de tu hijo.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
