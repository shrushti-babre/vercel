import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { verifyAuth } from "@/lib/auth";
import { ObjectId } from "mongodb";

interface ManufacturerInventoryItem {
  _id?: ObjectId;
  productId: ObjectId;
  productName: string;
  supplierId: ObjectId;
  supplierName: string;
  batchNumber: string;
  quantity: number;
  unit: string;
  location: string;
  status: "available" | "reserved" | "sold" | "expired";
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = authResult.user;
    // ✅ Allow both manufacturer (to manage) and distributor (to order) to view inventory
    if (user.role !== "manufacturer" && user.role !== "distributor") {
      return NextResponse.json(
        { error: "Only manufacturers or distributors can access manufacturer inventory" },
        { status: 403 }
      );
    }

    const db = await getDatabase();
    const inventory = await db
      .collection<ManufacturerInventoryItem>("manufacturer_inventory")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(inventory);
  } catch (err) {
    console.error("Manufacturer inventory GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
