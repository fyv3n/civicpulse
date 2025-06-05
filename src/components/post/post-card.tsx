"use client"

import { useState, useEffect } from "react"
import { MessageCircle, Flag, MoreVertical, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import UserTrustBadge from "@/components/user/user-trust-badge"
import LocationTag from "@/components/user/location-tag"
import MediaPreview from "@/components/post/media-preview"
import PostStatusBadge from "@/components/post/post-status-badge"
import CommentsDialog from "@/components/post/comments-dialog"
import { reportPost } from "@/lib/firebase/posts"
import { useAuth } from "@/@auth"
import { useToast } from "@/hooks/use-toast"
import { doc, onSnapshot, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { DEFAULT_AVATAR } from "@/lib/constants"

const formatDate = (timestamp: Timestamp | string) => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toLocaleString()
  }
  return new Date(timestamp).toLocaleString()
}

interface PostCardProps {
  post: {
    id: string
    title: string
    content: string
    createdAt: Timestamp | string
    author: {
      name: string
      avatar?: string
      trustScore: number
      isVerified: boolean
    }
    location: string
    mediaUrls?: string[]
    isEmergency: boolean
    status: "pending" | "verified" | "resolved" | "false alarm" | "auto flagged"
    commentCount: number
    aiAnalysis?: {
      categories: string[]
      riskScore: number
      explanation: string
    } | null
  }
}

export default function PostCard({ post: initialPost }: PostCardProps) {
  const [post, setPost] = useState(initialPost)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    // Subscribe to real-time updates for the post
    const unsubscribe = onSnapshot(doc(db, "posts", post.id), (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        setPost(prev => ({
          ...prev,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt
        }))
      }
    })

    return () => unsubscribe()
  }, [post.id])

  const handleReport = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to report posts.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      await reportPost(post.id, reportReason, user.uid)
      setIsReportDialogOpen(false)
      toast({
        title: "Post Reported",
        description: "Thank you for reporting this post. Our moderators will review it shortly.",
      })
    } catch (error) {
      console.error("Error reporting post:", error)
      toast({
        title: "Error",
        description: "Failed to report post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setReportReason("")
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0 mb-3">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={post.author.avatar || DEFAULT_AVATAR} alt={post.author.name} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{post.author.name}</span>
                <UserTrustBadge score={post.author.trustScore} isVerified={post.author.isVerified} />
              </div>
              <div className="flex items-center text-sm text-gray-500 flex-wrap">
                <span>{formatDate(post.createdAt)}</span>
                <span className="mx-1">•</span>
                <LocationTag location={post.location} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap mt-2 sm:mt-0">
            <PostStatusBadge 
              status={post.status} 
              aiVerified={post.status === "verified" && post.aiAnalysis?.categories.includes("verified")}
            />
            {post.isEmergency && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Emergency
              </Badge>
            )}
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-2">{post.title}</h3>

        <div className="text-gray-700">
          {isExpanded ? (
            <p>{post.content}</p>
          ) : (
            <>
              <p>
                {post.content.slice(0, 150)}
                {post.content.length > 150 ? "..." : ""}
              </p>
              {post.content.length > 150 && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="text-red-600 text-sm font-medium mt-1 hover:underline"
                >
                  Read more
                </button>
              )}
            </>
          )}
        </div>

        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div className="mt-3">
            <MediaPreview mediaUrls={post.mediaUrls} />
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-600"
            onClick={() => setIsCommentsOpen(true)}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            {post.commentCount} Comments
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-gray-600">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setIsReportDialogOpen(true)}>
                <Flag className="h-4 w-4 mr-2" />
                Report Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Report Post</DialogTitle>
                <DialogDescription>
                  Please provide a reason for reporting this post. This will help our moderators review it appropriately.
                </DialogDescription>
              </DialogHeader>
              <Textarea
                placeholder="Reason for reporting..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="min-h-[100px]"
              />
              <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setIsReportDialogOpen(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReport}
                  disabled={!reportReason.trim() || isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? "Submitting..." : "Submit Report"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <CommentsDialog
            isOpen={isCommentsOpen}
            onOpenChange={setIsCommentsOpen}
            post={post}
          />
        </div>
      </div>
    </div>
  )
}
