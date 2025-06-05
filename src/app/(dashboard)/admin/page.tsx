"use client"

import { RoleGuard } from "@/@auth"
import UserManagement from "@/components/admin/user-management"
import PostLogViewer from "@/components/admin/post-log-viewer"
import ActionLog from "@/components/admin/action-log"
import AnalyticsPanel from "@/components/admin/analytics-panel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminPage() {
  return (
    <RoleGuard requiredRole="admin">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Barangay Dashboard</h1>
        
        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="posts">Post Log</TabsTrigger>
            <TabsTrigger value="actions">Action Log</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <UserManagement />
          </TabsContent>

          <TabsContent value="posts" className="space-y-4">
            <PostLogViewer />
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <ActionLog />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <AnalyticsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  )
} 