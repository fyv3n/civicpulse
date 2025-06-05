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
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import LoadingSpinner from "../utilities/loading-spinner"
import { AIAnalysisRiskScoreBadge, AIAnalysisCategoryBadge } from "./status-badge"

export default function AIAnalysisLogs() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const fetchedPosts = await getPosts()
      setPosts(fetchedPosts)
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === "all" || 
      post.aiAnalysis?.categories.includes(categoryFilter)

    return matchesSearch && matchesCategory
  })

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="safe">Safe</SelectItem>
            <SelectItem value="unsafe">Unsafe</SelectItem>
            <SelectItem value="needs_moderation">Needs Moderation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Post</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead>Risk Score</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Analyzed</TableHead>
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
                  <div className="flex flex-wrap gap-1">
                    {post.aiAnalysis?.categories.map((category) => (
                      <AIAnalysisCategoryBadge key={category} category={category} />
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <AIAnalysisRiskScoreBadge status={post.status} />
                </TableCell>
                <TableCell> 
                  <Badge variant="outline">
                    {post.aiAnalysis?.confidence ? (post.aiAnalysis.confidence * 100).toFixed(0) : "N/A"}%
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