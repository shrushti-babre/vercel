"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck } from "lucide-react";

export function DistributorOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/manufacturer/distributor-orders");
        if (!res.ok) throw new Error("Failed to fetch distributor orders");
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error("Distributor orders load error:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "secondary";
      case "confirmed": return "default";
      case "shipped": return "outline";
      case "delivered": return "default";
      case "cancelled": return "destructive";
      default: return "secondary";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8 text-muted-foreground">
          Loading distributor orders…
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif font-bold">Distributor Orders</h2>
      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-muted-foreground">
            No distributor orders found.
          </CardContent>
        </Card>
      ) : (
        orders.map((order) => (
          <Card key={order._id}>
            <CardHeader className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                <p className="text-muted-foreground">Buyer: {order.buyerName}</p>
              </div>
              <Badge variant={getStatusColor(order.status)} className="flex items-center gap-1">
                <Truck className="h-4 w-4" />
                {order.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Product</p>
                  <p className="font-medium">{order.productName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="font-medium">
                    {order.quantity} {order.unit}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
