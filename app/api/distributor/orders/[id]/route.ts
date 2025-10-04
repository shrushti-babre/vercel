import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import type { Order } from "@/lib/models/Order";
import type { TraceabilityRecord } from "@/lib/models/TraceabilityRecord";
import { ObjectId } from "mongodb";
import { verifyAuth } from "@/lib/auth";
import { addTraceabilityRecord } from "@/lib/services/traceability-service";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) return NextResponse.json({ error: auth.error }, { status: 401 });
    if (auth.user!.role !== "distributor") {
      return NextResponse.json({ error: "Only distributors can update these orders" }, { status: 403 });
    }

    const orderId = params.id;
    if (!ObjectId.isValid(orderId)) return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });

    const { status } = (await request.json()) as { status: Order["status"] };
    const allowed: Order["status"][] = ["confirmed", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

    const db = await getDatabase();
    const ordersCol = db.collection<Order>("orders");

    const order = await ordersCol.findOne({
      _id: new ObjectId(orderId),
      sellerId: new ObjectId(auth.user!._id),
      sellerRole: "distributor",
    });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    await ordersCol.updateOne({ _id: order._id }, { $set: { status, updatedAt: new Date() } });

    // Traceability
    let stage: TraceabilityRecord["stage"] = "distribution";
    let description = "";
    if (status === "confirmed") description = "Retailer order confirmed by distributor";
    if (status === "shipped") description = "Retailer order shipped by distributor";
    if (status === "delivered") { stage = "retail"; description = "Retailer order delivered"; }
    if (status === "cancelled") description = "Retailer order cancelled";

    await addTraceabilityRecord({
      productId: order.productId,
      orderId: order._id!,
      stage,
      actorId: new ObjectId(auth.user!._id),
      actorName: auth.user!.name,
      actorRole: auth.user!.role,
      location: { name: order.shippingAddress.city, address: order.shippingAddress.street },
      action: status,
      description,
      verificationStatus: "pending",
    });

    return NextResponse.json({ message: "Order updated successfully" });
  } catch (e) {
    console.error("Distributor order update error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
