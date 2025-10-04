// lib/auth.ts
import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import { getDatabase } from "@/lib/mongodb"
import type { User } from "@/lib/models/User"
import { ObjectId } from "mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

interface AuthResult {
  success: boolean
  user?: User
  error?: string
}

export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  try {
    // ✅ Accept either cookie or Authorization header
    let token: string | undefined = request.cookies.get("auth-token")?.value

    // If missing, try Authorization header
    if (!token) {
      const authHeader = request.headers.get("Authorization")
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.slice(7)
      }
    }

    if (!token) {
      console.warn("verifyAuth: No token provided")
      return { success: false, error: "No token provided" }
    }

    // ✅ Verify and decode JWT
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    if (!decoded?.userId) {
      console.warn("verifyAuth: Invalid token payload")
      return { success: false, error: "Invalid token" }
    }

    // ✅ Load user from DB
    const db = await getDatabase()
    const user = await db
      .collection<User>("users")
      .findOne({ _id: new ObjectId(decoded.userId) })

    if (!user) {
      console.warn("verifyAuth: User not found in DB")
      return { success: false, error: "User not found" }
    }

    return { success: true, user }
  } catch (err) {
    console.error("verifyAuth error:", err)
    return { success: false, error: "Invalid token" }
  }
}
