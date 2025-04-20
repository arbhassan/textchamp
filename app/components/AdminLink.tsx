"use client"

import Link from "next/link"
import { Settings } from "lucide-react"

export default function AdminLink() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Link
        href="/admin"
        className="flex items-center gap-2 bg-gray-800 text-white px-3 py-2 rounded-md hover:bg-gray-700 transition-colors shadow-lg"
        title="Admin Panel"
      >
        <Settings size={16} />
        <span>Admin</span>
      </Link>
    </div>
  )
} 