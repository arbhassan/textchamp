"use client"

import Image from "next/image"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

interface HeaderProps {
  completedCount?: number
  targetCount?: number
}

export function Header({ completedCount = 0, targetCount = 5 }: HeaderProps) {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div className="border-b pb-6 mb-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative flex items-center h-12">
            <Image
              priority={true}
              src="/placeholder-logo.png"
              alt="TextChamp Logo"
              width={120}
              height={0}
              style={{ height: "auto" }}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Good Morning, Josh!</h1>
            <p className="text-muted-foreground">
              You've completed {completedCount >= targetCount ? "all" : completedCount} of {targetCount} practices this week
              {completedCount > targetCount && ` (+${completedCount - targetCount} extra)`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="text-muted-foreground hover:text-foreground"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>
    </div>
  )
} 