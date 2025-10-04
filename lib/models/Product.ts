import type { ObjectId } from "mongodb"

export interface Product {
  _id?: ObjectId
  name: string
  description: string
  category: string
  farmerId: ObjectId
  farmerName: string
  quantity: number
  unit: string
  pricePerUnit: number
  harvestDate: Date
  expiryDate?: Date
  certifications: string[]
  images: string[]
  location: {
    farm: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  status: "available" | "reserved" | "sold" | "expired"
  createdAt: Date
  updatedAt: Date
  traceabilityData: {
    seedSource?: string
    fertilizers?: string[]
    pesticides?: string[]
    irrigationMethod?: string
    soilType?: string
  }
}
