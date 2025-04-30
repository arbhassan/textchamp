"use client"

import { useEffect, useState } from "react"
import { Bell, Clock, HelpCircle, Moon, Play, CheckCircle, Clock3, Sun, Eye } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useTheme } from "next-themes"
import { Header } from "@/components/header"
import Link from "next/link"
import { ExerciseReviewModal } from "@/components/exercise-review-modal"

// Define the type for a practice result
interface PracticeResult {
  section: string;
  score: number;
  completedAt: string;
  name: string;
}

// Define the type for a saved session
interface SavedSession {
  id: string;
  section: string;
  name: string;
  progress: number;
  lastSaved: string;
  status?: "completed" | "in-progress"; // optional status field with union type
}

export default function Dashboard() {
  const { theme, setTheme } = useTheme()
  const [practiceResults, setPracticeResults] = useState<PracticeResult[]>([])
  const [recentSessions, setRecentSessions] = useState<SavedSession[]>([])
  const [totalPractices, setTotalPractices] = useState(20)
  const [completedPractices, setCompletedPractices] = useState(0)
  const [progressPercentage, setProgressPercentage] = useState(0)
  const [weeklyCompleted, setWeeklyCompleted] = useState(0)
  const [weeklyTarget, setWeeklyTarget] = useState(5)
  const [latestAchievement, setLatestAchievement] = useState<{title: string, detail: string} | null>(null)
  
  // Add state for review modal
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedSession, setSelectedSession] = useState<SavedSession | null>(null)
  
  useEffect(() => {
    // Load practice results from localStorage
    const loadResults = () => {
      try {
        const storedResults = localStorage.getItem('practiceResults')
        const results: PracticeResult[] = storedResults ? JSON.parse(storedResults) : []
        setPracticeResults(results)
        
        // Calculate completed practices
        setCompletedPractices(results.length)
        
        // Calculate progress percentage
        const percentage = totalPractices > 0 ? Math.round((results.length / totalPractices) * 100) : 0
        setProgressPercentage(percentage)
        
        // Calculate weekly completion
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        
        const completedThisWeek = results.filter(result => {
          const completedDate = new Date(result.completedAt)
          return completedDate >= oneWeekAgo
        }).length
        
        setWeeklyCompleted(completedThisWeek)
        
        // Set latest achievement
        if (results.length > 0) {
          // Sort by date (newest first)
          const sortedResults = [...results].sort((a, b) => 
            new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
          )
          
          const latest = sortedResults[0]
          let achievementTitle = latest.name
          let detail = ""
          
          // Determine achievement detail based on score
          if (latest.section === "A") {
            detail = "Visual interpretation improved"
          } else if (latest.section === "B") {
            detail = "Narrative comprehension improved"
          } else if (latest.section === "C") {
            detail = "Summary writing improved"
          }
          
          setLatestAchievement({
            title: achievementTitle,
            detail: detail
          })
        }
        
        // Load recent sessions
        const recentSessionsStr = localStorage.getItem('recentSessions')
        if (recentSessionsStr) {
          const sessions: SavedSession[] = JSON.parse(recentSessionsStr)
          setRecentSessions(sessions)
        }
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }
    
    // Set up event listener for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'practiceResults' || e.key === 'recentSessions') {
        loadResults()
      }
    }
    
    // Load initial data
    loadResults()
    
    // Add event listener for changes from other tabs/windows
    window.addEventListener('storage', handleStorageChange)
    
    // Add event listener for custom event from the section pages
    const handlePracticeComplete = (e: CustomEvent) => {
      loadResults()
    }
    
    window.addEventListener('practiceComplete', handlePracticeComplete as EventListener)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('practiceComplete', handlePracticeComplete as EventListener)
    }
  }, [totalPractices])
  
  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }
  
  // Get the session URL based on section
  const getSessionUrl = (sessionId: string) => {
    // Check if the session is completed - if so, don't allow resuming
    const session = recentSessions.find(s => s.id === sessionId)
    if (session?.status === "completed") {
      return "/" // Just go to the dashboard if session is completed
    }
    
    // Base URL paths
    let url = '/'
    
    if (sessionId === 'sectionA') url = '/visualtextcomp'
    else if (sessionId === 'sectionB') url = '/narratcomp'
    else if (sessionId === 'sectionC') url = '/nonnarratcomp'
    else if (sessionId === 'fullPractice') url = '/fullpractice'
    
    // Add resume parameter to indicate we're resuming a saved session
    return `${url}?resume=true`
  }
  
  // Save a new practice result to localStorage
  const savePracticeResult = (result: PracticeResult) => {
    try {
      const storedResults = localStorage.getItem('practiceResults')
      const existingResults: PracticeResult[] = storedResults ? JSON.parse(storedResults) : []
      
      // Add new result
      const updatedResults = [...existingResults, result]
      
      // Save to localStorage
      localStorage.setItem('practiceResults', JSON.stringify(updatedResults))
      
      // Dispatch event to notify that practice is complete
      window.dispatchEvent(new CustomEvent('practiceComplete'))
      
      // Update state
      setPracticeResults(updatedResults)
    } catch (error) {
      console.error("Error saving practice result:", error)
    }
  }
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // For testing purposes - clears all progress data
  const clearProgressData = () => {
    localStorage.removeItem('practiceResults')
    window.dispatchEvent(new CustomEvent('practiceComplete'))
  }

  // Function to show review modal for a completed session
  const handleShowReview = (session: SavedSession, e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigating to the session URL
    if (session.status === "completed") {
      setSelectedSession(session)
      setShowReviewModal(true)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <Header completedCount={weeklyCompleted} targetCount={weeklyTarget} />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Overall Progress */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Overall Progress</h2>
                  <p className="text-muted-foreground mt-6">{completedPractices} of {totalPractices} practices complete</p>
                </div>
                <div className="relative w-20 h-20">
                  <div className="w-20 h-20 rounded-full border-[8px] border-muted"></div>
                  <svg className="absolute top-0 left-0 w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="46"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="8"
                      strokeDasharray="289.02652413026095"
                      strokeDashoffset={`${289.02652413026095 - (progressPercentage / 100) * 289.02652413026095}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-primary">
                    {progressPercentage}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Latest Achievement */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="mt-1 text-amber-500">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 15C8.7 15 6 12.3 6 9V3.5C6 3.2 6.2 3 6.5 3H17.5C17.8 3 18 3.2 18 3.5V9C18 12.3 15.3 15 12 15Z"
                      fill="currentColor"
                    />
                    <path
                      d="M17 18H7C7 18 5 17.5 5 15.5V14.5C5 14.2 5.2 14 5.5 14H18.5C18.8 14 19 14.2 19 14.5V15.5C19 17.5 17 18 17 18Z"
                      fill="currentColor"
                    />
                    <path d="M12 21C13.1 21 14 20.1 14 19H10C10 20.1 10.9 21 12 21Z" fill="currentColor" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Latest Achievement</h2>
                  <div className="mt-4">
                    <p className="font-medium text-foreground">{latestAchievement?.title || "No achievements yet"}</p>
                    <p className="text-muted-foreground">{latestAchievement?.detail || "Complete a practice to earn achievements"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Goal */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="mt-1 text-purple-500">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M16 11C16 13.2091 14.2091 15 12 15C9.79086 15 8 13.2091 8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11Z"
                      fill="currentColor"
                    />
                    <path
                      d="M12 19C15.866 19 19 15.866 19 12V10H5V12C5 15.866 8.13401 19 12 19Z"
                      fill="currentColor"
                      fillOpacity="0.5"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Next Goal</h2>
                  <div className="mt-4">
                    <p className="font-medium text-foreground">Complete 5 more practices</p>
                    <p className="text-muted-foreground">to unlock advanced insights</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Practice Sections */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-foreground mb-6">Practice Sections</h2>

          {/* Full Comprehension Practice */}
          <Link href="/fullpractice">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 mb-6 text-white shadow-md hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold mb-1">Full Comprehension Practice</h3>
                  <p className="text-blue-100 mb-4">Simulates Sections A, B, C in one go</p>
                  <div className="inline-flex items-center gap-2 bg-blue-400/30 px-3 py-1.5 rounded-full">
                    <Clock size={16} />
                    <span>1 hour 50 min</span>
                  </div>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <Play className="w-8 h-8 text-white" fill="white" />
                </div>
              </div>
            </div>
          </Link>

          {/* Section Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Section A */}
            <Card className="shadow-sm bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-amber-200 dark:bg-amber-800 p-2 rounded-lg">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M4 16L8.586 11.414C8.96106 11.0391 9.46967 10.8284 10 10.8284C10.5303 10.8284 11.0389 11.0391 11.414 11.414L16 16M14 14L15.586 12.414C15.9611 12.0391 16.4697 11.8284 17 11.8284C17.5303 11.8284 18.0389 12.0391 18.414 12.414L20 14M14 8H14.01M6 20H18C18.5304 20 19.0391 19.7893 19.4142 19.4142C19.7893 19.0391 20 18.5304 20 18V6C20 5.46957 19.7893 4.96086 19.4142 4.58579C19.0391 4.21071 18.5304 4 18 4H6C5.46957 4 4.96086 4.21071 4.58579 4.58579C4.21071 4.96086 4 5.46957 4 6V18C4 18.5304 4.21071 19.0391 4.58579 19.4142C4.96086 19.7893 5.46957 20 6 20Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="text-amber-700 dark:text-amber-300">~25 mins</div>
                </div>
                <h3 className="text-lg font-bold text-amber-800 dark:text-amber-200 mb-2">Section A</h3>
                <p className="text-amber-700 dark:text-amber-300 mb-4">Interpret posters, ads & infographics</p>
                <p className="text-amber-600 dark:text-amber-400 text-sm">5 marks</p>
                <div className="mt-4">
                  <Link 
                    href="/visualtextcomp" 
                    className="inline-flex items-center gap-1 text-amber-800 dark:text-amber-200 font-medium hover:underline"
                  >
                    Start practice
                    <span className="w-4 h-4">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M5 12H19M19 12L12 5M19 12L12 19"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Section B */}
            <Card className="shadow-sm bg-orange-50 dark:bg-orange-950/20">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-orange-200 dark:bg-orange-800 p-2 rounded-lg">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15M9 5C9 5.53043 9.21071 6.03914 9.58579 6.41421C9.96086 6.78929 10.4696 7 11 7H13C13.5304 7 14.0391 6.78929 14.4142 6.41421C14.7893 6.03914 15 5.53043 15 5M9 5C9 4.46957 9.21071 3.96086 9.58579 3.58579C9.96086 3.21071 10.4696 3 11 3H13C13.5304 3 14.0391 3.21071 14.4142 3.58579C14.7893 3.96086 15 4.46957 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="text-orange-700 dark:text-orange-300">~40 mins</div>
                </div>
                <h3 className="text-lg font-bold text-orange-800 dark:text-orange-200 mb-2">Section B</h3>
                <p className="text-orange-700 dark:text-orange-300 mb-4">Practice story-based questions</p>
                <p className="text-orange-600 dark:text-orange-400 text-sm">20 marks</p>
                <div className="mt-4">
                  <Link 
                    href="/narratcomp" 
                    className="inline-flex items-center gap-1 text-orange-800 dark:text-orange-200 font-medium hover:underline"
                  >
                    Start practice
                    <span className="w-4 h-4">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M5 12H19M19 12L12 5M19 12L12 19"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Section C */}
            <Card className="shadow-sm bg-purple-50 dark:bg-purple-950/20">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-purple-200 dark:bg-purple-800 p-2 rounded-lg">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M15.232 5.232L18.768 8.768M16.732 3.732L20.268 7.268C20.5607 7.56068 20.7246 7.96168 20.7246 8.3795C20.7246 8.79732 20.5607 9.19832 20.268 9.491L9.49997 20.259C9.17997 20.579 8.76997 20.779 8.32997 20.829L3.16997 21.499C3.05956 21.5148 2.94647 21.5032 2.84192 21.4651C2.73737 21.427 2.64459 21.3637 2.57189 21.281C2.49919 21.1983 2.44883 21.0986 2.42535 20.9905C2.40187 20.8823 2.40602 20.7694 2.43697 20.663L3.16997 15.67C3.21997 15.23 3.41997 14.82 3.73997 14.5L14.508 3.732C14.8007 3.43932 15.2017 3.27539 15.6195 3.27539C16.0373 3.27539 16.4383 3.43932 16.731 3.732H16.732Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="text-purple-700 dark:text-purple-300">~45 mins</div>
                </div>
                <h3 className="text-lg font-bold text-purple-800 dark:text-purple-200 mb-2">Section C</h3>
                <p className="text-purple-700 dark:text-purple-300 mb-4">Answer non-fiction + summary writing</p>
                <p className="text-purple-600 dark:text-purple-400 text-sm">25 marks</p>
                <div className="mt-4">
                  <Link 
                    href="/nonnarratcomp" 
                    className="inline-flex items-center gap-1 text-purple-800 dark:text-purple-200 font-medium hover:underline"
                  >
                    Start practice
                    <span className="w-4 h-4">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M5 12H19M19 12L12 5M19 12L12 19"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-foreground mb-6">Recent Sessions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentSessions.length > 0 ? (
              recentSessions.map((session) => (
                <Link 
                  href={getSessionUrl(session.id)} 
                  key={session.id} 
                  title={session.status === "completed" ? "View this completed session" : "Continue this session"}
                  className={`block ${session.status === "completed" ? "cursor-pointer" : ""}`}
                  onClick={session.status === "completed" ? (e) => handleShowReview(session, e) : undefined}
                >
                  <Card className={`shadow-sm ${session.status === "completed" ? "opacity-95" : "hover:shadow-md transition-shadow"}`}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          {session.status === "completed" ? (
                            <>
                              <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-1 rounded-md">
                                <CheckCircle size={16} />
                              </div>
                              <span className="text-sm text-green-600 dark:text-green-400 font-medium">Completed</span>
                            </>
                          ) : (
                            <>
                              <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-1 rounded-md">
                                <Clock3 size={16} />
                              </div>
                              <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">In Progress</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{Math.round(session.progress)}% Complete</span>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-1">{session.name}</h3>
                      <p className="text-muted-foreground">Last saved {formatDate(session.lastSaved)}</p>
                      {session.status === "completed" && (
                        <div className="flex items-center gap-1 mt-2 text-sm text-blue-600 dark:text-blue-400">
                          <Eye size={14} />
                          <span>View Review</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-2 text-center p-6 bg-gray-50 dark:bg-gray-800/20 rounded-lg">
                <p className="text-muted-foreground">No saved sessions found. Start a practice and use the save button to track your progress.</p>
              </div>
            )}
          </div>
        </div>

        {/* Tips & Resources */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-6">Tips & Resources</h2>
          {/* This section is partially visible in the screenshot */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <p className="text-muted-foreground">Resources will appear here</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Review Modal */}
      <ExerciseReviewModal 
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        sessionData={selectedSession}
      />
    </div>
  )
}

