"use client"

import { useAuth } from "@/contexts/AuthContext"
import { User } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function UserProfile() {
  const { user } = useAuth()
  
  if (!user) return null
  
  // Extract user metadata (custom fields we added during signup)
  const metadata = user.user_metadata || {}
  const firstName = metadata.first_name || ""
  const lastName = metadata.last_name || ""
  const fullName = `${firstName} ${lastName}`.trim() || user.email?.split('@')[0] || "User"
  const currentLevel = metadata.current_level || "Not specified"
  const userType = metadata.user_type || "Student"
  
  // Get initials for avatar
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || fullName.charAt(0).toUpperCase()

  return (
    <div className="flex items-center gap-4 mb-6 p-4 bg-card rounded-lg shadow-sm">
      <Avatar className="h-12 w-12 border">
        <AvatarFallback className="bg-primary/10 text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div>
        <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">{fullName}</h2>
        <p className="text-sm text-muted-foreground text-gray-600 dark:text-gray-400">{currentLevel} • {userType}</p>
      </div>
    </div>
  )
} 