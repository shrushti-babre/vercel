import type { ObjectId } from "mongodb"

export interface Supplier {
  _id?: ObjectId
  name: string
  type: "farmer" | "manufacturer" | "distributor" | "retailer"
  contactInfo: {
    email: string
    phone: string
    address: string
  }
  location: {
    name: string
    address: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  certifications: string[]
  trustScore?: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
