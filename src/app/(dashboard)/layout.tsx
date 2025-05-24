import type React from "react"
import MainSidebar from "@/components/sidebar/main-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      <MainSidebar />
      <main className="flex-1 ml-0 md:ml-64 transition-all duration-300 p-4 md:p-6">{children}</main>
    </div>
  )
}
