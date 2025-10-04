"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { orderTrackingService, type OrderTracking } from "@/lib/order-tracking"
import { MapPin, Clock, Package, Truck, CheckCircle, AlertCircle, Navigation, Calendar } from "lucide-react"

interface OrderTrackerProps {
  orderId: string
}

export function OrderTracker({ orderId }: OrderTrackerProps) {
  const [tracking, setTracking] = useState<OrderTracking | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTrackingData()
  }, [orderId])

  const loadTrackingData = async () => {
    setIsLoading(true)
    try {
      const trackingData = await orderTrackingService.getOrderTracking(orderId)
      setTracking(trackingData)
    } catch (error) {
      console.error("[v0] Error loading tracking data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-500"
      case "in-transit":
      case "shipped":
        return "bg-blue-500"
      case "processing":
        return "bg-yellow-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      case "in-transit":
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "processing":
        return <Package className="h-4 w-4" />
      case "cancelled":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const calculateProgress = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return 10
      case "confirmed":
        return 20
      case "processing":
        return 40
      case "shipped":
        return 60
      case "in-transit":
        return 80
      case "delivered":
        return 100
      default:
        return 0
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading tracking information...</p>
        </div>
      </div>
    )
  }

  if (!tracking) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Order Not Found</h3>
          <p className="text-muted-foreground">Unable to find tracking information for this order.</p>
        </CardContent>
      </Card>
    )
  }

  const progress = calculateProgress(tracking.currentStatus)

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{tracking.productName}</CardTitle>
              <p className="text-muted-foreground">Order #{tracking.orderId}</p>
              <p className="text-sm text-muted-foreground">Tracking: {tracking.trackingNumber}</p>
            </div>
            <div className="text-right space-y-2">
              <Badge className={getStatusColor(tracking.currentStatus)}>
                {getStatusIcon(tracking.currentStatus)}
                <span className="ml-1 capitalize">{tracking.currentStatus.replace("-", " ")}</span>
              </Badge>
              <p className="text-sm text-muted-foreground">Quantity: {tracking.quantity} units</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span>{progress}% Complete</span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Current Location</p>
                  <p className="text-muted-foreground">
                    {tracking.currentLocation.city}, {tracking.currentLocation.state}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Estimated Delivery</p>
                  <p className="text-muted-foreground">{tracking.estimatedDelivery.toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Carrier</p>
                  <p className="text-muted-foreground">{tracking.carrier || "TBD"}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="timeline" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="timeline">Tracking Timeline</TabsTrigger>
          <TabsTrigger value="map">Route Map</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Shipment Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {tracking.events.map((event, index) => (
                  <div key={event.id} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      {index < tracking.events.length - 1 && <div className="w-px h-16 bg-border mt-2"></div>}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{event.status}</h4>
                        <Badge variant="outline" className="capitalize">
                          {event.actorType}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.actor} • {event.location.city}, {event.location.state}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {event.timestamp.toLocaleDateString()} at {event.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Shipment Route
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-8 text-center space-y-4">
                <MapPin className="h-16 w-16 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Interactive Map</h3>
                  <p className="text-muted-foreground mb-4">
                    Real-time tracking map would be displayed here showing the route from origin to destination.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-background p-4 rounded border">
                      <h4 className="font-semibold mb-2">Origin</h4>
                      <p>{tracking.origin.address}</p>
                      <p>
                        {tracking.origin.city}, {tracking.origin.state}
                      </p>
                    </div>
                    <div className="bg-background p-4 rounded border">
                      <h4 className="font-semibold mb-2">Destination</h4>
                      <p>{tracking.destination.address}</p>
                      <p>
                        {tracking.destination.city}, {tracking.destination.state}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
