import type { ObjectId } from "mongodb"

export interface Notification {
  _id?: ObjectId
  userId: ObjectId
  type: "order_update" | "quality_alert" | "delivery_notification" | "system_alert"
  title: string
  message: string
  data?: Record<string, any>
  isRead: boolean
  priority: "low" | "medium" | "high" | "urgent"
  createdAt: Date
  readAt?: Date
}
