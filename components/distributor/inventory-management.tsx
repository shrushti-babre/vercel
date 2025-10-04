"use client"
import { useEffect, useState } from "react"

interface InventoryItem {
  _id: string
  batchNumber: string
  quantity: number
  location: string
  status: string
}

export default function InventoryManagement() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchInventory() {
      try {
        const res = await fetch("/api/distributor/inventory")
        const data = await res.json()
        const items = Array.isArray(data.inventory)
          ? data.inventory
          : Array.isArray(data)
          ? data
          : []
        setInventory(items)
      } catch (e) {
        console.error("Distributor inventory fetch error:", e)
        setInventory([])
      } finally {
        setLoading(false)
      }
    }
    fetchInventory()
  }, [])

  return (
    <div className="bg-white rounded shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Inventory</h2>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b">
            <th className="py-2">Batch</th>
            <th className="py-2">Quantity</th>
            <th className="py-2">Location</th>
            <th className="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={4} className="py-4 text-center">Loading…</td></tr>
          ) : inventory.length === 0 ? (
            <tr><td colSpan={4} className="py-4 text-center text-gray-500">No inventory found</td></tr>
          ) : (
            inventory.map((item) => (
              <tr key={item._id} className="border-b hover:bg-gray-50">
                <td className="py-2">{item.batchNumber}</td>
                <td className="py-2">{item.quantity}</td>
                <td className="py-2">{item.location}</td>
                <td className="py-2">{item.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

