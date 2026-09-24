/** Mirrors Role in @pco/content-models; wired as a dependency in Phase 2. */
export type Role = "viewer" | "content_admin" | "super_admin";

/**
 * Admin shell nav. Viewers never see this app at all (separate bundle, login-gated).
 * Content Admin: catalog only. Super Admin: catalog + users/admins/settings/activity (§36).
 */
export interface AdminNavItem {
  id: string;
  title: string;
  route: string;
  minRole: Exclude<Role, "viewer">;
}

export const ADMIN_NAV: AdminNavItem[] = [
  { id: "dashboard", title: "Dashboard", route: "/admin", minRole: "content_admin" },
  { id: "messages", title: "Messages", route: "/admin/messages", minRole: "content_admin" },
  { id: "music", title: "Music, Artists & Albums", route: "/admin/music", minRole: "content_admin" },
  { id: "programs", title: "Programs & Events", route: "/admin/programs", minRole: "content_admin" },
  { id: "live", title: "Live Programming", route: "/admin/live", minRole: "content_admin" },
  { id: "home", title: "Home Curation & Featured", route: "/admin/home", minRole: "content_admin" },
  { id: "users", title: "Users", route: "/admin/users", minRole: "super_admin" },
  { id: "admins", title: "Admins & Permissions", route: "/admin/admins", minRole: "super_admin" },
  { id: "settings", title: "Platform Settings", route: "/admin/settings", minRole: "super_admin" },
  { id: "activity", title: "Platform Activity", route: "/admin/activity", minRole: "super_admin" },
];

const RANK: Record<Role, number> = { viewer: 0, content_admin: 1, super_admin: 2 };

export function visibleNav(role: Role): AdminNavItem[] {
  if (role === "viewer") return [];
  return ADMIN_NAV.filter((item) => RANK[role] >= RANK[item.minRole]);
}

export function canAccess(role: Role, route: string): boolean {
  return visibleNav(role).some((item) => item.route === route);
}
