"use client"

import { useState } from "react"
import { MessageCircle, Flag, Share2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import UserTrustBadge from "@/components/user/user-trust-badge"
import LocationTag from "@/components/user/location-tag"
import MediaPreview from "@/components/post/media-preview"
import PostStatusBadge from "@/components/post/post-status-badge"

interface PostCardProps {
  post: {
    id: string
    title: string
    content: string
    createdAt: string
    author: {
      name: string
      avatar?: string
      trustScore: number
      isVerified: boolean
    }
    location: string
    mediaUrls?: string[]
    isEmergency: boolean
    status: "pending" | "verified" | "resolved" | "false_alarm"
    commentCount: number
  }
}

export default function PostCard({ post }: PostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0 mb-3">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{post.author.name}</span>
                <UserTrustBadge score={post.author.trustScore} isVerified={post.author.isVerified} />
              </div>
              <div className="flex items-center text-sm text-gray-500 flex-wrap">
                <span>{new Date(post.createdAt).toLocaleString()}</span>
                <span className="mx-1">•</span>
                <LocationTag location={post.location} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap mt-2 sm:mt-0">
            <PostStatusBadge status={post.status} />
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

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4 pt-3 border-t border-gray-100">
          <Button variant="ghost" size="sm" className="text-gray-600 justify-start">
            <MessageCircle className="h-4 w-4 mr-1" />
            {post.commentCount} Comments
          </Button>

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="ghost" size="sm" className="text-gray-600">
              <Flag className="h-4 w-4 mr-1" />
              Report
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600">
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
