import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import type { Order } from "@/lib/models/Order";
import { ObjectId } from "mongodb";
import { verifyAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) return NextResponse.json({ error: auth.error }, { status: 401 });
    if (auth.user!.role !== "distributor") {
      return NextResponse.json({ error: "Only distributors can view these orders" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as Order["status"] | null;

    const db = await getDatabase();
    const orders = await db
      .collection<Order>("orders")
      .find({
        sellerId: new ObjectId(auth.user!._id),
        sellerRole: "distributor",
        ...(status ? { status } : {}),
      })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ orders });
  } catch (e) {
    console.error("Distributor orders list error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
