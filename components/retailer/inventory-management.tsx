"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Package, TrendingDown, TrendingUp } from "lucide-react"

interface InventoryItem {
  id: string
  name: string
  currentStock: number
  minThreshold: number
  maxCapacity: number
  lastRestocked: string
  expiryDate: string
  turnoverRate: number
  status: "healthy" | "low-stock" | "expiring" | "overstocked"
}

export function InventoryManagement() {
  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: "INV-001",
      name: "Fresh Tomatoes",
      currentStock: 85,
      minThreshold: 20,
      maxCapacity: 150,
      lastRestocked: "2025-08-20",
      expiryDate: "2025-08-25",
      turnoverRate: 12.5,
      status: "healthy",
    },
    {
      id: "INV-002",
      name: "Fresh Potatoes",
      currentStock: 15,
      minThreshold: 25,
      maxCapacity: 100,
      lastRestocked: "2025-08-18",
      expiryDate: "2025-09-15",
      turnoverRate: 8.3,
      status: "low-stock",
    },
    {
      id: "INV-003",
      name: "Fresh Brinjal",
      currentStock: 67,
      minThreshold: 30,
      maxCapacity: 120,
      lastRestocked: "2025-08-19",
      expiryDate: "2025-08-28",
      turnoverRate: 15.2,
      status: "expiring",
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "default"
      case "low-stock":
        return "secondary"
      case "expiring":
        return "destructive"
      case "overstocked":
        return "outline"
      default:
        return "default"
    }
  }

  const getStockPercentage = (current: number, max: number) => {
    return (current / max) * 100
  }

  const inventoryStats = {
    totalItems: inventory.length,
    healthy: inventory.filter((item) => item.status === "healthy").length,
    lowStock: inventory.filter((item) => item.status === "low-stock").length,
    expiring: inventory.filter((item) => item.status === "expiring").length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold">Inventory Management</h2>
        <p className="text-muted-foreground">Monitor stock levels and manage product availability</p>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{inventoryStats.totalItems}</div>
            <p className="text-xs text-muted-foreground">Total Products</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{inventoryStats.healthy}</div>
            <p className="text-xs text-muted-foreground">Healthy Stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{inventoryStats.lowStock}</div>
            <p className="text-xs text-muted-foreground">Low Stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{inventoryStats.expiring}</div>
            <p className="text-xs text-muted-foreground">Expiring Soon</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {inventory.map((item) => {
          const stockPercentage = getStockPercentage(item.currentStock, item.maxCapacity)

          return (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <Badge variant={getStatusColor(item.status)}>{item.status.replace("-", " ")}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Stock</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-lg">{item.currentStock}</p>
                      {item.turnoverRate > 10 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Turnover Rate</p>
                    <p className="font-medium text-lg">{item.turnoverRate}/week</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Restocked</p>
                    <p className="font-medium">{item.lastRestocked}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expiry Date</p>
                    <p className="font-medium">{item.expiryDate}</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-muted-foreground">Stock Level</p>
                    <p className="text-sm font-medium">
                      {item.currentStock} / {item.maxCapacity} ({stockPercentage.toFixed(1)}%)
                    </p>
                  </div>
                  <Progress value={stockPercentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Min: {item.minThreshold}</span>
                    <span>Max: {item.maxCapacity}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Package className="h-3 w-3 mr-1" />
                    Reorder
                  </Button>
                  {item.status === "expiring" && (
                    <Button size="sm" variant="outline">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Mark for Sale
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
