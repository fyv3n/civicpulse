import FlaggedPostsPanel from "@/components/moderation/flagged-posts-panel"
import ScrollToTop from "@/components/ui/scroll-to-top"

export default function ModerationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Moderator Dashboard</h1>
        <FlaggedPostsPanel />
      </div>
      <ScrollToTop />
    </div>
  )
}
