import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-muted via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-primary"
            >
              <path
                d="M24 8C20 8 16 12 16 16C16 20 20 24 24 24C28 24 32 20 32 16C32 12 28 8 24 8Z"
                fill="currentColor"
              />
              <path
                d="M12 20C12 18 14 16 16 16C18 16 20 18 20 20C20 22 18 24 16 24C14 24 12 22 12 20Z"
                fill="currentColor"
              />
              <path
                d="M28 20C28 18 30 16 32 16C34 16 36 18 36 20C36 22 34 24 32 24C30 24 28 22 28 20Z"
                fill="currentColor"
              />
              <path d="M24 28L20 32L16 36L20 40L24 36L28 40L32 36L28 32L24 28Z" fill="currentColor" />
            </svg>
          </div>
          <h1 className="text-4xl font-serif font-bold text-foreground mb-3">Trust Trace</h1>
          <p className="text-muted-foreground text-lg">Sign in to your account</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
