"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Pencil, MapPin, Shield, Calendar, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/@auth"
import { doc, getDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { useToast } from "@/hooks/use-toast"
import { sendEmailVerification } from "firebase/auth"
import { getPostsByUserId, type Post } from "@/lib/firebase/posts"
import PostCard from "@/components/post/post-card"
import LoadingSpinner from "@/components/utilities/loading-spinner"
import Link from "next/link"

interface UserData {
  displayName: string
  avatar?: string
  trustScore: number
  isVerified: boolean
  barangay: string
  createdAt: Timestamp
  bio: string
  email: string
}

function formatDate(timestamp: Timestamp) {
  const date = timestamp.toDate()
  return date.toLocaleDateString('en-US', { 
    month: 'long',
    year: 'numeric'
  })
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [sendingVerification, setSendingVerification] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return
      
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile data"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user, toast])

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!user) {
        console.log("No user found, skipping post fetch")
        return
      }
      
      try {
        setLoadingPosts(true)
        console.log("Fetching posts for user:", user.uid)
        const userPosts = await getPostsByUserId(user.uid)
        console.log("Fetched posts:", userPosts)
        setPosts(userPosts)
      } catch (error) {
        console.error("Error fetching user posts:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load posts"
        })
      } finally {
        setLoadingPosts(false)
      }
    }

    fetchUserPosts()
  }, [user, toast])

  const handleVerify = async () => {
    if (!user) return
    setSendingVerification(true)

    try {
      await sendEmailVerification(user)
      toast({
        title: "Verification Email Sent",
        description: "Please check your email to verify your account."
      })
    } catch (error) {
      console.error("Error sending verification email:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send verification email"
      })
    } finally {
      setSendingVerification(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!userData) {
    return <div className="text-center p-8">No profile data found</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-24 w-24 border-4 border-white shadow-md">
              <AvatarImage src={userData.avatar || "/placeholder.svg"} alt={userData.displayName} />
              <AvatarFallback>{userData.displayName?.charAt(0) || "?"}</AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold">{userData.displayName}</h1>
                {user?.emailVerified ? (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 self-center">Verified User</Badge>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleVerify}
                    disabled={sendingVerification}
                    className="self-center"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {sendingVerification ? "Sending..." : "Verify Email"}
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {userData.barangay}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Joined {userData.createdAt ? formatDate(userData.createdAt) : 'N/A'}
                </div>
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-1" />
                  Trust Score: {userData.trustScore}/100
                </div>
              </div>

              <p className="text-gray-700 mb-4">{userData.bio || "No bio yet"}</p>
                
              <Link href="/settings" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                <Pencil className="h-4 w-4 mr-2" />
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="posts">
        <TabsList className="mb-6">
          <TabsTrigger value="posts">My Posts ({posts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6">
          {loadingPosts ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={{
                  ...post,
                  id: post.id || "",
                  createdAt: post.createdAt.toISOString(),
                  status: post.status === "false alarm" ? "false alarm" : 
                         post.status === "auto flagged" ? "pending" : 
                         post.status
                }}
              />
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
              <p className="text-gray-500">No posts yet.</p>
              <Link href="/create" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 mt-4">
                Create your first post
              </Link>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
