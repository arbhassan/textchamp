"use client"

import { useState, useEffect } from "react"
import { HelpCircle, X, Home, Save, ArrowLeft, ArrowRight } from "lucide-react"
import { evaluateAnswers } from "../api/evaluate-answers/utils"
import { QuestionWithAnswer } from "../api/evaluate-answers/types"
import ReactMarkdown from 'react-markdown'
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "../../lib/supabase"
import { VisualExercise, Question, NarrativeExercise, NarrativeQuestion } from "../../lib/types"

// Define additional types for Section C
interface NonNarrativeExercise {
  id: number
  title: string
  content: string
  description?: string
  time_limit: number
  questions: NonNarrativeQuestion[]
}

interface NonNarrativeQuestion {
  id: number
  question_text: string
  ideal_answer: string
  question_order: number
  word_limit?: number
  marks?: number
}

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
  
  // Added state for exercises and questions from Supabase
  const [loading, setLoading] = useState(true)
  const [visualExercise, setVisualExercise] = useState<VisualExercise | null>(null)
  const [visualQuestions, setVisualQuestions] = useState<Record<number, Question>>({})
  const [narrativeExercise, setNarrativeExercise] = useState<NarrativeExercise | null>(null)
  const [nonNarrativeExercise, setNonNarrativeExercise] = useState<NonNarrativeExercise | null>(null)
  
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
  
  // Fetch exercise data from Supabase for all three sections
  useEffect(() => {
    async function fetchExerciseData() {
      try {
        setLoading(true)
        
        // 1. Fetch visual exercise (Section A)
        const { data: visualData, error: visualError } = await supabase
          .from('visual_exercises')
          .select('*')
          .order('id')
          .limit(1)
          .single()
        
        if (visualError) {
          console.error('Error fetching visual exercise:', visualError)
        } else {
          setVisualExercise(visualData)
          
          // Fetch questions for visual exercise
          const { data: visualQuestionsData, error: visualQuestionsError } = await supabase
            .from('questions')
            .select('*')
            .eq('exercise_id', visualData.id)
            .order('question_order', { ascending: true })
            
          if (visualQuestionsError) {
            console.error('Error fetching visual questions:', visualQuestionsError)
          } else {
            // Convert array to record object with question id as key
            const questionRecord = visualQuestionsData.reduce((acc, question) => {
              acc[question.id] = question
              return acc
            }, {})
            
            setVisualQuestions(questionRecord)
            
            // Initialize answers state with empty strings for each question
            const initialAnswersA = visualQuestionsData.reduce((acc, question, index) => {
              // Use index+1 as the key to match the original structure (1, 2, 3)
              acc[index + 1] = ""
              return acc
            }, {})
            
            setAnswersA(initialAnswersA)
          }
        }
        
        // 2. Fetch narrative exercise (Section B)
        const { data: narrativeData, error: narrativeError } = await supabase
          .from('narrative_exercises')
          .select('*')
          .order('id')
          .limit(1)
          .single()
        
        if (narrativeError) {
          console.error('Error fetching narrative exercise:', narrativeError)
        } else {
          setNarrativeExercise(narrativeData)
          
          // Initialize answers state based on the narrative questions
          if (narrativeData.questions && narrativeData.questions.length > 0) {
            const initialAnswersB = narrativeData.questions.reduce((acc, question, index) => {
              // Use index+1 as the key to match the original structure (1, 2, 3)
              acc[index + 1] = ""
              return acc
            }, {})
            
            setAnswersB(initialAnswersB)
          }
        }
        
        // 3. Fetch non-narrative exercise (Section C)
        const { data: nonNarrativeData, error: nonNarrativeError } = await supabase
          .from('non_narrative_exercises')
          .select('* ')
          .order('id')
          .limit(1)
          .single()
        
        if (nonNarrativeError) {
          console.error('Error fetching non-narrative exercise:', nonNarrativeError)
        } else {
          setNonNarrativeExercise(nonNarrativeData)
          
          // Initialize answers state based on the non-narrative questions
          if (nonNarrativeData.questions && nonNarrativeData.questions.length > 0) {
            const initialAnswersC = nonNarrativeData.questions.reduce((acc, question, index) => {
              // Use index+1 as the key to match the original structure (1, 2, 3)
              acc[index + 1] = ""
              return acc
            }, {})
            
            setAnswersC(initialAnswersC)
          }
        }
        
      } catch (error) {
        console.error('Error fetching exercises:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchExerciseData()
  }, [])
  
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
  const getQuestionsA = () => {
    // If we have loaded questions from Supabase
    if (Object.keys(visualQuestions).length > 0) {
      return Object.values(visualQuestions).reduce((acc, question, index) => {
        acc[index + 1] = {
          id: index + 1,
          text: question.text,
          answer: question.ideal_answer,
          marks: question.marks || 1
        }
        return acc
      }, {})
    }
    
    // Fallback questions
    return {
      1: {
        id: 1,
        text: "What is the main message conveyed by the image?",
        answer: "The main message is about environmental awareness and sustainability. The image likely depicts the impact of human actions on the environment and encourages viewers to take responsibility for environmental protection.",
        marks: 1
      },
      2: {
        id: 2,
        text: "How does the visual element support the text?",
        answer: "The visual elements likely illustrate the text by showing environmental concerns visually (such as pollution, deforestation, or conservation efforts), making the message more impactful and emotionally engaging than text alone.",
        marks: 2
      },
      3: {
        id: 3,
        text: "What is the target audience for this advertisement?",
        answer: "The target audience appears to be environmentally conscious individuals or the general public. The advertisement aims to increase awareness about environmental issues and motivate action among a broad audience.",
        marks: 2
      }
    }
  }

  // Questions for Section B - Narrative Comprehension
  const getQuestionsB = () => {
    // If we have loaded questions from Supabase
    if (narrativeExercise?.questions && narrativeExercise.questions.length > 0) {
      return narrativeExercise.questions.reduce((acc, question, index) => {
        acc[index + 1] = {
          id: index + 1,
          text: question.question_text || question.text,
          answer: question.ideal_answer || question.answer,
          marks: question.marks || 1
        }
        return acc
      }, {})
    }
    
    // Fallback questions
    return {
      1: {
        id: 1,
        text: "What is the main character's attitude toward the forest?",
        answer: "Elara is curious and drawn to the forest, unlike the other villagers who fear it. She's adventurous and interested in its secrets.",
        marks: 1
      },
      2: {
        id: 2,
        text: "What does the grandmother's warning suggest about the forest?",
        answer: "The grandmother's warning suggests the forest is magical but potentially dangerous. It gives gifts that come with a price, indicating it has a dual nature of beauty and risk.",
        marks: 2
      },
      3: {
        id: 3,
        text: "What literary device is used in \"The Whispering Woods\"?",
        answer: "Personification is used in 'The Whispering Woods' - the forest is given human-like qualities such as whispering and giving gifts.",
        marks: 2
      }
    }
  }
  
  // Questions for Section C - Non-Narrative Comprehension
  const getQuestionsC = () => {
    // If we have loaded questions from Supabase
    if (nonNarrativeExercise?.questions && nonNarrativeExercise.questions.length > 0) {
      return nonNarrativeExercise.questions.reduce((acc, question, index) => {
        acc[index + 1] = {
          id: index + 1,
          text: question.question_text || question.text,
          answer: question.ideal_answer || question.answer,
          marks: question.marks || 1
        }
        return acc
      }, {})
    }
    
    // Fallback questions
    return {
      1: {
        id: 1,
        text: "What is the central theme of the passage? Support your answer with evidence.",
        answer: "The central theme is the rapid advancement of AI technology and its implications for society. Evidence includes the references to AI reshaping the world, becoming more sophisticated, and the ethical considerations it raises including privacy, accountability, and employment impacts.",
        marks: 2
      },
      2: {
        id: 2,
        text: "Write a summary of the passage in no more than 80 words.",
        answer: "AI technology is rapidly advancing and transforming various sectors. Recent breakthroughs in machine learning have enabled AI systems to process language and visual data with exceptional accuracy. However, this integration raises ethical concerns about privacy, accountability, and employment impacts. Experts emphasize the need for regulatory frameworks to maximize benefits while minimizing risks.",
        marks: 1
      },
      3: {
        id: 3,
        text: "What ethical concerns does the passage highlight about AI development?",
        answer: "The passage highlights ethical concerns about privacy, accountability, and the potential impact on employment. It emphasizes the need for robust regulatory frameworks to ensure AI technologies benefit humanity while minimizing potential risks.",
        marks: 2
      }
    }
  }
  
  // Use the getter functions to get the questions
  const questionsA = getQuestionsA()
  const questionsB = getQuestionsB()
  const questionsC = getQuestionsC()

  // Content for each section
  const sectionContent = {
    A: {
      title: "Section A – Visual Text Comprehension",
      description: "Interpret posters, ads & infographics",
      contentType: "image",
      content: visualExercise?.image_url || "/environment-awareness.jpg",
      timeBudget: "25 minutes"
    },
    B: {
      title: "Section B – Narrative Comprehension",
      description: "Practice story-based questions",
      contentType: "text",
      content: narrativeExercise?.story_text || "Once upon a time, in a small village nestled at the edge of a vast forest known to locals as \"The Whispering Woods,\" there lived a curious young girl named Elara. Unlike the other villagers who feared the dense, mysterious forest, Elara was drawn to its secrets and the strange sounds that seemed to call to her at night.\n\nOne misty morning, Elara discovered a peculiar blue flower with luminescent petals growing just beyond her garden fence. She had never seen anything like it before, and as she reached out to touch it, the flower seemed to glow even brighter, as if responding to her presence.\n\nHer grandmother, a wise woman respected in the village for her knowledge of old folklore, warned her about the forest's enchantments. \"The forest gives gifts,\" she said, her eyes reflecting wisdom accumulated over decades, \"but every gift comes with a price. Be careful what you accept from the Whispering Woods.\"\n\nElara, unable to resist the call of adventure, kept the strange flower in a jar by her bedside. That night, she dreamed of towering trees with faces, talking animals, and a silver path that led deeper into the heart of the forest. When she awoke, she found small blue petals scattered across her bedroom floor, forming a trail that led to her window—and beyond, toward the edge of the Whispering Woods.\n\nThe decision she faced would change everything. Should she follow the mysterious path into the unknown, or heed her grandmother's warning about the forest's unpredictable nature?",
      timeBudget: narrativeExercise?.time_limit ? `${Math.floor(narrativeExercise.time_limit / 60)} minutes` : "40 minutes"
    },
    C: {
      title: "Section C – Non-Narrative Comprehension",
      description: "Answer non-fiction + summary writing",
      contentType: "text",
      content: nonNarrativeExercise?.content || "The rapid advancement of artificial intelligence (AI) technology is reshaping our world in unprecedented ways. From healthcare to transportation, AI systems are becoming increasingly sophisticated and capable of handling complex tasks that were once thought to be exclusively human domains.\n\nRecent developments in machine learning algorithms have led to significant breakthroughs in natural language processing and computer vision. These advances have enabled AI systems to understand and respond to human speech with remarkable accuracy, translate between languages in real-time, and identify objects and patterns in images with precision that sometimes exceeds human capabilities.\n\nHowever, the integration of AI into society raises important ethical considerations. Questions about privacy, accountability, and the potential impact on employment have become central to the discourse surrounding AI development. Experts argue that establishing robust regulatory frameworks is crucial to ensure that AI technologies benefit humanity while minimizing potential risks.",
      timeBudget: nonNarrativeExercise?.time_limit ? `${Math.floor(nonNarrativeExercise.time_limit / 60)} minutes` : "45 minutes"
    }
  }
  
  // Evaluate answers for each section
  const evaluateSectionA = async () => {
    setIsSubmitting(true)
    try {
      // Use the description from the Supabase data or fall back to a default
      const visualDescription = visualExercise?.description || 
        "An environmental awareness advertisement showing the impact of human actions on the environment. The image depicts a contrast between healthy nature and environmental degradation, with accompanying text that calls for sustainable practices and environmental protection."
      
      const questionsWithAnswers: QuestionWithAnswer[] = Object.values(questionsA).map(q => ({
        question: q.text,
        idealAnswer: q.answer,
        userAnswer: answersA[q.id] || ""
      }))

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
      // Use the story text from the Supabase data or fall back to the content in sectionContent
      const storyText = narrativeExercise?.story_text || sectionContent.B.content
      
      const questionsWithAnswers: QuestionWithAnswer[] = Object.values(questionsB).map(q => ({
        question: q.text,
        idealAnswer: q.answer,
        userAnswer: answersB[q.id] || ""
      }))

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
      // Use the content from the Supabase data or fall back to the content in sectionContent
      const articleText = nonNarrativeExercise?.content || sectionContent.C.content
      
      const questionsWithAnswers: QuestionWithAnswer[] = Object.values(questionsC).map(q => ({
        question: q.text,
        idealAnswer: q.answer,
        userAnswer: answersC[q.id] || ""
      }))

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
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading content...</p>
          </div>
        ) : (
          <>
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
                    {currentSection === "A" ? (visualExercise?.title || "Environmental Awareness") : 
                     currentSection === "B" ? (narrativeExercise?.title || "The Enchanted Forest") : 
                     (nonNarrativeExercise?.title || "The Future of Artificial Intelligence")}
                  </h2>
                  
                  {/* Different content for each section */}
                  {currentSection === "A" ? (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                      <img src={sectionContent.A.content} alt={visualExercise?.title || "Visual Exercise"} className="w-full" />
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
                          <div className="ml-2 text-sm text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-md">
                            {question.marks || 1} {(question.marks || 1) === 1 ? 'mark' : 'marks'}
                          </div>
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
                          <div className="ml-2 text-sm text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-md">
                            {question.marks || 1} {(question.marks || 1) === 1 ? 'mark' : 'marks'}
                          </div>
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
                    {Object.values(questionsC).map(question => (
                      <div key={question.id} className="bg-white rounded-2xl shadow-sm p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600 font-medium">
                            {question.id}
                          </div>
                          <h2 className="text-lg font-medium text-gray-800">
                            {question.id === 1 ? "Main Idea" : 
                             question.id === 2 ? "Summary Writing" : 
                             "Critical Analysis"}
                          </h2>
                          <div className="ml-2 text-sm text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-md">
                            {question.marks || 1} {(question.marks || 1) === 1 ? 'mark' : 'marks'}
                          </div>
                          <button className="text-gray-400 hover:text-gray-600 transition-colors ml-auto">
                            <HelpCircle className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="mb-4 text-gray-700">
                          {question.text}
                        </p>
                        <div>
                          {question.id === 2 ? (
                            <>
                              <div className="mb-2 text-sm text-gray-500 flex justify-between">
                                <span>Write a concise summary</span>
                                <span className={wordCount > 80 ? "text-red-500 font-medium" : ""}>
                                  {wordCount}/80 words
                                </span>
                              </div>
                              <textarea
                                className="w-full h-24 p-4 border border-gray-200 text-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Write your summary here..."
                                value={answersC[question.id]}
                                onChange={(e) => {
                                  const text = e.target.value;
                                  handleAnswerChangeC(question.id, text);
                                }}
                              />
                            </>
                          ) : (
                            <textarea
                              className="w-full h-24 p-4 border border-gray-200 text-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Type your answer here..."
                              value={answersC[question.id]}
                              onChange={(e) => handleAnswerChangeC(question.id, e.target.value)}
                            />
                          )}
                        </div>
                      </div>
                    ))}
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
          </>
        )}
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