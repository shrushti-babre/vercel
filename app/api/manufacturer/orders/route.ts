import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import type { Order } from "@/lib/models/Order";
import { ObjectId } from "mongodb";
import { verifyAuth } from "@/lib/auth";

/**
 * GET: Only return orders where
 *   - this manufacturer is the seller
 *   - and the buyer is explicitly a distributor
 *
 * No manufacturer->farmer orders will match this query.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success)
      return NextResponse.json({ error: auth.error }, { status: 401 });

    if (auth.user!.role !== "manufacturer") {
      return NextResponse.json(
        { error: "Only manufacturers can view distributor orders" },
        { status: 403 }
      );
    }

    const db = await getDatabase();

    // ✅ absolute filter: must be manufacturer seller AND distributor buyer
    const orders = await db
      .collection<Order>("orders")
      .find({
        sellerId: new ObjectId(auth.user!._id),
        sellerRole: "manufacturer",
        buyerRole: "distributor",
      })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ orders });
  } catch (e) {
    console.error("Manufacturer GET distributor orders error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
