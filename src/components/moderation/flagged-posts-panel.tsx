"use client"

import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, XCircle, AlertOctagon } from "lucide-react"
import ModeratorActions from "@/components/moderation/moderator-actions"
import PostCard from "@/components/post/post-card"

interface Post {
  id: string
  title: string
  content: string
  createdAt: string
  author: {
    name: string
    avatar: string
    trustScore: number
    isVerified: boolean
  }
  location: string
  mediaUrls: string[]
  isEmergency: boolean
  status: "pending" | "verified" | "resolved" | "false_alarm"
  commentCount: number
}

// Mock data
const mockPosts: Post[] = [
  {
    id: "1",
    title: "Flooding on Main Street",
    content:
      "Water level is rising quickly near the market area. Several stores already affected. Need immediate assistance.",
    createdAt: "2023-05-15T08:30:00Z",
    author: {
      name: "Juan Dela Cruz",
      avatar: "/placeholder.svg?height=40&width=40",
      trustScore: 85,
      isVerified: true,
    },
    location: "Main Street, Barangay 123",
    mediaUrls: ["/placeholder.svg?height=300&width=400"],
    isEmergency: true,
    status: "pending",
    commentCount: 5,
  },
  {
    id: "2",
    title: "Fire spotted near school",
    content:
      "Smoke visible from the abandoned building next to elementary school. Fire might spread if not contained quickly.",
    createdAt: "2023-05-15T09:15:00Z",
    author: {
      name: "Maria Santos",
      avatar: "/placeholder.svg?height=40&width=40",
      trustScore: 72,
      isVerified: false,
    },
    location: "School Zone, Barangay 123",
    mediaUrls: ["/placeholder.svg?height=300&width=400", "/placeholder.svg?height=300&width=400"],
    isEmergency: true,
    status: "pending",
    commentCount: 12,
  },
]

export default function FlaggedPostsPanel() {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Moderation Queue</h2>
        <p className="text-gray-600 text-sm sm:text-base">Review and verify emergency reports from the community</p>
      </div>

      <Tabs defaultValue="pending">
        <div className="px-3 sm:px-4 pt-3 sm:pt-4">
          <TabsList className="grid grid-cols-3 mb-4 w-full">
            <TabsTrigger value="pending" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Pending</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {mockPosts.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="verified" className="text-xs sm:text-sm">
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span>Verified</span>
            </TabsTrigger>
            <TabsTrigger value="false_alarms" className="text-xs sm:text-sm">
              <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span>False Alarms</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="pending" className="p-3 sm:p-4 space-y-4">
          {mockPosts.length > 0 ? (
            <>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-start gap-3">
                <AlertOctagon className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-yellow-800">Attention Required</p>
                  <p className="text-xs sm:text-sm text-yellow-700">
                    These posts have been flagged as potential emergencies and require verification. Please review
                    carefully before taking action.
                  </p>
                </div>
              </div>

              {mockPosts.map((post) => {
                return (
                  <div key={post.id} className="space-y-2">
                    <PostCard post={post} />
                    <ModeratorActions postId={post.id} />
                  </div>
                )
              })}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
              <p className="text-gray-600 mt-1">There are no pending posts to review.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="verified" className="p-4">
          <div className="text-center py-8">
            <p className="text-gray-600">No verified posts to display.</p>
          </div>
        </TabsContent>

        <TabsContent value="false_alarms" className="p-4">
          <div className="text-center py-8">
            <p className="text-gray-600">No false alarms to display.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
