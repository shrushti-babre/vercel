"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PlaceOrder from "./place-order"
import InventoryManagement from "./inventory-management"
import RetailerOrders from "./retailer-orders"
import LogisticsCoordination from "./logistics-coordination"

export default function DistributorDashboard() {
  const [activeTab, setActiveTab] = useState("place-order")

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-serif font-bold text-foreground">Distributor Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage inventory, retailer orders, logistics, and place new orders to manufacturers.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
            <TabsTrigger value="place-order">Place Order</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="logistics">Logistics</TabsTrigger>
          </TabsList>

          <TabsContent value="place-order">
            <PlaceOrder />
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryManagement />
          </TabsContent>

          <TabsContent value="orders">
            <RetailerOrders />
          </TabsContent>

          <TabsContent value="logistics">
            <LogisticsCoordination />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
