import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import type { Product } from "@/lib/models/Product";
import { ObjectId } from "mongodb";
import { verifyAuth } from "@/lib/auth";

/**
 * PATCH: Update a processed product owned by this manufacturer
 * DELETE: Remove a processed product
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) return NextResponse.json({ error: auth.error }, { status: 401 });
    if (auth.user!.role !== "manufacturer")
      return NextResponse.json({ error: "Only manufacturers can update products" }, { status: 403 });

    const productId = params.id;
    if (!ObjectId.isValid(productId)) return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });

    const body = await request.json();
    const update: Partial<Product> = {};
    for (const key of Object.keys(body)) {
      if (["quantity", "pricePerUnit"].includes(key)) (update as any)[key] = Number(body[key]);
      else if (["harvestDate", "expiryDate"].includes(key)) (update as any)[key] = new Date(body[key]);
      else (update as any)[key] = body[key];
    }
    update.updatedAt = new Date();

    const db = await getDatabase();
    const res = await db.collection<Product>("products").updateOne(
      { _id: new ObjectId(productId), farmerId: new ObjectId(auth.user!._id) },
      { $set: update }
    );

    if (!res.matchedCount) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json({ message: "Product updated successfully" });
  } catch (e) {
    console.error("Manufacturer PATCH product error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) return NextResponse.json({ error: auth.error }, { status: 401 });
    if (auth.user!.role !== "manufacturer")
      return NextResponse.json({ error: "Only manufacturers can delete products" }, { status: 403 });

    const productId = params.id;
    if (!ObjectId.isValid(productId)) return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });

    const db = await getDatabase();
    const res = await db
      .collection<Product>("products")
      .deleteOne({ _id: new ObjectId(productId), farmerId: new ObjectId(auth.user!._id) });

    if (!res.deletedCount) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (e) {
    console.error("Manufacturer DELETE product error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
