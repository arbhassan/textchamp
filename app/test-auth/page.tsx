"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"

export default function TestAuth() {
  const { user, isLoading } = useAuth()
  const [testResult, setTestResult] = useState<any>(null)
  const [isTestLoading, setIsTestLoading] = useState(false)
  
  const testAuthConfig = async () => {
    setIsTestLoading(true)
    try {
      const response = await fetch('/api/test-auth')
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({ status: 'error', message: 'Error fetching test API', error })
    } finally {
      setIsTestLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Test Page</CardTitle>
            <CardDescription>
              This page helps debug authentication issues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Authentication Status:</h3>
              {isLoading ? (
                <p>Loading authentication status...</p>
              ) : user ? (
                <div>
                  <p className="mb-2 text-green-600 dark:text-green-400 font-medium">✓ Authenticated</p>
                  <p><span className="font-medium">User ID:</span> {user.id}</p>
                  <p><span className="font-medium">Email:</span> {user.email}</p>
                </div>
              ) : (
                <p className="text-red-500 font-medium">✗ Not authenticated</p>
              )}
            </div>
            
            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium mb-2">Test Supabase Configuration:</h3>
              <Button 
                onClick={testAuthConfig} 
                disabled={isTestLoading}
              >
                {isTestLoading ? "Testing..." : "Test Supabase Config"}
              </Button>
              
              {testResult && (
                <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
                  <p><span className="font-medium">Status:</span> {testResult.status}</p>
                  <p><span className="font-medium">Message:</span> {testResult.message}</p>
                  
                  {testResult.env && (
                    <div className="mt-2">
                      <p className="font-medium">Environment Variables:</p>
                      <p>SUPABASE_URL: {testResult.env.hasSupabaseUrl ? '✓ Set' : '✗ Missing'}</p>
                      <p>SUPABASE_ANON_KEY: {testResult.env.hasSupabaseAnonKey ? '✓ Set' : '✗ Missing'}</p>
                    </div>
                  )}
                  
                  {testResult.auth && (
                    <div className="mt-2">
                      <p className="font-medium">Auth Check:</p>
                      <p>Has Session: {testResult.auth.hasSession ? '✓ Yes' : '✗ No'}</p>
                      {testResult.auth.error && <p>Error: {testResult.auth.error}</p>}
                    </div>
                  )}
                  
                  <pre className="mt-4 p-2 bg-gray-200 dark:bg-gray-700 rounded text-xs overflow-auto">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex space-x-4">
              <Link href="/signin">
                <Button variant="outline">Go to Sign In</Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Go to Dashboard</Button>
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 