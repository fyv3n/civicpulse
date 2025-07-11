import { RoleGuard } from "@/@auth";
import AdminClientPage from "./admin-client";

export default function AdminPage() {
  return (
    <RoleGuard requiredRole="admin">
      <AdminClientPage />
    </RoleGuard>
  );
}
