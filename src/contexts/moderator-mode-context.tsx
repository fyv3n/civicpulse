"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface ModeratorModeContextType {
  isModeratorMode: boolean
  setIsModeratorMode: (value: boolean) => void
  getDisplayName: (realName: string) => string
}

const ModeratorModeContext = createContext<ModeratorModeContextType | undefined>(undefined)

export function ModeratorModeProvider({ children }: { children: ReactNode }) {
  const [isModeratorMode, setIsModeratorMode] = useState(false)

  // Load saved mode preference on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('moderatorMode')
    if (savedMode) {
      setIsModeratorMode(savedMode === 'true')
    }
  }, [])

  // Update localStorage when mode changes
  useEffect(() => {
    localStorage.setItem('moderatorMode', isModeratorMode.toString())
  }, [isModeratorMode])

  const getDisplayName = (realName: string) => {
    return isModeratorMode ? "Barangay Moderator" : realName
  }

  return (
    <ModeratorModeContext.Provider value={{ isModeratorMode, setIsModeratorMode, getDisplayName }}>
      {children}
    </ModeratorModeContext.Provider>
  )
}

export function useModeratorMode() {
  const context = useContext(ModeratorModeContext)
  if (context === undefined) {
    throw new Error('useModeratorMode must be used within a ModeratorModeProvider')
  }
  return context
} 