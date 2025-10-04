import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import type { Supplier } from "@/lib/models/Supplier"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    const filter = type ? { type } : {}
    const suppliers = await db.collection<Supplier>("suppliers").find(filter).sort({ name: 1 }).toArray()

    return NextResponse.json(suppliers)
  } catch (error) {
    console.error("Error fetching suppliers:", error)
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const supplierData = await request.json()

    const newSupplier: Supplier = {
      ...supplierData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection<Supplier>("suppliers").insertOne(newSupplier)

    return NextResponse.json(
      {
        ...newSupplier,
        _id: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating supplier:", error)
    return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 })
  }
}
