"use client"

import PostForm from "@/components/post/post-form"
import { useRouter } from "next/navigation"

export default function CreatePostPage() {
  const router = useRouter()

  const handlePostCreated = () => {
    try {
      router.push("/feed")
    } catch (error) {
      console.error("Navigation error:", error)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Create New Post</h1>
        <p className="text-gray-600 mt-1">Share what's happening in your community</p>
      </div>

      <PostForm onPostCreated={handlePostCreated} />
    </div>
  )
}
