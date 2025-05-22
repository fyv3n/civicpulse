import { Shield, ShieldCheck, ShieldAlert } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface UserTrustBadgeProps {
  score: number
  isVerified: boolean
}

export default function UserTrustBadge({ score, isVerified }: UserTrustBadgeProps) {
  let badgeColor = ""
  let icon = null
  let label = ""

  if (score >= 80) {
    badgeColor = "text-green-600"
    icon = <ShieldCheck className="h-4 w-4" />
    label = "Highly Trusted"
  } else if (score >= 50) {
    badgeColor = "text-blue-600"
    icon = <Shield className="h-4 w-4" />
    label = "Trusted"
  } else {
    badgeColor = "text-yellow-600"
    icon = <ShieldAlert className="h-4 w-4" />
    label = "New User"
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-1 ${badgeColor}`}>
            {icon}
            {isVerified && (
              <svg className="h-3.5 w-3.5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-medium">{label}</p>
            <p className="text-xs">Trust Score: {score}/100</p>
            {isVerified && <p className="text-xs text-blue-500">Verified User</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
