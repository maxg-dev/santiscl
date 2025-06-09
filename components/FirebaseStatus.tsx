"use client"

import { useState, useEffect } from "react"
import { isFirebaseConfigured } from "@/lib/firebase/config"

export default function FirebaseStatus() {
  const [configured, setConfigured] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setConfigured(isFirebaseConfigured())
    setLoading(false)
  }, [])

  if (loading) return null

  if (!configured) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-yellow-400">⚠️</span>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Firebase no configurado:</strong> La aplicación funcionará con limitaciones.
              <a href="/setup" className="underline ml-1">
                Configurar ahora
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}
