import type { ObjectId } from "mongodb"

export interface InventoryItem {
  _id?: ObjectId
  productId: ObjectId
  supplierId: ObjectId
  batchNumber: string
  quantity: number
  unit: string
  expiryDate?: Date
  location: string
  status: "available" | "reserved" | "sold" | "expired"
  qualityGrade: "A" | "B" | "C"
  storageConditions?: {
    temperature?: number
    humidity?: number
  }
  createdAt: Date
  updatedAt: Date
}
