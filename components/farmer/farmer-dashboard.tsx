"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, ShoppingCart, Loader2 } from "lucide-react"
import { ProductManagement } from "./product-management"
import { OrderManagement } from "./order-management"
import { useApi } from "@/hooks/use-api"

interface DashboardStats {
  totalProducts: number
  activeOrders: number
}

interface Order {
  _id: string
  orderNumber: string
  buyerName: string
  productName: string
  quantity: number
  unit: string
  status: string
  orderDate: string
}

interface Product {
  _id: string
  name: string
  quantity: number
  unit: string
  harvestDate: string
  status: string
}

export function FarmerDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeOrders: 0,
  })

  const { data: ordersData, loading: ordersLoading } = useApi<{ orders: Order[] }>("/api/orders")
  const { data: productsData, loading: productsLoading } = useApi<{ products: Product[] }>("/api/products")

  useEffect(() => {
    if (productsData && ordersData) {
      const activeOrders = ordersData.orders.filter(
        (order) => order.status === "pending" || order.status === "confirmed",
      ).length

      setDashboardStats({
        totalProducts: productsData.products.length,
        activeOrders: activeOrders,
      })
    }
  }, [productsData, ordersData])

  // Get recent orders (last 5)
  const recentOrders = ordersData?.orders.slice(0, 5) || []

  // Get upcoming harvests (products with future harvest dates)
  const upcomingHarvests =
    productsData?.products
      .filter((product) => {
        const harvestDate = new Date(product.harvestDate)
        const today = new Date()
        return harvestDate > today
      })
      .slice(0, 5) || []

  if (ordersLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-serif font-bold text-foreground">Farmer Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your products and track your farm operations</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalProducts}</div>
                  <p className="text-xs text-muted-foreground">Active listings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.activeOrders}</div>
                  <p className="text-xs text-muted-foreground">Pending & confirmed</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.length > 0 ? (
                      recentOrders.map((order) => (
                        <div
                          key={order._id}
                          className="flex items-center justify-between p-3 border border-border rounded-lg"
                        >
                          <div className="space-y-1">
                            <p className="font-medium">{order.productName}</p>
                            <p className="text-sm text-muted-foreground">{order.buyerName}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.quantity} {order.unit}
                            </p>
                          </div>
                          <div className="text-right space-y-1">
                            <Badge
                              variant={
                                order.status === "pending"
                                  ? "secondary"
                                  : order.status === "confirmed"
                                    ? "default"
                                    : "outline"
                              }
                            >
                              {order.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.orderDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No recent orders</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Harvests */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Harvests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingHarvests.length > 0 ? (
                      upcomingHarvests.map((harvest) => (
                        <div
                          key={harvest._id}
                          className="flex items-center justify-between p-3 border border-border rounded-lg"
                        >
                          <div className="space-y-1">
                            <p className="font-medium">{harvest.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Expected: {new Date(harvest.harvestDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {harvest.quantity} {harvest.unit}
                            </p>
                          </div>
                          <Badge variant={harvest.status === "available" ? "default" : "secondary"}>
                            {harvest.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No upcoming harvests</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="orders">
            <OrderManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
