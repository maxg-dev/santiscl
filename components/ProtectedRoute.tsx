"use client"

import type React from "react"

import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-orange-700">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      fallback || (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-orange-100 text-center">
            <h2 className="text-2xl font-bold text-orange-900 mb-4">Acceso Denegado</h2>
            <p className="text-orange-700 mb-4">No tienes permisos para acceder a esta página.</p>
            <a href="/admin/login" className="text-orange-600 hover:text-orange-800 underline">
              Iniciar Sesión
            </a>
          </div>
        </div>
      )
    )
  }

  return <>{children}</>
}
