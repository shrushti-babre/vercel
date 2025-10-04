import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { ObjectId } from "mongodb"
import { getDatabase } from "@/lib/mongodb"
import type { User } from "@/lib/models/User"

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      password,
      role,
      companyName,
      contactPerson,
      phone,
      address,
      city,
      state,
      pinCode,
    } = await request.json()

    // Required fields validation
    if (!email || !password || !role || !companyName || !contactPerson || !phone || !address) {
      return NextResponse.json({ error: "Please fill in all required fields" }, { status: 400 })
    }

    const db = await getDatabase()
    const usersCollection = db.collection<User>("users")

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user object
    const newUser: User = {
      _id: new ObjectId(),
      email,
      password: hashedPassword,
      name: companyName, // store company/personal name
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        companyName,
        contactPerson,
        phone,
        address,
        description: ${city || ""}, ${state || ""}, ${pinCode || ""},
      },
    }

    const result = await usersCollection.insertOne(newUser)

    return NextResponse.json({
      message: "User created successfully",
      userId: result.insertedId,
    })
  } catch (error) {
    console.error("[Signup] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}