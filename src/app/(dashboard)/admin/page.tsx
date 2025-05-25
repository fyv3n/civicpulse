import RoleGuard from "@/components/auth/role-guard"

export default function AdminPage() {
  return (
    <RoleGuard requiredRole="admin">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        {/* Admin content */}
      </div>
    </RoleGuard>
  )
} 