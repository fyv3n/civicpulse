"use client"

import { useState } from "react"
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

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true)
      await deleteUserAccount()
      
      toast({
        title: "Account deleted",
        description: "Your account has been deleted successfully.",
      })
      
      router.push("/login")
    } catch (error: any) {
      console.error("Error deleting account:", error)
      
      // Get a user-friendly error message
      let errorMessage = "Failed to delete account. Please try again."
      
      if (error.message.includes("No user is currently signed in")) {
        errorMessage = "Please sign in to delete your account."
      } else if (error.message.includes("requires-recent-login") || error.message.includes("sign out and sign in again")) {
        errorMessage = "For security reasons, please sign out and sign in again before deleting your account."
      } else if (error.message.includes("permission") || error.message.includes("permissions")) {
        errorMessage = "You don't have permission to delete your account. Please contact support."
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
                <Input id="first-name" defaultValue="Juan" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input id="last-name" defaultValue="Dela Cruz" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" defaultValue="juan.delacruz@example.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input id="phone" type="tel" defaultValue="+63 912 345 6789" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="barangay">Barangay</Label>
              <Select defaultValue="barangay-123">
                <SelectTrigger>
                  <SelectValue placeholder="Select barangay" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="barangay-123">Barangay 123</SelectItem>
                  <SelectItem value="barangay-124">Barangay 124</SelectItem>
                  <SelectItem value="barangay-125">Barangay 125</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                defaultValue="Active community member interested in local safety and development initiatives."
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

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications" className="text-base">
                  Email Notifications
                </Label>
                <p className="text-sm text-gray-500">Receive notifications via email in addition to in-app alerts.</p>
              </div>
              <Switch id="email-notifications" />
            </div>
          </div>
        </div>

        <Separator />

        <div className="p-6">
          <h2 className="text-lg font-medium mb-4">Privacy Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="profile-visibility" className="text-base">
                  Profile Visibility
                </Label>
                <p className="text-sm text-gray-500">Make your profile visible to other community members.</p>
              </div>
              <Switch id="profile-visibility" defaultChecked />
            </div>

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
          <Button variant="outline">Cancel</Button>
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  )
}
