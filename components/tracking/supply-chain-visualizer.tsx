"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { orderTrackingService, type SupplyChainFlow } from "@/lib/order-tracking"
import { ArrowRight, MapPin, Factory, Truck, Store, Sprout, Clock, Route } from "lucide-react"

interface SupplyChainVisualizerProps {
  productId: string
}

export function SupplyChainVisualizer({ productId }: SupplyChainVisualizerProps) {
  const [flow, setFlow] = useState<SupplyChainFlow | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadFlowData()
  }, [productId])

  const loadFlowData = async () => {
    setIsLoading(true)
    try {
      const flowData = await orderTrackingService.getSupplyChainFlow(productId)
      setFlow(flowData)
    } catch (error) {
      console.error("[v0] Error loading supply chain flow:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "farmer":
        return <Sprout className="h-6 w-6" />
      case "manufacturer":
        return <Factory className="h-6 w-6" />
      case "distributor":
        return <Truck className="h-6 w-6" />
      case "retailer":
        return <Store className="h-6 w-6" />
      default:
        return <MapPin className="h-6 w-6" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "processing":
        return "bg-blue-500"
      case "active":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed"
      case "processing":
        return "In Progress"
      case "active":
        return "Pending"
      default:
        return "Unknown"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading supply chain visualization...</p>
        </div>
      </div>
    )
  }

  if (!flow) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Route className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Supply Chain Data</h3>
          <p className="text-muted-foreground">Unable to load supply chain information for this product.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Flow Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Supply Chain Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span>Overall Progress</span>
            <span>{flow.progress}% Complete</span>
          </div>
          <Progress value={flow.progress} className="h-3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Total Distance</p>
                <p className="text-muted-foreground">{flow.totalDistance.toLocaleString()} miles</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Estimated Duration</p>
                <p className="text-muted-foreground">{Math.round(flow.estimatedDuration / 24)} days</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Current Stage</p>
                <p className="text-muted-foreground capitalize">
                  {flow.nodes.find((n) => n.id === flow.currentNode)?.type || "Unknown"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supply Chain Flow */}
      <Card>
        <CardHeader>
          <CardTitle>Supply Chain Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {flow.nodes.map((node, index) => (
              <div key={node.id} className="flex items-center gap-4">
                {/* Node Icon */}
                <div
                  className={`p-3 rounded-full ${node.id === flow.currentNode ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  {getNodeIcon(node.type)}
                </div>

                {/* Node Details */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{node.name}</h4>
                    <Badge className={getStatusColor(node.status)}>{getStatusText(node.status)}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground capitalize">
                    {node.type} • {node.location.city}, {node.location.state}
                  </p>
                  <p className="text-xs text-muted-foreground">{node.location.address}</p>
                </div>

                {/* Arrow (except for last node) */}
                {index < flow.nodes.length - 1 && (
                  <div className="flex flex-col items-center">
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                    <div className="w-px h-8 bg-border mt-2"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Network Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Supply Chain Network</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-8 text-center space-y-4">
            <Route className="h-16 w-16 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Interactive Network Diagram</h3>
              <p className="text-muted-foreground mb-4">
                A visual network diagram would be displayed here showing the connections between all supply chain
                participants.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {flow.nodes.map((node) => (
                  <div key={node.id} className="bg-background p-3 rounded border text-center">
                    <div className="mb-2">{getNodeIcon(node.type)}</div>
                    <p className="font-medium text-xs">{node.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{node.type}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
