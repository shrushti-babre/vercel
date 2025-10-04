"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { traceabilityService } from "@/lib/services/traceability-service"
import type { ProductJourney } from "@/lib/models/TraceabilityRecord"
import { CheckCircle, AlertCircle, MapPin, Calendar, Award, TrendingUp } from "lucide-react"

interface ProductTraceViewerProps {
  productId: string
}

export function ProductTraceViewer({ productId }: ProductTraceViewerProps) {
  const [journey, setJourney] = useState<ProductJourney | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVerifying, setIsVerifying] = useState(false)

  useEffect(() => {
    loadTraceData()
  }, [productId])

  const loadTraceData = async () => {
    setIsLoading(true)
    try {
      const journeyData = await traceabilityService.getProductJourney(productId)
      setJourney(journeyData)
    } catch (error) {
      console.error("Error loading trace data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyAuthenticity = async () => {
    setIsVerifying(true)
    try {
      const isAuthentic = await traceabilityService.verifyProductAuthenticity(productId)
      console.log("Product authenticity verified:", isAuthentic)
    } catch (error) {
      console.error("Error verifying authenticity:", error)
    } finally {
      setIsVerifying(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading product trace data...</p>
        </div>
      </div>
    )
  }

  if (!journey) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Product Not Found</h3>
          <p className="text-muted-foreground">Unable to load traceability data for this product.</p>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "verified":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "failed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getTrustScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      {/* Product Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{journey.productName}</CardTitle>
              <p className="text-muted-foreground">Product ID: {journey.productId.toString()}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge className={getStatusColor(journey.verificationStatus)}>
                <CheckCircle className="h-4 w-4 mr-1" />
                {journey.verificationStatus}
              </Badge>
              <Button onClick={handleVerifyAuthenticity} disabled={isVerifying} variant="outline">
                {isVerifying ? "Verifying..." : "Verify Authenticity"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="journey" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="journey">Supply Chain Journey</TabsTrigger>
          <TabsTrigger value="trust-score">Trust Score</TabsTrigger>
          <TabsTrigger value="origin">Origin Details</TabsTrigger>
        </TabsList>

        <TabsContent value="journey" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Database-Verified Journey
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {journey.records.map((record, index) => (
                  <div key={record._id?.toString()} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      {index < journey.records.length - 1 && <div className="w-px h-16 bg-border mt-2"></div>}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{record.action}</h4>
                        <Badge variant="outline">{record.actorRole}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {record.actorName} • {record.location.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {record.timestamp.toLocaleDateString()} at {record.timestamp.toLocaleTimeString()}
                      </p>
                      {record.description && <p className="text-sm">{record.description}</p>}
                      {record.qualityScore && (
                        <div className="text-xs bg-muted p-2 rounded">
                          <strong>Quality Score:</strong> {record.qualityScore}/100
                        </div>
                      )}
                      {record.hash && <p className="text-xs font-mono text-muted-foreground">Hash: {record.hash}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trust-score" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Trust Score Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <div className={`text-6xl font-bold ${getTrustScoreColor(journey.trustScore || 0)}`}>
                  {journey.trustScore || 0}
                </div>
                <Badge variant="outline" className="text-lg px-4 py-1">
                  {journey.trustScore && journey.trustScore >= 90
                    ? "Grade A"
                    : journey.trustScore && journey.trustScore >= 80
                      ? "Grade B"
                      : journey.trustScore && journey.trustScore >= 70
                        ? "Grade C"
                        : "Grade D"}
                </Badge>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Trust Factors</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Journey Completeness</span>
                    <span className="font-medium">{Math.min(journey.records.length * 25, 100)}%</span>
                  </div>
                  <Progress value={Math.min(journey.records.length * 25, 100)} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Verification Status</span>
                    <span className="font-medium">{journey.verificationStatus === "verified" ? 100 : 0}%</span>
                  </div>
                  <Progress value={journey.verificationStatus === "verified" ? 100 : 0} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="origin" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Origin & Certifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Farm Details</h4>
                  <p className="text-sm">
                    <strong>Farmer:</strong> {journey.origin.farmer}
                  </p>
                  <p className="text-sm">
                    <strong>Location:</strong> {journey.origin.location}
                  </p>
                  <p className="text-sm flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <strong>Harvest Date:</strong> {journey.origin.harvestDate.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Certifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {journey.origin.certifications.map((cert, index) => (
                      <Badge key={index} variant="secondary">
                        {cert}
                      </Badge>
                    ))}
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
