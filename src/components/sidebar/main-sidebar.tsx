"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Bell,
  User,
  PlusCircle,
  Settings,
  LogOut,
  Shield,
  Building,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { auth } from "@/lib/firebase/config"
import { getUserProfile, UserProfile } from "@/lib/firebase/users"

export default function MainSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [moderationOpen, setModerationOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const profile = await getUserProfile(user.uid)
        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }
    })
    return () => unsubscribe()
  }, [])

  const userMenuItems = [
    { title: "Home", icon: Home, href: "/feed" },
    { title: "Notifications", icon: Bell, href: "/notifications" },
    { title: "Profile", icon: User, href: "/profile" },
    { title: "Create Post", icon: PlusCircle, href: "/create" },
  ]

  const submenuOfModeration = [
    { title: "Flagged Posts", icon: Shield, href: "/moderation?panel=flagged-posts" },
    { title: "AI Analysis Logs", icon: Shield, href: "/moderation?panel=ai-logs" },
    { title: "Emergency Logs", icon: Shield, href: "/moderation?panel=emergency-logs" },
    { title: "Report Logs", icon: Shield, href: "/moderation?panel=report-logs" },
  ]

  const submenuOfAdmin = [
    { title: "User Management", icon: User, href: "/admin/users" },
    { title: "Post Log", icon: Shield, href: "/admin/post-log" },
    { title: "Action Log", icon: Shield, href: "/admin/action-log" },
    { title: "Analytics", icon: Shield, href: "/admin/analytics" },
  ]

  const bottomMenuItems = [
    { title: "Settings", icon: Settings, href: "/settings" },
    { title: "Logout", icon: LogOut, href: "/" },
  ]

  return (
    <>
      {/* Top Bar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (window.innerWidth >= 768) {
                setCollapsed(!collapsed)
              } else {
                setMobileOpen(!mobileOpen)
              }
            }}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-red-600" />
          <span className="text-lg font-bold">CivicPulse</span>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside className={cn("fixed top-16 bottom-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out", collapsed ? "w-16" : "w-64", mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0")}>
        <div className="flex-1 overflow-y-auto">
          <TooltipProvider delayDuration={0}>
            <div className="py-4">
              <nav className="flex flex-col gap-1 px-2">
                {userMenuItems.map((item) => (
                  <Tooltip key={item.href} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors", pathname === item.href ? "bg-red-50 text-red-600" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900")}
                        onClick={() => setMobileOpen(false)}
                      >
                        <item.icon className={cn("h-5 w-5 flex-shrink-0", collapsed ? "mx-auto" : "")} />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </TooltipTrigger>
                    {collapsed && <TooltipContent side="right">{item.title}</TooltipContent>}
                  </Tooltip>
                ))}

                {userProfile?.role === "admin" && (
                  <>
                    <Separator className="my-2" />
                    <div className={cn("px-3 py-2", collapsed ? "hidden" : "")}>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Admin</p>
                    </div>

                    {/* Moderation Parent */}
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setModerationOpen(!moderationOpen)}
                          className={cn("flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors", pathname.startsWith("/moderation") ? "bg-red-50 text-red-600" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900")}
                        >
                          <Shield className="h-5 w-5 flex-shrink-0" />
                          {!collapsed && <span>Moderation</span>}
                        </button>
                      </TooltipTrigger>
                      {collapsed && <TooltipContent side="right">Moderation</TooltipContent>}
                    </Tooltip>

                    {moderationOpen && !collapsed && (
                      <div className="ml-8 flex flex-col gap-1 mt-1">
                        {submenuOfModeration.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn("flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors", pathname === item.href ? "bg-red-50 text-red-600" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900")}
                            onClick={() => setMobileOpen(false)}
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Barangay Dashboard Parent */}
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setAdminOpen(!adminOpen)}
                          className={cn("flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors", pathname.startsWith("/admin") ? "bg-red-50 text-red-600" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900")}
                        >
                          <Building className="h-5 w-5 flex-shrink-0" />
                          {!collapsed && <span>Barangay Dashboard</span>}
                        </button>
                      </TooltipTrigger>
                      {collapsed && <TooltipContent side="right">Barangay Dashboard</TooltipContent>}
                    </Tooltip>

                    {adminOpen && !collapsed && (
                      <div className="ml-8 flex flex-col gap-1 mt-1">
                        {submenuOfAdmin.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn("flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors", pathname === item.href ? "bg-red-50 text-red-600" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900")}
                            onClick={() => setMobileOpen(false)}
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </nav>
            </div>
          </TooltipProvider>
        </div>

        {/* Bottom Menu */}
        <div className="mt-auto border-t border-gray-200">
          <TooltipProvider delayDuration={0}>
            <div className="py-4">
              <nav className="flex flex-col gap-1 px-2">
                {bottomMenuItems.map((item) => (
                  <Tooltip key={item.href} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors", pathname === item.href ? "bg-red-50 text-red-600" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900")}
                        onClick={() => setMobileOpen(false)}
                      >
                        <item.icon className={cn("h-5 w-5 flex-shrink-0", collapsed ? "mx-auto" : "")} />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </TooltipTrigger>
                    {collapsed && <TooltipContent side="right">{item.title}</TooltipContent>}
                  </Tooltip>
                ))}
              </nav>
            </div>
          </TooltipProvider>
        </div>
      </aside>
    </>
  )
}
