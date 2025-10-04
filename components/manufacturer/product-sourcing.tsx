"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, ShoppingCart, MapPin, Star } from "lucide-react"

interface FarmerProduct {
  _id: string
  name: string
  farmer?: { _id?: string; name?: string; farm?: { name?: string } }
  location?: string
  category?: string
  quantity?: number
  unit?: string
  pricePerUnit?: number
  harvestDate?: string
  expiryDate?: string
  certifications?: (string | { name?: string })[]
  rating?: number
  description?: string
  status?: "available" | "low-stock" | "out-of-stock"
}

interface SafeProduct extends FarmerProduct {
  farmerName: string
  certificationsSafe: string[]
  locationSafe: string
}

export function ProductSourcing() {
  const [products, setProducts] = useState<FarmerProduct[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedProduct, setSelectedProduct] = useState<SafeProduct | null>(null)
  const [orderQuantity, setOrderQuantity] = useState("")
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = new URLSearchParams()
        if (categoryFilter !== "all") params.append("category", categoryFilter)

        const res = await fetch(`/api/products?${params.toString()}`)
        const data = await res.json()
        setProducts(data.products || [])
      } catch (err) {
        console.error("Failed to fetch products:", err)
        setProducts([])
      }
    }
    fetchProducts()
  }, [categoryFilter])

  // Map products into safe fields for rendering
  const safeProducts: SafeProduct[] = products.map(p => ({
    ...p,
    farmerName: typeof p.farmer === "object" ? p.farmer.name ?? p.farmer.farm?.name ?? "Unknown Farmer" : "Unknown Farmer",
    certificationsSafe: p.certifications?.map(c => typeof c === "string" ? c : c.name ?? "N/A") || [],
    locationSafe: typeof p.location === "string" ? p.location : "Unknown Location"
  }))

  const filteredProducts = safeProducts.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.farmerName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handlePlaceOrder = async () => {
    if (!selectedProduct || !orderQuantity) return

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct._id,
          quantity: Number(orderQuantity),
          shippingAddress: "Distributor address here",
        }),
      })
      const result = await res.json()
      if (res.ok) {
        alert("Order placed successfully!")
        setIsOrderDialogOpen(false)
        setSelectedProduct(null)
        setOrderQuantity("")
      } else {
        alert(result.error || "Failed to place order")
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "available": return "default"
      case "low-stock": return "secondary"
      case "out-of-stock": return "destructive"
      default: return "default"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold">Product Sourcing</h2>
          <p className="text-muted-foreground">Browse and order raw materials from verified farmers</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products or farmers..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-[300px]"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Vegetables">Vegetables</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <Card key={product._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{product.name || "Unnamed Product"}</CardTitle>
                  <p className="text-sm text-muted-foreground">{product.farmerName}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{product.locationSafe}</p>
                  </div>
                </div>
                <Badge variant={getStatusColor(product.status)}>
                  {product.status?.replace("-", " ") || "N/A"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{product.description || "No description"}</p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Available</p>
                  <p className="font-medium">{product.quantity ?? 0} {product.unit || "kg"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Price/kg</p>
                  <p className="font-medium">₹{product.pricePerUnit ?? 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Harvest Date</p>
                  <p className="font-medium">{product.harvestDate ? new Date(product.harvestDate).toLocaleDateString() : "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Rating</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <p className="font-medium">{product.rating ?? "-"}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Certifications</p>
                <div className="flex flex-wrap gap-1">
                  {product.certificationsSafe.map((cert, index) => (
                    <Badge key={index} variant="outline" className="text-xs">{cert}</Badge>
                  ))}
                </div>
              </div>

              <Button
                className="w-full"
                disabled={product.status === "out-of-stock"}
                onClick={() => { setSelectedProduct(product); setIsOrderDialogOpen(true) }}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.status === "out-of-stock" ? "Out of Stock" : "Place Order"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No products found matching your criteria.</p>
          </CardContent>
        </Card>
      )}

      {/* Order Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Place Order</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold">{selectedProduct.name || "Unnamed Product"}</h3>
                <p className="text-sm text-muted-foreground">{selectedProduct.farmerName}</p>
                <p className="text-sm">Available: {selectedProduct.quantity ?? 0} {selectedProduct.unit || "kg"}</p>
                <p className="text-sm">Price: ₹{selectedProduct.pricePerUnit ?? 0}/kg</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity (kg)</label>
                <Input
                  type="number"
                  placeholder="Enter quantity in kg"
                  value={orderQuantity}
                  onChange={e => setOrderQuantity(e.target.value)}
                />
              </div>

              {orderQuantity && (
                <div className="bg-primary/10 p-3 rounded-lg">
                  <p className="text-sm">
                    <strong>Total Cost: ₹{((selectedProduct.pricePerUnit ?? 0) * Number(orderQuantity)).toFixed(2)}</strong>
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>Cancel</Button>
                <Button onClick={handlePlaceOrder} disabled={!orderQuantity}>Confirm Order</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
