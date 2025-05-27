"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { auth } from "@/lib/firebase/config"
import { getUserProfile } from "@/lib/firebase/users"
import { UserProfile } from "@/lib/firebase/users"
import { useModeratorMode } from "@/contexts/moderator-mode-context"

export default function ModeratorModeToggle() {
  const { isModeratorMode, setIsModeratorMode } = useModeratorMode()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const profile = await getUserProfile(user.uid)
        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }
    })

    return () => unsubscribe()
  }, [])

  // Only show the toggle for users with moderator role
  if (!userProfile || (userProfile.role !== 'moderator' && userProfile.role !== 'admin')) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-base">Moderator Mode</Label>
          <p className="text-sm text-gray-500">
            {isModeratorMode 
              ? "Your actions will appear as 'Barangay Moderator'"
              : "Your actions will appear with your personal name"}
          </p>
        </div>
        <Switch
          checked={isModeratorMode}
          onCheckedChange={setIsModeratorMode}
        />
      </div>
      <Separator />
    </div>
  )
} 