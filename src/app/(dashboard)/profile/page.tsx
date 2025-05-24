import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Pencil, MapPin, Shield, Calendar } from "lucide-react"
import PostCard from "@/components/post/post-card"

// Mock user data
const user = {
  name: "Juan Dela Cruz",
  avatar: "/placeholder.svg?height=100&width=100",
  trustScore: 85,
  isVerified: true,
  location: "Barangay 123, Manila",
  joinDate: "May 2023",
  bio: "Active community member interested in local safety and development initiatives.",
}

// Mock posts data
const userPosts = [
  {
    id: "1",
    title: "Flooding on Main Street",
    content:
      "Water level is rising quickly near the market area. Several stores already affected. Need immediate assistance.",
    createdAt: "2023-05-15T08:30:00Z",
    author: {
      name: user.name,
      avatar: user.avatar,
      trustScore: user.trustScore,
      isVerified: user.isVerified,
    },
    location: "Main Street, Barangay 123",
    mediaUrls: ["/placeholder.svg?height=300&width=400"],
    isEmergency: true,
    status: "verified" as const,
    commentCount: 5,
  },
  {
    id: "2",
    title: "Community cleanup this weekend",
    content:
      "Join us for a community cleanup this Saturday at 8 AM. We will be focusing on the creek area that has been collecting debris. Bring gloves and wear appropriate clothing. Refreshments will be provided!",
    createdAt: "2023-05-14T14:20:00Z",
    author: {
      name: user.name,
      avatar: user.avatar,
      trustScore: user.trustScore,
      isVerified: user.isVerified,
    },
    location: "Creek Area, Barangay 123",
    mediaUrls: [],
    isEmergency: false,
    status: "verified" as const,
    commentCount: 8,
  },
]

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-24 w-24 border-4 border-white shadow-md">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                {user.isVerified && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 self-center">Verified User</Badge>
                )}
              </div>

              <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {user.location}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Joined {user.joinDate}
                </div>
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-1" />
                  Trust Score: {user.trustScore}/100
                </div>
              </div>

              <p className="text-gray-700 mb-4">{user.bio}</p>

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
          {userPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
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
