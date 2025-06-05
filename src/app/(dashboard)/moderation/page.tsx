"use client"

import { FlaggedPostsPanel, AIAnalysisLogs, EmergencyLogs, ReportLogs } from "@/components/moderation"
import ScrollToTop from "@/components/ui/scroll-to-top"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ModerationPage() {

  return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Moderator Dashboard</h1>
          
          <Tabs defaultValue="queue" className="mt-6">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="queue">Moderation Queue</TabsTrigger>
              <TabsTrigger value="ai-logs">AI Analysis Logs</TabsTrigger>
              <TabsTrigger value="emergency-logs">Emergency Logs</TabsTrigger>
              <TabsTrigger value="report-logs">Report Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="queue">
              <FlaggedPostsPanel />
            </TabsContent>

            <TabsContent value="ai-logs">
              <AIAnalysisLogs />
            </TabsContent>

            <TabsContent value="emergency-logs">
              <EmergencyLogs />
            </TabsContent>

            <TabsContent value="report-logs">
              <ReportLogs />
            </TabsContent>
          </Tabs>
        </div>
        <ScrollToTop />
      </div>
  )
}
