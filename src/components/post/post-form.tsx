"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { MapPin, AlertTriangle, Camera } from "lucide-react"
import { useRouter } from "next/navigation"
import { createPost } from "@/lib/firebase/posts"
import { useToast } from "@/components/ui/use-toast"
import LoadingSpinner from "@/components/utilities/loading-spinner"
import { useAuth } from "@/contexts/auth-context"

interface PostFormProps {
  onPostCreated?: () => void
}

export default function PostForm({ onPostCreated }: PostFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [location, setLocation] = useState("")
  const [isEmergency, setIsEmergency] = useState(false)
  const [media, setMedia] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create a post",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    // Force refresh user status before checking
    try {
      await user.reload()
    } catch (error) {
      console.error("Error refreshing user status:", error)
    }

    if (!user.emailVerified) {
      toast({
        title: "Verification Required",
        description: "Please verify your email before creating posts",
        variant: "destructive",
      })
      router.push("/verify")
      return
    }

    if (!title || !content) {
      toast({
        title: "Error",
        description: "Please provide a title and content for your post",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Create post in Firebase
      await createPost({
        title,
        content,
        location,
        isEmergency,
        userId: user.uid,
        author: {
          name: user.displayName || "Anonymous",
          avatar: user.photoURL || "/placeholder.svg?height=40&width=40",
          trustScore: 0,
          isVerified: user.emailVerified
        },
        status: "pending",
        createdAt: new Date(),
        commentCount: 0,
      })

      toast({
        title: "Success!",
        description: isEmergency 
          ? "Your emergency post has been created and will be reviewed promptly."
          : "Your post has been created and will be visible in the community feed.",
      })

      // Call the onPostCreated callback if provided
      onPostCreated?.()
    } catch (error: unknown) {
      console.error("Error creating post:", error)
      const errorMessage = error instanceof Error ? error.message : "There was an error creating your post. Please try again. If the problem persists, contact support."
      toast({
        title: "Post Creation Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMedia(Array.from(e.target.files))
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create Post</h1>
        <p className="text-gray-600 mt-1">Share information with your community</p>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="What's happening in your barangay?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isSubmitting}
              className="text-lg font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Provide more details about the situation..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[150px]"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-500 flex-shrink-0" />
              <Input
                id="location"
                placeholder="Exact location (optional)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isSubmitting}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="media-upload">Add Photos/Videos</Label>
            <div>
              <Input
                type="file"
                id="media-upload"
                className="hidden"
                multiple
                accept="image/*,video/*"
                onChange={handleMediaChange}
                disabled={isSubmitting}
              />
              <Label htmlFor="media-upload" className={`cursor-pointer ${isSubmitting ? "opacity-50" : ""}`}>
                <div className="flex items-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 transition-colors">
                  <Camera className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-600">Click to add photos or videos</span>
                </div>
              </Label>
            </div>
            {media.length > 0 && (
              <p className="text-sm text-gray-500">
                {media.length} file{media.length !== 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
            <div className="flex items-center space-x-2">
              <Switch
                id="emergency-toggle"
                checked={isEmergency}
                onCheckedChange={setIsEmergency}
                disabled={isSubmitting}
              />
              <Label htmlFor="emergency-toggle" className="flex items-center gap-1 cursor-pointer">
                <AlertTriangle className={`h-4 w-4 ${isEmergency ? "text-red-600" : "text-gray-500"}`} />
                <span className={isEmergency ? "text-red-600 font-medium" : "text-gray-600"}>Mark as Emergency</span>
              </Label>
            </div>
          </div>

          {isEmergency && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-sm text-red-800">
              <p className="font-medium">Important:</p>
              <p>
                Only mark posts as emergencies for genuine urgent situations. False alarms may affect your trust score
                and community safety.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" /> Creating Post...
                </div>
              ) : (
                "Post to Community"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
