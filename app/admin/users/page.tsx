"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../../lib/supabase"
import Link from "next/link"
import { ArrowLeft, Lock, X, User, Phone, ChevronLeft } from "lucide-react"

interface User {
  id: string
  email?: string
  created_at: string
  last_sign_in_at?: string
  user_metadata?: {
    options?: {
      data?: {
        currentGrade?: string
        currentLevel?: string
        firstName?: string
        lastName?: string
        phone?: string
        schoolName?: string
        userType?: string
      }
    }
    name?: string
  }
  app_metadata?: any
}

export default function UsersPanel() {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState("")
  
  // Users state
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ text: "", type: "" })
  
  // Selected user for detail view
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Check for existing authentication
  useEffect(() => {
    const isAdminAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true'
    if (isAdminAuthenticated) {
      setIsAuthenticated(true)
      fetchUsers()
    }
  }, [])
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === "admin123") {
      setIsAuthenticated(true)
      // Store authentication in session storage
      sessionStorage.setItem('adminAuthenticated', 'true')
      setAuthError("")
      fetchUsers()
    } else {
      setAuthError("Incorrect password. Please try again.")
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      // Fetch user data from our API route
      const response = await fetch('/api/admin/users', {
        headers: {
          // In a real app, you'd use a more secure approach for this secret
          'x-admin-secret': 'admin123' // Simple implementation - replace with a proper secret
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch users')
      }
      
      const data = await response.json()
      setUsers(data.users || [])
      
    } catch (error) {
      console.error('Error fetching users:', error)
      setMessage({ text: error instanceof Error ? error.message : "Failed to fetch users", type: "error" })
      
      // Fallback to mock data if the API fails
      const mockUsers: User[] = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'user1@example.com',
          created_at: '2023-01-15T10:30:00.000Z',
          last_sign_in_at: '2023-05-20T14:25:00.000Z',
          user_metadata: { 
            name: 'User One',
            options: {
              data: {
                firstName: "Joshua",
                lastName: "Lim",
                currentGrade: "A",
                currentLevel: "JC2",
                phone: "+6591805377",
                schoolName: "CHS",
                userType: "Parent"
              }
            }
          }
        },
        {
          id: '223e4567-e89b-12d3-a456-426614174001',
          email: 'user2@example.com',
          created_at: '2023-02-20T11:45:00.000Z',
          last_sign_in_at: '2023-05-18T09:15:00.000Z',
          user_metadata: { 
            name: 'User Two',
            options: {
              data: {
                firstName: "Sarah",
                lastName: "Tan",
                currentGrade: "B",
                currentLevel: "JC1",
                phone: "+6598765432",
                schoolName: "NYJC",
                userType: "Student"
              }
            }
          }
        }
      ]
      
      setUsers(mockUsers)
      setMessage(prev => ({ 
        ...prev, 
        text: prev.text + " - Displaying sample data instead.", 
      }))
    } finally {
      setLoading(false)
    }
  }

  // View user details
  const handleUserClick = (user: User) => {
    setSelectedUser(user)
  }

  // Close user details
  const closeUserDetails = () => {
    setSelectedUser(null)
  }

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <Lock className="h-12 w-12 text-blue-500 mx-auto" />
            <h1 className="text-2xl font-bold mt-4">Admin Authentication</h1>
            <p className="text-gray-600 mt-2">Please enter the password to access the users panel</p>
          </div>
          
          {authError && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {authError}
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 text-black py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter admin password"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Login
            </button>
            
            <div className="mt-4 text-center">
              <Link href="/admin" className="text-sm text-blue-600 hover:text-blue-800">
                Return to Admin Panel
              </Link>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="flex items-center text-gray-500 hover:text-gray-700">
              <ArrowLeft size={20} />
              <span className="ml-2">Back to Admin Panel</span>
            </Link>
            <h1 className="text-xl font-semibold text-gray-800">Users Management</h1>
          </div>
          <button 
            onClick={() => {
              sessionStorage.removeItem('adminAuthenticated')
              setIsAuthenticated(false)
            }}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Logout
          </button>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
        {/* Message display */}
        {message.text && (
          <div className={`mb-4 p-3 rounded ${message.type === "error" ? "bg-red-100 text-red-700" : message.type === "info" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"} flex justify-between items-center`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage({ text: "", type: "" })} className="text-gray-500 hover:text-gray-700">
              <X size={18} />
            </button>
          </div>
        )}
        
        {selectedUser ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">
                  User Details
                </h2>
                <button
                  onClick={closeUserDetails}
                  className="flex items-center text-gray-500 hover:text-gray-700"
                >
                  <ChevronLeft size={20} className="mr-1" />
                  <span>Back to Users List</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-md font-medium text-gray-800 mb-4 flex items-center">
                    <User className="mr-2 text-blue-500" size={20} />
                    Basic Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">ID</p>
                      <p className="text-gray-800">{selectedUser.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-800">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="text-gray-800">{new Date(selectedUser.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Sign In</p>
                      <p className="text-gray-800">
                        {selectedUser.last_sign_in_at ? 
                          new Date(selectedUser.last_sign_in_at).toLocaleString() : 
                          'Never'
                        }
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-md font-medium text-gray-800 mb-4 flex items-center">
                    <Phone className="mr-2 text-blue-500" size={20} />
                    User Metadata
                  </h3>
                  
                  {(selectedUser.user_metadata?.options?.data || 
                    (selectedUser.user_metadata?.first_name && selectedUser.user_metadata?.last_name)) ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="text-gray-800">
                          {selectedUser.user_metadata?.options?.data ? 
                            `${selectedUser.user_metadata.options.data.firstName || ''} ${selectedUser.user_metadata.options.data.lastName || ''}` : 
                            `${selectedUser.user_metadata?.first_name || ''} ${selectedUser.user_metadata?.last_name || ''}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">User Type</p>
                        <p className="text-gray-800">
                          {selectedUser.user_metadata?.options?.data?.userType || 
                           selectedUser.user_metadata?.user_type || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-gray-800">
                          {selectedUser.user_metadata?.options?.data?.phone || 
                           selectedUser.user_metadata?.phone || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">School</p>
                        <p className="text-gray-800">
                          {selectedUser.user_metadata?.options?.data?.schoolName || 
                           selectedUser.user_metadata?.school_name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Level</p>
                        <p className="text-gray-800">
                          {selectedUser.user_metadata?.options?.data?.currentLevel || 
                           selectedUser.user_metadata?.current_level || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Grade</p>
                        <p className="text-gray-800">
                          {selectedUser.user_metadata?.options?.data?.currentGrade || 
                           selectedUser.user_metadata?.current_grade || 'N/A'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No additional user data available</p>
                  )}
                </div>
              </div>
              

            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Registered Users
              </h2>
              
              <div className="mb-4 flex justify-end">
                <button 
                  onClick={fetchUsers}
                  className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-sm"
                >
                  Refresh Users
                </button>
              </div>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User Info
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created At
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Sign In
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr 
                          key={user.id} 
                          onClick={() => handleUserClick(user)}
                          className="hover:bg-gray-50 cursor-pointer"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.id.substring(0, 8)}...
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.user_metadata?.options?.data || 
                             (user.user_metadata?.first_name && user.user_metadata?.last_name) ? (
                              <span className="text-sm">
                                {user.user_metadata?.options?.data ? 
                                  `${user.user_metadata.options.data.firstName || ''} ${user.user_metadata.options.data.lastName || ''}` :
                                  `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`}
                                <span className="ml-1 text-xs text-gray-500">
                                  ({user.user_metadata?.options?.data?.userType || user.user_metadata?.user_type || 'Unknown'})
                                </span>
                              </span>
                            ) : (
                              <span className="text-gray-400 italic">No user data</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 