"use client"

import { useState, useEffect } from "react"
import { HelpCircle, X, Home, Save } from "lucide-react"
import { evaluateAnswers } from "../api/evaluate-answers/utils"
import { QuestionWithAnswer } from "../api/evaluate-answers/types"
import ReactMarkdown from 'react-markdown'
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SectionB() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const totalQuestions = 3
  const [answers, setAnswers] = useState({
    1: "",
    2: "",
    3: ""
  })
  const [feedback, setFeedback] = useState("")
  const [score, setScore] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState({ minutes: 30, seconds: 0 })
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
      
      // Add to recent sessions, replacing any existing session for this section
      const updatedRecentSessions = [
        {
          id: 'sectionB',
          section: "B",
          name: "Narrative Comprehension",
          progress: Object.values(answers).filter(a => a.trim() !== '').length / 3 * 100,
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
  
  const questions = {
    1: {
      id: 1,
      text: "What is the main character's attitude toward the forest?",
      answer: "Elara is curious and drawn to the forest, unlike the other villagers who fear it. She's adventurous and interested in its secrets."
    },
    2: {
      id: 2,
      text: "What does the grandmother's warning suggest about the forest?",
      answer: "The grandmother's warning suggests the forest is magical but potentially dangerous. It gives gifts that come with a price, indicating it has a dual nature of beauty and risk."
    },
    3: {
      id: 3,
      text: "What literary device is used in \"The Whispering Woods\"?",
      answer: "Personification is used in 'The Whispering Woods' - the forest is given human-like qualities such as whispering and giving gifts."
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
      const storyText = "This story focuses on a young woman named Amara who moves to a new city for her dream job. Initially overwhelmed by the unfamiliar environment, she struggles with loneliness and self-doubt. Through small acts of courage, like exploring her neighborhood and joining a local community garden, she gradually builds connections. The narrative explores themes of belonging, personal growth, and finding community in unexpected places. By the end, Amara has not only adapted to her new home but has created a meaningful life there through her openness to new experiences.";
      
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

      const result = await evaluateAnswers(storyText, questionsWithAnswers);
      
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
          }
        } catch (error) {
          console.error('Error updating session status:', error)
        }
        
        // Save this result to localStorage
        try {
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
            <h1 className="text-xl font-medium text-gray-800">Section B – Narrative Comprehension</h1>
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
            {/* <div className="text-gray-600">
              Question {currentQuestion} of {totalQuestions}
            </div> */}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left panel - Story Display */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">The Enchanted Forest</h2>
              <div className="prose max-w-none text-gray-700">
                <p>
                  Once upon a time, in a small village nestled at the edge of a vast forest known to locals as "The Whispering Woods," there lived a curious young girl named Elara. Unlike the other villagers who feared the dense, mysterious forest, Elara was drawn to its secrets and the strange sounds that seemed to call to her at night.
                </p>
                <p>
                  One misty morning, Elara discovered a peculiar blue flower with luminescent petals growing just beyond her garden fence. She had never seen anything like it before, and as she reached out to touch it, the flower seemed to glow even brighter, as if responding to her presence.
                </p>
                <p>
                  Her grandmother, a wise woman respected in the village for her knowledge of old folklore, warned her about the forest's enchantments. "The forest gives gifts," she said, her eyes reflecting wisdom accumulated over decades, "but every gift comes with a price. Be careful what you accept from the Whispering Woods."
                </p>
                <p>
                  Elara, unable to resist the call of adventure, kept the strange flower in a jar by her bedside. That night, she dreamed of towering trees with faces, talking animals, and a silver path that led deeper into the heart of the forest. When she awoke, she found small blue petals scattered across her bedroom floor, forming a trail that led to her window—and beyond, toward the edge of the Whispering Woods.
                </p>
                <p>
                  The decision she faced would change everything. Should she follow the mysterious path into the unknown, or heed her grandmother's warning about the forest's unpredictable nature?
                </p>
              </div>
            </div>
          </div>

          {/* Right panel - Questions */}
          <div className="space-y-6">
            {/* Question 1 */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600 font-medium">
                  {questions[1].id}
                </div>
                <h2 className="text-lg font-medium text-gray-800">{questions[1].text}</h2>
                <button className="text-gray-400 hover:text-gray-600 transition-colors ml-auto">
                  <HelpCircle className="w-5 h-5" />
                </button>
              </div>
              <div>
                <textarea
                  className="w-full h-24 p-4 border text-gray-700 border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Type your answer here..."
                  value={answers[1]}
                  onChange={(e) => handleAnswerChange(1, e.target.value)}
                />
              </div>
            </div>

            {/* Question 2 */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600 font-medium">
                  {questions[2].id}
                </div>
                <h2 className="text-lg font-medium text-gray-800">{questions[2].text}</h2>
                <button className="text-gray-400 hover:text-gray-600 transition-colors ml-auto">
                  <HelpCircle className="w-5 h-5" />
                </button>
              </div>
              <div>
                <textarea
                  className="w-full h-24 p-4 border text-gray-700 border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Type your answer here..."
                  value={answers[2]}
                  onChange={(e) => handleAnswerChange(2, e.target.value)}
                />
              </div>
            </div>

            {/* Question 3 */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600 font-medium">
                  {questions[3].id}
                </div>
                <h2 className="text-lg font-medium text-gray-800">{questions[3].text}</h2>
                <button className="text-gray-400 hover:text-gray-600 transition-colors ml-auto">
                  <HelpCircle className="w-5 h-5" />
                </button>
              </div>
              <div>
                <textarea
                  className="w-full h-24 p-4 border text-gray-700 border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Type your answer here..."
                  value={answers[3]}
                  onChange={(e) => handleAnswerChange(3, e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-12 flex justify-end">
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
      </main>
      
      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Your Results</h2>
                <button 
                  onClick={() => setShowFeedback(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Score Circle */}
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
                      {score !== null && (
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke={score >= 4 ? "#4ade80" : score >= 3 ? "#facc15" : "#f87171"}
                          strokeWidth="10"
                          strokeLinecap="round"
                          strokeDasharray={calculateCircleProgress(score).circumference}
                          strokeDashoffset={calculateCircleProgress(score).offset}
                          className="transition-all duration-1000 ease-out"
                        />
                      )}
                    </svg>
                    
                    {/* Score text */}
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <div className="flex items-baseline">
                        <span className="text-4xl text-gray-800 font-bold">{score !== null ? score : 0}</span>
                        <span className="text-xl font-medium text-gray-500">/5</span>
                      </div>
                      <span className="text-sm text-gray-500 mt-1">points</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <p className="font-medium text-gray-700">
                      {score !== null && (
                        score >= 4 ? "Excellent!" : 
                        score >= 3 ? "Good job!" : 
                        score >= 2 ? "Needs improvement" : 
                        "Try again"
                      )}
                    </p>
                  </div>
                </div>
                
                {/* Feedback Text */}
                <div className="md:col-span-2">
                  <div className="prose prose-sm max-w-none text-gray-700 markdown-content">
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
                      {formatFeedback(feedback)}
                    </ReactMarkdown>
                  </div>
                  
                  <div className="mt-8 flex justify-center md:justify-end">
                    <button
                      onClick={() => setShowFeedback(false)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 