"use client"

import { useState, useEffect } from "react"
import { Search, HelpCircle, X, Home, Save, ArrowRight } from "lucide-react"
import { evaluateAnswers } from "../api/evaluate-answers/utils"
import { QuestionWithAnswer } from "../api/evaluate-answers/types"
import ReactMarkdown from 'react-markdown'
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "../../lib/supabase"
import { VisualExercise, Question } from "../../lib/types"

export default function SectionA() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(2)
  const totalQuestions = 5
  const [answers, setAnswers] = useState({})
  const [feedback, setFeedback] = useState("")
  const [score, setScore] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState({ minutes: 12, seconds: 30 })
  const [saveStatus, setSaveStatus] = useState("")
  const [exercise, setExercise] = useState<VisualExercise | null>(null)
  const [questions, setQuestions] = useState<Record<number, Question>>({})
  const [loading, setLoading] = useState(true)
  
  // New state variables for handling multiple exercises
  const [allExercises, setAllExercises] = useState<VisualExercise[]>([])
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [exerciseChanged, setExerciseChanged] = useState(false)
  
  // Fetch all available exercises on initial load
  useEffect(() => {
    async function fetchAllExercises() {
      try {
        const { data, error } = await supabase
          .from('visual_exercises')
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
        
        // Fetch the visual exercise
        let exerciseQuery = supabase
          .from('visual_exercises')
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
          // Fallback to the exercise with the title
          exerciseQuery = exerciseQuery.eq('title', 'Visual Text Comprehension')
        }
        
        const { data: exerciseData, error: exerciseError } = await exerciseQuery.single()
        
        if (exerciseError) throw exerciseError
        
        setExercise(exerciseData)
        
        // Fetch questions for this exercise
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('exercise_id', exerciseData.id)
          .order('question_order', { ascending: true })
        
        if (questionsError) throw questionsError
        
        // Convert array to record object with question id as key
        const questionRecord = questionsData.reduce((acc, question) => {
          acc[question.id] = question
          return acc
        }, {})
        
        setQuestions(questionRecord)
        
        // Initialize answers state with empty strings for each question
        const initialAnswers = questionsData.reduce((acc, question) => {
          acc[question.id] = ""
          return acc
        }, {})
        
        setAnswers(initialAnswers)
        setExerciseChanged(false)
        
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
  
  // Load saved progress when component mounts
  useEffect(() => {
    // Check if we're resuming a saved session
    const searchParams = new URLSearchParams(window.location.search)
    const isResuming = searchParams.get('resume') === 'true'
    
    if (isResuming) {
      try {
        // Check if this session is completed first
        const recentSessionsStr = localStorage.getItem('recentSessions')
        if (recentSessionsStr) {
          const recentSessions = JSON.parse(recentSessionsStr)
          const sectionSession = recentSessions.find(s => s.id === 'sectionA')
          
          // If session exists and is completed, redirect back to dashboard
          if (sectionSession && sectionSession.status === "completed") {
            router.push('/')
            return
          }
        }
        
        const savedSession = localStorage.getItem('savedSession_sectionA')
        
        if (savedSession) {
          const session = JSON.parse(savedSession)
          
          if (session.answers) {
            setAnswers(session.answers)
          }
          
          if (session.timeRemaining) {
            setTimeRemaining(session.timeRemaining)
          }
        }
      } catch (error) {
        console.error('Error loading saved session:', error)
      }
    }
  }, [router])
  
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
        section: "A",
        name: "Visual Text Comprehension",
        answers,
        timeRemaining,
        lastSaved: new Date().toISOString()
      }
      
      // Save current session
      localStorage.setItem('savedSession_sectionA', JSON.stringify(sessionData))
      
      // Save to recent sessions
      const recentSessionsStr = localStorage.getItem('recentSessions')
      const recentSessions = recentSessionsStr ? JSON.parse(recentSessionsStr) : []
      
      // Calculate progress based on non-empty answers
      const questionCount = Object.keys(questions).length || 1  // Avoid division by zero
      const answeredCount = Object.values(answers).filter(a => a && String(a).trim() !== '').length
      const progressPercentage = (answeredCount / questionCount) * 100
      
      // Add to recent sessions, replacing any existing session for this section
      const updatedRecentSessions = [
        {
          id: 'sectionA',
          section: "A",
          name: "Visual Text Comprehension",
          progress: progressPercentage,
          lastSaved: new Date().toISOString(),
          status: "in-progress"
        },
        ...recentSessions.filter(s => s.id !== 'sectionA')
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
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Use the exercise description or a fallback
      const visualDescription = exercise?.description || "An environmental awareness advertisement showing the impact of human actions on the environment.";
      
      // Convert questions and answers to the format expected by evaluateAnswers
      const questionsWithAnswers: QuestionWithAnswer[] = Object.values(questions).map(q => ({
        question: q.text,
        idealAnswer: q.ideal_answer,
        userAnswer: answers[q.id] || ""
      }));

      const result = await evaluateAnswers(visualDescription, questionsWithAnswers);
      
      // Check that we have valid feedback and score
      if (result && result.feedback) {
        // Store feedback and score in localStorage instead of showing inline
        const finalScore = typeof result.score === 'number' ? result.score : Number(result.score) || 0;
        
        // Save results to localStorage with questions data
        try {
          const sessionData = {
            section: "A",
            name: "Visual Text Comprehension",
            answers,
            questions, // Include questions data
            feedback: result.feedback,
            score: finalScore,
            lastSaved: new Date().toISOString()
          }
          
          // Save current session with feedback and score
          localStorage.setItem('savedSession_sectionA', JSON.stringify(sessionData))
          
          // Update recent sessions list to mark this session as completed
          const recentSessionsStr = localStorage.getItem('recentSessions')
          if (recentSessionsStr) {
            const recentSessions = JSON.parse(recentSessionsStr)
            const updatedRecentSessions = recentSessions.map(session => {
              if (session.id === 'sectionA') {
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
          } else {
            // If there are no recent sessions yet, create one for this completed session
            const newSession = {
              id: 'sectionA',
              section: "A", 
              name: "Visual Text Comprehension",
              progress: 100,
              lastSaved: new Date().toISOString(),
              status: "completed"
            };
            localStorage.setItem('recentSessions', JSON.stringify([newSession]))
          }
          
          // Save result to practice results too
          const practiceResult = {
            section: "A",
            name: "Visual Text Comprehension",
            score: finalScore,
            completedAt: new Date().toISOString()
          };
          
          // Get existing results from localStorage
          const storedResults = localStorage.getItem('practiceResults');
          const existingResults = storedResults ? JSON.parse(storedResults) : [];
          
          // Add new result
          const updatedResults = [...existingResults, practiceResult];
          
          // Save to localStorage
          localStorage.setItem('practiceResults', JSON.stringify(updatedResults));
          
          // Redirect to the feedback page
          router.push('/visualtextcomp/feedback');
          
        } catch (error) {
          console.error('Error saving session data:', error)
          
          // Show fallback error message
          setFeedback("There was an error saving your results. Please try again.");
          setScore(0);
          setShowFeedback(true);
        }
      } else {
        throw new Error('Received invalid feedback from evaluation');
      }
    } catch (error) {
      console.error('Error evaluating answers:', error);
      setFeedback("There was an error evaluating your answers. Please try again.");
      setScore(0);
      setShowFeedback(true);
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
      setExerciseChanged(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f9ff] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exercise data...</p>
        </div>
      </div>
    );
  }

  // If no exercise found
  if (!exercise) {
    return (
      <div className="min-h-screen bg-[#f5f9ff] flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-sm">
          <div className="text-red-500 mb-4">
            <X size={48} className="mx-auto" />
          </div>
          <h2 className="text-2xl font-medium text-gray-800 mb-2">Exercise Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find the exercise data. This could be due to a connection issue or the exercise might not exist.</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            <Home size={20} />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    );
  }

  // Process questions once for use in multiple places
  const sortedQuestions = Object.values(questions).sort((a, b) => a.question_order - b.question_order);

  // If feedback is shown (will only happen on error), render the feedback error message
  if (showFeedback) {
    return (
      <div className="min-h-screen bg-[#f5f9ff] flex flex-col">
        <header className="border-b bg-white py-4 px-6 flex-shrink-0">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors">
                <Home size={18} />
              </Link>
              <h1 className="text-xl font-medium text-gray-800">Error Processing Results</h1>
            </div>
          </div>
        </header>

        <main className="flex-grow max-w-5xl mx-auto w-full px-6 py-10">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex items-center gap-4 mb-6 text-red-500">
              <X size={32} />
              <h2 className="text-2xl font-medium">An Error Occurred</h2>
            </div>
            
            <p className="text-gray-700 mb-6">{feedback}</p>
            
            <div className="flex gap-4">
              <button
                onClick={() => setShowFeedback(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Return to Test
              </button>
              
              <Link 
                href="/" 
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="h-screen bg-[#f5f9ff] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b bg-white py-4 px-6 flex-shrink-0">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors">
              <Home size={18} />
            </Link>
            <h1 className="text-xl font-medium text-gray-800">Section A – {exercise.title || "Visual Text Comprehension"}</h1>
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

      <main className="flex flex-col max-w-7xl mx-auto px-6 py-8 flex-grow w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-13rem)]">
          {/* Left panel - Image Display */}
          <div className="overflow-y-auto pr-2 pb-2">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden h-auto">
              <img 
                src={exercise.image_url || "/environment-awareness.jpg"} 
                alt={exercise.title || "Visual Exercise"} 
                className="w-full" 
              />
              <div className="p-4 flex justify-center">
              </div>
            </div>
          </div>

          {/* Right panel - Questions */}
          <div className="overflow-y-auto pr-2 pb-2 space-y-6">
            {sortedQuestions.map((question, index) => (
              <div key={question.id} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex flex-wrap items-start gap-4 mb-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600 font-medium">
                    {index + 1}
                  </div>
                  <h2 className="flex-1 text-lg font-medium text-gray-800">{question.text}</h2>
                  <div className="flex-shrink-0 text-sm text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-md">
                    {question.marks || 1} {(question.marks || 1) === 1 ? 'mark' : 'marks'}
                  </div>
                </div>
                <div>
                  <textarea
                    className="w-full h-24 p-4 border border-gray-200 text-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Type your answer here..."
                    value={answers[question.id] || ""}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          <div></div> {/* Empty div for flex justification */}
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

