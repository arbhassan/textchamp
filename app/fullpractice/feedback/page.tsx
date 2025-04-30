"use client"

import { useState, useEffect } from "react"
import { Home, X, ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import ReactMarkdown from 'react-markdown'

export default function FullPracticeFeedback() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [currentFeedbackTab, setCurrentFeedbackTab] = useState("C") // Default to Section C
  
  // Data from the completed test
  const [answersA, setAnswersA] = useState({})
  const [answersB, setAnswersB] = useState({})
  const [answersC, setAnswersC] = useState({})
  const [questionsA, setQuestionsA] = useState({})
  const [questionsB, setQuestionsB] = useState({})
  const [questionsC, setQuestionsC] = useState({})
  const [sectionScores, setSectionScores] = useState({
    A: null,
    B: null,
    C: null
  })
  const [sectionFeedback, setSectionFeedback] = useState({
    A: "",
    B: "",
    C: ""
  })
  
  // Load test data when component mounts
  useEffect(() => {
    try {
      setLoading(true)
      const savedSession = localStorage.getItem('savedSession_fullPractice')
      
      if (savedSession) {
        const session = JSON.parse(savedSession)
        
        // Load answers
        if (session.answersA) setAnswersA(session.answersA)
        if (session.answersB) setAnswersB(session.answersB)
        if (session.answersC) setAnswersC(session.answersC)
        
        // Load questions - these need to be retrieved from the session too
        // For now, using a placeholder structure
        if (session.questionsA) {
          setQuestionsA(session.questionsA)
        } else {
          // If questions aren't saved in the session, redirect back to practice
          router.push('/fullpractice')
          return
        }
        
        if (session.questionsB) {
          setQuestionsB(session.questionsB)
        }
        
        if (session.questionsC) {
          setQuestionsC(session.questionsC)
        }
        
        // Load scores
        if (session.sectionScores) {
          setSectionScores(session.sectionScores)
        }
        
        // Load feedback
        if (session.sectionFeedback) {
          setSectionFeedback(session.sectionFeedback)
        }
      } else {
        // If no session data exists, redirect back to practice
        router.push('/fullpractice')
        return
      }
    } catch (error) {
      console.error('Error loading feedback data:', error)
      router.push('/fullpractice')
    } finally {
      setLoading(false)
    }
  }, [router])
  
  // Helper function to calculate the circumference for the circular progress bar
  const calculateCircleProgress = (score) => {
    const radius = 50
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (score / 5) * circumference
    return { circumference, offset }
  }
  
  // Format feedback text
  const formatFeedback = (feedbackText) => {
    if (!feedbackText) return ""
    return String(feedbackText)
  }
  
  if (loading) {
    return (
      <div className="h-screen bg-[#f5f9ff] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading feedback...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f9ff] flex flex-col">
      {/* Header */}
      <header className="border-b bg-white py-4 px-6 flex-shrink-0">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors">
              <Home size={18} />
            </Link>
            <h1 className="text-xl font-medium text-gray-800">
              Full Practice Test Results
            </h1>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-6 py-8 w-full">
        <div className="bg-white rounded-3xl shadow-sm p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {/* Total Score Circle */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-[120px] h-[120px]">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  {/* Background circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#e6e6e6"
                    strokeWidth="10"
                  />
                  
                  {/* Progress circle */}
                  {sectionScores.C !== null && (
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#4ade80"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={calculateCircleProgress(sectionScores.C).circumference}
                      strokeDashoffset={calculateCircleProgress(sectionScores.C).offset}
                      className="transition-all duration-1000 ease-out"
                    />
                  )}
                </svg>
                
                {/* Score text */}
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <div className="flex items-baseline">
                    <span className="text-4xl text-gray-800 font-bold">{sectionScores.C !== null ? sectionScores.C : 0}</span>
                    <span className="text-xl font-medium text-gray-500">/5</span>
                  </div>
                  <span className="text-sm text-gray-500 mt-1">Section C</span>
                </div>
              </div>
            </div>
            
            {/* Section scores */}
            <div className="md:col-span-3 grid grid-cols-3 gap-4">
              {/* Section A Score */}
              <div className="bg-amber-50 p-4 rounded-xl">
                <h3 className="font-medium text-amber-800 mb-2">Section A</h3>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-amber-700">{sectionScores.A || 0}</div>
                  <div className="text-amber-600">/5 points</div>
                </div>
              </div>
              
              {/* Section B Score */}
              <div className="bg-orange-50 p-4 rounded-xl">
                <h3 className="font-medium text-orange-800 mb-2">Section B</h3>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-orange-700">{sectionScores.B || 0}</div>
                  <div className="text-orange-600">/5 points</div>
                </div>
              </div>
              
              {/* Section C Score */}
              <div className="bg-purple-50 p-4 rounded-xl">
                <h3 className="font-medium text-purple-800 mb-2">Section C</h3>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-purple-700">{sectionScores.C || 0}</div>
                  <div className="text-purple-600">/5 points</div>
                </div>
              </div>
              
              {/* Total Score */}
              <div className="col-span-3 bg-blue-50 p-4 rounded-xl">
                <h3 className="font-medium text-blue-800 mb-2">Overall Score</h3>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-blue-700">
                    {((sectionScores.A || 0) + (sectionScores.B || 0) + (sectionScores.C || 0))}
                  </div>
                  <div className="text-blue-600">/15 points</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Section Tabs for Feedback */}
        <div className="bg-white rounded-3xl shadow-sm p-8">
          <div className="border-b mb-6">
            <div className="flex">
              <button 
                className={`px-4 py-2 text-sm font-medium relative ${
                  currentFeedbackTab === "A" ? "border-b-2 border-amber-500 text-amber-600" : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setCurrentFeedbackTab("A")}
              >
                Section A - Visual
                {sectionFeedback.A && currentFeedbackTab !== "A" && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full"></span>
                )}
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium relative ${
                  currentFeedbackTab === "B" ? "border-b-2 border-orange-500 text-orange-600" : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setCurrentFeedbackTab("B")}
              >
                Section B - Narrative
                {sectionFeedback.B && currentFeedbackTab !== "B" && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
                )}
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium relative ${
                  currentFeedbackTab === "C" ? "border-b-2 border-purple-500 text-purple-600" : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setCurrentFeedbackTab("C")}
              >
                Section C - Non-Narrative
                {sectionFeedback.C && currentFeedbackTab !== "C" && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full"></span>
                )}
              </button>
            </div>
          </div>
          
          {/* Section A Feedback */}
          {currentFeedbackTab === "A" && (
            <div>
              <h3 className="text-lg font-bold text-amber-800 mb-4">Visual Comprehension Questions</h3>
              
              {Object.values(questionsA).map((question, index) => (
                <div key={index} className="mb-8 p-4 border border-gray-100 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-medium text-xs">
                      {question.id}
                    </div>
                    <h4 className="font-medium text-gray-800">{question.text}</h4>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Your Answer:</h5>
                    <div className="p-3 bg-white border border-gray-200 rounded text-sm text-gray-700">
                      {answersA[question.id] || <span className="text-gray-400 italic">No answer provided</span>}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-green-700 mb-1">Model Answer:</h5>
                    <div className="p-3 bg-green-50 border border-green-100 rounded text-sm text-gray-800">
                      {question.answer}
                    </div>
                  </div>
                </div>
              ))}
              
              {sectionFeedback.A && (
                <div className="prose prose-sm max-w-none text-gray-700 markdown-content mt-6">
                  <h4 className="text-lg font-medium text-amber-800 mb-2">AI Feedback:</h4>
                  <ReactMarkdown 
                    components={{
                      h2: ({node, ...props}) => <h2 className="text-lg font-bold text-blue-700 mt-4 mb-2" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-md font-bold text-gray-800 mt-3 mb-1" {...props} />,
                      p: ({node, ...props}) => <p className="mb-3" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3" {...props} />,
                      li: ({node, ...props}) => <li className="mb-1" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold text-blue-600" {...props} />,
                      em: ({node, ...props}) => <em className="italic text-gray-800" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="pl-4 border-l-4 border-gray-200 italic my-2" {...props} />
                    }}
                  >
                    {formatFeedback(sectionFeedback.A)}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}
          
          {/* Section B Feedback */}
          {currentFeedbackTab === "B" && (
            <div>
              <h3 className="text-lg font-bold text-orange-800 mb-4">Narrative Comprehension Questions</h3>
              
              {Object.values(questionsB).map((question, index) => (
                <div key={index} className="mb-8 p-4 border border-gray-100 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-medium text-xs">
                      {question.id}
                    </div>
                    <h4 className="font-medium text-gray-800">{question.text}</h4>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Your Answer:</h5>
                    <div className="p-3 bg-white border border-gray-200 rounded text-sm text-gray-700">
                      {answersB[question.id] || <span className="text-gray-400 italic">No answer provided</span>}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-green-700 mb-1">Model Answer:</h5>
                    <div className="p-3 bg-green-50 border border-green-100 rounded text-sm text-gray-800">
                      {question.answer}
                    </div>
                  </div>
                </div>
              ))}
              
              {sectionFeedback.B && (
                <div className="prose prose-sm max-w-none text-gray-700 markdown-content mt-6">
                  <h4 className="text-lg font-medium text-orange-800 mb-2">AI Feedback:</h4>
                  <ReactMarkdown 
                    components={{
                      h2: ({node, ...props}) => <h2 className="text-lg font-bold text-blue-700 mt-4 mb-2" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-md font-bold text-gray-800 mt-3 mb-1" {...props} />,
                      p: ({node, ...props}) => <p className="mb-3" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3" {...props} />,
                      li: ({node, ...props}) => <li className="mb-1" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold text-blue-600" {...props} />,
                      em: ({node, ...props}) => <em className="italic text-gray-800" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="pl-4 border-l-4 border-gray-200 italic my-2" {...props} />
                    }}
                  >
                    {formatFeedback(sectionFeedback.B)}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}
          
          {/* Section C Feedback */}
          {currentFeedbackTab === "C" && (
            <div>
              <h3 className="text-lg font-bold text-purple-800 mb-4">Non-Narrative Comprehension Questions</h3>
              
              {Object.values(questionsC).map((question, index) => (
                <div key={index} className="mb-8 p-4 border border-gray-100 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-medium text-xs">
                      {question.id}
                    </div>
                    <h4 className="font-medium text-gray-800">{question.text}</h4>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Your Answer:</h5>
                    <div className="p-3 bg-white border border-gray-200 rounded text-sm text-gray-700">
                      {answersC[question.id] || <span className="text-gray-400 italic">No answer provided</span>}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-green-700 mb-1">Model Answer:</h5>
                    <div className="p-3 bg-green-50 border border-green-100 rounded text-sm text-gray-800">
                      {question.answer}
                    </div>
                  </div>
                </div>
              ))}
              
              {sectionFeedback.C && (
                <div className="prose prose-sm max-w-none text-gray-700 markdown-content mt-6">
                  <h4 className="text-lg font-medium text-purple-800 mb-2">AI Feedback:</h4>
                  <ReactMarkdown 
                    components={{
                      h2: ({node, ...props}) => <h2 className="text-lg font-bold text-blue-700 mt-4 mb-2" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-md font-bold text-gray-800 mt-3 mb-1" {...props} />,
                      p: ({node, ...props}) => <p className="mb-3" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3" {...props} />,
                      li: ({node, ...props}) => <li className="mb-1" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold text-blue-600" {...props} />,
                      em: ({node, ...props}) => <em className="italic text-gray-800" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="pl-4 border-l-4 border-gray-200 italic my-2" {...props} />
                    }}
                  >
                    {formatFeedback(sectionFeedback.C)}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-8 flex justify-center md:justify-end">
            <Link href="/">
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                Return to Dashboard
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
} 