"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createAdminUser } from "@/lib/firebase/auth"
import { isFirebaseConfigured } from "@/lib/firebase/config"
import Link from "next/link"

export default function SetupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!isFirebaseConfigured()) {
      setError("Firebase no está configurado. Verifica tu archivo .env.local")
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setIsLoading(true)

    try {
      await createAdminUser(email, password)
      setSuccess(true)
    } catch (error: any) {
      console.error("Error creando admin:", error)
      if (error.code === "auth/email-already-in-use") {
        setError("Este email ya está registrado")
      } else if (error.code === "auth/weak-password") {
        setError("La contraseña es muy débil")
      } else if (error.code === "auth/invalid-email") {
        setError("Email inválido")
      } else {
        setError(error.message || "Error al crear usuario administrador")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-orange-100 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✅</span>
          </div>
          <h1 className="text-2xl font-bold text-green-800 mb-4">¡Usuario Administrador Creado!</h1>
          <p className="text-green-700 mb-6">
            El usuario administrador ha sido creado exitosamente. Ahora puedes iniciar sesión.
          </p>
          <div className="space-y-3">
            <Link href="/admin/login">
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">Ir al Login de Admin</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full border-orange-600 text-orange-600 hover:bg-orange-50">
                Volver al Inicio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <nav className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-orange-800">
              Santi's
            </Link>
            <Link href="/" className="text-orange-700 hover:text-orange-900 font-medium">
              Volver al Inicio
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center py-20">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-orange-100 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-orange-900 mb-2">Configuración Inicial</h1>
            <p className="text-orange-700">Crear el primer usuario administrador</p>
          </div>

          {!isFirebaseConfigured() && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Firebase No Configurado</h3>
              <p className="text-red-700 text-sm">
                Para crear usuarios administradores, necesitas configurar Firebase. Crea un archivo{" "}
                <code className="bg-red-100 px-1 rounded">.env.local</code> con tu configuración de Firebase.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-orange-900 mb-2">
                Email del Administrador
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-orange-200 focus:border-orange-500"
                placeholder="admin@santis.com"
                disabled={!isFirebaseConfigured()}
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
                placeholder="Mínimo 6 caracteres"
                disabled={!isFirebaseConfigured()}
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-orange-900 mb-2">
                Confirmar Contraseña
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border-orange-200 focus:border-orange-500"
                placeholder="Repetir contraseña"
                disabled={!isFirebaseConfigured()}
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
              disabled={isLoading || !isFirebaseConfigured()}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
            >
              {isLoading ? "Creando Usuario..." : "Crear Administrador"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">⚠️ Importante</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Esta página es solo para configuración inicial</li>
              <li>• Solo crea un usuario administrador</li>
              <li>• Después de crear el admin, usa /admin/login</li>
              <li>• Guarda las credenciales en un lugar seguro</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
