"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiCall } from "@/hooks/use-api"

interface User {
  _id: string
  email: string
  name: string
  role: "farmer" | "manufacturer" | "distributor" | "retailer" | "customer"
  profile?: {
    phone?: string
    address?: string
    companyName?: string
    description?: string
  }
}

interface RegisterData {
  email: string
  password: string
  name: string
  role: string
  profile?: {
    phone?: string
    address?: string
    companyName?: string
    description?: string
  }
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<User>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      let token = localStorage.getItem("auth-token")
      if (!token) {
        const cookies = document.cookie.split(";")
        const authCookie = cookies.find((cookie) => cookie.trim().startsWith("auth-token="))
        if (authCookie) {
          token = authCookie.split("=")[1]
          localStorage.setItem("auth-token", token)
        }
      }

      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        localStorage.removeItem("auth-token")
        document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      localStorage.removeItem("auth-token")
      document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await apiCall<{ user: User; token: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })

      localStorage.setItem("auth-token", response.token)
      setUser(response.user)

      return {...response.user,token:response.token} // ✅ important for immediate redirect
    } catch (error) {
      throw error
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      await apiCall<{ user: User }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      })
      router.push("/login")
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("auth-token")
    document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    setUser(null)
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
