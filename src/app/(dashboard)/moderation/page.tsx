import { RoleGuard } from "@/@auth"
import ModerationClientPage from "./moderation-client"

export default function ModerationPage() {
  return (
    <RoleGuard requiredRole="moderator">
      <ModerationClientPage />
    </RoleGuard>
  );
}
