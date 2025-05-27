import RoleGuard from "@/components/auth/role-guard"

export default function ModeratorPage() {
  return (
    <RoleGuard requiredRole="moderator">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Moderator Dashboard</h1>
        {/* Moderator content */}
      </div>
    </RoleGuard>
  )
} 