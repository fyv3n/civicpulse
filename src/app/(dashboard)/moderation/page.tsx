"use client"

import { useSearchParams } from "next/navigation"
import { AIAnalysisLogs, EmergencyLogs, FlaggedPostsPanel, ReportLogs } from "@/components/moderation"
import ScrollToTop from "@/components/ui/scroll-to-top"

export default function ModerationPage() {
  const searchParams = useSearchParams()
  const panelParam = searchParams.get("panel")
  const panel = panelParam ?? "flagged-posts"

  const renderContent = () => {
    switch (panel) {
      case "flagged-posts": return <FlaggedPostsPanel />
      case "ai-logs": return <AIAnalysisLogs />
      case "emergency-logs": return <EmergencyLogs />
      case "report-logs": return <ReportLogs />
      default: return <FlaggedPostsPanel />
    }
  }

  return (
    <div className="container px-4 py-8">
      <div className="mx-auto">
        <h1 className="text-2xl font-bold mb-6">Moderator Dashboard</h1>
        {renderContent()}
      </div>
      <ScrollToTop />
    </div>
  )
}
