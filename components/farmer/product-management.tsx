"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { useApi, apiCall } from "@/hooks/use-api"
import { useToast } from "@/hooks/use-toast"
import { Package } from "lucide-react" // Declare the Package variable

interface Product {
  _id: string
  name: string
  description: string
  category: string
  quantity: number
  unit: string
  pricePerUnit: number
  harvestDate: string
  expiryDate?: string
  certifications: string[]
  status: "available" | "reserved" | "sold" | "expired"
  location: {
    farm: string
  }
}

interface NewProduct {
  name: string
  description: string
  category: string
  quantity: string
  unit: string
  pricePerUnit: string
  harvestDate: string
  expiryDate: string
  certifications: string
  farm: string
}

export function ProductManagement() {
  const { data: productsData, loading, error, refetch } = useApi<{ products: Product[] }>("/api/products")
  const { toast } = useToast()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: "",
    description: "",
    category: "",
    quantity: "",
    unit: "kg",
    pricePerUnit: "",
    harvestDate: "",
    expiryDate: "",
    certifications: "",
    farm: "",
  })

  const products = productsData?.products || []

  const handleAddProduct = async () => {
    try {
      setIsSubmitting(true)

      // Validate required fields
      if (
        !newProduct.name ||
        !newProduct.description ||
        !newProduct.category ||
        !newProduct.quantity ||
        !newProduct.pricePerUnit ||
        !newProduct.harvestDate ||
        !newProduct.farm
      ) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      const productData = {
        name: newProduct.name,
        description: newProduct.description,
        category: newProduct.category,
        quantity: Number.parseInt(newProduct.quantity),
        unit: newProduct.unit,
        pricePerUnit: Number.parseFloat(newProduct.pricePerUnit),
        harvestDate: newProduct.harvestDate,
        expiryDate: newProduct.expiryDate || undefined,
        certifications: newProduct.certifications
          .split(",")
          .map((cert) => cert.trim())
          .filter((cert) => cert),
        images: [],
        location: {
          farm: newProduct.farm,
        },
        traceabilityData: {},
      }

      await apiCall("/api/products", {
        method: "POST",
        body: JSON.stringify(productData),
      })

      toast({
        title: "Success",
        description: "Product added successfully",
      })

      // Reset form and close dialog
      setNewProduct({
        name: "",
        description: "",
        category: "",
        quantity: "",
        unit: "kg",
        pricePerUnit: "",
        harvestDate: "",
        expiryDate: "",
        certifications: "",
        farm: "",
      })
      setIsAddDialogOpen(false)
      refetch() // Refresh the products list
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add product",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "default"
      case "reserved":
        return "secondary"
      case "sold":
        return "outline"
      case "expired":
        return "destructive"
      default:
        return "default"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading products...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading products: {error}</p>
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
          <h2 className="text-2xl font-serif font-bold">Product Management</h2>
          <p className="text-muted-foreground">Manage your farm products and inventory</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Name *</label>
                <Input
                  placeholder="e.g., Organic Tomatoes"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <Select
                  value={newProduct.category}
                  onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vegetables">Vegetables</SelectItem>
                    <SelectItem value="Fruits">Fruits</SelectItem>
                    <SelectItem value="Leafy Greens">Leafy Greens</SelectItem>
                    <SelectItem value="Grains">Grains</SelectItem>
                    <SelectItem value="Herbs">Herbs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  placeholder="Describe your product..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity *</label>
                <Input
                  type="number"
                  placeholder="500"
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Unit *</label>
                <Select
                  value={newProduct.unit}
                  onValueChange={(value) => setNewProduct({ ...newProduct, unit: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="g">Grams (g)</SelectItem>
                    <SelectItem value="pieces">Pieces</SelectItem>
                    <SelectItem value="bunches">Bunches</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price per Unit (₹) *</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="35.00"
                  value={newProduct.pricePerUnit}
                  onChange={(e) => setNewProduct({ ...newProduct, pricePerUnit: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Farm Location *</label>
                <Input
                  placeholder="e.g., Green Valley Farm, Punjab"
                  value={newProduct.farm}
                  onChange={(e) => setNewProduct({ ...newProduct, farm: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Harvest Date *</label>
                <Input
                  type="date"
                  value={newProduct.harvestDate}
                  onChange={(e) => setNewProduct({ ...newProduct, harvestDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Expiry Date</label>
                <Input
                  type="date"
                  value={newProduct.expiryDate}
                  onChange={(e) => setNewProduct({ ...newProduct, expiryDate: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Certifications (comma-separated)</label>
                <Input
                  placeholder="USDA Organic, Non-GMO, Pesticide-Free"
                  value={newProduct.certifications}
                  onChange={(e) => setNewProduct({ ...newProduct, certifications: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleAddProduct} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Product"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No products yet</h3>
            <p className="text-muted-foreground mb-4">Start by adding your first product to the inventory</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                  </div>
                  <Badge variant={getStatusColor(product.status)}>{product.status.replace("-", " ")}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{product.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Quantity</p>
                    <p className="font-medium">
                      {product.quantity} {product.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Price/{product.unit}</p>
                    <p className="font-medium">₹{product.pricePerUnit}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Harvest Date</p>
                    <p className="font-medium">{new Date(product.harvestDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Farm</p>
                    <p className="font-medium">{product.location.farm}</p>
                  </div>
                </div>

                {product.certifications.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Certifications</p>
                    <div className="flex flex-wrap gap-1">
                      {product.certifications.map((cert, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
