"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Search, Shield, User, Flag, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { collection, query, orderBy, getDocs, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase/config"

interface ActionLog {
  id: string
  actionType: "user_role_update" | "post_status_update" | "post_report" | "user_verification"
  actionBy: {
    name: string
    role: string
  }
  target: {
    type: "user" | "post"
    id: string
    name: string
  }
  details: {
    from?: string
    to?: string
    note?: string
  }
  createdAt: Date
}

export default function ActionLog() {
  const [logs, setLogs] = useState<ActionLog[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState<ActionLog["actionType"] | "all">("all")
  const { toast } = useToast()

  const fetchActionLogs = useCallback(async () => {
    try {
      const logsQuery = query(
        collection(db, "action_logs"),
        orderBy("createdAt", "desc")
      )
      const querySnapshot = await getDocs(logsQuery)
      const fetchedLogs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp).toDate(),
      })) as ActionLog[]
      setLogs(fetchedLogs)
    } catch (error) {
      console.error("Error fetching action logs:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load action logs"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchActionLogs()
  }, [fetchActionLogs])

  const getActionIcon = (actionType: ActionLog["actionType"]) => {
    switch (actionType) {
      case "user_role_update":
        return <Shield className="h-4 w-4" />
      case "post_status_update":
        return <Flag className="h-4 w-4" />
      case "post_report":
        return <AlertTriangle className="h-4 w-4" />
      case "user_verification":
        return <User className="h-4 w-4" />
      default:
        return null
    }
  }

  const getActionBadgeColor = (actionType: ActionLog["actionType"]) => {
    switch (actionType) {
      case "user_role_update":
        return "bg-purple-100 text-purple-800"
      case "post_status_update":
        return "bg-blue-100 text-blue-800"
      case "post_report":
        return "bg-red-100 text-red-800"
      case "user_verification":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatActionType = (actionType: ActionLog["actionType"]) => {
    return actionType
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.target.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actionBy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.note?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesAction = actionFilter === "all" || log.actionType === actionFilter

    return matchesSearch && matchesAction
  })

  if (loading) {
    return <div>Loading action logs...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by target, moderator, or note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={actionFilter} onValueChange={(value) => setActionFilter(value as ActionLog["actionType"] | "all")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="user_role_update">Role Updates</SelectItem>
            <SelectItem value="post_status_update">Post Status</SelectItem>
            <SelectItem value="post_report">Reports</SelectItem>
            <SelectItem value="user_verification">Verifications</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Moderator</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getActionIcon(log.actionType)}
                    <Badge className={getActionBadgeColor(log.actionType)}>
                      {formatActionType(log.actionType)}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{log.actionBy.name}</span>
                    <Badge variant="outline">{log.actionBy.role}</Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{log.target.name}</span>
                    <Badge variant="outline">{log.target.type}</Badge>
                  </div>
                </TableCell>
                <TableCell className="max-w-[300px]">
                  {log.details.from && log.details.to && (
                    <div className="text-sm">
                      Changed from <span className="font-medium">{log.details.from}</span> to{" "}
                      <span className="font-medium">{log.details.to}</span>
                    </div>
                  )}
                  {log.details.note && (
                    <div className="text-sm text-gray-600">{log.details.note}</div>
                  )}
                </TableCell>
                <TableCell>{formatDistanceToNow(log.createdAt, { addSuffix: true })}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 