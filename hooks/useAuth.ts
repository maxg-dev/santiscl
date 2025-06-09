"use client"

import { useState, useEffect } from "react"
import { onAuthStateChange, type AdminUser } from "@/lib/firebase/auth"

export function useAuth() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  return { user, loading, isAuthenticated: !!user }
}
