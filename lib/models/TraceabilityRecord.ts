import type { ObjectId } from "mongodb"

export interface TraceabilityRecord {
  _id?: ObjectId
  productId: ObjectId
  orderId?: ObjectId
  stage: "farm" | "processing" | "distribution" | "retail" | "consumer"
  actorId: ObjectId
  actorName: string
  actorRole: "farmer" | "manufacturer" | "distributor" | "retailer" | "customer"
  location: {
    name: string
    address: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  timestamp: Date
  action: string
  description: string
  temperature?: number
  humidity?: number
  qualityScore?: number
  certifications?: string[]
  images?: string[]
  verificationStatus: "verified" | "pending" | "failed"
  previousRecordId?: ObjectId
  hash?: string
  metadata?: Record<string, any>
  createdAt: Date
}

export interface ProductJourney {
  productId: ObjectId
  productName: string
  origin: {
    farmer: string
    location: string
    harvestDate: Date
    certifications: string[]
  }
  records: TraceabilityRecord[]
  currentStatus: string
  verificationStatus: "verified" | "pending" | "failed"
  trustScore?: number
}
