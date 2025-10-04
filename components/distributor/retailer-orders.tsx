"use client"
import { useEffect, useState } from "react"

interface Order {
  _id: string
  orderNumber: string
  productName: string
  quantity: number
  status: string
}

export default function RetailerOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      try {
        // ✅ only retailer->distributor orders
        const res = await fetch("/api/distributor/orders")
        const data = await res.json()
        setOrders(Array.isArray(data.orders) ? data.orders : [])
      } catch (e) {
        console.error("Distributor retailer orders fetch error:", e)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  return (
    <div className="bg-white rounded shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Orders</h2>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b">
            <th className="py-2">Order #</th>
            <th className="py-2">Product</th>
            <th className="py-2">Quantity</th>
            <th className="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={4} className="py-4 text-center">Loading…</td></tr>
          ) : orders.length === 0 ? (
            <tr><td colSpan={4} className="py-4 text-center text-gray-500">No orders found</td></tr>
          ) : (
            orders.map((o) => (
              <tr key={o._id} className="border-b hover:bg-gray-50">
                <td className="py-2">{o.orderNumber}</td>
                <td className="py-2">{o.productName}</td>
                <td className="py-2">{o.quantity}</td>
                <td className="py-2">{o.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
