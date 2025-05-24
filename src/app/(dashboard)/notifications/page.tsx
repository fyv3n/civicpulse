import { Bell, AlertTriangle, MessageCircle, CheckCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Mock notifications data
const notifications = [
  {
    id: "1",
    type: "emergency",
    title: "Emergency Alert: Flooding",
    message: "Flooding reported on Main Street. Please avoid the area.",
    time: "10 minutes ago",
    read: false,
    user: {
      name: "Barangay Official",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  },
  {
    id: "2",
    type: "comment",
    title: "New Comment",
    message: "Maria Santos commented on your post about the community cleanup.",
    time: "1 hour ago",
    read: false,
    user: {
      name: "Maria Santos",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  },
  {
    id: "3",
    type: "verification",
    title: "Post Verified",
    message: "Your emergency report about the fire near the school has been verified by moderators.",
    time: "3 hours ago",
    read: true,
    user: {
      name: "System",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  },
  {
    id: "4",
    type: "emergency",
    title: "Emergency Alert: Power Outage",
    message: "Power outage reported in East District. Authorities have been notified.",
    time: "5 hours ago",
    read: true,
    user: {
      name: "Barangay Official",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  },
]

export default function NotificationsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button variant="outline" size="sm">
          Mark all as read
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        {notifications.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification, index) => (
              <div key={notification.id} className={`p-4 flex gap-3 ${notification.read ? "bg-white" : "bg-blue-50"}`}>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={notification.user.avatar || "/placeholder.svg"} alt={notification.user.name} />
                  <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{notification.title}</span>
                      {!notification.read && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          New
                        </Badge>
                      )}
                      {notification.type === "emergency" && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Emergency
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{notification.time}</span>
                  </div>
                  <p className="text-gray-700">{notification.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                      {notification.type === "comment" ? (
                        <>
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Reply
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Mark as read
                        </>
                      )}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                      View details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Bell className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
            <p className="text-gray-500 mt-1">You're all caught up! Check back later for updates.</p>
          </div>
        )}
      </div>
    </div>
  )
}
