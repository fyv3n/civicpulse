"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { deleteUserAccount } from "@/lib/firebase/users"
import LoadingSpinner from "@/components/utilities/loading-spinner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FirebaseError } from "firebase/app"
import { useAuth } from "@/@auth"
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import type { UserProfile } from "@/lib/firebase/users"

export default function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    barangay: "",
    bio: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        router.push("/login")
        return
      }
      
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          const data = userDoc.data() as UserProfile
          setUserData(data)
          setFormData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            barangay: data.barangay || "",
            bio: data.bio || "",
          })
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load user data"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user, router, toast])

  const handleSaveChanges = async () => {
    if (!user || !userData) return

    try {
      setIsSaving(true)
      await updateDoc(doc(db, "users", user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: `${formData.firstName} ${formData.lastName}`,
        barangay: formData.barangay,
        bio: formData.bio,
        updatedAt: serverTimestamp()
      })

      toast({
        title: "Success",
        description: "Your settings have been saved."
      })
    } catch (error) {
      console.error("Error saving changes:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save changes"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true)
      await deleteUserAccount()
      
      toast({
        title: "Account deleted",
        description: "Your account has been deleted successfully.",
      })
      
      router.push("/login")
    } catch (error: unknown) {
      console.error("Error deleting account:", error)
      
      // Get a user-friendly error message
      let errorMessage = "Failed to delete account. Please try again."
      
      if (error instanceof FirebaseError || error instanceof Error) {
        if (error.message.includes("No user is currently signed in")) {
          errorMessage = "Please sign in to delete your account."
        } else if (error.message.includes("requires-recent-login") || error.message.includes("sign out and sign in again")) {
          errorMessage = "For security reasons, please sign out and sign in again before deleting your account."
        } else if (error.message.includes("permission") || error.message.includes("permissions")) {
          errorMessage = "You don't have permission to delete your account. Please contact support."
        }
      }
      
      toast({
        title: "Account Deletion Failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-medium mb-4">Profile Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">First name</Label>
                <Input 
                  id="first-name" 
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input 
                  id="last-name" 
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input 
                id="email" 
                type="email" 
                value={formData.email}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="barangay">Barangay</Label>
              <Select 
                value={formData.barangay}
                onValueChange={(value) => setFormData(prev => ({ ...prev, barangay: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select barangay" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="barangay-123">West Bajac-Bajac</SelectItem>
                  <SelectItem value="barangay-124">Barangay 124</SelectItem>
                  <SelectItem value="barangay-125">Barangay 125</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
              />
              <p className="text-sm text-gray-500">Brief description for your profile.</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="p-6">
          <h2 className="text-lg font-medium mb-4">Notification Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emergency-alerts" className="text-base">
                  Emergency Alerts
                </Label>
                <p className="text-sm text-gray-500">
                  Receive notifications for emergency situations in your barangay.
                </p>
              </div>
              <Switch id="emergency-alerts" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="comment-notifications" className="text-base">
                  Comment Notifications
                </Label>
                <p className="text-sm text-gray-500">Receive notifications when someone comments on your posts.</p>
              </div>
              <Switch id="comment-notifications" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="event-reminders" className="text-base">
                  Event Reminders
                </Label>
                <p className="text-sm text-gray-500">Receive reminders for upcoming community events.</p>
              </div>
              <Switch id="event-reminders" defaultChecked />
            </div>
          </div>
        </div>

        <Separator />

        <div className="p-6">
          <h2 className="text-lg font-medium mb-4">Privacy Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="location-sharing" className="text-base">
                  Location Sharing
                </Label>
                <p className="text-sm text-gray-500">Share your precise location when reporting emergencies.</p>
              </div>
              <Switch id="location-sharing" defaultChecked />
            </div>
          </div>
        </div>

        <Separator />

        <div className="p-6">
          <h2 className="text-lg font-medium mb-4 text-red-600">Danger Zone</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="delete-account" className="text-base text-red-600">
                  Delete Account
                </Label>
                <p className="text-sm text-gray-500">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogTrigger asChild>
                  <Button 
                    variant="destructive"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <div className="flex items-center justify-center gap-2">
                        <LoadingSpinner size="sm" />
                        <span>Deleting...</span>
                      </div>
                    ) : (
                      "Delete Account"
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove all associated data.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isDeleting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                    >
                      Delete Account
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <Separator />

        <div className="p-6 flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={() => setFormData({
              firstName: userData?.firstName || "",
              lastName: userData?.lastName || "",
              email: userData?.email || "",
              barangay: userData?.barangay || "",
              bio: userData?.bio || "",
            })}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveChanges}
            disabled={isSaving}
          >
            {isSaving ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                <span>Saving...</span>
              </div>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
