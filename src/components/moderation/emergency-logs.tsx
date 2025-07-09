"use client"

import { useState, useEffect } from "react"
import { getPosts, type Post } from "@/lib/firebase/posts"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EmergencyStatusBadge } from "@/components/moderation/status-badge"
import LoadingSpinner from "../utilities/loading-spinner"

export default function EmergencyLogs() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const fetchedPosts = await getPosts()
      // Filter for emergency posts only
      const emergencyPosts = fetchedPosts.filter(post => post.isEmergency)
      setPosts(emergencyPosts)
    } catch (error) {
      console.error("Error fetching emergency posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.location.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || post.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-2">
        <LoadingSpinner />
        <p className="mt-2 text-gray-600">Loading emergency logs...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by title, content, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="false_alarm">False Alarm</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Emergency Report</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Risk Score</TableHead>
              <TableHead>Reported</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  <div className="font-medium">{post.title}</div>
                  <div className="text-sm text-gray-500">{post.content.substring(0, 100)}...</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {post.location}
                  </div>
                </TableCell>
                <TableCell>
                  <EmergencyStatusBadge status={post.status} />
                </TableCell>
                <TableCell>
                  <Badge variant={post.aiAnalysis?.riskScore && post.aiAnalysis.riskScore > 0.5 ? "destructive" : "default"}>
                    {post.aiAnalysis?.riskScore?.toFixed(2) || "N/A"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 