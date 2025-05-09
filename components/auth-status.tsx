"use client"

import { useAuth } from "@/contexts/AuthContext"

export function AuthStatus() {
  const { user, isLoading } = useAuth()

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md shadow-md max-w-xs overflow-hidden z-50">
      <h3 className="font-bold mb-2">Auth Status</h3>
      <p className="text-sm mb-1"><span className="font-medium">Loading:</span> {isLoading ? "Yes" : "No"}</p>
      <p className="text-sm mb-2"><span className="font-medium">User:</span> {user ? "Authenticated" : "Not authenticated"}</p>
      {user && (
        <div className="text-xs mt-2 overflow-auto max-h-32">
          <p className="font-medium mb-1">User details:</p>
          <pre className="bg-gray-200 dark:bg-gray-700 p-2 rounded overflow-x-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
} 