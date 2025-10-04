import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import type { Order } from "@/lib/models/Order";
import { ObjectId } from "mongodb";
import { verifyAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // 🔑 Authenticate
    const auth = await verifyAuth(request);
    if (!auth.success || !auth.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = auth.user;
    if (user.role !== "manufacturer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = await getDatabase();
    const ordersCollection = db.collection<Order>("orders");

    // ✅ MAIN FIX:
    // Fetch orders where:
    //  - buyerRole is distributor
    //  - AND either:
    //      (sellerRole is manufacturer AND sellerId = current user)
    //      OR
    //      (product came from manufacturer_inventory but sellerId is saved as farmerId)
    const distributorOrders = await ordersCollection
      .find({
        buyerRole: "distributor",
        $or: [
          { sellerRole: "manufacturer", sellerId: new ObjectId(user._id) },
          { sellerId: new ObjectId(user._id) } // fallback for older/wrong inserts
        ]
      })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ orders: distributorOrders });
  } catch (error) {
    console.error("Distributor-orders fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
