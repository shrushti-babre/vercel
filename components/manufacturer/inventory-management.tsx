"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface InventoryItem {
  _id: string;
  productName: string;
  batchNumber: string;
  quantity: number;
  unit: string;
  location: string;
  status: string;
}

export default function ManufacturerInventoryManagement() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInventory() {
      try {
        const res = await fetch("/api/manufacturer/inventory", {
          credentials: "include",
        });
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Manufacturer inventory fetch failed", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    fetchInventory();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Manufacturer Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading inventory…</p>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground">No stock received yet.</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2">Product</th>
                <th className="py-2">Batch #</th>
                <th className="py-2">Quantity</th>
                <th className="py-2">Location</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i._id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{i.productName}</td>
                  <td className="py-2">{i.batchNumber}</td>
                  <td className="py-2">
                    {i.quantity} {i.unit}
                  </td>
                  <td className="py-2">{i.location}</td>
                  <td className="py-2">{i.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
