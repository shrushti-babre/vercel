import type { ObjectId } from "mongodb"

export interface Order {
  _id?: ObjectId
  orderNumber: string
  buyerId: ObjectId
  buyerName: string
  buyerRole: "manufacturer" | "distributor" | "retailer" | "customer"
  sellerId: ObjectId
  sellerName: string
  sellerRole: "farmer" | "manufacturer" | "distributor" | "retailer"
  productId: ObjectId
  productName: string
  quantity: number
  unit: string
  pricePerUnit: number
  totalAmount: number
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  orderDate: Date
  expectedDeliveryDate?: Date
  actualDeliveryDate?: Date
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  trackingInfo?: {
    trackingNumber?: string
    carrier?: string
    currentLocation?: string
    estimatedDelivery?: Date
  }
  createdAt: Date
  updatedAt: Date
}
