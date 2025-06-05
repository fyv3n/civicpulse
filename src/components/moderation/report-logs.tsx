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
import { Flag } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ReportStatusBadge } from "@/components/moderation/status-badge"

export default function ReportLogs() {
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
      // Filter for reported posts only
      const reportedPosts = fetchedPosts.filter(post => (post.reportCount || 0) > 0)
      setPosts(reportedPosts)
    } catch (error) {
      console.error("Error fetching reported posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || post.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return <div className="text-center py-8">Loading report logs...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search reported posts..."
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
            <SelectItem value="pending">Pending Review</SelectItem>
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
              <TableHead>Reported Post</TableHead>
              <TableHead>Report Count</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Risk Score</TableHead>
              <TableHead>Last Updated</TableHead>
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
                  <Badge className="bg-red-50 text-red-700 border-red-200 px-2">
                    <Flag className="h-4 w-4 mr-1" />
                    <span className="font-medium">{post.reportCount || 0}</span>
                  </Badge>
                </TableCell>
                <TableCell>
                  <ReportStatusBadge status={post.status} />
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