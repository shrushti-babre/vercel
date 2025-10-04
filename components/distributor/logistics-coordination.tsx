"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Truck, Clock, CheckCircle } from "lucide-react"

interface Order {
  _id?: string
  orderNumber: string
  buyerName: string
  sellerName: string
  productName: string
  quantity: number
  unit: string
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  expectedDeliveryDate?: string
  trackingInfo?: {
    trackingNumber?: string
    carrier?: string
    currentLocation?: string
    estimatedDelivery?: string
  }
}

export default function LogisticsCoordination() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      try {
        // ✅ retailer->distributor orders only
        const res = await fetch("/api/distributor/orders")
        if (!res.ok) throw new Error("Failed to fetch orders")
        const data = await res.json()
        setOrders(Array.isArray(data.orders) ? data.orders : [])
      } catch (err) {
        console.error("Logistics fetch error:", err)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending": return "secondary"
      case "confirmed": return "default"
      case "shipped": return "outline"
      case "delivered": return "default"
      case "cancelled": return "destructive"
      default: return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif font-bold">Logistics & Shipments</h2>
        <p className="text-muted-foreground">Track retailer orders and shipments</p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            Loading logistics data…
          </CardContent>
        </Card>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            No logistics data available.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {orders.map((order) => (
            <Card key={order._id}>
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                  {order.productName}
                </CardTitle>
                <Badge variant={getStatusBadgeVariant(order.status)}>
                  {order.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground">Order #</p>
                    <p>{order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Buyer</p>
                    <p>{order.buyerName}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Quantity</p>
                    <p>{order.quantity} {order.unit}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Seller</p>
                    <p>{order.sellerName}</p>
                  </div>
                </div>

                {order.trackingInfo?.currentLocation && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Current: {order.trackingInfo.currentLocation}</span>
                  </div>
                )}

                {order.expectedDeliveryDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <span>ETA: {new Date(order.expectedDeliveryDate).toLocaleDateString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
