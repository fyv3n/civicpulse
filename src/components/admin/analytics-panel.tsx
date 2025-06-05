"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, AlertTriangle, Shield, MessageSquare } from "lucide-react"
import { collection, getDocs, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { getPosts, type Post } from "@/lib/firebase/posts"
import { type UserProfile } from "@/lib/firebase/users"

interface AnalyticsData {
  totalUsers: number
  totalPosts: number
  emergencyPosts: number
  verifiedPosts: number
  falseAlarms: number
  activeModerators: number
  postsByStatus: {
    pending: number
    verified: number
    resolved: number
    false_alarm: number
  }
  postsByType: {
    emergency: number
    general: number
  }
  recentActivity: {
    newUsers: number
    newPosts: number
    resolvedEmergencies: number
  }
}

export default function AnalyticsPanel() {
  const [data, setData] = useState<AnalyticsData>({
    totalUsers: 0,
    totalPosts: 0,
    emergencyPosts: 0,
    verifiedPosts: 0,
    falseAlarms: 0,
    activeModerators: 0,
    postsByStatus: {
      pending: 0,
      verified: 0,
      resolved: 0,
      false_alarm: 0
    },
    postsByType: {
      emergency: 0,
      general: 0
    },
    recentActivity: {
      newUsers: 0,
      newPosts: 0,
      resolvedEmergencies: 0
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      
      // Fetch users
      const usersSnapshot = await getDocs(collection(db, "users"))
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserProfile[]
      const moderators = users.filter((user: UserProfile) => user.role === "moderator")
      
      // Fetch posts
      const posts = await getPosts()
      const emergencyPosts = posts.filter((post: Post) => post.isEmergency)
      const verifiedPosts = posts.filter((post: Post) => post.status === "verified")
      const falseAlarms = posts.filter((post: Post) => post.status === "false alarm")
      
      // Calculate posts by status
      const postsByStatus = {
        pending: posts.filter((post: Post) => post.status === "pending").length,
        verified: posts.filter((post: Post) => post.status === "verified").length,
        resolved: posts.filter((post: Post) => post.status === "resolved").length,
        false_alarm: posts.filter((post: Post) => post.status === "false alarm").length
      }
      
      // Calculate posts by type
      const postsByType = {
        emergency: posts.filter((post: Post) => post.isEmergency).length,
        general: posts.filter((post: Post) => !post.isEmergency).length
      }
      
      // Calculate recent activity (last 24 hours)
      const now = new Date()
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      
      const recentActivity = {
        newUsers: users.filter((user: UserProfile) => {
          if (!user.createdAt) return false
          if (user.createdAt instanceof Timestamp) {
            return user.createdAt.toDate() > last24Hours
          }
          if (user.createdAt instanceof Date) {
            return user.createdAt > last24Hours
          }
          return false
        }).length,
        newPosts: posts.filter((post: Post) => post.createdAt > last24Hours).length,
        resolvedEmergencies: posts.filter((post: Post) => 
          post.isEmergency && 
          post.status === "resolved" && 
          post.createdAt > last24Hours
        ).length
      }

      setData({
        totalUsers: users.length,
        totalPosts: posts.length,
        emergencyPosts: emergencyPosts.length,
        verifiedPosts: verifiedPosts.length,
        falseAlarms: falseAlarms.length,
        activeModerators: moderators.length,
        postsByStatus,
        postsByType,
        recentActivity
      })
    } catch (error) {
      console.error("Error fetching analytics data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p>Loading analytics...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{data.recentActivity.newUsers} in last 24h
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emergency Posts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.emergencyPosts}</div>
            <p className="text-xs text-muted-foreground">
              {data.verifiedPosts} verified
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Moderators</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeModerators}</div>
            <p className="text-xs text-muted-foreground">
              {data.postsByStatus.pending} posts pending review
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              +{data.recentActivity.newPosts} in last 24h
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Posts by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending</span>
                <span className="font-medium">{data.postsByStatus.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Verified</span>
                <span className="font-medium">{data.postsByStatus.verified}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Resolved</span>
                <span className="font-medium">{data.postsByStatus.resolved}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">False Alarms</span>
                <span className="font-medium">{data.postsByStatus.false_alarm}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Posts by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Emergency</span>
                <span className="font-medium">{data.postsByType.emergency}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">General</span>
                <span className="font-medium">{data.postsByType.general}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-sm font-medium">New Users</div>
              <div className="text-2xl font-bold">{data.recentActivity.newUsers}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">New Posts</div>
              <div className="text-2xl font-bold">{data.recentActivity.newPosts}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Resolved Emergencies</div>
              <div className="text-2xl font-bold">{data.recentActivity.resolvedEmergencies}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 