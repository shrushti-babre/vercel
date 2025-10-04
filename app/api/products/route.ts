import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import type { Product } from "@/lib/models/Product";
import { ObjectId } from "mongodb";
import { verifyAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    const db = await getDatabase();
    const productsCollection = db.collection<Product>("products");
    const { searchParams } = new URL(request.url);

    const farmerId = searchParams.get("farmerId");
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    const query: Record<string, any> = {};
    if (farmerId) query.farmerId = new ObjectId(farmerId);
    if (category) query.category = category;
    if (status) query.status = status;

    // Farmers see their own products by default
    if (authResult.success && authResult.user?.role === "farmer" && !farmerId) {
      query.farmerId = new ObjectId(authResult.user._id as any);
    }

    const products = await productsCollection.find(query).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    const user = authResult.user!;
    if (user.role !== "farmer") {
      return NextResponse.json({ error: "Only farmers can create products" }, { status: 403 });
    }

    const productData = await request.json();

    const requiredFields = [
      "name",
      "description",
      "category",
      "quantity",
      "unit",
      "pricePerUnit",
      "harvestDate",
      "location",
    ] as const;

    for (const field of requiredFields) {
      if (productData[field] == null || productData[field] === "") {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    const now = new Date();
    const db = await getDatabase();
    const productsCollection = db.collection<Product>("products");

    const newProduct: Omit<Product, "_id"> = {
      ...productData,
      farmerId: new ObjectId(user._id as any),
      farmerName: user.name,
      quantity: Number(productData.quantity),
      unit: String(productData.unit),
      pricePerUnit: Number(productData.pricePerUnit),
      harvestDate: new Date(productData.harvestDate),
      expiryDate: productData.expiryDate ? new Date(productData.expiryDate) : undefined,
      status: "available",
      createdAt: now,
      updatedAt: now,
      traceabilityData: productData.traceabilityData || {},
      images: productData.images || [],
    };

    const result = await productsCollection.insertOne(newProduct);

    return NextResponse.json(
      { message: "Product created successfully", product: { ...newProduct, _id: result.insertedId } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
