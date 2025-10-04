"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Clock, CheckCircle, User } from "lucide-react"

interface CustomerInquiry {
  id: string
  customerName: string
  customerEmail: string
  product: string
  inquiryType: "traceability" | "quality" | "availability" | "general"
  message: string
  date: string
  status: "pending" | "responded" | "resolved"
  priority: "low" | "medium" | "high"
}

export function CustomerInquiries() {
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([
    {
      id: "INQ-001",
      customerName: "Shrushti Babre",
      customerEmail: "shrushti.b@email.com",
      product: "Fresh Tomatoes",
      inquiryType: "traceability",
      message: "Hi, I'd like to know more about where these tomatoes were grown. Can you provide the farm details?",
      date: "2025-08-22",
      status: "pending",
      priority: "medium",
    },
    {
      id: "INQ-002",
      customerName: "Sanika Parate",
      customerEmail: "sanika.p@email.com",
      product: "Fresh Potatoes",
      inquiryType: "quality",
      message: "I noticed the potatoes I bought yesterday have some spots. Are they still fresh and safe to eat?",
      date: "2025-08-21",
      status: "responded",
      priority: "high",
    },
    {
      id: "INQ-003",
      customerName: "Shreya Nagbhidkar",
      customerEmail: "shreya.N@email.com",
      product: "Fresh Brinjal",
      inquiryType: "availability",
      message: "When will you have smaller sized brinjals back in stock?",
      date: "2025-08-20",
      status: "resolved",
      priority: "low",
    },
  ])

  const handleStatusChange = (inquiryId: string, newStatus: CustomerInquiry["status"]) => {
    setInquiries(inquiries.map((inquiry) => (inquiry.id === inquiryId ? { ...inquiry, status: newStatus } : inquiry)))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "responded":
        return <MessageCircle className="h-4 w-4" />
      case "resolved":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "responded":
        return "default"
      case "resolved":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  const getInquiryTypeLabel = (type: string) => {
    switch (type) {
      case "traceability":
        return "Product Origin"
      case "quality":
        return "Quality Concern"
      case "availability":
        return "Stock Inquiry"
      case "general":
        return "General Question"
      default:
        return type
    }
  }

  const inquiryStats = {
    total: inquiries.length,
    pending: inquiries.filter((i) => i.status === "pending").length,
    responded: inquiries.filter((i) => i.status === "responded").length,
    resolved: inquiries.filter((i) => i.status === "resolved").length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold">Customer Inquiries</h2>
        <p className="text-muted-foreground">Manage customer questions about vegetable traceability and quality</p>
      </div>

      {/* Inquiry Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{inquiryStats.total}</div>
            <p className="text-xs text-muted-foreground">Total Inquiries</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{inquiryStats.pending}</div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{inquiryStats.responded}</div>
            <p className="text-xs text-muted-foreground">Responded</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{inquiryStats.resolved}</div>
            <p className="text-xs text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {inquiries.map((inquiry) => (
          <Card key={inquiry.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-lg">{inquiry.customerName}</CardTitle>
                    <p className="text-sm text-muted-foreground">{inquiry.customerEmail}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant={getPriorityColor(inquiry.priority)}>{inquiry.priority} priority</Badge>
                  <Badge variant={getStatusColor(inquiry.status)} className="flex items-center gap-1">
                    {getStatusIcon(inquiry.status)}
                    {inquiry.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Product</p>
                  <p className="font-medium">{inquiry.product}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Inquiry Type</p>
                  <p className="font-medium">{getInquiryTypeLabel(inquiry.inquiryType)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{inquiry.date}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Message</p>
                <p className="text-sm bg-muted p-3 rounded-lg">{inquiry.message}</p>
              </div>

              <div className="flex space-x-2">
                {inquiry.status === "pending" && (
                  <Button size="sm" onClick={() => handleStatusChange(inquiry.id, "responded")}>
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Respond
                  </Button>
                )}
                {inquiry.status === "responded" && (
                  <Button size="sm" onClick={() => handleStatusChange(inquiry.id, "resolved")}>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Mark Resolved
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  View Details
                </Button>
                {inquiry.inquiryType === "traceability" && (
                  <Button size="sm" variant="outline">
                    Share Traceability
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
