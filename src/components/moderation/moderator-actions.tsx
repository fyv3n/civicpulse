"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, XCircle, AlertTriangle, MessageSquare } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ModeratorActionsProps {
  postId: string
}

export default function ModeratorActions({ postId }: ModeratorActionsProps) {
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  const handleVerify = () => {
    console.log("Verifying post:", postId)
    // Implement verification logic
  }

  const handleReject = () => {
    console.log("Rejecting post:", postId, "Reason:", rejectReason)
    setIsRejectDialogOpen(false)
    // Implement rejection logic
  }

  const handleEscalate = () => {
    console.log("Escalating post:", postId)
    // Implement escalation logic
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
      <Button
        variant="outline"
        className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800 flex-1 sm:flex-initial"
        onClick={handleVerify}
      >
        <CheckCircle className="h-4 w-4 mr-2" />
        Verify Emergency
      </Button>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800 flex-1 sm:flex-initial"
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
              disabled={!rejectReason.trim()}
              className="w-full sm:w-auto"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button variant="outline" onClick={handleEscalate} className="flex-1 sm:flex-initial">
        <AlertTriangle className="h-4 w-4 mr-2" />
        Escalate to Officials
      </Button>

      <Button variant="outline" className="flex-1 sm:flex-initial">
        <MessageSquare className="h-4 w-4 mr-2" />
        Add Comment
      </Button>
    </div>
  )
}
