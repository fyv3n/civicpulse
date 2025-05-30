export const ADMIN_PATHS = ["/admin", "/barangay-settings", "/moderation"] as const;
export const MODERATOR_PATHS = ["/moderation"] as const;
export const RESTRICTED_PATHS = ["/create", "/comment", "/profile/edit"] as const;

export type AdminPath = typeof ADMIN_PATHS[number];
export type ModeratorPath = typeof MODERATOR_PATHS[number];
export type RestrictedPath = typeof RESTRICTED_PATHS[number]; 