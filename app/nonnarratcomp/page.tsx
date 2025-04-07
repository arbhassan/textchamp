"use client"

import { useState, useEffect } from "react"
import { HelpCircle, X, Home, Save } from "lucide-react"
import { evaluateAnswers } from "../api/evaluate-answers/utils"
import { QuestionWithAnswer } from "../api/evaluate-answers/types"
import ReactMarkdown from 'react-markdown'
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SectionC() {
  const router = useRouter()
  const [wordCount, setWordCount] = useState(0)
  const [answers, setAnswers] = useState({
    1: "",
    2: "",
    3: ""
  })
  const [feedback, setFeedback] = useState("")
  const [score, setScore] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState({ minutes: 25, seconds: 0 })
  const [saveStatus, setSaveStatus] = useState("")
  
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
            if (session.answers[2]) {
              const words = session.answers[2].trim().split(/\s+/).filter(Boolean).length
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
          progress: Object.values(answers).filter(a => a.trim() !== '').length / 3 * 100,
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
  
  const currentQuestion = 1
  const totalQuestions = 3

  const questions = {
    1: {
      id: 1,
      text: "What is the central theme of the passage? Support your answer with evidence.",
      answer: "The central theme is the rapid advancement of AI technology and its implications for society. Evidence includes the references to AI reshaping the world, becoming more sophisticated, and the ethical considerations it raises including privacy, accountability, and employment impacts."
    },
    2: {
      id: 2,
      text: "Write a summary of the passage in no more than 80 words.",
      answer: "AI technology is rapidly advancing and transforming various sectors. Recent breakthroughs in machine learning have enabled AI systems to process language and visual data with exceptional accuracy. However, this integration raises ethical concerns about privacy, accountability, and employment impacts. Experts emphasize the need for regulatory frameworks to maximize benefits while minimizing risks."
    },
    3: {
      id: 3,
      text: "What ethical concerns does the passage highlight about AI development?",
      answer: "The passage highlights ethical concerns about privacy, accountability, and the potential impact on employment. It emphasizes the need for robust regulatory frameworks to ensure AI technologies benefit humanity while minimizing potential risks."
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
      const articleText = "Climate change represents one of the most pressing challenges of our time, with far-reaching implications for the environment, economy, and human well-being. Scientists have observed significant shifts in global temperature patterns, with the past decade recording the highest average temperatures in modern history. These changes are primarily attributed to human activities, particularly the release of greenhouse gases from fossil fuel combustion, deforestation, and industrial processes.\n\nThe consequences of climate change are already evident worldwide. Rising sea levels threaten coastal communities and small island nations, while increasingly frequent and severe weather events—including hurricanes, floods, and droughts—impact agricultural productivity and human safety. Biodiversity loss accelerates as ecosystems struggle to adapt to rapidly changing conditions, potentially disrupting vital ecosystem services upon which human societies depend.\n\nAddressing climate change requires coordinated global action. International agreements like the Paris Climate Accord establish frameworks for reducing emissions and supporting adaptation efforts. Technological innovations in renewable energy, energy efficiency, and carbon capture present promising solutions. Meanwhile, shifts in consumer behavior, corporate practices, and public policy are essential complementary strategies.\n\nImportantly, climate action presents not just challenges but opportunities. Transitioning to clean energy systems can create jobs, improve public health, and enhance energy security. Sustainable urban planning can create more livable communities, while ecosystem restoration can preserve vital natural resources and services.\n\nWhile the scale of the climate challenge is immense, the collective capacity for innovation and adaptation offers reason for cautious optimism. Effective climate action will require unprecedented coordination across sectors and borders, but the benefits of success—and the costs of inaction—make this effort essential for securing a sustainable future for coming generations.";
      
      const questionsWithAnswers: QuestionWithAnswer[] = [
        {
          question: questions[1].text,
          idealAnswer: questions[1].answer,
          userAnswer: answers[1]
        },
        {
          question: questions[2].text,
          idealAnswer: questions[2].answer,
          userAnswer: answers[2]
        },
        {
          question: questions[3].text,
          idealAnswer: questions[3].answer,
          userAnswer: answers[3]
        }
      ];

      const result = await evaluateAnswers(articleText, questionsWithAnswers);
      
      // Check that we have valid feedback and score
      if (result && result.feedback) {
        setFeedback(result.feedback);
        // Ensure score is properly converted to a number
        const finalScore = typeof result.score === 'number' ? result.score : Number(result.score) || 0;
        setScore(finalScore);
        setShowFeedback(true);
        
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
          };
          
          // Get existing results from localStorage
          const storedResults = localStorage.getItem('practiceResults');
          const existingResults = storedResults ? JSON.parse(storedResults) : [];
          
          // Add new result
          const updatedResults = [...existingResults, practiceResult];
          
          // Save to localStorage
          localStorage.setItem('practiceResults', JSON.stringify(updatedResults));
          
          // Dispatch an event to notify other components that a practice is complete
          window.dispatchEvent(new CustomEvent('practiceComplete'));
        } catch (error) {
          console.error('Error saving practice result:', error);
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
  
  // Function to calculate the circumference for the circular progress bar
  const calculateCircleProgress = (score) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 5) * circumference;
    return { circumference, offset };
  };
  
  // Format feedback with line breaks and highlight key points
  const formatFeedback = (feedbackText) => {
    if (!feedbackText) return "";
    
    // Ensure feedbackText is a string
    const feedbackString = String(feedbackText);
    
    // Return the markdown content directly - we'll use ReactMarkdown to render it
    return feedbackString;
  };

  return (
    <div className="min-h-screen bg-[#f5f9ff]">
      {/* Header */}
      <header className="border-b bg-white py-4 px-6">
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

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left panel - Passage Display */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">The Future of Artificial Intelligence</h2>
              <div className="prose max-w-none text-gray-700">
                <p>
                  The rapid advancement of artificial intelligence (AI) technology is reshaping our world in
                  unprecedented ways. From healthcare to transportation, AI systems are becoming increasingly
                  sophisticated and capable of handling complex tasks that were once thought to be exclusively human
                  domains.
                </p>
                <p>
                  Recent developments in machine learning algorithms have led to significant breakthroughs in natural
                  language processing and computer vision. These advances have enabled AI systems to understand and
                  respond to human speech with remarkable accuracy, translate between languages in real-time, and
                  identify objects and patterns in images with precision that sometimes exceeds human capabilities.
                </p>
                <p>
                  However, the integration of AI into society raises important ethical considerations. Questions about
                  privacy, accountability, and the potential impact on employment have become central to the discourse
                  surrounding AI development. Experts argue that establishing robust regulatory frameworks is crucial to
                  ensure that AI technologies benefit humanity while minimizing potential risks.
                </p>
              </div>
            </div>
          </div>

          {/* Right panel - Questions */}
          <div className="space-y-6">
            {/* Main Idea Question */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600 font-medium">
                  1
                </div>
                <h2 className="text-lg font-medium text-gray-800">Main Idea</h2>
                <button className="text-gray-400 hover:text-gray-600 transition-colors ml-auto">
                  <HelpCircle className="w-5 h-5" />
                </button>
              </div>
              <p className="mb-4 text-gray-700">
                What is the central theme of the passage? Support your answer with evidence.
              </p>
              <div>
                <textarea
                  className="w-full h-24 p-4 border border-gray-200 text-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Type your answer here..."
                  value={answers[1]}
                  onChange={(e) => handleAnswerChange(1, e.target.value)}
                />
              </div>
            </div>

            {/* Summary Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600 font-medium">
                  2
                </div>
                <h2 className="text-lg font-medium text-gray-800">Summary Writing</h2>
                <button className="text-gray-400 hover:text-gray-600 transition-colors ml-auto">
                  <HelpCircle className="w-5 h-5" />
                </button>
              </div>
              <p className="mb-4 text-gray-700">Write a summary of the passage in no more than 80 words.</p>
              <div>
                <textarea
                  className="w-full h-24 p-4 border border-gray-200 text-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Write your summary here..."
                  value={answers[2]}
                  onChange={(e) => {
                    const text = e.target.value;
                    handleAnswerChange(2, text);
                    const words = text.trim().split(/\s+/).filter(Boolean).length;
                    setWordCount(words);
                  }}
                />
              </div>
            </div>

            {/* Analysis Question */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600 font-medium">
                  3
                </div>
                <h2 className="text-lg font-medium text-gray-800">Critical Analysis</h2>
                <button className="text-gray-400 hover:text-gray-600 transition-colors ml-auto">
                  <HelpCircle className="w-5 h-5" />
                </button>
              </div>
              <p className="mb-4 text-gray-700">
                What ethical concerns does the passage highlight about AI development?
              </p>
              <div>
                <textarea
                  className="w-full h-24 p-4 border border-gray-200 text-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Type your answer here..."
                  value={answers[3]}
                  onChange={(e) => handleAnswerChange(3, e.target.value)}
                />
              </div>
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

        {/* Navigation */}
        <div className="mt-12 flex justify-end">
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
      </main>
    </div>
  )
}

