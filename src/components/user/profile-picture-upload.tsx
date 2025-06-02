"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DEFAULT_AVATAR } from "@/lib/constants"
import { useToast } from "@/hooks/use-toast"
import { storage } from "@/lib/firebase/config"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { updateProfile } from "firebase/auth"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { useAuth } from "@/@auth"

interface ProfilePictureUploadProps {
  currentPhotoURL?: string | null
  displayName?: string | null
  onUploadComplete?: (url: string) => void
}

export default function ProfilePictureUpload({ 
  currentPhotoURL, 
  displayName = "User",
  onUploadComplete 
}: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return

    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUploading(true)

      // Upload to Firebase Storage
      const storageRef = ref(storage, `profile_pictures/${user.uid}/${file.name}`)
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)

      // Update Auth Profile
      await updateProfile(user, {
        photoURL: downloadURL
      })

      // Update Firestore User Document
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, {
        photoURL: downloadURL
      })

      onUploadComplete?.(downloadURL)

      toast({
        title: "Success",
        description: "Profile picture updated successfully.",
      })
    } catch (error) {
      console.error("Error uploading profile picture:", error)
      toast({
        title: "Upload failed",
        description: "Failed to update profile picture. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="h-24 w-24 cursor-pointer relative group">
        <AvatarImage 
          src={currentPhotoURL || DEFAULT_AVATAR} 
          alt={displayName || "User"} 
        />
        <AvatarFallback>{displayName?.[0] || "U"}</AvatarFallback>
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
          <span className="text-white text-sm">Change Photo</span>
        </div>
      </Avatar>
      <div className="flex flex-col items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="relative"
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Upload New Picture"}
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </Button>
      </div>
    </div>
  )
} 