"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase/config"
import { getUserProfile, isAdmin, isModerator } from "@/lib/firebase/users"

interface RoleGuardProps {
  children: React.ReactNode
  requiredRole: "admin" | "moderator"
}

export default function RoleGuard({ children, requiredRole }: RoleGuardProps) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const user = auth.currentUser
      if (!user) {
        router.push("/login")
        return
      }

      try {
        let hasAccess = false
        if (requiredRole === "admin") {
          hasAccess = await isAdmin(user.uid)
        } else if (requiredRole === "moderator") {
          hasAccess = await isModerator(user.uid)
        }

        if (!hasAccess) {
          router.push("/feed")
          return
        }

        setIsAuthorized(true)
      } catch (error) {
        console.error("Error checking authorization:", error)
        router.push("/feed")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, requiredRole])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
} 