"use client"

import PostForm from "@/components/post/post-form"
import { useRouter } from "next/navigation"
import { useAuth } from "@/@auth"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import LoadingSpinner from "@/components/utilities/loading-spinner"

export default function CreatePostPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Check if user is not logged in
        if (!user) {
          toast({
            title: "Authentication Required",
            description: "Please log in to create a post",
            variant: "destructive",
          })
          router.push("/login")
          return
        }

        // Force refresh the user to get the latest verification status
        await user.reload()
        
        // Check if email is not verified
        if (!user.emailVerified) {
          toast({
            title: "Email Verification Required",
            description: "Your email must be verified to create posts. Please check your inbox and verify your email.",
            variant: "destructive",
          })
          router.push("/verify")
          return
        }
      } catch (error) {
        console.error("Error checking access:", error)
        toast({
          title: "Access Check Failed",
          description: "There was an error checking your access. Please try again.",
          variant: "destructive",
        })
        router.push("/feed")
      } finally {
        setIsChecking(false)
      }
    }

    checkAccess()
  }, [user, router, toast])

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // If user is not verified or not logged in, don't render anything
  if (!user?.emailVerified) {
    return null
  }


  const handlePostCreated = () => {
    try {
      router.push("/feed")
    } catch (error) {
      console.error("Navigation error:", error)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Create New Post</h1>
        <p className="text-gray-600 mt-1">Share what&apos;s happening in your community</p>
      </div>

      <PostForm onPostCreated={handlePostCreated} />
    </div>
  )
}
