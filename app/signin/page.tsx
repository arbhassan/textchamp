"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/utils/supabase"

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, user } = useAuth()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])
  
  // Check for registration success
  useEffect(() => {
    const registered = searchParams.get('registered')
    if (registered === 'true') {
      setSuccessMessage("Account created successfully! Please verify your email before signing in.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    console.log("Attempting to sign in with:", email)

    if (!email || !password) {
      setError("Please enter your email and password.")
      setIsLoading(false)
      return
    }

    try {
      console.log("Calling supabase.auth.signInWithPassword...")
      const { error, data } = await signIn(email, password)
      
      console.log("Sign in response:", { 
        error, 
        hasSession: !!data?.session,
        user: data?.user ? `${data.user.email} (${data.user.id})` : 'No user' 
      })
      
      if (error) {
        console.error("Sign in error:", error)
        setError(error.message)
      } else {
        // Verify we actually got authenticated
        if (data?.session) {
          console.log("Sign in successful, got session token:", data.session.access_token.substring(0, 10) + '...')
          
          // Let's verify the session is valid by checking user data
          const { data: userData, error: userError } = await supabase.auth.getUser()
          
          if (userError) {
            console.error("Error verifying user after login:", userError)
            setError("Authentication successful but session verification failed. Please try again.")
          } else {
            console.log("User verified after login:", userData.user.email)
            console.log("Sign in successful, redirecting to dashboard...")
            router.push("/")
          }
        } else {
          console.error("Sign in had no error but also no session")
          setError("Authentication succeeded but no session was created. Please try again.")
        }
      }
    } catch (err: any) {
      console.error("Exception during sign in:", err)
      setError(err.message || "An error occurred during sign in.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {successMessage && (
            <Alert variant="success" className="mb-6 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.doe@example.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function SignIn() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background">Loading...</div>}>
      <SignInContent />
    </Suspense>
  )
} 