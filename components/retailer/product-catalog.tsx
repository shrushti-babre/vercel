"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, ShoppingCart, Eye, Star, Leaf } from "lucide-react"

interface Product {
  id: string
  name: string
  distributor: string
  category: string
  price: number
  retailPrice: number
  stock: number
  trustScore: number
  certifications: string[]
  description: string
  traceability: {
    farmer: string
    location: string
    harvestDate: string
    qualityScore: number
  }
  image?: string
}

export function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: "PROD-001",
      name: "Fresh Tomatoes",
      distributor: "Fresh Distribution Co.",
      category: "Fresh Produce",
      price: 35,
      retailPrice: 45,
      stock: 85,
      trustScore: 96,
      certifications: ["Organic", "Pesticide-Free", "Fresh Harvest"],
      description: "Premium organic tomatoes grown in Punjab with natural farming methods",
      traceability: {
        farmer: "Green Valley Farm",
        location: "Ludhiana, Punjab",
        harvestDate: "2025-08-20",
        qualityScore: 94,
      },
    },
    {
      id: "PROD-002",
      name: "Fresh Potatoes",
      distributor: "Healthy Foods Distribution",
      category: "Fresh Produce",
      price: 25,
      retailPrice: 32,
      stock: 42,
      trustScore: 94,
      certifications: ["Organic", "High Quality", "Fresh Harvest"],
      description: "Fresh organic potatoes from Maharashtra with excellent texture and taste",
      traceability: {
        farmer: "Sunny Acres Farm",
        location: "Nashik, Maharashtra",
        harvestDate: "2025-08-18",
        qualityScore: 92,
      },
    },
    {
      id: "PROD-003",
      name: "Fresh Brinjal",
      distributor: "Organic Supply Chain",
      category: "Fresh Produce",
      price: 45,
      retailPrice: 58,
      stock: 67,
      trustScore: 92,
      certifications: ["Organic", "Premium Quality", "Fresh Harvest"],
      description: "Fresh organic brinjal from Karnataka farms with rich flavor and nutrients",
      traceability: {
        farmer: "Leafy Greens Co.",
        location: "Bangalore, Karnataka",
        harvestDate: "2025-08-19",
        qualityScore: 90,
      },
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isTraceabilityDialogOpen, setIsTraceabilityDialogOpen] = useState(false)

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.distributor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleViewTraceability = (product: Product) => {
    setSelectedProduct(product)
    setIsTraceabilityDialogOpen(true)
  }

  const getStockStatus = (stock: number) => {
    if (stock > 50) return { status: "in-stock", color: "default" }
    if (stock > 20) return { status: "low-stock", color: "secondary" }
    return { status: "very-low", color: "destructive" }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold">Product Catalog</h2>
          <p className="text-muted-foreground">Browse and manage your fresh vegetable offerings</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products or distributors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-[300px]"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Fresh Produce">Fresh Produce</SelectItem>
              <SelectItem value="Vegetables">Vegetables</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const stockStatus = getStockStatus(product.stock)
          const profitMargin = (((product.retailPrice - product.price) / product.price) * 100).toFixed(1)

          return (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{product.distributor}</p>
                  </div>
                  <Badge variant={stockStatus.color}>{stockStatus.status.replace("-", " ")}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{product.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Cost Price</p>
                    <p className="font-medium">₹{product.price}/kg</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Retail Price</p>
                    <p className="font-medium">₹{product.retailPrice}/kg</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Stock</p>
                    <p className="font-medium">{product.stock} kg</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Margin</p>
                    <p className="font-medium text-green-600">+{profitMargin}%</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">Trust Score: {product.trustScore}%</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Certifications</p>
                  <div className="flex flex-wrap gap-1">
                    {product.certifications.map((cert, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <Leaf className="h-2 w-2 mr-1" />
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1">
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    Reorder
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleViewTraceability(product)}>
                    <Eye className="h-3 w-3 mr-1" />
                    Trace
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Traceability Dialog */}
      <Dialog open={isTraceabilityDialogOpen} onOpenChange={setIsTraceabilityDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Traceability</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold text-lg">{selectedProduct.name}</h3>
                <p className="text-muted-foreground">{selectedProduct.description}</p>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Supply Chain Journey</h4>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-sm">1</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Farm Origin</p>
                      <p className="text-sm text-muted-foreground">{selectedProduct.traceability.farmer}</p>
                      <p className="text-xs text-muted-foreground">Location: {selectedProduct.traceability.location}</p>
                      <p className="text-xs text-muted-foreground">
                        Harvested: {selectedProduct.traceability.harvestDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-sm">2</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Distribution</p>
                      <p className="text-sm text-muted-foreground">{selectedProduct.distributor}</p>
                      <p className="text-xs text-muted-foreground">Quality maintained throughout cold chain</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-sm">3</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Retail</p>
                      <p className="text-sm text-muted-foreground">Your Store</p>
                      <p className="text-xs text-muted-foreground">Ready for customer purchase</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm font-medium">Quality Score</p>
                    <p className="text-2xl font-bold text-green-600">{selectedProduct.traceability.qualityScore}%</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm font-medium">Trust Score</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedProduct.trustScore}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
