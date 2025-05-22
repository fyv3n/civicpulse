import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8 text-red-600"
            >
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
            <span className="text-xl font-bold">CivicPulse</span>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200">
          <h1 className="text-xl sm:text-2xl font-bold text-center mb-6">Log in to your account</h1>

          <form className="space-y-4" action="/feed">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your.email@example.com" required />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-red-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input id="password" type="password" required />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-sm">
                Remember me
              </Label>
            </div>

            <Button type="submit" className="w-full" asChild>
              <Link href="/feed">Log in</Link>
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/signup" className="text-red-600 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
