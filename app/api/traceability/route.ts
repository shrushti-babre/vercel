import { type NextRequest, NextResponse } from "next/server"
import { traceabilityService } from "@/lib/services/traceability-service"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    const journey = await traceabilityService.getProductJourney(productId)

    if (!journey) {
      return NextResponse.json({ error: "Product journey not found" }, { status: 404 })
    }

    return NextResponse.json(journey)
  } catch (error) {
    console.error("Error fetching product journey:", error)
    return NextResponse.json({ error: "Failed to fetch product journey" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const recordData = await request.json()

    const record = await traceabilityService.addTraceabilityRecord({
      ...recordData,
      productId: new ObjectId(recordData.productId),
      actorId: new ObjectId(recordData.actorId),
      orderId: recordData.orderId ? new ObjectId(recordData.orderId) : undefined,
      previousRecordId: recordData.previousRecordId ? new ObjectId(recordData.previousRecordId) : undefined,
      timestamp: new Date(recordData.timestamp || Date.now()),
    })

    if (!record) {
      return NextResponse.json({ error: "Failed to create traceability record" }, { status: 500 })
    }

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error("Error creating traceability record:", error)
    return NextResponse.json({ error: "Failed to create traceability record" }, { status: 500 })
  }
}
