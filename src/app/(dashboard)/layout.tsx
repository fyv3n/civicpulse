import type React from "react"
import MainSidebar from "@/components/sidebar/main-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainSidebar />
      <main className="md:ml-64 min-h-screen transition-all duration-300">
        <div className="pt-20 px-4 md:px-6">{children}</div>
      </main>
    </div>
  )
}
