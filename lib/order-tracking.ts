// Order Tracking and Supply Chain Visualization Service
export interface TrackingLocation {
  latitude: number
  longitude: number
  address: string
  city: string
  state: string
  country: string
}

export interface TrackingEvent {
  id: string
  timestamp: Date
  status: string
  location: TrackingLocation
  description: string
  actor: string
  actorType: "farmer" | "manufacturer" | "distributor" | "retailer" | "carrier"
  estimatedDelivery?: Date
}

export interface OrderTracking {
  orderId: string
  productId: string
  productName: string
  quantity: number
  currentStatus: "pending" | "confirmed" | "processing" | "shipped" | "in-transit" | "delivered" | "cancelled"
  currentLocation: TrackingLocation
  origin: TrackingLocation
  destination: TrackingLocation
  events: TrackingEvent[]
  estimatedDelivery: Date
  actualDelivery?: Date
  carrier?: string
  trackingNumber?: string
}

export interface SupplyChainNode {
  id: string
  name: string
  type: "farmer" | "manufacturer" | "distributor" | "retailer"
  location: TrackingLocation
  status: "active" | "processing" | "completed"
  products: string[]
  connections: string[]
}

export interface SupplyChainFlow {
  id: string
  productId: string
  nodes: SupplyChainNode[]
  currentNode: string
  progress: number // 0-100
  totalDistance: number
  estimatedDuration: number
}

class OrderTrackingService {
  private generateTrackingNumber(): string {
    return `TT${Date.now().toString().slice(-8)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`
  }

  async createOrderTracking(
    orderId: string,
    productId: string,
    productName: string,
    quantity: number,
    origin: TrackingLocation,
    destination: TrackingLocation,
  ): Promise<OrderTracking> {
    const trackingNumber = this.generateTrackingNumber()
    const estimatedDelivery = new Date()
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7) // 7 days from now

    const initialEvent: TrackingEvent = {
      id: `event_${Date.now()}`,
      timestamp: new Date(),
      status: "Order Confirmed",
      location: origin,
      description: "Order has been confirmed and is being prepared for shipment",
      actor: "Trust Trace System",
      actorType: "farmer",
      estimatedDelivery,
    }

    const orderTracking: OrderTracking = {
      orderId,
      productId,
      productName,
      quantity,
      currentStatus: "confirmed",
      currentLocation: origin,
      origin,
      destination,
      events: [initialEvent],
      estimatedDelivery,
      trackingNumber,
    }

    console.log("[v0] Order tracking created:", orderTracking)
    return orderTracking
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderTracking["currentStatus"],
    location: TrackingLocation,
    description: string,
    actor: string,
    actorType: TrackingEvent["actorType"],
  ): Promise<void> {
    const event: TrackingEvent = {
      id: `event_${Date.now()}`,
      timestamp: new Date(),
      status: status.charAt(0).toUpperCase() + status.slice(1),
      location,
      description,
      actor,
      actorType,
    }

    console.log("[v0] Order status updated:", { orderId, status, event })
  }

  async getOrderTracking(orderId: string): Promise<OrderTracking | null> {
    // Mock data for demonstration
    const mockTracking: OrderTracking = {
      orderId,
      productId: "prod_001",
      productName: "Organic Tomatoes",
      quantity: 100,
      currentStatus: "in-transit",
      currentLocation: {
        latitude: 36.1699,
        longitude: -115.1398,
        address: "Distribution Center",
        city: "Las Vegas",
        state: "Nevada",
        country: "USA",
      },
      origin: {
        latitude: 36.7783,
        longitude: -119.4179,
        address: "Green Valley Farms",
        city: "Fresno",
        state: "California",
        country: "USA",
      },
      destination: {
        latitude: 40.7128,
        longitude: -74.006,
        address: "Fresh Market Store",
        city: "New York",
        state: "New York",
        country: "USA",
      },
      events: [
        {
          id: "event_001",
          timestamp: new Date("2024-01-15T08:00:00Z"),
          status: "Order Confirmed",
          location: {
            latitude: 36.7783,
            longitude: -119.4179,
            address: "Green Valley Farms",
            city: "Fresno",
            state: "California",
            country: "USA",
          },
          description: "Order confirmed and harvest scheduled",
          actor: "Green Valley Farms",
          actorType: "farmer",
        },
        {
          id: "event_002",
          timestamp: new Date("2024-01-16T10:30:00Z"),
          status: "Processing",
          location: {
            latitude: 36.7783,
            longitude: -119.4179,
            address: "Processing Facility",
            city: "Fresno",
            state: "California",
            country: "USA",
          },
          description: "Products harvested and being processed",
          actor: "Fresh Foods Processing",
          actorType: "manufacturer",
        },
        {
          id: "event_003",
          timestamp: new Date("2024-01-17T14:15:00Z"),
          status: "Shipped",
          location: {
            latitude: 36.7783,
            longitude: -119.4179,
            address: "Shipping Dock",
            city: "Fresno",
            state: "California",
            country: "USA",
          },
          description: "Package shipped via Regional Distribution Co",
          actor: "Regional Distribution Co",
          actorType: "distributor",
        },
        {
          id: "event_004",
          timestamp: new Date("2024-01-18T09:45:00Z"),
          status: "In Transit",
          location: {
            latitude: 36.1699,
            longitude: -115.1398,
            address: "Distribution Center",
            city: "Las Vegas",
            state: "Nevada",
            country: "USA",
          },
          description: "Package arrived at distribution center",
          actor: "Regional Distribution Co",
          actorType: "distributor",
        },
      ],
      estimatedDelivery: new Date("2024-01-22T16:00:00Z"),
      trackingNumber: "TT24011501",
      carrier: "Regional Distribution Co",
    }

    return mockTracking
  }

  async getSupplyChainFlow(productId: string): Promise<SupplyChainFlow> {
    const mockFlow: SupplyChainFlow = {
      id: `flow_${productId}`,
      productId,
      currentNode: "node_distributor",
      progress: 65,
      totalDistance: 2800, // miles
      estimatedDuration: 168, // hours
      nodes: [
        {
          id: "node_farmer",
          name: "Green Valley Farms",
          type: "farmer",
          location: {
            latitude: 36.7783,
            longitude: -119.4179,
            address: "Green Valley Farms",
            city: "Fresno",
            state: "California",
            country: "USA",
          },
          status: "completed",
          products: [productId],
          connections: ["node_manufacturer"],
        },
        {
          id: "node_manufacturer",
          name: "Fresh Foods Processing",
          type: "manufacturer",
          location: {
            latitude: 36.7783,
            longitude: -119.4179,
            address: "Processing Facility",
            city: "Fresno",
            state: "California",
            country: "USA",
          },
          status: "completed",
          products: [productId],
          connections: ["node_distributor"],
        },
        {
          id: "node_distributor",
          name: "Regional Distribution Co",
          type: "distributor",
          location: {
            latitude: 36.1699,
            longitude: -115.1398,
            address: "Distribution Center",
            city: "Las Vegas",
            state: "Nevada",
            country: "USA",
          },
          status: "processing",
          products: [productId],
          connections: ["node_retailer"],
        },
        {
          id: "node_retailer",
          name: "Fresh Market Store",
          type: "retailer",
          location: {
            latitude: 40.7128,
            longitude: -74.006,
            address: "Fresh Market Store",
            city: "New York",
            state: "New York",
            country: "USA",
          },
          status: "active",
          products: [productId],
          connections: [],
        },
      ],
    }

    return mockFlow
  }
}

export const orderTrackingService = new OrderTrackingService()
