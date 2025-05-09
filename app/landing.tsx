"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

export default function LandingPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen bg-background">
      <header className="py-6 px-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Text Champ</h1>
        <div className="flex items-center gap-4">
          <button 
            className="p-2 text-muted-foreground hover:text-foreground rounded-full"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-gray-800 dark:text-gray-200">
            Master English <span className="text-primary">Comprehension</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mb-12">
            Improve your reading and writing skills with targeted practice sessions for all sections of the English comprehension exam.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              onClick={() => router.push('/signin')}
              className="min-w-[140px]"
            >
              Sign In
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => router.push('/signup')}
              className="min-w-[140px] text-gray-800 dark:text-gray-200"
            >
              Sign Up
            </Button>
          </div>
          
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 16L8.586 11.414C8.96106 11.0391 9.46967 10.8284 10 10.8284C10.5303 10.8284 11.0389 11.0391 11.414 11.414L16 16" stroke="currentColor" className="text-primary" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" className="text-primary" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">Visual Text Analysis</h3>
              <p className="text-muted-foreground text-center">Practice interpreting visual texts, posters, advertisements and infographics.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 2H7C5.89543 2 5 2.89543 5 4V20C5 21.1046 5.89543 22 7 22H17C18.1046 22 19 21.1046 19 20V4C19 2.89543 18.1046 2 17 2Z" stroke="currentColor" className="text-primary" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 18H12.01" stroke="currentColor" className="text-primary" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">Narrative Comprehension</h3>
              <p className="text-muted-foreground text-center">Improve your narrative understanding with story-based comprehension exercises.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19" stroke="currentColor" className="text-primary" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 12H19" stroke="currentColor" className="text-primary" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">Non-Narrative Practice</h3>
              <p className="text-muted-foreground text-center">Master non-fiction texts and build summary writing skills for section C.</p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} Text Champ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
} 