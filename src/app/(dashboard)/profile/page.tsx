"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Pencil, MapPin, Shield, Calendar, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { useToast } from "@/hooks/use-toast"
import { sendEmailVerification } from "firebase/auth"


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
  const [loading, setLoading] = useState(true)
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
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
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

              <p className="text-gray-700 mb-4">{userData.bio}</p>

              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="posts">
        <TabsList className="mb-6">
          <TabsTrigger value="posts">My Posts</TabsTrigger>
          <TabsTrigger value="comments">My Comments</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No posts yet.</p>
          </div>
        </TabsContent>

        <TabsContent value="comments">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No comments yet.</p>
          </div>
        </TabsContent>

        <TabsContent value="saved">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No saved posts yet.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
