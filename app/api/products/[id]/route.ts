import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import type { Product } from "@/lib/models/Product";
import { ObjectId } from "mongodb";
import { verifyAuth } from "@/lib/auth";

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
    if (user.role !== "farmer") {
      return NextResponse.json({ error: "Only farmers can update products" }, { status: 403 });
    }

    const productId = params.id;
    if (!ObjectId.isValid(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const body = await request.json();
    const allowed: (keyof Product)[] = [
      "name",
      "description",
      "category",
      "quantity",
      "unit",
      "pricePerUnit",
      "harvestDate",
      "expiryDate",
      "certifications",
      "images",
      "location",
      "traceabilityData",
      "status",
    ];

    const update: Partial<Product> = {};
    for (const key of allowed) {
      if (key in body) {
        // normalize types
        if (key === "harvestDate" || key === "expiryDate") {
          (update as any)[key] = body[key] ? new Date(body[key]) : undefined;
        } else if (key === "quantity" || key === "pricePerUnit") {
          (update as any)[key] = Number(body[key]);
        } else {
          (update as any)[key] = body[key];
        }
      }
    }
    update.updatedAt = new Date();

    const db = await getDatabase();
    const products = db.collection<Product>("products");
    const res = await products.updateOne(
      { _id: new ObjectId(productId), farmerId: new ObjectId(user._id as any) },
      { $set: update }
    );

    if (res.matchedCount === 0) {
      return NextResponse.json({ error: "Product not found or not owned by you" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    const user = authResult.user!;
    if (user.role !== "farmer") {
      return NextResponse.json({ error: "Only farmers can delete products" }, { status: 403 });
    }

    const productId = params.id;
    if (!ObjectId.isValid(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const db = await getDatabase();
    const products = db.collection<Product>("products");
    const res = await products.deleteOne({
      _id: new ObjectId(productId),
      farmerId: new ObjectId(user._id as any),
    });

    if (res.deletedCount === 0) {
      return NextResponse.json({ error: "Product not found or not owned by you" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
