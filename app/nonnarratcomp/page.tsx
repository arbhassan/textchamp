"use client"

import { useState, useEffect } from "react"
import { HelpCircle, X, Home, Save, ArrowRight } from "lucide-react"
import { evaluateAnswers } from "../api/evaluate-answers/utils"
import { QuestionWithAnswer } from "../api/evaluate-answers/types"
import ReactMarkdown from 'react-markdown'
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "../../lib/supabase"

// Define types for our data
interface NonNarrativeExercise {
  id: number
  title: string
  passage_text: string
  time_limit: number
  description?: string
  questions: Question[]
}

interface Question {
  id: number
  question_text: string
  ideal_answer: string
  question_order: number
  marks?: number
}

export default function SectionC() {
  const router = useRouter()
  const [wordCount, setWordCount] = useState(0)
  const [answers, setAnswers] = useState<Record<number | string, string>>({})
  const [feedback, setFeedback] = useState("")
  const [score, setScore] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState({ minutes: 25, seconds: 0 })
  const [saveStatus, setSaveStatus] = useState("")
  const [exercise, setExercise] = useState<NonNarrativeExercise | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  
  // New state variables for handling multiple exercises
  const [allExercises, setAllExercises] = useState<NonNarrativeExercise[]>([])
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [exerciseChanged, setExerciseChanged] = useState(false)
  
  // Fetch all available exercises on initial load
  useEffect(() => {
    async function fetchAllExercises() {
      try {
        const { data, error } = await supabase
          .from('non_narrative_exercises')
          .select('*')
          .order('id')
        
        if (error) throw error
        
        if (data && data.length > 0) {
          setAllExercises(data)
        }
      } catch (error) {
        console.error('Error fetching all exercises:', error)
      }
    }
    
    fetchAllExercises()
  }, [])
  
  // Fetch exercise and questions data from Supabase
  useEffect(() => {
    async function fetchExerciseData() {
      try {
        setLoading(true)
        
        // Check if there's a specific exercise ID in the URL
        const searchParams = new URLSearchParams(window.location.search)
        const exerciseId = searchParams.get('exercise')
        
        // Fetch the non-narrative exercise
        let exerciseQuery = supabase
          .from('non_narrative_exercises')
          .select('*')
        
        // If we have a specific exercise ID, use it
        if (exerciseId) {
          exerciseQuery = exerciseQuery.eq('id', exerciseId)
          // Find the index of this exercise in allExercises
          if (allExercises.length > 0) {
            const index = allExercises.findIndex(ex => ex.id.toString() === exerciseId)
            if (index !== -1) {
              setCurrentExerciseIndex(index)
            }
          }
        } else if (allExercises.length > 0) {
          // If no specific ID is provided, get the first exercise
          exerciseQuery = exerciseQuery.eq('id', allExercises[0].id)
        } else {
          // Fallback to getting the first exercise
          exerciseQuery = exerciseQuery.order('id', { ascending: true }).limit(1)
        }
        
        const { data: exerciseData, error: exerciseError } = await exerciseQuery.single()
        
        if (exerciseError) throw exerciseError
        
        // Set exercise data
        setExercise(exerciseData)
        
        // Get questions from the JSONB field
        const exerciseQuestions = exerciseData.questions as Question[]
        
        // Sort questions by order
        const sortedQuestions = [...exerciseQuestions].sort((a, b) => a.question_order - b.question_order)
        setQuestions(sortedQuestions)
        
        // Set time remaining based on the exercise's time limit (converting from seconds to minutes/seconds)
        const totalSeconds = exerciseData.time_limit || 1500 // Default to 25 minutes if not specified
        setTimeRemaining({
          minutes: Math.floor(totalSeconds / 60),
          seconds: totalSeconds % 60
        })
        
        // Initialize empty answers for each question
        const initialAnswers: Record<number | string, string> = {}
        sortedQuestions.forEach(q => {
          initialAnswers[q.id || `question-${q.question_order}`] = ""
        })
        setAnswers(initialAnswers)
        setExerciseChanged(false)
        
        // Reset word count
        if (sortedQuestions.find(q => q.question_order === 2)) {
          setWordCount(0)
        }
        
        // Check if we're resuming a saved session
        const isResuming = searchParams.get('resume') === 'true'
        if (isResuming) {
          try {
            // Check if this session is completed first
            const recentSessionsStr = localStorage.getItem('recentSessions')
            if (recentSessionsStr) {
              const recentSessions = JSON.parse(recentSessionsStr)
              const sectionSession = recentSessions.find(s => s.id === 'sectionC')
              
              // If session exists and is completed, redirect back to dashboard
              if (sectionSession && sectionSession.status === "completed") {
                router.push('/')
                return
              }
            }
            
            const savedSession = localStorage.getItem('savedSession_sectionC')
            
            if (savedSession) {
              const session = JSON.parse(savedSession)
              
              if (session.answers) {
                setAnswers(session.answers)
                
                // Recalculate word count for answer 2 (summary)
                const summaryQuestionId = sortedQuestions.find(q => q.question_order === 2)?.id
                if (summaryQuestionId && session.answers[summaryQuestionId]) {
                  const words = session.answers[summaryQuestionId].trim().split(/\s+/).filter(Boolean).length
                  setWordCount(words)
                }
              }
              
              if (session.timeRemaining) {
                setTimeRemaining(session.timeRemaining)
              }
            }
          } catch (error) {
            console.error('Error loading saved session:', error)
          }
        }
      } catch (error) {
        console.error('Error fetching exercise data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (allExercises.length > 0 || exerciseChanged) {
      fetchExerciseData()
    }
  }, [allExercises, exerciseChanged])
  
  // Start the timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev.minutes === 0 && prev.seconds === 0) {
          clearInterval(timer)
          // Optionally auto-submit when time is up
          // handleSubmit()
          return prev
        }
        
        if (prev.seconds === 0) {
          return { minutes: prev.minutes - 1, seconds: 59 }
        } else {
          return { minutes: prev.minutes, seconds: prev.seconds - 1 }
        }
      })
    }, 1000)
    
    // Cleanup on unmount
    return () => clearInterval(timer)
  }, [])
  
  // Close feedback modal when ESC key is pressed
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setShowFeedback(false);
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);
  
  // Save the current session progress
  const saveProgress = () => {
    try {
      const sessionData = {
        section: "C",
        name: "Non-Narrative Comprehension",
        answers,
        timeRemaining,
        lastSaved: new Date().toISOString()
      }
      
      // Save current session
      localStorage.setItem('savedSession_sectionC', JSON.stringify(sessionData))
      
      // Save to recent sessions
      const recentSessionsStr = localStorage.getItem('recentSessions')
      const recentSessions = recentSessionsStr ? JSON.parse(recentSessionsStr) : []
      
      // Add to recent sessions, replacing any existing session for this section
      const updatedRecentSessions = [
        {
          id: 'sectionC',
          section: "C",
          name: "Non-Narrative Comprehension",
          progress: Object.values(answers).filter(a => a.trim() !== '').length / Math.max(1, questions.length) * 100,
          lastSaved: new Date().toISOString(),
          status: "in-progress"
        },
        ...recentSessions.filter(s => s.id !== 'sectionC')
      ].slice(0, 5) // Keep only the 5 most recent sessions
      
      localStorage.setItem('recentSessions', JSON.stringify(updatedRecentSessions))
      
      // Show success message briefly
      setSaveStatus("Saved!")
      setTimeout(() => setSaveStatus(""), 2000)
      
    } catch (error) {
      console.error('Error saving progress:', error)
      setSaveStatus("Error saving")
      setTimeout(() => setSaveStatus(""), 2000)
    }
  }
  
  // Format time display properly with leading zeros
  const formatTime = () => {
    const minutes = timeRemaining.minutes.toString().padStart(2, '0')
    const seconds = timeRemaining.seconds.toString().padStart(2, '0') 
    return `${minutes}:${seconds}`
  }

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
    
    // If this is the summary question (question_order === 2), update word count
    const summaryQuestion = questions.find(q => q.question_order === 2)
    const lastQuestion = questions.find(q => q.question_order === questions.length)
    
    // Update word count for summary question or the last question
    if ((summaryQuestion && (questionId === summaryQuestion.id || questionId === `question-${summaryQuestion.question_order}`)) ||
        (lastQuestion && (questionId === lastQuestion.id || questionId === `question-${lastQuestion.question_order}`))) {
      const words = value.trim().split(/\s+/).filter(Boolean).length
      setWordCount(words)
    }
  }

  const handleSubmit = async () => {
    if (!exercise) return
    
    setIsSubmitting(true)
    try {
      const questionsWithAnswers: QuestionWithAnswer[] = questions.map(question => ({
        question: question.question_text,
        idealAnswer: question.ideal_answer,
        userAnswer: answers[question.id || `question-${question.question_order}`] || ""
      }))

      const result = await evaluateAnswers(exercise.passage_text, questionsWithAnswers)
      
      // Check that we have valid feedback and score
      if (result && result.feedback) {
        setFeedback(result.feedback)
        // Ensure score is properly converted to a number
        const finalScore = typeof result.score === 'number' ? result.score : Number(result.score) || 0
        setScore(finalScore)
        setShowFeedback(true)
        
        // Update saved session status to completed
        try {
          // Update the recent sessions list to mark this session as completed
          const recentSessionsStr = localStorage.getItem('recentSessions')
          if (recentSessionsStr) {
            const recentSessions = JSON.parse(recentSessionsStr)
            const updatedRecentSessions = recentSessions.map(session => {
              if (session.id === 'sectionC') {
                return {
                  ...session,
                  progress: 100,
                  lastSaved: new Date().toISOString(),
                  status: "completed"
                }
              }
              return session
            })
            localStorage.setItem('recentSessions', JSON.stringify(updatedRecentSessions))
          }
        } catch (error) {
          console.error('Error updating session status:', error)
        }
        
        // Save this result to localStorage
        try {
          const practiceResult = {
            section: "C",
            name: "Non-Narrative Comprehension",
            score: finalScore,
            completedAt: new Date().toISOString()
          }
          
          // Get existing results from localStorage
          const storedResults = localStorage.getItem('practiceResults')
          const existingResults = storedResults ? JSON.parse(storedResults) : []
          
          // Add new result
          const updatedResults = [...existingResults, practiceResult]
          
          // Save to localStorage
          localStorage.setItem('practiceResults', JSON.stringify(updatedResults))
          
          // Dispatch an event to notify other components that a practice is complete
          window.dispatchEvent(new CustomEvent('practiceComplete'))
        } catch (error) {
          console.error('Error saving practice result:', error)
        }
      } else {
        throw new Error('Received invalid feedback from evaluation')
      }
    } catch (error) {
      console.error('Error evaluating answers:', error)
      setFeedback("There was an error evaluating your answers. Please try again.")
      setScore(0)
      setShowFeedback(true)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Function to calculate the circumference for the circular progress bar
  const calculateCircleProgress = (score) => {
    const radius = 50
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (score / 5) * circumference
    return { circumference, offset }
  }
  
  // Format feedback with line breaks and highlight key points
  const formatFeedback = (feedbackText) => {
    if (!feedbackText) return ""
    
    // Ensure feedbackText is a string
    const feedbackString = String(feedbackText)
    
    // Return the markdown content directly - we'll use ReactMarkdown to render it
    return feedbackString
  }

  // Function to navigate to next exercise
  const handleNextExercise = () => {
    if (currentExerciseIndex < allExercises.length - 1) {
      const nextIndex = currentExerciseIndex + 1
      setCurrentExerciseIndex(nextIndex)
      
      // Update URL without refreshing the page
      const nextExerciseId = allExercises[nextIndex].id
      const url = new URL(window.location.href)
      url.searchParams.set('exercise', nextExerciseId.toString())
      window.history.pushState({}, '', url.toString())
      
      // Reset states for the new exercise
      setAnswers({})
      setFeedback("")
      setScore(null)
      setShowFeedback(false)
      setWordCount(0)
      setExerciseChanged(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f9ff] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exercise...</p>
        </div>
      </div>
    )
  }

  if (!exercise || questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f9ff] flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-xl shadow-sm max-w-md">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Exercise Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find the requested exercise. It may not exist or there was an error loading it.</p>
          <Link href="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors">
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f9ff]">
      {/* Header */}
      <header className="border-b bg-white py-4 px-6 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors">
              <Home size={18} />
            </Link>
            <h1 className="text-xl font-medium text-gray-800">Section C – Non-Narrative Comprehension + Summary</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <button 
                onClick={saveProgress}
                className="flex items-center gap-2 bg-green-100 text-green-600 px-3 py-1.5 rounded-md hover:bg-green-200 transition-colors"
              >
                <Save size={16} />
                <span>Save progress</span>
              </button>
              {saveStatus && (
                <div className="absolute top-full right-0 mt-1 bg-white p-2 rounded shadow-md text-sm">
                  {saveStatus}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{formatTime()}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 flex flex-col h-[calc(100vh-80px)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow overflow-hidden">
          {/* Left panel - Passage Display */}
          <div className="bg-white rounded-2xl shadow-sm p-6 overflow-y-auto max-h-[calc(100vh-180px)]">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{exercise.title}</h2>
            <div className="whitespace-pre-wrap prose max-w-none text-gray-700">
              {exercise.passage_text.split('\n\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Right panel - Questions */}
          <div className="overflow-y-auto pr-2 max-h-[calc(100vh-180px)]">
            <div className="space-y-6">
              {questions.map((question) => (
                <div key={question.id || `question-${question.question_order}`} className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600 font-medium text-sm flex-shrink-0">
                      {question.question_order}
                    </div>
                    <h3 className="text-gray-700 flex-grow">
                      {question.question_text}
                    </h3>
                    <div className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-md whitespace-nowrap">
                      {question.marks || 1} {(question.marks || 1) === 1 ? 'mark' : 'marks'}
                    </div>
                  </div>
                  
                  <div>
                    <textarea
                      className="w-full h-24 p-4 border border-gray-200 text-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Type your answer here..."
                      value={answers[question.id || `question-${question.question_order}`] || ""}
                      onChange={(e) => handleAnswerChange(question.id || `question-${question.question_order}`, e.target.value)}
                    />
                    {/* Display word counter for the last question */}
                    {question.question_order === questions.length && (
                      <div className="flex justify-end mt-2">
                        <span className="text-sm text-gray-500">
                          Words: {answers[question.id || `question-${question.question_order}`]?.trim().split(/\s+/).filter(Boolean).length || 0}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feedback modal */}
        {showFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24">
                      <svg className="w-full h-full" viewBox="0 0 120 120">
                        <circle 
                          cx="60" 
                          cy="60" 
                          r="50" 
                          fill="none" 
                          stroke="#e5e7eb" 
                          strokeWidth="12"
                        />
                        {score !== null && (
                          <circle 
                            cx="60" 
                            cy="60" 
                            r="50" 
                            fill="none" 
                            stroke={score >= 3 ? "#4ade80" : "#f87171"} 
                            strokeWidth="12"
                            strokeDasharray={calculateCircleProgress(score).circumference}
                            strokeDashoffset={calculateCircleProgress(score).offset}
                            transform="rotate(-90 60 60)"
                            strokeLinecap="round"
                          />
                        )}
                        <text 
                          x="60" 
                          y="60" 
                          textAnchor="middle" 
                          dominantBaseline="middle" 
                          fill="#111827" 
                          fontSize="30" 
                          fontWeight="bold"
                        >
                          {score !== null ? score : "?"}
                        </text>
                        <text 
                          x="60" 
                          y="80" 
                          textAnchor="middle" 
                          dominantBaseline="middle" 
                          fill="#6b7280" 
                          fontSize="16"
                        >
                          /5
                        </text>
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Your Feedback</h2>
                      <p className="text-gray-600">
                        Here's how you did on the non-narrative comprehension section
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowFeedback(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="prose max-w-none text-gray-700 mt-4">
                  <ReactMarkdown>{formatFeedback(feedback)}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation - Fixed at bottom */}
        <div className="mt-6 flex justify-end pt-4">
          <div className="flex gap-4">
            {currentExerciseIndex < allExercises.length - 1 && (
              <button
                onClick={handleNextExercise}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full shadow-sm transition-colors font-medium"
              >
                <span>Next Exercise</span>
                <ArrowRight size={20} />
              </button>
            )}
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex items-center gap-2 ${
                isSubmitting ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600'
              } text-white px-6 py-3 rounded-full shadow-sm transition-colors font-medium`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Test'}
              {!isSubmitting && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M5 12H19M19 12L12 5M19 12L12 19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

