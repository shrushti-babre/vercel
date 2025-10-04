// app/api/retailer-dashboard/route.ts
import { NextResponse } from "next/server"

const dashboardData = {
  dashboardStats: {
    totalProducts: 0,
    activeOrders: 0,
    monthlySales: 0,
    customerInquiries: 0,
    averageRating: 0,
  },
  recentSales: [],
  topProducts: [],
}

export async function GET() {
  return NextResponse.json(dashboardData)
}
