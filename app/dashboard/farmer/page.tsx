"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FarmerDashboard } from "@/components/farmer/farmer-dashboard"

export default function FarmerDashboardPage() {
  const router = useRouter()
  const [canRender, setCanRender] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login") // redirect if no token
    } else {
      setCanRender(true) // render dashboard if token exists
    }
  }, [router])

  if (!canRender) return <p>Loading dashboard...</p>

  return <FarmerDashboard />
}