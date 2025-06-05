import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, XCircle, Shield, AlertTriangle } from "lucide-react"

interface PostStatusBadgeProps {
  status: "pending" | "verified" | "resolved" | "false alarm" | "auto flagged"
  aiVerified?: boolean
}

export default function PostStatusBadge({ status, aiVerified }: PostStatusBadgeProps) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending Verification
        </Badge>
      )
    case "verified":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
          {aiVerified ? (
            <>
              <Shield className="h-3 w-3" />
              AI Verified
            </>
          ) : (
            <>
              <CheckCircle className="h-3 w-3" />
              Verified
            </>
          )}
        </Badge>
      )
    case "resolved":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Resolved
        </Badge>
      )
    case "false alarm":
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          False Alarm
        </Badge>
      )
    case "auto flagged":
      return (
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Auto Flagged
        </Badge>
      )
    default:
      return null
  }
}
