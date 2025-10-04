import type { ObjectId } from "mongodb"

export interface SupplyChainAnalytics {
  _id?: ObjectId
  productId?: ObjectId
  supplierId?: ObjectId
  period: {
    startDate: Date
    endDate: Date
  }
  metrics: {
    totalOrders: number
    totalRevenue: number
    averageDeliveryTime: number
    qualityScore: number
    customerSatisfaction: number
    wastePercentage: number
  }
  trends: {
    orderGrowth: number
    qualityTrend: number
    deliveryPerformance: number
  }
  createdAt: Date
}
