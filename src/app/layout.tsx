import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ModeratorModeProvider } from "@/contexts/moderator-mode-context";
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/@auth"

const inter = Inter({
  subsets: ["latin"]
})

export const metadata: Metadata = {
  title: "CivicPulse",
  description: "A community-driven platform for emergency detection and response",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ModeratorModeProvider>
            <div className="min-h-screen flex flex-col">{children}</div>
          </ModeratorModeProvider>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}