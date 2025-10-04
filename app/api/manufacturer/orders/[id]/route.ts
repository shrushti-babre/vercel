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
    if (auth.user!.role !== "manufacturer")
      return NextResponse.json({ error: "Only manufacturers can update distributor orders" }, { status: 403 });

    const orderId = params.id;
    if (!ObjectId.isValid(orderId)) return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });

    const { status } = await request.json();
    const valid: Order["status"][] = ["confirmed", "shipped", "delivered", "cancelled"];
    if (!valid.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

    const db = await getDatabase();
    const orders = db.collection<Order>("orders");
    const order = await orders.findOne({ _id: new ObjectId(orderId), sellerId: new ObjectId(auth.user!._id) });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    await orders.updateOne({ _id: order._id }, { $set: { status, updatedAt: new Date() } });

    // traceability record
    let stage: TraceabilityRecord["stage"] = "processing";
    let description = "";
    if (status === "confirmed") description = "Distributor order confirmed by manufacturer";
    if (status === "shipped") { stage = "distribution"; description = "Shipped to distributor"; }
    if (status === "delivered") { stage = "retail"; description = "Delivered to distributor"; }
    if (status === "cancelled") { stage = "processing"; description = "Distributor order cancelled"; }

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

    return NextResponse.json({ message: "Distributor order updated successfully" });
  } catch (e) {
    console.error("Manufacturer PATCH distributor order error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
