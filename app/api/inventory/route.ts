import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import type { InventoryItem } from "@/lib/models/Inventory"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const supplierId = searchParams.get("supplierId")

    const filter: any = {}
    if (status) filter.status = status
    if (supplierId) filter.supplierId = new ObjectId(supplierId)

    const inventory = await db.collection<InventoryItem>("inventory").find(filter).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(inventory)
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const inventoryData = await request.json()

    const newItem: InventoryItem = {
      ...inventoryData,
      productId: new ObjectId(inventoryData.productId),
      supplierId: new ObjectId(inventoryData.supplierId),
      status: "available",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection<InventoryItem>("inventory").insertOne(newItem)

    return NextResponse.json(
      {
        ...newItem,
        _id: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating inventory item:", error)
    return NextResponse.json({ error: "Failed to create inventory item" }, { status: 500 })
  }
}
