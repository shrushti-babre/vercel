"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrderTracker } from "@/components/tracking/order-tracker"
import { SupplyChainVisualizer } from "@/components/tracking/supply-chain-visualizer"
import { ProductTraceViewer } from "@/components/traceability/product-trace-viewer"
import { Search, Package, Route, Eye } from "lucide-react"

export default function TrackingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTrackingId, setActiveTrackingId] = useState("")
  const [trackingType, setTrackingType] = useState<"order" | "product" | "supply-chain">("order")

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setActiveTrackingId(searchQuery.trim())
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-serif font-bold text-foreground">Track Your Order</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Enter your order ID, product ID, or tracking number to view real-time tracking information and supply chain
            details.
          </p>
        </div>

        {/* Search Section */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Tracking Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter Order ID, Product ID, or Tracking Number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
                <Search className="h-4 w-4 mr-2" />
                Track
              </Button>
            </div>

            <Tabs value={trackingType} onValueChange={(value) => setTrackingType(value as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="order" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Order Tracking
                </TabsTrigger>
                <TabsTrigger value="supply-chain" className="flex items-center gap-2">
                  <Route className="h-4 w-4" />
                  Supply Chain
                </TabsTrigger>
                <TabsTrigger value="product" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Product Trace
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Tracking Results */}
        {activeTrackingId && (
          <div className="space-y-6">
            {trackingType === "order" && <OrderTracker orderId={activeTrackingId} />}
            {trackingType === "supply-chain" && <SupplyChainVisualizer productId={activeTrackingId} />}
            {trackingType === "product" && <ProductTraceViewer productId={activeTrackingId} />}
          </div>
        )}

        {/* Sample IDs for Testing */}
        {!activeTrackingId && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Try Sample Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Use these sample IDs to explore the tracking system:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-semibold">Order Tracking</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("ORD-2024-001")
                      setTrackingType("order")
                      setActiveTrackingId("ORD-2024-001")
                    }}
                    className="w-full justify-start"
                  >
                    ORD-2024-001
                  </Button>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Supply Chain</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("prod_001")
                      setTrackingType("supply-chain")
                      setActiveTrackingId("prod_001")
                    }}
                    className="w-full justify-start"
                  >
                    prod_001
                  </Button>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Product Trace</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("prod_001")
                      setTrackingType("product")
                      setActiveTrackingId("prod_001")
                    }}
                    className="w-full justify-start"
                  >
                    prod_001
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
