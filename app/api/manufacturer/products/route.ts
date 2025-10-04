import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import type { Product } from "@/lib/models/Product";
import { ObjectId } from "mongodb";
import { verifyAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) return NextResponse.json({ error: auth.error }, { status: 401 });
    if (auth.user!.role !== "manufacturer")
      return NextResponse.json({ error: "Only manufacturers can view their products" }, { status: 403 });

    const db = await getDatabase();
    const products = await db
      .collection<Product>("products")
      .find({ farmerId: new ObjectId(auth.user!._id), category: "manufacturer" })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ products });
  } catch (e) {
    console.error("Manufacturer GET products error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) return NextResponse.json({ error: auth.error }, { status: 401 });
    if (auth.user!.role !== "manufacturer")
      return NextResponse.json({ error: "Only manufacturers can create products" }, { status: 403 });

    const body = await request.json();
    const required = ["name", "description", "quantity", "unit", "pricePerUnit", "harvestDate"] as const;
    for (const f of required) {
      if (!body[f]) return NextResponse.json({ error: `Missing required field: ${f}` }, { status: 400 });
    }

    const now = new Date();
    const newProduct: Omit<Product, "_id"> = {
      ...body,
      category: "manufacturer", // ✅ key for distributor discovery & sellerRole inference
      farmerId: new ObjectId(auth.user!._id),
      farmerName: auth.user!.name,
      quantity: Number(body.quantity),
      unit: String(body.unit),
      pricePerUnit: Number(body.pricePerUnit),
      harvestDate: new Date(body.harvestDate),
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
      status: "available",
      createdAt: now,
      updatedAt: now,
      traceabilityData: body.traceabilityData || {},
      images: body.images || [],
      location: body.location || { farm: "Processing Plant" },
    };

    const db = await getDatabase();
    const result = await db.collection<Product>("products").insertOne(newProduct);

    return NextResponse.json(
      { message: "Manufacturer product created", product: { ...newProduct, _id: result.insertedId } },
      { status: 201 }
    );
  } catch (e) {
    console.error("Manufacturer POST product error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
