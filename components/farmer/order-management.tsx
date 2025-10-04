"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, Clock, Truck, Loader2, ShoppingCart } from "lucide-react"
import { useApi, apiCall } from "@/hooks/use-api"
import { useToast } from "@/hooks/use-toast"

interface Order {
  _id: string
  orderNumber: string
  buyerName: string
  buyerRole: string
  productName: string
  quantity: number
  unit: string
  pricePerUnit: number
  totalAmount: number
  orderDate: string
  expectedDeliveryDate?: string
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

export function OrderManagement() {
  const { data: ordersData, loading, error, refetch } = useApi<{ orders: Order[] }>("/api/orders")
  const { toast } = useToast()
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set())

  const orders = ordersData?.orders || []

  const handleStatusChange = async (orderId: string, newStatus: Order["status"]) => {
    try {
      setUpdatingOrders((prev) => new Set(prev).add(orderId))

      await apiCall(`/api/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      })

      toast({
        title: "Success",
        description: `Order ${newStatus} successfully`,
      })

      refetch() // Refresh the orders list
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update order",
        variant: "destructive",
      })
    } finally {
      setUpdatingOrders((prev) => {
        const newSet = new Set(prev)
        newSet.delete(orderId)
        return newSet
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "confirmed":
        return "default"
      case "cancelled":
        return "destructive"
      case "shipped":
        return "outline"
      case "delivered":
        return "default"
      default:
        return "secondary"
    }
  }

  const filteredOrders = statusFilter === "all" ? orders : orders.filter((order) => order.status === statusFilter)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading orders...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading orders: {error}</p>
        <Button onClick={refetch} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif font-bold">Order Management</h2>
          <p className="text-muted-foreground">View and manage incoming orders from buyers</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No orders yet</h3>
            <p className="text-muted-foreground">Orders from buyers will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                    <p className="text-muted-foreground">
                      {order.buyerName} ({order.buyerRole})
                    </p>
                  </div>
                  <Badge variant={getStatusColor(order.status)} className="flex items-center gap-1">
                    {getStatusIcon(order.status)}
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="font-medium">₹{order.totalAmount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Order Date</p>
                    <p className="font-medium">{new Date(order.orderDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Shipping Address</p>
                  <p className="text-sm bg-muted p-2 rounded">
                    {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.zipCode}, {order.shippingAddress.country}
                  </p>
                </div>

                {order.status === "pending" && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(order._id, "confirmed")}
                      disabled={updatingOrders.has(order._id)}
                    >
                      {updatingOrders.has(order._id) ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      )}
                      Accept Order
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(order._id, "cancelled")}
                      disabled={updatingOrders.has(order._id)}
                    >
                      {updatingOrders.has(order._id) ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      Cancel Order
                    </Button>
                  </div>
                )}

                {order.status === "confirmed" && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(order._id, "shipped")}
                    disabled={updatingOrders.has(order._id)}
                  >
                    {updatingOrders.has(order._id) ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Truck className="h-3 w-3 mr-1" />
                    )}
                    Mark as Shipped
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredOrders.length === 0 && orders.length > 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No orders found for the selected filter.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
