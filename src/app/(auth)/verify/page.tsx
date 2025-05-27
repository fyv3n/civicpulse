"use client"

import { Suspense, useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { verifyEmail, resendVerificationEmail } from "@/lib/firebase/users"
import { auth } from "@/lib/firebase/config"
import { onAuthStateChanged } from "firebase/auth"
import { FirebaseError } from "firebase/app"
import LoadingSpinner from "@/components/utilities/loading-spinner"

function VerifyPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [verificationAttempted, setVerificationAttempted] = useState(false)

  const handleVerification = useCallback(async (code: string) => {
    try {
      setIsLoading(true)
      setVerificationAttempted(true)
      
      await verifyEmail(code)
      
      toast({
        title: "Email verified",
        description: "Your email has been verified successfully. You can now use all features.",
      })
      
      // Redirect to feed or return URL if provided
      const returnUrl = searchParams.get('returnUrl')
      router.push(returnUrl || "/feed")
    } catch (error: unknown) {
      console.error("Verification error:", error)
      
      let errorMessage = "The verification link is invalid or has expired. Please request a new one."
      
      // Provide more specific error messages based on the error
      if (error instanceof FirebaseError || error instanceof Error) {
        if (error.message.includes("No user is currently signed in")) {
          errorMessage = "Please sign in to verify your email."
        } else if (error.message.includes("Invalid or expired verification link")) {
          errorMessage = "The verification link is invalid or has expired. Please request a new one."
        } else if (error.message.includes("Failed to update user verification status")) {
          errorMessage = "There was an error updating your verification status. Please try again."
        }
      }
      
      toast({
        title: "Verification failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [router, searchParams, toast])

  // Check if we have a verification code in the URL
  useEffect(() => {
    const mode = searchParams.get('mode')
    const oobCode = searchParams.get('oobCode')

    if (mode === 'verifyEmail' && oobCode && !verificationAttempted) {
      handleVerification(oobCode)
    }
  }, [searchParams, verificationAttempted, handleVerification])

  // Check auth state and redirect if already verified
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user?.emailVerified) {
        try {
          // Force reload user to ensure we have the latest data
          await user.reload()
        const returnUrl = searchParams.get('returnUrl')
        router.push(returnUrl || "/feed")
        } catch (error) {
          console.error("Error reloading user:", error)
        }
      }
    })

    return () => unsubscribe()
  }, [router, searchParams])

  const handleResendEmail = async () => {
    try {
      setIsResending(true)
      await resendVerificationEmail()
      
      toast({
        title: "Verification email sent",
        description: "Please check your email for the verification link.",
      })
    } catch (error: unknown) {
      console.error("Error resending verification email:", error)
      
      let errorMessage = "Failed to resend verification email. Please try again."
      
      if (error instanceof FirebaseError || error instanceof Error) {
        if (error.message.includes("No user is currently signed in")) {
          errorMessage = "Please sign in to request a new verification email."
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
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
              disabled={isResending || isLoading}
              variant="outline"
            >
              {isResending ? (
                <div className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span>Sending...</span>
                </div>
              ) : (
                "Resend verification email"
              )}
            </Button>

            <Button 
              onClick={() => router.push("/login")} 
              className="w-full"
              disabled={isLoading || isResending}
            >
              Back to login
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <VerifyPageContent />
    </Suspense>
  )
} 