"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, XCircle, AlertTriangle, MessageSquare, Phone } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { updatePostStatus } from "@/lib/firebase/posts"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/@auth"

interface ModeratorActionsProps {
  postId: string
  onStatusUpdate: (postId: string) => void
}

export default function ModeratorActions({ postId, onStatusUpdate }: ModeratorActionsProps) {
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false)
  const [isEscalateDialogOpen, setIsEscalateDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [verifyNote, setVerifyNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const handleVerify = async () => {
    try {
      if (!user) {
        throw new Error("User not authenticated")
      }

      setIsSubmitting(true)
      await updatePostStatus(postId, "verified", verifyNote || undefined, {
        name: user.displayName || "Moderator",
        role: "moderator"
      })
      toast({
        title: "Post Verified",
        description: "The post has been marked as verified.",
      })
      setIsVerifyDialogOpen(false)
      setVerifyNote("")
      onStatusUpdate(postId)
    } catch (error) {
      console.error("Error verifying post:", error)
      toast({
        title: "Error",
        description: "Failed to verify post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    try {
      if (!user) {
        throw new Error("User not authenticated")
      }

      if (!rejectReason.trim()) {
        toast({
          title: "Error",
          description: "Please provide a reason for marking this as a false alarm.",
          variant: "destructive",
        })
        return
      }

      setIsSubmitting(true)
      await updatePostStatus(postId, "false_alarm", rejectReason, {
        name: user.displayName || "Moderator",
        role: "moderator"
      })
      toast({
        title: "Post Marked as False Alarm",
        description: "The post has been marked as a false alarm.",
      })
      setIsRejectDialogOpen(false)
      setRejectReason("")
      onStatusUpdate(postId)
    } catch (error) {
      console.error("Error marking post as false alarm:", error)
      toast({
        title: "Error",
        description: "Failed to mark post as false alarm. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEscalate = async () => {
    try {
      if (!user) {
        throw new Error("User not authenticated")
      }

      setIsSubmitting(true)
      await updatePostStatus(postId, "verified", "Escalated to officials", {
        name: user.displayName || "Moderator",
        role: "moderator"
      })
      toast({
        title: "Post Escalated",
        description: "The post has been escalated to officials.",
      })
      setIsEscalateDialogOpen(false)
      onStatusUpdate(postId)
    } catch (error) {
      console.error("Error escalating post:", error)
      toast({
        title: "Error",
        description: "Failed to escalate post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
      <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800 flex-1 sm:flex-initial"
            disabled={isSubmitting}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Verify Emergency
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Emergency</DialogTitle>
            <DialogDescription>
              Please provide any additional notes about this emergency verification. This information will be visible to other moderators.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Add verification notes (optional)..."
            value={verifyNote}
            onChange={(e) => setVerifyNote(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsVerifyDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleVerify}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800 flex-1 sm:flex-initial"
            disabled={isSubmitting}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Mark as False Alarm
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as False Alarm</DialogTitle>
            <DialogDescription>
              Please provide a reason why this post is being marked as a false alarm. This information will be shared
              with the post author.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for marking as false alarm..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || isSubmitting}
              className="w-full sm:w-auto"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEscalateDialogOpen} onOpenChange={setIsEscalateDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="flex-1 sm:flex-initial"
            disabled={isSubmitting}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Escalate to Officials
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escalate to Emergency Response</DialogTitle>
            <DialogDescription>
              Please contact the appropriate emergency response team using the following hotlines:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">Emergency Hotlines</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-red-600" />
                  <span>National Emergency Hotline: <strong>911</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-red-600" />
                  <span>Philippine Red Cross: <strong>143</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-red-600" />
                  <span>Bureau of Fire Protection: <strong>160</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-red-600" />
                  <span>Philippine National Police: <strong>117</strong></span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
              <p className="font-medium">Important:</p>
              <p>Please ensure you have verified the emergency before escalating.</p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsEscalateDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleEscalate}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Confirm Escalation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
