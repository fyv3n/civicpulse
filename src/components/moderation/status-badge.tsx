import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, CheckCircle2, XCircle, Clock, ShieldCheck } from "lucide-react";

// =========================================
// Post Status Badges
// =========================================
export function PostStatusBadge({ status }: { status: string }) {
  const formatStatus = (s: string) =>
    s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 px-2">
          <Clock className="h-4 w-4 mr-1" />
          Pending Review
        </Badge>
      );

    case "verified":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-2">
          <ShieldCheck className="h-4 w-4 mr-1" />
          Verified
        </Badge>
      );

    case "false_alarm":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 px-2">
          <XCircle className="h-4 w-4 mr-1" />
          False Alarm
        </Badge>
      );

    default:
      return <Badge variant="outline" className="px-2">{formatStatus(status)}</Badge>;
  }
}

// =========================================
// AI Analysis Risk Score Badges
// =========================================
export function AIAnalysisRiskScoreBadge({ status }: { status: string }) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1 px-2 hover:bg-yellow-100 transition-colors">
          <Clock className="h-4 w-4 mr-1" />
          Needs Review
        </Badge>
      );

    case "verified":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1 px-2 hover:bg-blue-100 transition-colors">
          <ShieldCheck className="h-4 w-4 mr-1" />
          AI Verified
        </Badge>
      );

    case "resolved":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 px-2 hover:bg-green-100 transition-colors">
          <CheckCircle2 className="h-4 w-4 mr-1" />
          Resolved
        </Badge>
      );

    case "false_alarm":
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 flex items-center gap-1 px-2 hover:bg-gray-100 transition-colors">
          <XCircle className="h-4 w-4 mr-1" />
          False Alarm
        </Badge>
      );

    case "auto_flagged":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1 px-2 hover:bg-red-100 transition-colors">
          <AlertTriangle className="h-4 w-4 mr-1" />
          AI Flagged
        </Badge>
      );

    default:
      return <Badge variant="outline" className="flex items-center gap-1 px-2 hover:bg-gray-100 transition-colors">{status}</Badge>;
  }
}

// =========================================
// AI Analysis Category Badges
// =========================================
export function AIAnalysisCategoryBadge({ category }: { category: string }) {
  switch (category) {
    case "unsafe":
      return (
        <Badge variant="destructive" className="flex items-center gap-1 px-2 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 transition-colors">
          <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
          Unsafe
        </Badge>
      );

    case "emergency":
      return (
        <Badge variant="destructive" className="flex items-center gap-1 px-2 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 transition-colors">
          <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
          Emergency
        </Badge>
      );

    case "needs_moderation":
      return (
        <Badge variant="destructive" className="flex items-center gap-1 px-2 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 transition-colors">
          <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
          Needs Moderation
        </Badge>
      );

    case "safe":
      return (
        <Badge variant="default" className="flex items-center gap-1 px-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 transition-colors">
          <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
          Safe
        </Badge>
      );

    case "verified":
      return (
        <Badge variant="outline" className="flex items-center gap-1 px-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors">
          <ShieldCheck className="h-4 w-4 text-blue-500 mr-1" />
          Verified
        </Badge>
      );

    default:
      return (
        <Badge variant="outline" className="flex items-center gap-1 px-2 hover:bg-gray-100 transition-colors">
          {category.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
        </Badge>
      );
  }
}

// =========================================
// Report Status Badges
// =========================================
export function ReportStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1 px-2 hover:bg-yellow-100 transition-colors">
          <Clock className="h-4 w-4 mr-1" />
          Pending Review
        </Badge>
      );

    case "verified":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1 px-2 hover:bg-blue-100 transition-colors">
          <ShieldCheck className="h-4 w-4 mr-1" />
          Verified
        </Badge>
      );

    case "resolved":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1 px-2 hover:bg-blue-100 transition-colors">
          <Shield className="h-4 w-4 mr-1" />
          Resolved
        </Badge>
      );

    case "false_alarm":
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 flex items-center gap-1 px-2 hover:bg-gray-100 transition-colors">
          <XCircle className="h-4 w-4 mr-1" />
          False Alarm
        </Badge>
      );

    case "auto_flagged":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1 px-2 hover:bg-red-100 transition-colors">
          <AlertTriangle className="h-4 w-4 mr-1" />
          AI/User Flagged
        </Badge>
      );

    default:
      return <Badge variant="outline" className="flex items-center gap-1 px-2 hover:bg-gray-100 transition-colors">{status}</Badge>;
  }
}

// =========================================
// Emergency Status Badges
// =========================================
export function EmergencyStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "active":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1 px-2 hover:bg-red-100 transition-colors">
          <AlertTriangle className="h-4 w-4 mr-1" />
          Active Emergency
        </Badge>
      );

    case "resolved":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 px-2 hover:bg-green-100 transition-colors">
          <CheckCircle2 className="h-4 w-4 mr-1" />
          Resolved
        </Badge>
      );

    case "false_alarm":
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 flex items-center gap-1 px-2 hover:bg-gray-100 transition-colors">
          <XCircle className="h-4 w-4 mr-1" />
          False Alarm
        </Badge>
      );

    default:
      return <Badge variant="outline" className="flex items-center gap-1 px-2 hover:bg-gray-100 transition-colors">{status}</Badge>;
  }
} 