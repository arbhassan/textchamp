"use client"

import { useState, useEffect } from "react"
import { HelpCircle, X, Home, Save, ArrowRight } from "lucide-react"
import { evaluateAnswers } from "../api/evaluate-answers/utils"
import { QuestionWithAnswer } from "../api/evaluate-answers/types"
import ReactMarkdown from 'react-markdown'
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "../../lib/supabase"
import React from "react"

// Define types for our data
interface NarrativeExercise {
  id: number
  title: string
  story_text: string
  time_limit: number
  description?: string
  exercise_type: "questions" | "combined" // Only questions and combined types
  questions?: Question[]
  flowchart?: FlowChartExercise // Add flowchart data
  has_flowchart?: boolean // Flag to indicate if exercise has flowchart component
}

interface Question {
  id: number
  question_text: string
  ideal_answer: string
  question_order: number
  marks?: number
}

// New type for flowchart exercise
interface FlowChartExercise {
  options: string[]
  sections: FlowChartSection[]
}

interface FlowChartSection {
  id: number
  name: string
  paragraphs: string // e.g., "1-2" or "5"
}

export default function SectionB() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [answers, setAnswers] = useState<Record<number | string, string>>({})
  const [feedback, setFeedback] = useState("")
  const [score, setScore] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState({ minutes: 30, seconds: 0 })
  const [saveStatus, setSaveStatus] = useState("")
  const [exercise, setExercise] = useState<NarrativeExercise | null>(null)
  const [questions, setQuestions] = useState<Record<number, Question>>({})
  const [loading, setLoading] = useState(true)
  const [totalQuestions, setTotalQuestions] = useState(0)
  
  // New state variables for handling multiple exercises
  const [allExercises, setAllExercises] = useState<NarrativeExercise[]>([])
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [exerciseChanged, setExerciseChanged] = useState(false)
  
  // Fetch all available exercises on initial load
  useEffect(() => {
    async function fetchAllExercises() {
      try {
        const { data, error } = await supabase
          .from('narrative_exercises')
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
        
        // Fetch the narrative exercise
        let exerciseQuery = supabase
          .from('narrative_exercises')
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
        }
        
        const { data: exerciseData, error: exerciseError } = await exerciseQuery.single()
        
        if (exerciseError) throw exerciseError
        
        setExercise(exerciseData)
        
        // Set time limit from exercise
        if (exerciseData.time_limit) {
          setTimeRemaining({ 
            minutes: Math.floor(exerciseData.time_limit / 60), 
            seconds: exerciseData.time_limit % 60 
          })
        }
        
        // Initialize answers based on exercise type
        if ((exerciseData.exercise_type === "questions" || exerciseData.exercise_type === "combined") && exerciseData.questions) {
          // Get questions from the exercise data
          const questionsData = exerciseData.questions || []
          
          // Convert array to record object with question id as key
          const questionRecord = questionsData.reduce((acc, question) => {
            // Make sure each question has an id property
            const questionId = question.id || questionsData.indexOf(question) + 1;
            acc[questionId] = {
              ...question,
              id: questionId, // Ensure the id property exists
            };
            return acc
          }, {})
          
          setQuestions(questionRecord)
          
          // Initialize answers state with empty strings for each question
          const initialAnswers = questionsData.reduce((acc, question) => {
            const questionId = question.id || questionsData.indexOf(question) + 1;
            acc[questionId] = ""
            return acc
          }, {})
          
          setAnswers(initialAnswers)
          setTotalQuestions(questionsData.length)
        }
        
        // Initialize flowchart answers if exercise has flowchart component (only for combined type)
        if (exerciseData.exercise_type === "combined" && exerciseData.flowchart) {
          // Initialize flowchart answers
          const initialFlowchartAnswers = exerciseData.flowchart.sections.reduce((acc, section, idx) => {
            const sectionId = section.id || `section-${idx}`;
            acc[sectionId] = ""
            return acc
          }, {})
          
          // For combined exercises, merge with existing answers
          setAnswers(prev => ({...prev, ...initialFlowchartAnswers}))
          setTotalQuestions(prev => prev + exerciseData.flowchart.sections.length)
        }
        
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
          const sectionSession = recentSessions.find(s => s.id === 'sectionB')
          
          // If session exists and is completed, redirect back to dashboard
          if (sectionSession && sectionSession.status === "completed") {
            router.push('/')
            return
          }
        }
        
        const savedSession = localStorage.getItem('savedSession_sectionB')
        
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
        section: "B",
        name: "Narrative Comprehension",
        answers,
        timeRemaining,
        lastSaved: new Date().toISOString()
      }
      
      // Save current session
      localStorage.setItem('savedSession_sectionB', JSON.stringify(sessionData))
      
      // Save to recent sessions
      const recentSessionsStr = localStorage.getItem('recentSessions')
      const recentSessions = recentSessionsStr ? JSON.parse(recentSessionsStr) : []
      
      // Calculate progress based on non-empty answers
      const questionCount = exercise?.exercise_type === "questions" 
        ? Object.keys(questions).length 
        : (exercise?.flowchart?.sections.length || 0);
      
      const answeredCount = Object.values(answers).filter(a => a && String(a).trim() !== '').length
      const progressPercentage = questionCount ? (answeredCount / questionCount) * 100 : 0
      
      // Add to recent sessions, replacing any existing session for this section
      const updatedRecentSessions = [
        {
          id: 'sectionB',
          section: "B",
          name: "Narrative Comprehension",
          progress: progressPercentage,
          lastSaved: new Date().toISOString(),
          status: "in-progress"
        },
        ...recentSessions.filter(s => s.id !== 'sectionB')
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

  const handleAnswerChange = (id, value) => {
    setAnswers(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      if (!exercise) {
        throw new Error('No exercise data available')
      }
      
      let result;
      
      if (exercise.exercise_type === "questions") {
        // Prepare the questions with answers for evaluation
        const questionsWithAnswers: QuestionWithAnswer[] = Object.values(questions).map(q => ({
          question: q.question_text,
          idealAnswer: q.ideal_answer,
          userAnswer: answers[q.id] || ''
        }));
  
        result = await evaluateAnswers(exercise.story_text, questionsWithAnswers);
      } 
      else if (exercise.exercise_type === "combined") {
        // For combined exercises, evaluate both parts
        let questionScore = 0;
        let flowchartScore = 0;
        let questionFeedback = "";
        let flowchartFeedback = "";
        
        // Evaluate questions if present
        if (exercise.questions && exercise.questions.length > 0) {
          const questionsWithAnswers: QuestionWithAnswer[] = Object.values(questions).map(q => ({
            question: q.question_text,
            idealAnswer: q.ideal_answer,
            userAnswer: answers[q.id] || ''
          }));
          
          const questionResult = await evaluateAnswers(exercise.story_text, questionsWithAnswers);
          questionScore = typeof questionResult.score === 'number' ? questionResult.score : Number(questionResult.score) || 0;
          questionFeedback = questionResult.feedback || "";
        }
        
        // Evaluate flowchart if present
        if (exercise.flowchart) {
          // Implement basic evaluation for flowchart answers
          const flowchartSections = exercise.flowchart.sections;
          const correctAnswers = flowchartSections.filter((section, idx) => {
            const sectionId = section.id || `section-${idx}`;
            const userAnswer = answers[sectionId] || '';
            // If there's a correct_answer property, compare with it
            if (section.correct_answer) {
              return userAnswer.trim().toLowerCase() === section.correct_answer.trim().toLowerCase();
            }
            // Otherwise check if answer is one of the options
            return exercise.flowchart.options.some(option => 
              userAnswer.trim().toLowerCase() === option.trim().toLowerCase()
            );
          });
          
          // Calculate score as percentage of correct answers
          const correctCount = correctAnswers.length;
          const totalCount = flowchartSections.length;
          flowchartScore = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
          
          // Generate feedback for flowchart answers
          flowchartFeedback = `You correctly answered ${correctCount} out of ${totalCount} flowchart sections.`;
          
          if (correctCount === totalCount) {
            flowchartFeedback += "\n\nExcellent work on the flowchart! You've correctly identified all the main elements.";
          } else if (correctCount > totalCount / 2) {
            flowchartFeedback += "\n\nGood work on the flowchart. You've correctly identified most of the main elements.";
          } else {
            flowchartFeedback += "\n\nYou need to work on identifying the main elements in the text. Consider how each section connects to the key ideas.";
          }
        }
        
        // Combine scores and feedback
        const totalQuestionWeight = exercise.questions ? 0.7 : 0; // 70% weight for questions if present
        const totalFlowchartWeight = exercise.flowchart ? (exercise.questions ? 0.3 : 1) : 0; // 30% weight for flowchart if questions present, 100% otherwise
        
        const combinedScore = (questionScore * totalQuestionWeight) + (flowchartScore * totalFlowchartWeight);
        const combinedFeedback = [
          exercise.questions && exercise.questions.length > 0 ? "Questions Feedback:\n" + questionFeedback : "",
          exercise.flowchart ? "Flowchart Feedback:\n" + flowchartFeedback : ""
        ].filter(Boolean).join("\n\n");
        
        result = {
          feedback: combinedFeedback,
          score: combinedScore
        };
      }
      
      // Check that we have valid feedback and score
      if (result && result.feedback) {
        // Store feedback and score in localStorage instead of showing inline
        const finalScore = typeof result.score === 'number' ? result.score : Number(result.score) || 0;
        
        // Save results to localStorage with questions data
        try {
          const sessionData = {
            section: "B",
            name: "Narrative Comprehension",
            answers,
            questions: exercise.exercise_type === "questions" 
              ? questions 
              : {
                  // For combined type, include both question and flowchart data
                  ...questions,
                  // Add flowchart sections as pseudo-questions for the feedback page
                  ...exercise.flowchart?.sections.reduce((acc, section, idx) => {
                    const sectionId = section.id || `section-${idx}`;
                    acc[`flowchart-${sectionId}`] = {
                      id: `flowchart-${sectionId}`,
                      question_text: `Flowchart: ${section.name}`,
                      ideal_answer: section.correct_answer || "Select from available options",
                      question_order: idx + 1000, // Use high numbers to separate from regular questions
                      mark: answers[sectionId] && (
                        section.correct_answer 
                          ? answers[sectionId].trim().toLowerCase() === section.correct_answer.trim().toLowerCase()
                          : exercise.flowchart.options.some(option => answers[sectionId].trim().toLowerCase() === option.trim().toLowerCase())
                      ) ? 1 : 0,
                      marks: 1,
                      isFlowchart: true // Flag to identify flowchart items in the feedback
                    };
                    return acc;
                  }, {}) || {}
              },
            feedback: result.feedback,
            score: finalScore,
            lastSaved: new Date().toISOString(),
            exerciseType: exercise.exercise_type, // Save exercise type for the feedback page
            // Save flowchart options if present
            flowchartOptions: exercise.flowchart?.options || []
          }
          
          // Save current session with feedback and score
          localStorage.setItem('savedSession_sectionB', JSON.stringify(sessionData))
          
          // Update recent sessions list to mark this session as completed
          const recentSessionsStr = localStorage.getItem('recentSessions')
          if (recentSessionsStr) {
            const recentSessions = JSON.parse(recentSessionsStr)
            const updatedRecentSessions = recentSessions.map(session => {
              if (session.id === 'sectionB') {
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
              id: 'sectionB',
              section: "B",
              name: "Narrative Comprehension",
              progress: 100,
              lastSaved: new Date().toISOString(),
              status: "completed"
            };
            localStorage.setItem('recentSessions', JSON.stringify([newSession]))
          }
          
          // Save result to practice results too
          const practiceResult = {
            section: "B",
            name: "Narrative Comprehension",
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
          router.push('/narratcomp/feedback');
          
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
  
  // Extract question IDs for rendering and filter out any that don't exist in questions
  const questionIds = Object.keys(questions)
    .map(id => parseInt(id))
    .filter(id => questions[id]);
  
  // If still loading, show a loading indicator
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f9ff] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If no exercise data found, show an error
  if (!exercise) {
    return (
      <div className="min-h-screen bg-[#f5f9ff] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Exercise Not Found</h2>
          <p className="text-gray-600 mb-4">We couldn't find the narrative comprehension exercise.</p>
          <Link href="/" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  // If feedback is shown, render the feedback page
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
  
  // Render the appropriate UI based on exercise type
  return (
    <div className="h-screen bg-[#f5f9ff] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b bg-white py-4 px-6 flex-shrink-0">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors">
              <Home size={18} />
            </Link>
            <h1 className="text-xl font-medium text-gray-800">Section B – {exercise.title}</h1>
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
        {/* Render different UI based on exercise type */}
        {exercise.exercise_type === "questions" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-13rem)]">
            {/* Left panel - Story Display */}
            <div className="overflow-y-auto pr-2 pb-2">
              <div className="bg-white rounded-2xl shadow-sm p-6 h-auto">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{exercise.title}</h2>
                <div className="whitespace-pre-wrap prose max-w-none text-gray-700">
                  <ReactMarkdown>
                    {exercise.story_text}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            {/* Right panel - Questions */}
            <div className="overflow-y-auto pr-2 pb-2 space-y-6">
              {questionIds.map(questionId => (
                <div key={questionId} className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex flex-wrap items-start gap-4 mb-4">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600 font-medium">
                      {questions[questionId] && (questions[questionId].question_order || questionId)}
                    </div>
                    <h2 className="flex-1 text-lg font-medium text-gray-800">{questions[questionId] && questions[questionId].question_text}</h2>
                    <div className="flex-shrink-0 text-sm text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-md">
                      {questions[questionId] && (questions[questionId].marks || 1)} {questions[questionId] && ((questions[questionId].marks || 1) === 1 ? 'mark' : 'marks')}
                    </div>
                  </div>
                  <div>
                    {questions[questionId] && (
                      <textarea
                        className="w-full h-24 p-4 border text-gray-700 border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Type your answer here..."
                        value={answers[questionId] || ''}
                        onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Combined Exercise UI - Both Questions and Flowchart */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-13rem)]">
            {/* Left panel - Story Display */}
            <div className="overflow-y-auto pr-2 pb-2">
              <div className="bg-white rounded-2xl shadow-sm p-6 h-auto">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{exercise.title}</h2>
                <div className="whitespace-pre-wrap prose max-w-none text-gray-700">
                  <ReactMarkdown>
                    {exercise.story_text}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            {/* Right panel - Questions and Flowchart */}
            <div className="overflow-y-auto pr-2 pb-2 space-y-6">
              {/* Questions Section */}
              {exercise.questions && exercise.questions.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Part 1: Questions</h3>
                  <div className="space-y-6 mb-6">
                    {questionIds.map(questionId => (
                      <div key={questionId} className="bg-white rounded-2xl shadow-sm p-6">
                        <div className="flex flex-wrap items-start gap-4 mb-4">
                          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600 font-medium">
                            {questions[questionId] && (questions[questionId].question_order || questionId)}
                          </div>
                          <h2 className="flex-1 text-lg font-medium text-gray-800">{questions[questionId] && questions[questionId].question_text}</h2>
                          <div className="flex-shrink-0 text-sm text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-md">
                            {questions[questionId] && (questions[questionId].marks || 1)} {questions[questionId] && ((questions[questionId].marks || 1) === 1 ? 'mark' : 'marks')}
                          </div>
                        </div>
                        <div>
                          {questions[questionId] && (
                            <textarea
                              className="w-full h-24 p-4 border text-gray-700 border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Type your answer here..."
                              value={answers[questionId] || ''}
                              onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Flowchart Section */}
              {exercise.flowchart && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Part 2: Flow Chart</h3>
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Flow Chart</span>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <HelpCircle size={18} />
                      </button>
                    </div>
                    
                    <p className="mb-6 text-gray-700">
                      {exercise.description || "Complete the flowchart by choosing one word from the box to summarise the main thoughts or feelings presented in each part of the text."}
                    </p>
                    
                    <React.Fragment key="flowchart-container">
                      {/* Options grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                        {exercise.flowchart.options.map((option, index) => (
                          <div 
                            key={`flowchart-option-${index}`} 
                            className={`p-2 border rounded-md text-center text-gray-800 ${
                              index >= exercise.flowchart.options.length - 2 ? 'col-span-1 sm:col-span-2' : ''
                            }`}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                      
                      {/* Flow chart sections */}
                      {exercise.flowchart.sections.map((section, idx) => (
                        <div key={`flowchart-section-${section.id || idx}`} className="mb-8">
                          <div className="mb-1 font-medium text-gray-800">
                            {section.name}: ({String.fromCharCode(105 + idx)})
                          </div>
                          <input 
                            type="text" 
                            className="w-full p-2 border rounded-md text-gray-800"
                            placeholder="Enter word here"
                            value={answers[section.id || `section-${idx}`] || ''}
                            onChange={(e) => {
                              // Use a unique identifier for each section
                              const sectionKey = section.id || `section-${idx}`;
                              setAnswers(prev => ({
                                ...prev,
                                [sectionKey]: e.target.value
                              }));
                            }}
                          />
                          
                          {/* Add arrow between sections except after the last one */}
                          {idx < exercise.flowchart.sections.length - 1 && (
                            <div className="flex justify-center my-4">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                              </svg>
                            </div>
                          )}
                        </div>
                      ))}
                    </React.Fragment>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex justify-end">
          <div className="flex gap-4">
            {currentExerciseIndex < allExercises.length - 1 && !showFeedback && (
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
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full shadow-sm transition-colors font-medium disabled:bg-orange-300"
            >
              {isSubmitting ? "Submitting..." : "Submit Test"}
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