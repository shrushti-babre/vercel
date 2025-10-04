import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { signToken } from "@/lib/jwt"
import { getDatabase } from "@/lib/mongodb"
import type { User, UserSession } from "@/lib/models/User"

export async function POST(request: NextRequest) {
  try {
    const JWT_SECRET = process.env.JWT_SECRET
    if (!JWT_SECRET) {
      console.error("[v0] JWT_SECRET environment variable is missing")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    console.log("[v0] Attempting login for:", email)

    const db = await getDatabase()
    const usersCollection = db.collection<User>("users")

    // Find user
    const user = await usersCollection.findOne({ email })
    if (!user) {
      console.log("[v0] User not found:", email)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log("[v0] User found, verifying password")

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      console.log("[v0] Invalid password for user:", email)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log("[v0] Password verified, generating token")

    const token = signToken({ userId: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" })

    // Store session
    const sessionsCollection = db.collection<UserSession>("sessions")
    const session: Omit<UserSession, "_id"> = {
      userId: user._id!,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: new Date(),
    }
    await sessionsCollection.insertOne(session)

    console.log("[v0] Session created, login successful")

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    const response = NextResponse.json({
      message: "Login successful",
      user: userWithoutPassword,
      token,
    })

    response.cookies.set("auth-token", token, {
      httpOnly: false, // Allow client-side access for now
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
