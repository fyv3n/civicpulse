"use client"

import { useState, useEffect } from "react"
import PostCard from "@/components/post/post-card"
import { Button } from "@/components/ui/button"
import { Plus, Filter} from "lucide-react"
import { getPosts, type Post } from "@/lib/firebase/posts"
import { auth } from "@/lib/firebase/config"
import { onAuthStateChanged } from "firebase/auth"
import { useRouter } from "next/navigation"
import ScrollToTop from "@/components/ui/scroll-to-top"
import { Timestamp } from "firebase/firestore"
import Link from "next/link"

export default function FeedPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingTimeout, setLoadingTimeout] = useState(false)

  // Check auth state and load posts
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login")
        return
      }

      try {
        // Set a timeout to show caught up message after 3 seconds
        timeoutId = setTimeout(() => {
          setLoadingTimeout(true)
        }, 3000)

        await loadPosts()
      } catch (err) {
        console.error("Load posts error:", err)
        setError("Failed to load posts")
      } finally {
        setLoading(false)
        clearTimeout(timeoutId)
      }
    })

    return () => {
      unsubscribe()
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [router])

  async function loadPosts() {
    try {
      setLoading(true)
      setLoadingTimeout(false)
      setError(null)

      const fetchedPosts = await getPosts()
      setPosts(fetchedPosts)
    } catch (err) {
      console.error("Load posts error:", err)
      setError("Failed to load posts")
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Community Feed</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs sm:text-sm">
            <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Filter
          </Button>
          <Button size="sm" asChild className="text-xs sm:text-sm">
            <Link href="/create">
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              New Post
            </Link>
          </Button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

      <div className="space-y-4 sm:space-y-6">
        {loading && !loadingTimeout ? (
          <div className="text-center py-8">
            <p>Loading posts...</p>
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={{
                ...post,
                id: post.id || "",
                createdAt: Timestamp.fromDate(post.createdAt)
              }}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">You&apos;ve caught up! 🎉</p>
            <p className="text-gray-400 mt-2">Be the first to share something with the community.</p>
          </div>
        )}
      </div>
      <ScrollToTop />
    </div>
  )
}
