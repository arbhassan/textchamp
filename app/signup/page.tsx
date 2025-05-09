"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SignUp() {
  const router = useRouter()
  const { signUp } = useAuth()
  
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [currentLevel, setCurrentLevel] = useState("")
  const [schoolName, setSchoolName] = useState("")
  const [currentGrade, setCurrentGrade] = useState("")
  const [userType, setUserType] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!firstName || !lastName || !email || !password || !phone || !currentLevel || !schoolName || !currentGrade || !userType) {
      setError("Please fill in all the required fields.")
      setIsLoading(false)
      return
    }

    const userData = {
      firstName,
      lastName,
      phone,
      currentLevel,
      schoolName,
      currentGrade,
      userType
    }

    try {
      const { error, data } = await signUp(email, password, userData)
      
      if (error) {
        setError(error.message)
      } else {
        router.push("/signin?registered=true")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during sign up.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">
            Enter your details to sign up for Text Champ
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>
            
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currentLevel">Current Level</Label>
              <Select value={currentLevel} onValueChange={setCurrentLevel} required>
                <SelectTrigger id="currentLevel">
                  <SelectValue placeholder="Select your current level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Secondary 1">Secondary 1</SelectItem>
                  <SelectItem value="Secondary 2">Secondary 2</SelectItem>
                  <SelectItem value="Secondary 3">Secondary 3</SelectItem>
                  <SelectItem value="Secondary 4">Secondary 4</SelectItem>
                  <SelectItem value="Secondary 5">Secondary 5</SelectItem>
                  <SelectItem value="JC1">JC1</SelectItem>
                  <SelectItem value="JC2">JC2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="schoolName">School Name</Label>
              <Input
                id="schoolName"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Enter your school name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currentGrade">Current Grade</Label>
              <Input
                id="currentGrade"
                value={currentGrade}
                onChange={(e) => setCurrentGrade(e.target.value)}
                placeholder="A, B, C, etc."
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="userType">I am a</Label>
              <Select value={userType} onValueChange={setUserType} required>
                <SelectTrigger id="userType">
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Student">Student</SelectItem>
                  <SelectItem value="Parent">Parent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/signin" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
} 