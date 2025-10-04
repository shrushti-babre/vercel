import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import type { Order } from "@/lib/models/Order";
import type { Product } from "@/lib/models/Product";
import { ObjectId } from "mongodb";
import { verifyAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });

    const user = auth.user;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const db = await getDatabase();
    const orders = db.collection<Order>("orders");
    const query: any = {};

    if (user.role === "farmer") {
      query.sellerId = new ObjectId(user._id);
    } else if (user.role === "manufacturer") {
      query.$or = [
        { buyerId: new ObjectId(user._id) },  // manufacturer purchasing from farmers
        { sellerId: new ObjectId(user._id) }  // distributors purchasing from manufacturer
      ];
    } else {
      query.buyerId = new ObjectId(user._id);
    }

    if (status) query.status = status;

    const result = await orders.find(query).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ orders: result });
  } catch (e) {
    console.error("Get orders error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });

    const user = auth.user;
    const { productId, quantity, shippingAddress } = await request.json();
    if (!productId || !quantity || !shippingAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = await getDatabase();
    const products = db.collection<Product>("products");
    const manufacturerInventory = db.collection<Product>("manufacturer_inventory");
    const orders = db.collection<Order>("orders");

    let product: any = await products.findOne({ _id: new ObjectId(productId) });
    let fromManufacturer = false;
    if (!product) {
      product = await manufacturerInventory.findOne({ _id: new ObjectId(productId) });
      if (product) fromManufacturer = true;
    }
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    if (product.quantity < quantity) {
      return NextResponse.json({ error: "Insufficient quantity" }, { status: 400 });
    }

    // seller is manufacturer if product came from manufacturer_inventory
    const sellerId = fromManufacturer ? product.supplierId : product.farmerId;
    const sellerName = fromManufacturer ? product.supplierName : product.farmerName;
    const sellerRole: Order["sellerRole"] = fromManufacturer ? "manufacturer" : "farmer";

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const now = new Date();

    const newOrder: Omit<Order, "_id"> = {
      orderNumber,
      buyerId: new ObjectId(user._id),
      buyerName: user.name,
      buyerRole: user.role as Order["buyerRole"],
      sellerId: new ObjectId(sellerId),
      sellerName,
      sellerRole,
      productId: new ObjectId(productId),
      productName: product.productName || product.name,
      quantity,
      unit: product.unit || "unit",
      pricePerUnit: Number(product.pricePerUnit) || 0,
      totalAmount: quantity * (Number(product.pricePerUnit) || 0),
      status: "pending",
      orderDate: now,
      shippingAddress,
      createdAt: now,
      updatedAt: now,
    };

    const result = await orders.insertOne(newOrder);

    const collection = fromManufacturer ? manufacturerInventory : products;
    await collection.updateOne(
      { _id: new ObjectId(productId) },
      { $inc: { quantity: -quantity }, $set: { updatedAt: now } }
    );

    return NextResponse.json(
      { message: "Order created successfully", order: { ...newOrder, _id: result.insertedId } },
      { status: 201 }
    );
  } catch (e) {
    console.error("Create order error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
