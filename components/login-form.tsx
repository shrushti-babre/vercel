"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const loggedInUser = await login(email, password)

      console.log("login response:", loggedInUser)
      console.log("User role:", loggedInUser.role)

      // Store token in localStorage
      if ((loggedInUser as any).token) {
        localStorage.setItem("token", (loggedInUser as any).token)
      }

      toast({
        title: "Success",
        description: "Logged in successfully",
      })

      // Redirect based on role
      if (loggedInUser.role) {
        router.push(`/dashboard/${loggedInUser.role}`)
      } else {
        router.push("/login")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Login failed",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="shadow-2xl border-0 bg-background max-w-md w-full">
      <CardHeader className="space-y-3 text-center pb-6">
        <h2 className="text-3xl font-bold font-serif text-foreground">Welcome Back</h2>
        <p className="text-muted-foreground">Enter your credentials to access your account</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email">Email Address</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password">Password</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
              required
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full h-12">
            {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Sign In"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-center">
        <p className="text-muted-foreground">
          Don't have an account? <Link href="/signup">Sign up</Link>
        </p>
      </CardFooter>
    </Card>
  )
}