"use client"

import FlaggedPostsPanel from "@/components/moderation/flagged-posts-panel"
import ModeratorModeToggle from "@/components/moderation/moderator-mode-toggle"
import ScrollToTop from "@/components/ui/scroll-to-top"
import { ModeratorModeProvider } from "@/contexts/moderator-mode-context"

export default function ModerationPage() {
  return (
    <ModeratorModeProvider>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Moderator Dashboard</h1>
          <ModeratorModeToggle />
          <div className="mt-6">
            <FlaggedPostsPanel />
          </div>
        </div>
        <ScrollToTop />
      </div>
    </ModeratorModeProvider>
  )
}
