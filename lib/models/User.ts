import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  email: string
  password: string
  name: string
  role: "farmer" | "manufacturer" | "distributor" | "retailer" | "customer"
  createdAt: Date
  updatedAt: Date
  profile?: {
    phone?: string
    address?: string
    companyName?: string
    contactPerson?: string
    description?: string
  }
}

export interface UserSession {
  _id?: ObjectId
  userId: ObjectId
  token: string
  expiresAt: Date
  createdAt: Date
}
