"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/@auth"
import { useToast } from "@/hooks/use-toast"
import { addComment, getComments, type Comment } from "@/lib/firebase/comments"
import { Timestamp } from "firebase/firestore"
import { DEFAULT_AVATAR } from "@/lib/constants"

interface CommentsDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  post: {
    id: string
    title: string
    content: string
    author: {
      name: string
      avatar?: string
    }
    createdAt: Timestamp | string
  }
}

export default function CommentsDialog({ isOpen, onOpenChange, post }: CommentsDialogProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      loadComments()
    }
  }, [isOpen, post.id])

  const loadComments = async () => {
    try {
      setIsLoading(true)
      const fetchedComments = await getComments(post.id)
      setComments(fetchedComments)
    } catch (error) {
      console.error("Error loading comments:", error)
      toast({
        title: "Error",
        description: "Failed to load comments. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to comment on posts.",
        variant: "destructive",
      })
      return
    }

    if (!newComment.trim()) return

    try {
      setIsSubmitting(true)
      await addComment(
        post.id,
        newComment,
        user.uid,
        {
          name: user.displayName || "Anonymous",
          avatar: user.photoURL || undefined
        }
      )
      
      setNewComment("")
      toast({
        title: "Comment Added",
        description: "Your comment has been posted successfully.",
      })
      
      await loadComments()
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (timestamp: Timestamp | string) => {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toLocaleString()
    }
    return new Date(timestamp).toLocaleString()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Discussion</DialogTitle>
        </DialogHeader>
        
        {/* Original Post */}
        <div className="border-b border-gray-200 pb-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar>
              <AvatarImage src={post.author.avatar || DEFAULT_AVATAR} alt={post.author.name} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{post.author.name}</div>
              <div className="text-sm text-gray-500">
                {formatDate(post.createdAt)}
              </div>
            </div>
          </div>
          <h3 className="font-semibold mb-2">{post.title}</h3>
          <p className="text-gray-700">{post.content}</p>
        </div>

        {/* Comment Input */}
        <div className="space-y-4">
          <div className="flex gap-3">
            <Avatar>
              <AvatarImage 
                src={user?.photoURL || DEFAULT_AVATAR}
                alt={user?.displayName || "User"} 
              />
              <AvatarFallback>
                {user?.displayName?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                >
                  {isSubmitting ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4 mt-6">
            {isLoading ? (
              <div className="text-center py-6">
                <p className="text-gray-500">Loading comments...</p>
              </div>
            ) : comments.length === 0 ? (
              <p className="text-center text-gray-500 py-6">
                No comments yet. Be the first to share your thoughts!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar>
                    <AvatarImage 
                      src={comment.author.avatar || DEFAULT_AVATAR}
                      alt={comment.author.name} 
                    />
                    <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{comment.author.name}</span>
                      <span className="text-sm text-gray-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-1">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 