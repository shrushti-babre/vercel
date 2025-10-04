import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import type { Order } from "@/lib/models/Order";
import type { Product } from "@/lib/models/Product";
import type { TraceabilityRecord } from "@/lib/models/TraceabilityRecord";
import { ObjectId } from "mongodb";
import { verifyAuth } from "@/lib/auth";
import { addTraceabilityRecord } from "@/lib/services/traceability-service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const user = authResult.user!;
    const orderId = params.id;

    if (!ObjectId.isValid(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const { status } = (await request.json()) as { status: Order["status"] };
    const valid: Order["status"][] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!valid.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const db = await getDatabase();
    const orders = db.collection<Order>("orders");
    const products = db.collection<Product>("products");

    const order = await orders.findOne({ _id: new ObjectId(orderId) });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const isSeller = order.sellerId.toString() === (user._id as any).toString();
    const isBuyer = order.buyerId.toString() === (user._id as any).toString();
    if (!isSeller && !isBuyer) {
      return NextResponse.json({ error: "Not authorized to update this order" }, { status: 403 });
    }

    if (isSeller) {
      if (!["confirmed", "shipped", "cancelled"].includes(status) && status !== order.status) {
        return NextResponse.json({ error: "Farmers can only confirm, ship or cancel orders" }, { status: 403 });
      }
    } else {
      if (status !== "cancelled") {
        return NextResponse.json({ error: "Buyers can only cancel orders" }, { status: 403 });
      }
      if (order.status !== "pending") {
        return NextResponse.json({ error: "Cannot cancel an order that is not pending" }, { status: 400 });
      }
    }

    const now = new Date();
    const update: Partial<Order> = { status, updatedAt: now };
    if (status === "delivered") update.actualDeliveryDate = now;

    if (status === "cancelled" && order.status === "pending") {
      await products.updateOne(
        { _id: new ObjectId(order.productId) },
        { $inc: { quantity: order.quantity }, $set: { updatedAt: now, status: "available" } }
      );
    }

    await orders.updateOne({ _id: new ObjectId(orderId) }, { $set: update });

    // ✅ Add to manufacturer inventory if farmer ships to manufacturer
    if (status === "shipped" && order.sellerRole === "farmer" && order.buyerRole === "manufacturer") {
      const manufacturerInventory = db.collection("manufacturer_inventory");
      await manufacturerInventory.insertOne({
        productId: order.productId,
        productName: order.productName,
        supplierId: order.sellerId,
        supplierName: order.sellerName,
        batchNumber: `BATCH-${Date.now()}`,
        quantity: order.quantity,
        unit: order.unit,
        location: order.shippingAddress.city,
        status: "available",
        createdAt: now,
        updatedAt: now,
      });
    }

    // Traceability
    let stage: TraceabilityRecord["stage"] = "farm";
    let description = "";
    switch (status) {
      case "confirmed":
        stage = "processing";
        description = "Order confirmed by farmer";
        break;
      case "shipped":
        stage = "distribution";
        description = "Order shipped from farm";
        break;
      case "delivered":
        stage = "retail";
        description = "Order delivered to buyer";
        break;
      case "cancelled":
        stage = "farm";
        description = "Order cancelled";
        break;
    }

    await addTraceabilityRecord({
      productId: order.productId,
      orderId: order._id!,
      stage,
      actorId: new ObjectId(user._id as any),
      actorName: user.name,
      actorRole: user.role,
      location: {
        name: order.shippingAddress.city,
        address: `${order.shippingAddress.street}, ${order.shippingAddress.state}, ${order.shippingAddress.country}`,
      },
      action: status,
      description,
      verificationStatus: "pending",
    });

    return NextResponse.json({ message: "Order status updated & traceability recorded" });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
