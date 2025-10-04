"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

type UserRole = "farmer" | "manufacturer" | "distributor" | "retailer" | "customer"

interface FormData {
  email: string
  password: string
  confirmPassword: string
  role: UserRole | ""
  companyName: string
  contactPerson: string
  phone: string
  address: string
  city?: string
  state?: string
  pinCode?: string
}

interface FormErrors {
  email?: string
  password?: string
  confirmPassword?: string
  role?: string
  companyName?: string
  contactPerson?: string
  phone?: string
  address?: string
}

export function SignupForm() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    companyName: "",
    contactPerson: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const router = useRouter()

  const roleOptions = [
    { value: "farmer", label: "Farmer", description: "Grow and harvest organic produce" },
    { value: "manufacturer", label: "Manufacturer", description: "Process and package food products" },
    { value: "distributor", label: "Distributor", description: "Distribute products to retailers" },
    { value: "retailer", label: "Retailer", description: "Sell products to end customers" },
    { value: "customer", label: "Customer", description: "Purchase and consume organic products" },
  ]

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]){
       setErrors((prev) => ({ ...prev, [field]: undefined }))
  }
}

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    if (!formData.email) newErrors.email = "Email is required"
    if (!formData.password) newErrors.password = "Password is required"
    if (formData.password && formData.password.length < 8) newErrors.password = "Password must be at least 8 characters"
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match"
    if (!formData.role) newErrors.role = "Please select your role"
    if (!formData.companyName) newErrors.companyName = "Company/Organization name is required"
    if (!formData.contactPerson) newErrors.contactPerson = "Contact person name is required"
    if (!formData.phone) newErrors.phone = "Phone number is required"
    if (!formData.address) newErrors.address = "Address is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)

    try {
  const res = await fetch("/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: formData.email,
    password: formData.password,
    name: formData.contactPerson || formData.companyName, // 👈 required "name"
    role: formData.role,
    profile: {
      companyName: formData.companyName,
      contactPerson: formData.contactPerson,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pinCode: formData.pinCode,
    },
  }),
})


  const data = await res.json()
  if (!res.ok) throw new Error(data.error || "Signup failed")

  // ✅ Automatically log in after signup
  const loginRes = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: formData.email, password: formData.password }),
  })

  const loginData = await loginRes.json()
  if (!loginRes.ok) throw new Error(loginData.error || "Login failed")

  // ✅ Redirect user
  router.push(formData.role === "customer" ? "/customer" : `/dashboard/${formData.role}`)
} catch (error) {
  alert(error instanceof Error ? error.message : "Signup failed")
} finally {
  setIsLoading(false)
}

  }

  return (
    <Card className="shadow-2xl border-0 bg-background">
      <CardHeader className="space-y-1 pb-6 text-center">
        <h2 className="text-2xl font-serif font-bold text-foreground">Create Your Account</h2>
        <p className="text-muted-foreground">Fill in your details to get started</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Account Type *</label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value as UserRole)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select your role in the supply chain" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
          </div>

          {/* Credentials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="email" type="email" placeholder="Email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} className="h-12" />
            <Input id="phone" type="tel" placeholder="Phone" value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} className="h-12" />
            <Input id="password" type="password" placeholder="Password" value={formData.password} onChange={(e) => handleInputChange("password", e.target.value)} className="h-12" />
            <Input id="confirmPassword" type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={(e) => handleInputChange("confirmPassword", e.target.value)} className="h-12" />
          </div>

          {/* Company Info */}
          <Input id="companyName" type="text" placeholder="Company Name" value={formData.companyName} onChange={(e) => handleInputChange("companyName", e.target.value)} className="h-12" />
          <Input id="contactPerson" type="text" placeholder="Contact Person" value={formData.contactPerson} onChange={(e) => handleInputChange("contactPerson", e.target.value)} className="h-12" />
          <Input id="address" type="text" placeholder="Address" value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} className="h-12" />
          <Input id="city" type="text" placeholder="City" value={formData.city} onChange={(e) => handleInputChange("city", e.target.value)} className="h-12" />
          <Input id="state" type="text" placeholder="State" value={formData.state} onChange={(e) => handleInputChange("state", e.target.value)} className="h-12" />
          <Input id="pinCode" type="text" placeholder="PIN Code" value={formData.pinCode} onChange={(e) => handleInputChange("pinCode", e.target.value)} className="h-12" />

          <Button type="submit" className="w-full h-12" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="pt-6 text-center">
        <Link href="/login" className="text-primary font-semibold">Already have an account? Sign in</Link>
      </CardFooter>
    </Card>
  )
}