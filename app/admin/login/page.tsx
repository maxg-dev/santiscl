"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signInAdmin } from "@/lib/firebase/auth"
import { useAuth } from "@/hooks/useAuth"
import { isFirebaseConfigured } from "@/lib/firebase/config"
import Link from "next/link"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [firebaseConfigured, setFirebaseConfigured] = useState(false)
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    setFirebaseConfigured(isFirebaseConfigured())
  }, [])

  useEffect(() => {
    if (!loading && user) {
      router.push("/admin")
    }
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!firebaseConfigured) {
      setError("Firebase no está configurado. Por favor configura Firebase.")
      return
    }

    if (!email || !password) {
      setError("Por favor completa todos los campos")
      return
    }

    setIsLoading(true)

    try {
      await signInAdmin(email, password)
      router.push("/admin")
    } catch (error: any) {
      console.error("Error en login:", error)
      setError(error.message || "Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-orange-700">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Navegación */}
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

      <div className="flex items-center justify-center py-20">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-orange-100 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-orange-900 mb-2">Acceso Administrativo</h1>
            <p className="text-orange-700">Inicia sesión para acceder al panel de administración</p>
          </div>

          {!firebaseConfigured && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Firebase No Configurado</h3>
              <p className="text-red-700 text-sm mb-4">
                Para usar la autenticación, necesitas configurar Firebase. Crea un archivo{" "}
                <code className="bg-red-100 px-1 rounded">.env.local</code> con tu configuración de Firebase.
              </p>
              <div className="text-sm text-red-600">
                <p className="font-medium mb-2">Variables requeridas:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>NEXT_PUBLIC_FIREBASE_API_KEY</li>
                  <li>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</li>
                  <li>NEXT_PUBLIC_FIREBASE_PROJECT_ID</li>
                  <li>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET</li>
                  <li>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID</li>
                  <li>NEXT_PUBLIC_FIREBASE_APP_ID</li>
                </ul>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-orange-900 mb-2">
                Correo Electrónico
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-orange-200 focus:border-orange-500"
                placeholder="admin@santis.com"
                disabled={!firebaseConfigured}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-orange-900 mb-2">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-orange-200 focus:border-orange-500"
                placeholder="••••••••"
                disabled={!firebaseConfigured}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || !firebaseConfigured}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
            >
              {isLoading ? "Iniciando Sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-orange-600 hover:text-orange-800 text-sm underline">
              Volver al sitio principal
            </Link>
          </div>

          {firebaseConfigured && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">Configuración Inicial</h4>
              <p className="text-blue-700 text-sm">
                Para crear el primer usuario administrador, visita{" "}
                <Link href="/setup" className="underline">
                  /setup
                </Link>{" "}
                o contacta al desarrollador.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
