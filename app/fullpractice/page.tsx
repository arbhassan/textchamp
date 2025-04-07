"use client"

import { useState, useEffect } from "react"
import { HelpCircle, X, Home, Save, ArrowLeft, ArrowRight } from "lucide-react"
import { evaluateAnswers } from "../api/evaluate-answers/utils"
import { QuestionWithAnswer } from "../api/evaluate-answers/types"
import ReactMarkdown from 'react-markdown'
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function FullComprehensionPractice() {
  const router = useRouter()
  const [currentSection, setCurrentSection] = useState("A") // A, B, or C
  const [timeRemainingTotal, setTimeRemainingTotal] = useState({ 
    hours: 1, 
    minutes: 50, 
    seconds: 0 
  })
  
  // Answers for each section
  const [answersA, setAnswersA] = useState({
    1: "",
    2: "",
    3: ""
  })
  
  const [answersB, setAnswersB] = useState({
    1: "",
    2: "",
    3: ""
  })
  
  const [answersC, setAnswersC] = useState({
    1: "",
    2: "",
    3: ""
  })
  
  const [wordCount, setWordCount] = useState(0) // For Section C summary
  const [feedback, setFeedback] = useState("")
  const [score, setScore] = useState(null)
  const [sectionScores, setSectionScores] = useState({
    A: null,
    B: null,
    C: null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [saveStatus, setSaveStatus] = useState("")
  const [progress, setProgress] = useState(0) // 0 to 100
  
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
          const fullSession = recentSessions.find(s => s.id === 'fullPractice')
          
          // If session exists and is completed, redirect back to dashboard
          if (fullSession && fullSession.status === "completed") {
            router.push('/')
            return
          }
        }
        
        const savedSession = localStorage.getItem('savedSession_fullPractice')
        
        if (savedSession) {
          const session = JSON.parse(savedSession)
          
          if (session.currentSection) {
            setCurrentSection(session.currentSection)
          }
          
          if (session.answersA) {
            setAnswersA(session.answersA)
          }
          
          if (session.answersB) {
            setAnswersB(session.answersB)
          }
          
          if (session.answersC) {
            setAnswersC(session.answersC)
            
            // Recalculate word count for answer 2 (summary) in Section C
            if (session.answersC[2]) {
              const words = session.answersC[2].trim().split(/\s+/).filter(Boolean).length
              setWordCount(words)
            }
          }
          
          if (session.timeRemainingTotal) {
            setTimeRemainingTotal(session.timeRemainingTotal)
          }
          
          if (session.sectionScores) {
            setSectionScores(session.sectionScores)
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
      setTimeRemainingTotal(prev => {
        // If time's up
        if (prev.hours === 0 && prev.minutes === 0 && prev.seconds === 0) {
          clearInterval(timer)
          return prev
        }
        
        // Calculate next time
        if (prev.seconds === 0) {
          if (prev.minutes === 0) {
            return { 
              hours: prev.hours - 1, 
              minutes: 59, 
              seconds: 59 
            }
          } else {
            return { 
              hours: prev.hours, 
              minutes: prev.minutes - 1, 
              seconds: 59 
            }
          }
        } else {
          return { 
            hours: prev.hours, 
            minutes: prev.minutes, 
            seconds: prev.seconds - 1 
          }
        }
      })
    }, 1000)
    
    // Cleanup on unmount
    return () => clearInterval(timer)
  }, [])
  
  // Update progress percentage
  useEffect(() => {
    const totalQuestions = 9 // 3 sections × 3 questions
    const answeredQuestions = [
      ...Object.values(answersA),
      ...Object.values(answersB),
      ...Object.values(answersC)
    ].filter(answer => answer.trim() !== '').length
    
    const newProgress = Math.floor((answeredQuestions / totalQuestions) * 100)
    setProgress(newProgress)
  }, [answersA, answersB, answersC])
  
  // Close feedback modal when ESC key is pressed
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setShowFeedback(false)
      }
    }
    
    window.addEventListener('keydown', handleEsc)
    
    return () => {
      window.removeEventListener('keydown', handleEsc)
    }
  }, [])
  
  // Save the current session progress
  const saveProgress = () => {
    try {
      const sessionData = {
        section: "Full",
        name: "Full Comprehension Practice",
        currentSection,
        answersA,
        answersB,
        answersC,
        timeRemainingTotal,
        sectionScores,
        lastSaved: new Date().toISOString()
      }
      
      // Save current session
      localStorage.setItem('savedSession_fullPractice', JSON.stringify(sessionData))
      
      // Save to recent sessions
      const recentSessionsStr = localStorage.getItem('recentSessions')
      const recentSessions = recentSessionsStr ? JSON.parse(recentSessionsStr) : []
      
      // Add to recent sessions, replacing any existing session for this section
      const updatedRecentSessions = [
        {
          id: 'fullPractice',
          section: "Full",
          name: "Full Comprehension Practice",
          progress: progress,
          lastSaved: new Date().toISOString(),
          status: "in-progress"
        },
        ...recentSessions.filter(s => s.id !== 'fullPractice')
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
    const hours = timeRemainingTotal.hours.toString().padStart(2, '0')
    const minutes = timeRemainingTotal.minutes.toString().padStart(2, '0')
    const seconds = timeRemainingTotal.seconds.toString().padStart(2, '0') 
    return `${hours}:${minutes}:${seconds}`
  }

  // Handle answer changes for each section
  const handleAnswerChangeA = (questionId, value) => {
    setAnswersA(prev => ({
      ...prev,
      [questionId]: value
    }))
  }
  
  const handleAnswerChangeB = (questionId, value) => {
    setAnswersB(prev => ({
      ...prev,
      [questionId]: value
    }))
  }
  
  const handleAnswerChangeC = (questionId, value) => {
    setAnswersC(prev => ({
      ...prev,
      [questionId]: value
    }))
    
    // Update word count for summary question
    if (questionId === 2) {
      const words = value.trim().split(/\s+/).filter(Boolean).length
      setWordCount(words)
    }
  }
  
  // Navigate between sections
  const goToNextSection = () => {
    if (currentSection === "A") {
      setCurrentSection("B")
    } else if (currentSection === "B") {
      setCurrentSection("C")
    }
  }
  
  const goToPreviousSection = () => {
    if (currentSection === "C") {
      setCurrentSection("B")
    } else if (currentSection === "B") {
      setCurrentSection("A")
    }
  }

  // Questions for Section A - Visual Text Comprehension
  const questionsA = {
    1: {
      id: 1,
      text: "What is the main message conveyed by the image?",
      answer: "The main message is about environmental awareness and sustainability. The image likely depicts the impact of human actions on the environment and encourages viewers to take responsibility for environmental protection."
    },
    2: {
      id: 2,
      text: "How does the visual element support the text?",
      answer: "The visual elements likely illustrate the text by showing environmental concerns visually (such as pollution, deforestation, or conservation efforts), making the message more impactful and emotionally engaging than text alone."
    },
    3: {
      id: 3,
      text: "What is the target audience for this advertisement?",
      answer: "The target audience appears to be environmentally conscious individuals or the general public. The advertisement aims to increase awareness about environmental issues and motivate action among a broad audience."
    }
  }
  
  // Questions for Section B - Narrative Comprehension
  const questionsB = {
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
  
  // Questions for Section C - Non-Narrative Comprehension
  const questionsC = {
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

  // Content for each section
  const sectionContent = {
    A: {
      title: "Section A – Visual Text Comprehension",
      description: "Interpret posters, ads & infographics",
      contentType: "image",
      content: "/environment-awareness.jpg",
      timeBudget: "25 minutes"
    },
    B: {
      title: "Section B – Narrative Comprehension",
      description: "Practice story-based questions",
      contentType: "text",
      content: "Once upon a time, in a small village nestled at the edge of a vast forest known to locals as \"The Whispering Woods,\" there lived a curious young girl named Elara. Unlike the other villagers who feared the dense, mysterious forest, Elara was drawn to its secrets and the strange sounds that seemed to call to her at night.\n\nOne misty morning, Elara discovered a peculiar blue flower with luminescent petals growing just beyond her garden fence. She had never seen anything like it before, and as she reached out to touch it, the flower seemed to glow even brighter, as if responding to her presence.\n\nHer grandmother, a wise woman respected in the village for her knowledge of old folklore, warned her about the forest's enchantments. \"The forest gives gifts,\" she said, her eyes reflecting wisdom accumulated over decades, \"but every gift comes with a price. Be careful what you accept from the Whispering Woods.\"\n\nElara, unable to resist the call of adventure, kept the strange flower in a jar by her bedside. That night, she dreamed of towering trees with faces, talking animals, and a silver path that led deeper into the heart of the forest. When she awoke, she found small blue petals scattered across her bedroom floor, forming a trail that led to her window—and beyond, toward the edge of the Whispering Woods.\n\nThe decision she faced would change everything. Should she follow the mysterious path into the unknown, or heed her grandmother's warning about the forest's unpredictable nature?",
      timeBudget: "40 minutes"
    },
    C: {
      title: "Section C – Non-Narrative Comprehension",
      description: "Answer non-fiction + summary writing",
      contentType: "text",
      content: "The rapid advancement of artificial intelligence (AI) technology is reshaping our world in unprecedented ways. From healthcare to transportation, AI systems are becoming increasingly sophisticated and capable of handling complex tasks that were once thought to be exclusively human domains.\n\nRecent developments in machine learning algorithms have led to significant breakthroughs in natural language processing and computer vision. These advances have enabled AI systems to understand and respond to human speech with remarkable accuracy, translate between languages in real-time, and identify objects and patterns in images with precision that sometimes exceeds human capabilities.\n\nHowever, the integration of AI into society raises important ethical considerations. Questions about privacy, accountability, and the potential impact on employment have become central to the discourse surrounding AI development. Experts argue that establishing robust regulatory frameworks is crucial to ensure that AI technologies benefit humanity while minimizing potential risks.",
      timeBudget: "45 minutes"
    }
  }
  
  // Evaluate answers for each section
  const evaluateSectionA = async () => {
    setIsSubmitting(true)
    try {
      const visualDescription = "An environmental awareness advertisement showing the impact of human actions on the environment. The image depicts a contrast between healthy nature and environmental degradation, with accompanying text that calls for sustainable practices and environmental protection."
      
      const questionsWithAnswers: QuestionWithAnswer[] = [
        {
          question: questionsA[1].text,
          idealAnswer: questionsA[1].answer,
          userAnswer: answersA[1]
        },
        {
          question: questionsA[2].text,
          idealAnswer: questionsA[2].answer,
          userAnswer: answersA[2]
        },
        {
          question: questionsA[3].text,
          idealAnswer: questionsA[3].answer,
          userAnswer: answersA[3]
        }
      ]

      const result = await evaluateAnswers(visualDescription, questionsWithAnswers)
      
      if (result && result.feedback) {
        // Ensure score is properly converted to a number
        const finalScore = typeof result.score === 'number' ? result.score : Number(result.score) || 0
        
        // Update section scores
        setSectionScores(prev => ({
          ...prev,
          A: finalScore
        }))
        
        // Go to next section
        goToNextSection()
        
        // Save progress
        saveProgress()
      } else {
        throw new Error('Received invalid feedback from evaluation')
      }
    } catch (error) {
      console.error('Error evaluating answers for Section A:', error)
      alert("There was an error evaluating your answers. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const evaluateSectionB = async () => {
    setIsSubmitting(true)
    try {
      const storyText = sectionContent.B.content
      
      const questionsWithAnswers: QuestionWithAnswer[] = [
        {
          question: questionsB[1].text,
          idealAnswer: questionsB[1].answer,
          userAnswer: answersB[1]
        },
        {
          question: questionsB[2].text,
          idealAnswer: questionsB[2].answer,
          userAnswer: answersB[2]
        },
        {
          question: questionsB[3].text,
          idealAnswer: questionsB[3].answer,
          userAnswer: answersB[3]
        }
      ]

      const result = await evaluateAnswers(storyText, questionsWithAnswers)
      
      if (result && result.feedback) {
        // Ensure score is properly converted to a number
        const finalScore = typeof result.score === 'number' ? result.score : Number(result.score) || 0
        
        // Update section scores
        setSectionScores(prev => ({
          ...prev,
          B: finalScore
        }))
        
        // Go to next section
        goToNextSection()
        
        // Save progress
        saveProgress()
      } else {
        throw new Error('Received invalid feedback from evaluation')
      }
    } catch (error) {
      console.error('Error evaluating answers for Section B:', error)
      alert("There was an error evaluating your answers. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const evaluateSectionC = async () => {
    setIsSubmitting(true)
    try {
      const articleText = sectionContent.C.content
      
      const questionsWithAnswers: QuestionWithAnswer[] = [
        {
          question: questionsC[1].text,
          idealAnswer: questionsC[1].answer,
          userAnswer: answersC[1]
        },
        {
          question: questionsC[2].text,
          idealAnswer: questionsC[2].answer,
          userAnswer: answersC[2]
        },
        {
          question: questionsC[3].text,
          idealAnswer: questionsC[3].answer,
          userAnswer: answersC[3]
        }
      ]

      const result = await evaluateAnswers(articleText, questionsWithAnswers)
      
      if (result && result.feedback) {
        // Ensure score is properly converted to a number
        const finalScore = typeof result.score === 'number' ? result.score : Number(result.score) || 0
        
        // Update section scores
        setSectionScores(prev => ({
          ...prev,
          C: finalScore
        }))
        
        // Show final feedback
        setFeedback(result.feedback)
        setScore(finalScore)
        setShowFeedback(true)
        
        // Mark session as completed
        try {
          // Update the recent sessions list to mark this session as completed
          const recentSessionsStr = localStorage.getItem('recentSessions')
          if (recentSessionsStr) {
            const recentSessions = JSON.parse(recentSessionsStr)
            const updatedRecentSessions = recentSessions.map(session => {
              if (session.id === 'fullPractice') {
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
          
          // Record completed practice
          const practiceResult = {
            section: "Full",
            name: "Full Comprehension Practice",
            score: (sectionScores.A || 0) + (sectionScores.B || 0) + finalScore,
            completedAt: new Date().toISOString()
          }
          
          // Get existing results from localStorage
          const storedResults = localStorage.getItem('practiceResults')
          const existingResults = storedResults ? JSON.parse(storedResults) : []
          
          // Add new result
          const updatedResults = [...existingResults, practiceResult]
          
          // Save to localStorage
          localStorage.setItem('practiceResults', JSON.stringify(updatedResults))
          
          // Dispatch event to notify other components that a practice is complete
          window.dispatchEvent(new CustomEvent('practiceComplete'))
        } catch (error) {
          console.error('Error saving practice result:', error)
        }
      } else {
        throw new Error('Received invalid feedback from evaluation')
      }
    } catch (error) {
      console.error('Error evaluating answers for Section C:', error)
      alert("There was an error evaluating your answers. Please try again.")
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
    return String(feedbackText)
  }

  return (
    <div className="min-h-screen bg-[#f5f9ff]">
      {/* Header */}
      <header className="border-b bg-white py-4 px-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors">
              <Home size={18} />
            </Link>
            <h1 className="text-xl font-medium text-gray-800">
              Full Comprehension Practice - {sectionContent[currentSection].title}
            </h1>
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
            <div className="flex items-center gap-2 text-gray-600">
              <span>Section {currentSection}</span>
              {/* Progress indicator */}
              <div className="w-24 h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Section tabs */}
        <div className="flex mb-6 border-b">
          <button 
            className={`px-4 py-2 ${currentSection === "A" ? "border-b-2 border-blue-500 font-medium text-blue-600" : "text-gray-500"}`}
            onClick={() => setCurrentSection("A")}
          >
            Section A
          </button>
          <button 
            className={`px-4 py-2 ${currentSection === "B" ? "border-b-2 border-blue-500 font-medium text-blue-600" : "text-gray-500"}`}
            onClick={() => setCurrentSection("B")}
          >
            Section B
          </button>
          <button 
            className={`px-4 py-2 ${currentSection === "C" ? "border-b-2 border-blue-500 font-medium text-blue-600" : "text-gray-500"}`}
            onClick={() => setCurrentSection("C")}
          >
            Section C
          </button>
        </div>
        
        {/* Recommended time */}
        <div className="mb-4 text-gray-600">
          <p>Recommended time: {sectionContent[currentSection].timeBudget}</p>
        </div>
        
        {/* Section specific content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left panel - Content Display */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {currentSection === "A" ? "Environmental Awareness" : 
                 currentSection === "B" ? "The Enchanted Forest" : 
                 "The Future of Artificial Intelligence"}
              </h2>
              
              {/* Different content for each section */}
              {currentSection === "A" ? (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <img src="/environment-awareness.jpg" alt="Environmental Awareness" className="w-full" />
                </div>
              ) : (
                <div className="prose max-w-none text-gray-700">
                  {sectionContent[currentSection].content.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right panel - Questions */}
          <div className="space-y-6">
            {currentSection === "A" && (
              <>
                {/* Section A Questions */}
                {Object.values(questionsA).map(question => (
                  <div key={question.id} className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600 font-medium">
                        {question.id}
                      </div>
                      <h2 className="text-lg font-medium text-gray-800">{question.text}</h2>
                      <button className="text-gray-400 hover:text-gray-600 transition-colors ml-auto">
                        <HelpCircle className="w-5 h-5" />
                      </button>
                    </div>
                    <div>
                      <textarea
                        className="w-full h-24 p-4 border border-gray-200 text-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Type your answer here..."
                        value={answersA[question.id]}
                        onChange={(e) => handleAnswerChangeA(question.id, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </>
            )}
            
            {currentSection === "B" && (
              <>
                {/* Section B Questions */}
                {Object.values(questionsB).map(question => (
                  <div key={question.id} className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600 font-medium">
                        {question.id}
                      </div>
                      <h2 className="text-lg font-medium text-gray-800">{question.text}</h2>
                      <button className="text-gray-400 hover:text-gray-600 transition-colors ml-auto">
                        <HelpCircle className="w-5 h-5" />
                      </button>
                    </div>
                    <div>
                      <textarea
                        className="w-full h-24 p-4 border border-gray-200 text-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Type your answer here..."
                        value={answersB[question.id]}
                        onChange={(e) => handleAnswerChangeB(question.id, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </>
            )}
            
            {currentSection === "C" && (
              <>
                {/* Section C Questions */}
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
                    {questionsC[1].text}
                  </p>
                  <div>
                    <textarea
                      className="w-full h-24 p-4 border border-gray-200 text-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Type your answer here..."
                      value={answersC[1]}
                      onChange={(e) => handleAnswerChangeC(1, e.target.value)}
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
                  <p className="mb-4 text-gray-700">{questionsC[2].text}</p>
                  <div>
                    <div className="mb-2 text-sm text-gray-500 flex justify-between">
                      <span>Write a concise summary</span>
                      <span className={wordCount > 80 ? "text-red-500 font-medium" : ""}>
                        {wordCount}/80 words
                      </span>
                    </div>
                    <textarea
                      className="w-full h-24 p-4 border border-gray-200 text-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Write your summary here..."
                      value={answersC[2]}
                      onChange={(e) => {
                        const text = e.target.value;
                        handleAnswerChangeC(2, text);
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
                    {questionsC[3].text}
                  </p>
                  <div>
                    <textarea
                      className="w-full h-24 p-4 border border-gray-200 text-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Type your answer here..."
                      value={answersC[3]}
                      onChange={(e) => handleAnswerChangeC(3, e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-12 flex justify-between">
          {/* Back button */}
          {currentSection !== "A" && (
            <button 
              onClick={goToPreviousSection}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-full shadow-sm transition-colors font-medium"
            >
              <ArrowLeft size={20} />
              Previous Section
            </button>
          )}
          
          {/* Spacer if there's no back button */}
          {currentSection === "A" && <div></div>}
          
          {/* Next button */}
          {currentSection === "A" && (
            <button 
              onClick={evaluateSectionA}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full shadow-sm transition-colors font-medium disabled:bg-blue-300"
            >
              {isSubmitting ? "Submitting..." : "Next Section"}
              {!isSubmitting && <ArrowRight size={20} />}
            </button>
          )}
          
          {currentSection === "B" && (
            <button 
              onClick={evaluateSectionB}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full shadow-sm transition-colors font-medium disabled:bg-blue-300"
            >
              {isSubmitting ? "Submitting..." : "Next Section"}
              {!isSubmitting && <ArrowRight size={20} />}
            </button>
          )}
          
          {currentSection === "C" && (
            <button 
              onClick={evaluateSectionC}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full shadow-sm transition-colors font-medium disabled:bg-orange-300"
            >
              {isSubmitting ? "Submitting..." : "Complete Test"}
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
          )}
        </div>
      </main>
      
      {/* Final Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
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
                      {score !== null && (
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke="#4ade80"
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
              
              {/* Feedback Text */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">Final Feedback - Section C</h3>
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
                  <Link href="/">
                    <button
                      className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                    >
                      Return to Dashboard
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 