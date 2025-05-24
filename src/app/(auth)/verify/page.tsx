"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { verifyEmail, resendVerificationEmail } from "@/lib/firebase/users"
import { auth } from "@/lib/firebase/config"
import { onAuthStateChanged } from "firebase/auth"

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)

  // Check if we have a verification code in the URL
  useEffect(() => {
    const mode = searchParams.get('mode')
    const oobCode = searchParams.get('oobCode')

    if (mode === 'verifyEmail' && oobCode) {
      handleVerification(oobCode)
    }
  }, [searchParams])

  // Check auth state and redirect if already verified
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.emailVerified) {
        const returnUrl = searchParams.get('returnUrl')
        router.push(returnUrl || "/feed")
      }
    })

    return () => unsubscribe()
  }, [router, searchParams])

  const handleVerification = async (code: string) => {
    try {
      setIsLoading(true)
      await verifyEmail(code)
      
      // Force refresh the user to get updated emailVerified status
      await auth.currentUser?.reload()
      
      toast({
        title: "Email verified",
        description: "Your email has been verified successfully. You can now use all features.",
      })
      
      // Redirect to feed or return URL if provided
      const returnUrl = searchParams.get('returnUrl')
      router.push(returnUrl || "/feed")
    } catch (error: any) {
      console.error("Verification error:", error)
      toast({
        title: "Verification failed",
        description: "The verification link is invalid or has expired. Please request a new one.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    try {
      setIsResending(true)
      await resendVerificationEmail()
      
      toast({
        title: "Verification email sent",
        description: "Please check your email for the verification link.",
      })
    } catch (error: any) {
      console.error("Error resending verification email:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to resend verification email. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsResending(false)
    }
  }

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
          <h1 className="text-xl sm:text-2xl font-bold text-center mb-6">Verify your email</h1>
          
          <div className="mb-6 text-center text-gray-600">
            <p>Please check your email for a verification link.</p>
            <p className="text-sm mt-2">
              Click the link in the email to verify your account.
            </p>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={handleResendEmail} 
              className="w-full" 
              disabled={isResending}
              variant="outline"
            >
              {isResending ? "Sending..." : "Resend verification email"}
            </Button>

            <Button 
              onClick={() => router.push("/login")} 
              className="w-full"
            >
              Back to login
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 