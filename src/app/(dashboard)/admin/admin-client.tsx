"use client"

import { useSearchParams } from "next/navigation"
import UserManagement from "@/components/admin/user-management"
import PostLogViewer from "@/components/admin/post-log-viewer"
import ActionLog from "@/components/admin/action-log"
import AnalyticsPanel from "@/components/admin/analytics-panel"

export default function AdminClientPage() {
  const searchParams = useSearchParams()
  const panelParam = searchParams.get("panel")
  const panel = panelParam ?? "analytics"

  const renderContent = () => {
    switch (panel) {
      case "users":
        return <UserManagement />
      case "posts":
        return <PostLogViewer />
      case "actions":
        return <ActionLog />
      case "analytics":
      default:
        return <AnalyticsPanel />
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Barangay Dashboard</h1>
      {renderContent()}
    </div>
  )
}
