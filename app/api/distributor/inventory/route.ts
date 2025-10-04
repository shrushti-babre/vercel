import { NextResponse, type NextRequest } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyAuth } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.success || !auth.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = auth.user
    if (user.role !== "distributor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const db = await getDatabase()
    const orders = db.collection("orders")

    // Show all orders where this distributor is the buyer
    const inventory = await orders
      .find({
        buyerId: new ObjectId(user._id),
        sellerRole: "manufacturer",
      })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ inventory })
  } catch (err) {
    console.error("Distributor inventory GET error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
