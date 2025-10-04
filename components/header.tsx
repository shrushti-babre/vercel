import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="bg-background border-b border-border px-6 py-4 sticky top-0 z-50 backdrop-blur-sm bg-background/95">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-primary"
          >
            <path d="M24 8C20 8 16 12 16 16C16 20 20 24 24 24C28 24 32 20 32 16C32 12 28 8 24 8Z" fill="currentColor" />
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
          <span className="ml-3 text-xl font-serif font-bold text-foreground">Trust Trace</span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-foreground hover:text-primary font-medium transition-colors duration-200">
            HOME
          </a>
          <a href="#" className="text-foreground hover:text-primary font-medium transition-colors duration-200">
            ABOUT US
          </a>
          <a href="#" className="text-foreground hover:text-primary font-medium transition-colors duration-200">
            SERVICES
          </a>
        </nav>

        <div className="flex items-center space-x-3">
          <Link href="/signup">
            <Button variant="ghost" className="font-medium">
              Sign Up
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="font-medium bg-transparent">
              Login
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
