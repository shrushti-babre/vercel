import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import type { SupplyChainAnalytics } from "@/lib/models/Analytics"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")
    const supplierId = searchParams.get("supplierId")

    const filter: any = {}
    if (productId) filter.productId = new ObjectId(productId)
    if (supplierId) filter.supplierId = new ObjectId(supplierId)

    const analytics = await db
      .collection<SupplyChainAnalytics>("analytics")
      .find(filter)
      .sort({ "period.endDate": -1 })
      .limit(10)
      .toArray()

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const analyticsData = await request.json()

    const newAnalytics: SupplyChainAnalytics = {
      ...analyticsData,
      productId: analyticsData.productId ? new ObjectId(analyticsData.productId) : undefined,
      supplierId: analyticsData.supplierId ? new ObjectId(analyticsData.supplierId) : undefined,
      period: {
        startDate: new Date(analyticsData.period.startDate),
        endDate: new Date(analyticsData.period.endDate),
      },
      createdAt: new Date(),
    }

    const result = await db.collection<SupplyChainAnalytics>("analytics").insertOne(newAnalytics)

    return NextResponse.json(
      {
        ...newAnalytics,
        _id: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating analytics:", error)
    return NextResponse.json({ error: "Failed to create analytics" }, { status: 500 })
  }
}
