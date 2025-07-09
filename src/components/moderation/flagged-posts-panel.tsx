"use client"

import React, { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, XCircle, AlertOctagon } from "lucide-react"
import ModeratorActions from "@/components/moderation/moderator-actions"
import PostCard from "@/components/post/post-card"
import { getFlaggedPosts, getPostsForModeration, type Post } from "@/lib/firebase/posts"
import LoadingSpinner from "@/components/utilities/loading-spinner"

// Helper function to transform Post from Firestore to PostCard format
function transformPost(post: Post) {
  if (!post.id) throw new Error("Post must have an id")
  
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    createdAt: post.createdAt.toISOString(),
    author: post.author,
    location: post.location,
    mediaUrls: post.mediaUrls,
    isEmergency: post.isEmergency,
    status: post.status,
    commentCount: post.commentCount
  }
}

export default function FlaggedPostsPanel() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"pending" | "verified" | "false_alarm">("pending")

  useEffect(() => {
    fetchPosts(activeTab)
  }, [activeTab])

  const fetchPosts = async (status: "pending" | "verified" | "false_alarm") => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch both flagged posts and emergency posts
      const [flaggedPosts, emergencyPosts] = await Promise.all([
        getFlaggedPosts(status),
        getPostsForModeration(status)
      ])

      // Combine and deduplicate posts
      const allPosts = [...flaggedPosts, ...emergencyPosts]
      const uniquePosts = Array.from(new Map(allPosts.map(post => [post.id, post])).values())
      
      // Sort by createdAt
      uniquePosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      
      setPosts(uniquePosts)
    } catch (error) {
      console.error("Error fetching posts:", error)
      setError("Failed to load posts. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handlePostStatusUpdate = () => {
    // Refresh the posts list after a status update
    fetchPosts(activeTab)
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Moderation Queue</h2>
        <p className="text-gray-600 text-sm sm:text-base">Review and verify emergency reports from the community</p>
      </div>

      <Tabs defaultValue="pending" onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <div className="px-3 sm:px-4 pt-3 sm:pt-4">
          <TabsList className="grid grid-cols-3 mb-4 w-full">
            <TabsTrigger value="pending" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Pending</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {activeTab === "pending" ? posts.length : 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="verified" className="text-xs sm:text-sm">
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span>Verified</span>
            </TabsTrigger>
            <TabsTrigger value="false_alarm" className="text-xs sm:text-sm">
              <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span>False Alarms</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="pending" className="p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[200px] gap-2">
              <LoadingSpinner />
              <p className="mt-2 text-gray-600">Loading posts..</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
              {error}
            </div>
          ) : posts.length > 0 ? (
            <>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-start gap-3 mb-4">
                <AlertOctagon className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-yellow-800">Attention Required</p>
                  <p className="text-xs sm:text-sm text-yellow-700">
                    These posts have been reported by the community or flagged as emergencies. Please verify their content carefully.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {posts.map((post) => {
                  // Skip posts without IDs
                  if (!post.id) return null;
                  
                  return (
                    <div key={post.id} className="space-y-2">
                      <PostCard post={transformPost(post)} />
                      <ModeratorActions postId={post.id} onStatusUpdate={handlePostStatusUpdate} />
                    </div>
                  );
                })}
              </div>
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
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[200px] gap-2">
              <LoadingSpinner />
              <p className="mt-2 text-gray-600">Loading posts...</p>
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => {
                if (!post.id) return null;
                return <PostCard key={post.id} post={transformPost(post)} />;
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No verified posts to display.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="false_alarm" className="p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[200px] gap-2">
              <LoadingSpinner />
              <p className="mt-2 text-gray-600">Loading posts...</p>
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => {
                if (!post.id) return null;
                return <PostCard key={post.id} post={transformPost(post)} />;
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No false alarms to display.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
