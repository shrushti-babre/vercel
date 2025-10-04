"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface InventoryItem {
  _id: string;
  productName: string;
  batchNumber: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  supplierName: string; // manufacturer name
}

export default function PlaceOrder() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // ✅ Load manufacturer inventory for distributor to view
  useEffect(() => {
    async function fetchInventory() {
      try {
        const res = await fetch("/api/manufacturer/inventory", {
          credentials: "include", // send cookies / token
        });
        if (!res.ok) throw new Error("Failed to fetch manufacturer inventory");
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading manufacturer inventory:", err);
        setItems([]);
      }
    }
    fetchInventory();
  }, []);

  // ✅ Place order (saves to DB as distributor→manufacturer)
  async function handlePlaceOrder() {
    if (!selectedId || !quantity || !street || !city || !state || !zipCode || !country) {
      toast({
        title: "Missing fields",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }

    const selected = items.find((i) => i._id === selectedId);
    if (!selected) {
      toast({
        title: "Error",
        description: "Invalid product selection.",
        variant: "destructive",
      });
      return;
    }

    if (quantity > selected.quantity) {
      toast({
        title: "Error",
        description: "Requested quantity exceeds available stock.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        credentials: "include", // send cookies / token for auth
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selected._id, // inventory item ID
          quantity,
          shippingAddress: { street, city, state, zipCode, country },
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to place order");

      toast({
        title: "Order placed successfully",
        description: `Order Number: ${result.order.orderNumber}`,
      });

      // Reset form
      setSelectedId("");
      setQuantity(1);
      setStreet("");
      setCity("");
      setState("");
      setZipCode("");
      setCountry("");
    } catch (err) {
      toast({
        title: "Error",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Place an Order from Manufacturer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Select inventory product */}
        <div>
          <label className="block mb-1 text-sm font-medium">Select Product Batch</label>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a product batch" />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item._id} value={item._id}>
                  {item.productName} – Batch {item.batchNumber} – ₹{item.pricePerUnit}/{item.unit} (Available: {item.quantity})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block mb-1 text-sm font-medium">Quantity</label>
          <Input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>

        {/* Shipping address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Street</label>
            <Input value={street} onChange={(e) => setStreet(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">City</label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">State</label>
            <Input value={state} onChange={(e) => setState(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Zip Code</label>
            <Input value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="block mb-1 text-sm font-medium">Country</label>
            <Input value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
        </div>

        <Button onClick={handlePlaceOrder} disabled={loading}>
          {loading ? "Placing…" : "Place Order"}
        </Button>
      </CardContent>
    </Card>
  );
}
