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
import { getUserProfile } from "@/lib/firebase/users"
import { UserProfile } from "@/lib/firebase/users"

export default function MainSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

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
    {
      title: "Home",
      icon: Home,
      href: "/feed",
    },
    {
      title: "Notifications",
      icon: Bell,
      href: "/notifications",
    },
    {
      title: "Profile",
      icon: User,
      href: "/profile",
    },
    {
      title: "Create Post",
      icon: PlusCircle,
      href: "/create",
    },
  ]

  const adminMenuItems = [
    {
      title: "Moderation",
      icon: Shield,
      href: "/moderation",
    },
    {
      title: "Barangay Settings",
      icon: Building,
      href: "/barangay-settings",
    },
  ]

  const bottomMenuItems = [
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
    },
    {
      title: "Logout",
      icon: LogOut,
      href: "/",
    },
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-red-600"
          >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
          <span className="text-lg font-bold">CivicPulse</span>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-16 bottom-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Main Menu */}
        <div className="flex-1 overflow-y-auto">
          <TooltipProvider delayDuration={0}>
            <div className="py-4">
              <nav className="flex flex-col gap-1 px-2">
                {userMenuItems.map((item) => (
                  <Tooltip key={item.href} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          pathname === item.href
                            ? "bg-red-50 text-red-600"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                        )}
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

                    {adminMenuItems.map((item) => (
                      <Tooltip key={item.href} delayDuration={0}>
                        <TooltipTrigger asChild>
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                              pathname === item.href
                                ? "bg-red-50 text-red-600"
                                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                            )}
                            onClick={() => setMobileOpen(false)}
                          >
                            <item.icon className={cn("h-5 w-5 flex-shrink-0", collapsed ? "mx-auto" : "")} />
                            {!collapsed && <span>{item.title}</span>}
                          </Link>
                        </TooltipTrigger>
                        {collapsed && <TooltipContent side="right">{item.title}</TooltipContent>}
                      </Tooltip>
                    ))}
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
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          pathname === item.href
                            ? "bg-red-50 text-red-600"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                        )}
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
