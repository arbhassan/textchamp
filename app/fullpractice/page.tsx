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
  const [saveStatus, setSaveStatus] = useState("")
  const [progress, setProgress] = useState(0) // 0 to 100
  
  // Added state for feedback data for each section
  const [sectionFeedback, setSectionFeedback] = useState({
    A: "",
    B: "",
    C: ""
  })
  
  // Added state for exercises and questions from Supabase
  const [loading, setLoading] = useState(true)
  const [visualExercise, setVisualExercise] = useState<VisualExercise | null>(null)
  const [visualQuestions, setVisualQuestions] = useState<Record<number, Question>>({})
  const [narrativeExercise, setNarrativeExercise] = useState<NarrativeExercise | null>(null)
  const [questionsB, setQuestionsB] = useState<Record<string, any>>({}) // Add state for questionsB
  const [nonNarrativeExercise, setNonNarrativeExercise] = useState<NonNarrativeExercise | null>(null)
  
  // New state for multiple exercises
  const [allVisualExercises, setAllVisualExercises] = useState<VisualExercise[]>([])
  const [allNarrativeExercises, setAllNarrativeExercises] = useState<NarrativeExercise[]>([])
  const [allNonNarrativeExercises, setAllNonNarrativeExercises] = useState<NonNarrativeExercise[]>([])
  
  // Current exercise indices
  const [currentVisualExerciseIndex, setCurrentVisualExerciseIndex] = useState(0)
  const [currentNarrativeExerciseIndex, setCurrentNarrativeExerciseIndex] = useState(0)
  const [currentNonNarrativeExerciseIndex, setCurrentNonNarrativeExerciseIndex] = useState(0)
  
  // Exercise changed flags to trigger reloading
  const [exerciseAChanged, setExerciseAChanged] = useState(false)
  const [exerciseBChanged, setExerciseBChanged] = useState(false)
  const [exerciseCChanged, setExerciseCChanged] = useState(false)
  
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
          
          // Load section feedback
          if (session.sectionFeedback) {
            setSectionFeedback(session.sectionFeedback)
          }
          
          // Restore exercise indices
          if (session.currentVisualExerciseIndex !== undefined) {
            setCurrentVisualExerciseIndex(session.currentVisualExerciseIndex)
          }
          
          if (session.currentNarrativeExerciseIndex !== undefined) {
            setCurrentNarrativeExerciseIndex(session.currentNarrativeExerciseIndex)
          }
          
          if (session.currentNonNarrativeExerciseIndex !== undefined) {
            setCurrentNonNarrativeExerciseIndex(session.currentNonNarrativeExerciseIndex)
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
        
        // First, fetch all available exercises for each section
        const { data: allVisualData, error: allVisualError } = await supabase
          .from('visual_exercises')
          .select('*')
          .order('id')
        
        if (allVisualError) {
          console.error('Error fetching all visual exercises:', allVisualError)
        } else if (allVisualData && allVisualData.length > 0) {
          setAllVisualExercises(allVisualData)
        }
        
        const { data: allNarrativeData, error: allNarrativeError } = await supabase
          .from('narrative_exercises')
          .select('*')
          .order('id')
        
        if (allNarrativeError) {
          console.error('Error fetching all narrative exercises:', allNarrativeError)
        } else if (allNarrativeData && allNarrativeData.length > 0) {
          setAllNarrativeExercises(allNarrativeData)
        }
        
        const { data: allNonNarrativeData, error: allNonNarrativeError } = await supabase
          .from('non_narrative_exercises')
          .select('*')
          .order('id')
        
        if (allNonNarrativeError) {
          console.error('Error fetching all non-narrative exercises:', allNonNarrativeError)
        } else if (allNonNarrativeData && allNonNarrativeData.length > 0) {
          setAllNonNarrativeExercises(allNonNarrativeData)
        }
        
        // Check for exercise IDs in URL
        const searchParams = new URLSearchParams(window.location.search)
        const visualExerciseId = searchParams.get('visual')
        const narrativeExerciseId = searchParams.get('narrative')
        const nonNarrativeExerciseId = searchParams.get('nonnarrative')
        
        // 1. Fetch visual exercise (Section A)
        let visualQuery = supabase.from('visual_exercises').select('*')
        
        if (visualExerciseId && allVisualData) {
          visualQuery = visualQuery.eq('id', visualExerciseId)
          // Update the current index
          const index = allVisualData.findIndex(ex => ex.id.toString() === visualExerciseId)
          if (index !== -1) {
            setCurrentVisualExerciseIndex(index)
          }
        } else if (allVisualData && allVisualData.length > 0) {
          visualQuery = visualQuery.eq('id', allVisualData[0].id)
        } else {
          visualQuery = visualQuery.order('id').limit(1)
        }
        
        const { data: visualData, error: visualError } = await visualQuery.single()
        
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
        let narrativeQuery = supabase.from('narrative_exercises').select('*')
        
        if (narrativeExerciseId && allNarrativeData) {
          narrativeQuery = narrativeQuery.eq('id', narrativeExerciseId)
          // Update the current index
          const index = allNarrativeData.findIndex(ex => ex.id.toString() === narrativeExerciseId)
          if (index !== -1) {
            setCurrentNarrativeExerciseIndex(index)
          }
        } else if (allNarrativeData && allNarrativeData.length > 0) {
          narrativeQuery = narrativeQuery.eq('id', allNarrativeData[0].id)
        } else {
          narrativeQuery = narrativeQuery.order('id').limit(1)
        }
        
        const { data: narrativeData, error: narrativeError } = await narrativeQuery.single()
        
        if (narrativeError) {
          console.error('Error fetching narrative exercise:', narrativeError)
        } else {
          setNarrativeExercise(narrativeData)
          
          // Initialize questionsB state based on exercise type
          if (narrativeData.exercise_type === "questions" && narrativeData.questions && narrativeData.questions.length > 0) {
            // Create question records for regular questions
            const questionRecordB = narrativeData.questions.reduce((acc, question, index) => {
              acc[index + 1] = {
                id: index + 1,
                text: question.question_text || question.text,
                answer: question.ideal_answer || question.answer,
                marks: question.marks || 1
              };
              return acc;
            }, {});
            
            setQuestionsB(questionRecordB);
          } 
          else if (narrativeData.exercise_type === "combined" && narrativeData.flowchart) {
            // For combined type, prepare both question and flowchart records
            let combinedQuestions = {};
            
            // Add regular questions
            if (narrativeData.questions && narrativeData.questions.length > 0) {
              narrativeData.questions.forEach((question, index) => {
                combinedQuestions[index + 1] = {
                  id: index + 1,
                  text: question.question_text || question.text,
                  answer: question.ideal_answer || question.answer,
                  marks: question.marks || 1
                };
              });
            }
            
            // Add flowchart questions
            narrativeData.flowchart.sections.forEach((section, idx) => {
              const sectionId = section.id || `section-${idx}`;
              combinedQuestions[`flowchart-${sectionId}`] = {
                id: `flowchart-${sectionId}`,
                question_text: section.name || `Section ${idx + 1}`,
                ideal_answer: section.correct_answer || narrativeData.flowchart.options[0],
                isFlowchart: true,
                mark: 0 // Initialize mark to 0
              };
            });
            
            setQuestionsB(combinedQuestions);
          }
          else if (narrativeData.exercise_type === "flowchart" && narrativeData.flowchart) {
            // For flowchart-only exercises
            const flowchartQuestions = narrativeData.flowchart.sections.reduce((acc, section, idx) => {
              const sectionId = section.id || `section-${idx}`;
              acc[`flowchart-${sectionId}`] = {
                id: `flowchart-${sectionId}`,
                question_text: section.name || `Section ${idx + 1}`,
                ideal_answer: section.correct_answer || narrativeData.flowchart.options[0],
                isFlowchart: true,
                mark: 0
              };
              return acc;
            }, {});
            
            setQuestionsB(flowchartQuestions);
          }
          
          // Initialize answers state based on the narrative exercise type
          if (narrativeData.exercise_type === "flowchart" && narrativeData.flowchart) {
            // Initialize answers for flowchart exercise
            const initialAnswersB = narrativeData.flowchart.sections.reduce((acc, section, idx) => {
              acc[section.id || `section-${idx}`] = ""
              return acc
            }, {})
            
            setAnswersB(initialAnswersB)
          } else if (narrativeData.exercise_type === "combined" && narrativeData.flowchart) {
            // Initialize answers for combined type
            let initialAnswersB = {};
            
            // Add answers for questions part
            if (narrativeData.questions && narrativeData.questions.length > 0) {
              narrativeData.questions.forEach((question, index) => {
                initialAnswersB[index + 1] = "";
              });
            }
            
            // Add answers for flowchart part
            narrativeData.flowchart.sections.forEach((section, idx) => {
              const sectionId = section.id || `section-${idx}`;
              initialAnswersB[sectionId] = "";
            });
            
            setAnswersB(initialAnswersB);
          } else if (narrativeData.questions && narrativeData.questions.length > 0) {
            // Initialize answers for question-type exercise
            const initialAnswersB = narrativeData.questions.reduce((acc, question, index) => {
              // Use index+1 as the key to match the original structure (1, 2, 3)
              acc[index + 1] = ""
              return acc
            }, {})
            
            setAnswersB(initialAnswersB)
          }
        }
        
        // 3. Fetch non-narrative exercise (Section C)
        let nonNarrativeQuery = supabase.from('non_narrative_exercises').select('*')
        
        if (nonNarrativeExerciseId && allNonNarrativeData) {
          nonNarrativeQuery = nonNarrativeQuery.eq('id', nonNarrativeExerciseId)
          // Update the current index
          const index = allNonNarrativeData.findIndex(ex => ex.id.toString() === nonNarrativeExerciseId)
          if (index !== -1) {
            setCurrentNonNarrativeExerciseIndex(index)
          }
        } else if (allNonNarrativeData && allNonNarrativeData.length > 0) {
          nonNarrativeQuery = nonNarrativeQuery.eq('id', allNonNarrativeData[0].id)
        } else {
          nonNarrativeQuery = nonNarrativeQuery.order('id').limit(1)
        }
        
        const { data: nonNarrativeData, error: nonNarrativeError } = await nonNarrativeQuery.single()
        
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
  
  // Handle switching to next/previous exercise for each section
  useEffect(() => {
    if (exerciseAChanged) {
      handleChangeVisualExercise()
      setExerciseAChanged(false)
    }
  }, [exerciseAChanged])
  
  useEffect(() => {
    if (exerciseBChanged) {
      handleChangeNarrativeExercise()
      setExerciseBChanged(false)
    }
  }, [exerciseBChanged])
  
  useEffect(() => {
    if (exerciseCChanged) {
      handleChangeNonNarrativeExercise()
      setExerciseCChanged(false)
    }
  }, [exerciseCChanged])
  
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
        sectionFeedback,
        // Save questions for the feedback page
        questionsA,
        questionsB,
        questionsC,
        lastSaved: new Date().toISOString(),
        // Save current exercise indices
        currentVisualExerciseIndex,
        currentNarrativeExerciseIndex,
        currentNonNarrativeExerciseIndex,
        // Save exercise IDs
        visualExerciseId: visualExercise?.id,
        narrativeExerciseId: narrativeExercise?.id,
        nonNarrativeExerciseId: nonNarrativeExercise?.id,
        // Save narrative exercise type for Section B
        exerciseTypeB: narrativeExercise?.exercise_type || "questions",
        // Save flowchart options if available for Section B
        flowchartOptionsB: narrativeExercise?.flowchart?.options || []
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
          status: "in-progress",
          // Include exercise info for display
          exercises: {
            visual: visualExercise?.title || "Visual Exercise",
            narrative: narrativeExercise?.title || "Narrative Exercise",
            nonNarrative: nonNarrativeExercise?.title || "Non-Narrative Exercise"
          }
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
    
    // Check if this is the last question in section C
    const lastQuestionId = Math.max(...Object.keys(questionsC).map(Number))
    
    // Update word count for the last question only
    if (questionId === lastQuestionId) {
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
    // If we already have questions in the state, return the state directly
    if (Object.keys(questionsB).length > 0) {
      return questionsB;
    }
    
    // Otherwise, generate questions from narrative exercise data
    let generatedQuestionsB = {};
    
    // If we have loaded questions from Supabase
    if (narrativeExercise?.questions && narrativeExercise.questions.length > 0) {
      generatedQuestionsB = narrativeExercise.questions.reduce((acc, question, index) => {
        acc[index + 1] = {
          id: index + 1,
          text: question.question_text || question.text,
          answer: question.ideal_answer || question.answer,
          marks: question.marks || 1
        }
        return acc
      }, {});
    } else {
      // Fallback questions if no questions data is available
      generatedQuestionsB = {
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
      };
    }
    
    // Update the state if we generated new questions
    if (Object.keys(generatedQuestionsB).length > 0 && Object.keys(questionsB).length === 0) {
      setQuestionsB(generatedQuestionsB);
    }
    
    // Return the state directly
    return questionsB;
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
  // Don't redeclare questionsB, just call the getter function to initialize if needed
  getQuestionsB()
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
      content: nonNarrativeExercise?.passage_text || "The rapid advancement of artificial intelligence (AI) technology is reshaping our world in unprecedented ways. From healthcare to transportation, AI systems are becoming increasingly sophisticated and capable of handling complex tasks that were once thought to be exclusively human domains.\n\nRecent developments in machine learning algorithms have led to significant breakthroughs in natural language processing and computer vision. These advances have enabled AI systems to understand and respond to human speech with remarkable accuracy, translate between languages in real-time, and identify objects and patterns in images with precision that sometimes exceeds human capabilities.\n\nHowever, the integration of AI into society raises important ethical considerations. Questions about privacy, accountability, and the potential impact on employment have become central to the discourse surrounding AI development. Experts argue that establishing robust regulatory frameworks is crucial to ensure that AI technologies benefit humanity while minimizing potential risks.",
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
        
        // Store section feedback
        setSectionFeedback(prev => ({
          ...prev,
          A: result.feedback
        }))
        
        // Update section scores
        setSectionScores(prev => ({
          ...prev,
          A: finalScore
        }))
        
        // Go to next section
        goToNextSection()
        
        // Save progress with the current exercise ID
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
      
      let result;
      
      if (narrativeExercise?.exercise_type === "questions") {
        // Regular question-based evaluation
        const questionsWithAnswers: QuestionWithAnswer[] = Object.values(questionsB).map(q => ({
          question: q.text,
          idealAnswer: q.answer,
          userAnswer: answersB[q.id] || ""
        }));
        
        result = await evaluateAnswers(storyText, questionsWithAnswers);
      } 
      else if (narrativeExercise?.exercise_type === "combined" && narrativeExercise?.flowchart) {
        // For combined exercises, evaluate both parts
        let questionScore = 0;
        let flowchartScore = 0;
        let questionFeedback = "";
        let flowchartFeedback = "";
        
        // Evaluate questions if present
        if (narrativeExercise.questions && narrativeExercise.questions.length > 0) {
          const questionsWithAnswers: QuestionWithAnswer[] = Object.values(questionsB).map(q => ({
            question: q.text,
            idealAnswer: q.answer,
            userAnswer: answersB[q.id] || ''
          }));
          
          const questionResult = await evaluateAnswers(storyText, questionsWithAnswers);
          questionScore = typeof questionResult.score === 'number' ? questionResult.score : Number(questionResult.score) || 0;
          questionFeedback = questionResult.feedback || "";
        }
        
        // Evaluate flowchart if present
        if (narrativeExercise.flowchart) {
          // Implement basic evaluation for flowchart answers
          const flowchartSections = narrativeExercise.flowchart.sections;
          const correctAnswers = flowchartSections.filter((section, idx) => {
            const sectionId = section.id || `section-${idx}`;
            const userAnswer = answersB[sectionId] || '';
            // If there's a correct_answer property, compare with it
            if (section.correct_answer) {
              return userAnswer.trim().toLowerCase() === section.correct_answer.trim().toLowerCase();
            }
            // Otherwise check if answer is one of the options
            return narrativeExercise.flowchart.options.some(option => 
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
        const totalQuestionWeight = narrativeExercise.questions ? 0.7 : 0; // 70% weight for questions if present
        const totalFlowchartWeight = narrativeExercise.flowchart ? (narrativeExercise.questions ? 0.3 : 1) : 0; // 30% weight for flowchart if questions present, 100% otherwise
        
        const combinedScore = (questionScore * totalQuestionWeight) + (flowchartScore * totalFlowchartWeight);
        const combinedFeedback = [
          narrativeExercise.questions && narrativeExercise.questions.length > 0 ? "Questions Feedback:\n" + questionFeedback : "",
          narrativeExercise.flowchart ? "Flowchart Feedback:\n" + flowchartFeedback : ""
        ].filter(Boolean).join("\n\n");
        
        result = {
          feedback: combinedFeedback,
          score: combinedScore
        };
      }
      else if (narrativeExercise?.exercise_type === "flowchart" && narrativeExercise?.flowchart) {
        // For flowchart exercises, we create a different evaluation
        // Convert flowchart answers to QuestionWithAnswer format for the evaluator
        const questionsWithAnswers: QuestionWithAnswer[] = narrativeExercise.flowchart.sections.map((section, idx) => {
          const sectionKey = section.id || `section-${idx}`;
          return {
            question: `${section.name}: Word that best describes this section`,
            idealAnswer: section.correct_answer || narrativeExercise.flowchart.options[0], // Fallback to first option if no correct answer
            userAnswer: answersB[sectionKey] || ""
          };
        });
        
        result = await evaluateAnswers(storyText, questionsWithAnswers);
      }
      
      if (result && result.feedback) {
        // Ensure score is properly converted to a number
        const finalScore = typeof result.score === 'number' ? result.score : Number(result.score) || 0
        
        // Store section feedback
        setSectionFeedback(prev => ({
          ...prev,
          B: result.feedback
        }))
        
        // Update section scores
        setSectionScores(prev => ({
          ...prev,
          B: finalScore
        }))
        
        // Go to next section
        goToNextSection()
        
        // Save progress with the current exercise ID
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
        
        // Store section feedback
        setSectionFeedback(prev => ({
          ...prev,
          C: result.feedback
        }))
        
        // Update section scores
        setSectionScores(prev => ({
          ...prev,
          C: finalScore
        }))
        
        // Save all progress data including questions and feedback
        saveProgress()
        
        // Update saved session status to completed if needed
        try {
          // Check if this session exists in recent sessions
          const recentSessionsStr = localStorage.getItem('recentSessions');
          if (recentSessionsStr) {
            const recentSessions = JSON.parse(recentSessionsStr);
            let hasFullPracticeSession = false;
            
            const updatedRecentSessions = recentSessions.map(session => {
              if (session.id === 'fullPractice') {
                hasFullPracticeSession = true;
                return {
                  ...session,
                  progress: 100,
                  lastSaved: new Date().toISOString(),
                  status: "completed"
                };
              }
              return session;
            });
            
            // If the session wasn't found, add it
            if (!hasFullPracticeSession) {
              updatedRecentSessions.unshift({
                id: 'fullPractice',
                section: "Full",
                name: "Full Comprehension Practice",
                progress: 100,
                lastSaved: new Date().toISOString(),
                status: "completed"
              });
            }
            
            localStorage.setItem('recentSessions', JSON.stringify(updatedRecentSessions));
          } else {
            // If no recent sessions exist, create one
            const newSession = {
              id: 'fullPractice',
              section: "Full",
              name: "Full Comprehension Practice",
              progress: 100,
              lastSaved: new Date().toISOString(),
              status: "completed"
            };
            localStorage.setItem('recentSessions', JSON.stringify([newSession]));
          }
          
          // Dispatch event immediately after updating the session status
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('practiceComplete'));
          }, 100);
          
          // Record completed practice
          const practiceResult = {
            section: "Full",
            name: "Full Comprehension Practice",
            score: (sectionScores.A || 0) + (sectionScores.B || 0) + finalScore,
            completedAt: new Date().toISOString(),
            // Store exercise details
            exercises: {
              visual: {
                id: visualExercise?.id,
                title: visualExercise?.title || "Visual Exercise"
              },
              narrative: {
                id: narrativeExercise?.id,
                title: narrativeExercise?.title || "Narrative Exercise"
              },
              nonNarrative: {
                id: nonNarrativeExercise?.id,
                title: nonNarrativeExercise?.title || "Non-Narrative Exercise"
              }
            }
          }
          
          // Get existing results from localStorage
          const storedResults = localStorage.getItem('practiceResults')
          const existingResults = storedResults ? JSON.parse(storedResults) : []
          
          // Add new result
          const updatedResults = [...existingResults, practiceResult]
          
          // Save to localStorage
          localStorage.setItem('practiceResults', JSON.stringify(updatedResults))
          
          // Dispatch another event to notify about practice results update
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('practiceComplete'))
          }, 200)
          
          // Redirect to feedback page
          router.push('/fullpractice/feedback')
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

  // Functions to handle changing exercises
  const handleChangeVisualExercise = async () => {
    if (allVisualExercises.length <= 0) return
    
    try {
      setLoading(true)
      const selectedExercise = allVisualExercises[currentVisualExerciseIndex]
      
      // Update URL params
      const url = new URL(window.location.href)
      url.searchParams.set('visual', selectedExercise.id.toString())
      window.history.pushState({}, '', url.toString())
      
      setVisualExercise(selectedExercise)
      
      // Fetch questions for the new exercise
      const { data: visualQuestionsData, error: visualQuestionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('exercise_id', selectedExercise.id)
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
        
        // Reset answers
        const initialAnswersA = visualQuestionsData.reduce((acc, question, index) => {
          acc[index + 1] = ""
          return acc
        }, {})
        
        setAnswersA(initialAnswersA)
        
        // Reset section score
        setSectionScores(prev => ({
          ...prev,
          A: null
        }))
      }
    } catch (error) {
      console.error('Error changing visual exercise:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleChangeNarrativeExercise = async () => {
    if (allNarrativeExercises.length <= 0) return
    
    try {
      setLoading(true)
      const selectedExercise = allNarrativeExercises[currentNarrativeExerciseIndex]
      
      // Update URL params
      const url = new URL(window.location.href)
      url.searchParams.set('narrative', selectedExercise.id.toString())
      window.history.pushState({}, '', url.toString())
      
      setNarrativeExercise(selectedExercise)
      
      // Get questions for the feedback page
      let newQuestionsB = {};
      
      // Initialize answers and questions based on the exercise type
      if (selectedExercise.exercise_type === "questions" && selectedExercise.questions && selectedExercise.questions.length > 0) {
        // Initialize answers for question-type exercise
        const initialAnswersB = selectedExercise.questions.reduce((acc, question, index) => {
          acc[index + 1] = ""
          return acc
        }, {})
        
        setAnswersB(initialAnswersB)
        
        // Prepare questions for feedback
        newQuestionsB = selectedExercise.questions.reduce((acc, question, index) => {
          acc[index + 1] = {
            id: index + 1,
            text: question.question_text || question.text,
            answer: question.ideal_answer || question.answer,
            marks: question.marks || 1
          }
          return acc
        }, {})
      }
      else if (selectedExercise.exercise_type === "combined" && selectedExercise.flowchart && selectedExercise.questions) {
        // Initialize answers for combined exercise type
        let initialAnswersB = {};
        
        // Add answers for questions part
        if (selectedExercise.questions && selectedExercise.questions.length > 0) {
          selectedExercise.questions.forEach((question, index) => {
            initialAnswersB[index + 1] = "";
            
            // Add to questions for feedback
            newQuestionsB[index + 1] = {
              id: index + 1,
              text: question.question_text || question.text,
              answer: question.ideal_answer || question.answer,
              marks: question.marks || 1
            };
          });
        }
        
        // Add answers for flowchart part
        if (selectedExercise.flowchart && selectedExercise.flowchart.sections) {
          selectedExercise.flowchart.sections.forEach((section, idx) => {
            const sectionId = section.id || `section-${idx}`;
            initialAnswersB[sectionId] = "";
            
            // Add to questions for feedback - with isFlowchart flag to distinguish them
            newQuestionsB[`flowchart-${sectionId}`] = {
              id: `flowchart-${sectionId}`,
              question_text: section.name || `Section ${idx + 1}`,
              ideal_answer: section.correct_answer || selectedExercise.flowchart.options[0],
              isFlowchart: true,
              mark: 0 // Initialize mark to 0
            };
          });
        }
        
        setAnswersB(initialAnswersB);
      }
      else if (selectedExercise.exercise_type === "flowchart" && selectedExercise.flowchart) {
        // Initialize answers for flowchart-only exercise
        const initialAnswersB = selectedExercise.flowchart.sections.reduce((acc, section, idx) => {
          const sectionId = section.id || `section-${idx}`;
          acc[sectionId] = "";
          
          // Add to questions for feedback
          newQuestionsB[`flowchart-${sectionId}`] = {
            id: `flowchart-${sectionId}`,
            question_text: section.name || `Section ${idx + 1}`,
            ideal_answer: section.correct_answer || selectedExercise.flowchart.options[0],
            isFlowchart: true,
            mark: 0 // Initialize mark to 0
          };
          
          return acc;
        }, {});
        
        setAnswersB(initialAnswersB);
      }
      
      // Update questions for the feedback page
      setQuestionsB(newQuestionsB);
      
      // Reset section score
      setSectionScores(prev => ({
        ...prev,
        B: null
      }));
      
      // Reset section feedback
      setSectionFeedback(prev => ({
        ...prev,
        B: ""
      }));
      
    } catch (error) {
      console.error('Error changing narrative exercise:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleChangeNonNarrativeExercise = async () => {
    if (allNonNarrativeExercises.length <= 0) return
    
    try {
      setLoading(true)
      const selectedExercise = allNonNarrativeExercises[currentNonNarrativeExerciseIndex]
      
      // Update URL params
      const url = new URL(window.location.href)
      url.searchParams.set('nonnarrative', selectedExercise.id.toString())
      window.history.pushState({}, '', url.toString())
      
      setNonNarrativeExercise(selectedExercise)
      
      // Reset word count
      setWordCount(0)
      
      // Reset answers and initialize based on the new questions
      if (selectedExercise.questions && selectedExercise.questions.length > 0) {
        const initialAnswersC = selectedExercise.questions.reduce((acc, question, index) => {
          acc[index + 1] = ""
          return acc
        }, {})
        
        setAnswersC(initialAnswersC)
        
        // Reset section score
        setSectionScores(prev => ({
          ...prev,
          C: null
        }))
      }
    } catch (error) {
      console.error('Error changing non-narrative exercise:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // Functions to navigate to next/previous exercise
  const handleNextVisualExercise = () => {
    if (currentVisualExerciseIndex < allVisualExercises.length - 1) {
      setCurrentVisualExerciseIndex(prev => prev + 1)
      setExerciseAChanged(true)
    }
  }
  
  const handlePrevVisualExercise = () => {
    if (currentVisualExerciseIndex > 0) {
      setCurrentVisualExerciseIndex(prev => prev - 1)
      setExerciseAChanged(true)
    }
  }
  
  const handleNextNarrativeExercise = () => {
    if (currentNarrativeExerciseIndex < allNarrativeExercises.length - 1) {
      setCurrentNarrativeExerciseIndex(prev => prev + 1)
      setExerciseBChanged(true)
    }
  }
  
  const handlePrevNarrativeExercise = () => {
    if (currentNarrativeExerciseIndex > 0) {
      setCurrentNarrativeExerciseIndex(prev => prev - 1)
      setExerciseBChanged(true)
    }
  }
  
  const handleNextNonNarrativeExercise = () => {
    if (currentNonNarrativeExerciseIndex < allNonNarrativeExercises.length - 1) {
      setCurrentNonNarrativeExerciseIndex(prev => prev + 1)
      setExerciseCChanged(true)
    }
  }
  
  const handlePrevNonNarrativeExercise = () => {
    if (currentNonNarrativeExerciseIndex > 0) {
      setCurrentNonNarrativeExerciseIndex(prev => prev - 1)
      setExerciseCChanged(true)
    }
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
      <main className="flex flex-col max-w-7xl mx-auto px-6 py-8 flex-grow w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading content...</p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Section tabs */}
            <div className="flex mb-6 border-b flex-shrink-0">
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
            <div className="mb-4 text-gray-600 flex-shrink-0">
              <p>Recommended time: {sectionContent[currentSection].timeBudget}</p>
            </div>
            
            {/* Section specific content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow overflow-hidden h-[calc(100vh-20rem)]">
              {/* Left panel - Content Display */}
              <div className="overflow-y-auto pr-2 pb-4">
                <div className="bg-white rounded-2xl shadow-sm p-6 h-auto mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                      {currentSection === "A" ? (visualExercise?.title || "Environmental Awareness") : 
                       currentSection === "B" ? (narrativeExercise?.title || "The Enchanted Forest") : 
                       (nonNarrativeExercise?.title || "The Future of Artificial Intelligence")}
                    </h2>
                  </div>
                  
                  {/* Different content for each section */}
                  {currentSection === "A" ? (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                      <img src={sectionContent.A.content} alt={visualExercise?.title || "Visual Exercise"} className="w-full" />
                    </div>
                  ) : currentSection === "B" && narrativeExercise?.exercise_type === "combined" && narrativeExercise?.flowchart ? (
                    // For combined type in Section B, show the passage here
                    <div className="whitespace-pre-wrap prose max-w-none text-gray-700">
                      <ReactMarkdown>
                        {narrativeExercise?.story_text}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap prose max-w-none text-gray-700">
                      <ReactMarkdown>
                        {sectionContent[currentSection].content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>

              {/* Right panel - Questions */}
              <div className="overflow-y-auto pr-2 pb-4 space-y-6">
                {currentSection === "A" && (
                  <>
                    {/* Section A Questions */}
                    {Object.values(questionsA).map(question => (
                      <div key={question.id} className="bg-white rounded-2xl shadow-sm p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600 font-medium text-sm">
                            {question.id}
                          </div>
                          <h2 className="text-lg font-medium text-gray-800 flex-1">{question.text}</h2>
                          <div className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-md whitespace-nowrap">
                            {question.marks || 1} {(question.marks || 1) === 1 ? 'mark' : 'marks'}
                          </div>
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
                    {/* Section B - Based on exercise_type */}
                    {narrativeExercise?.exercise_type === "flowchart" && narrativeExercise?.flowchart ? (
                      <div className="bg-white rounded-2xl shadow-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center">
                            <span className="flex items-center justify-center w-6 h-6 bg-amber-100 text-amber-800 rounded-full mr-2">1</span>
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Flow Chart</span>
                          </div>
                          <button className="text-gray-400 hover:text-gray-600">
                            <HelpCircle size={18} />
                          </button>
                        </div>
                        
                        <p className="mb-6 text-gray-700">
                          {narrativeExercise.description || "Complete the flowchart by choosing one word from the box to summarise the main thoughts or feelings presented in each part of the text."}
                        </p>
                        
                        {/* Options grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                          {narrativeExercise.flowchart.options.map((option, index) => (
                            <div 
                              key={`flowchart-option-${index}`} 
                              className={`p-2 border rounded-md text-center text-gray-800 ${
                                index >= narrativeExercise.flowchart.options.length - 2 ? 'col-span-1 sm:col-span-2' : ''
                              }`}
                            >
                              {option}
                            </div>
                          ))}
                        </div>
                        
                        {/* Flow chart sections */}
                        {narrativeExercise.flowchart.sections.map((section, idx) => (
                          <div key={`flowchart-section-${section.id || idx}`} className="mb-8">
                            <div className="mb-1 font-medium text-gray-800">
                              {section.name}: ({String.fromCharCode(105 + idx)})
                            </div>
                            <input 
                              type="text" 
                              className="w-full p-2 border rounded-md text-gray-800"
                              placeholder="Enter word here"
                              value={answersB[section.id || `section-${idx}`] || ''}
                              onChange={(e) => {
                                // Use a unique identifier for each section
                                const sectionKey = section.id || `section-${idx}`;
                                setAnswersB(prev => ({
                                  ...prev,
                                  [sectionKey]: e.target.value
                                }));
                              }}
                            />
                            
                            {/* Add arrow between sections except after the last one */}
                            {idx < narrativeExercise.flowchart.sections.length - 1 && (
                              <div className="flex justify-center my-4">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                                </svg>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : narrativeExercise?.exercise_type === "combined" && narrativeExercise?.flowchart ? (
                      /* Combined Exercise UI - Both Questions and Flowchart */
                      <div>
                        {/* Questions Section */}
                        {narrativeExercise.questions && narrativeExercise.questions.length > 0 && (
                          <div className="mb-8">
                            <h3 className="text-lg font-medium text-gray-800 mb-4">Part 1: Questions</h3>
                            <div className="space-y-6">
                              {Object.values(questionsB)
                                .filter(q => !q.isFlowchart)
                                .map(question => (
                                <div key={question.id} className="bg-white rounded-2xl shadow-sm p-6">
                                  <div className="flex flex-wrap items-start gap-4 mb-4">
                                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600 font-medium">
                                      {question.id}
                                    </div>
                                    <h2 className="flex-1 text-lg font-medium text-gray-800">{question.text}</h2>
                                    <div className="flex-shrink-0 text-sm text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-md">
                                      {question.marks || 1} {(question.marks || 1) === 1 ? 'mark' : 'marks'}
                                    </div>
                                  </div>
                                  <div>
                                    <textarea
                                      className="w-full h-24 p-4 border text-gray-700 border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      placeholder="Type your answer here..."
                                      value={answersB[question.id] || ''}
                                      onChange={(e) => handleAnswerChangeB(question.id, e.target.value)}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Flowchart Section */}
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
                              {narrativeExercise.description || "Complete the flowchart by choosing one word from the box to summarise the main thoughts or feelings presented in each part of the text."}
                            </p>
                            
                            {/* Options grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                              {narrativeExercise.flowchart.options.map((option, index) => (
                                <div 
                                  key={`flowchart-option-${index}`} 
                                  className={`p-2 border rounded-md text-center text-gray-800 ${
                                    index >= narrativeExercise.flowchart.options.length - 2 ? 'col-span-1 sm:col-span-2' : ''
                                  }`}
                                >
                                  {option}
                                </div>
                              ))}
                            </div>
                            
                            {/* Flow chart sections */}
                            {narrativeExercise.flowchart.sections.map((section, idx) => (
                              <div key={`flowchart-section-${section.id || idx}`} className="mb-8">
                                <div className="mb-1 font-medium text-gray-800">
                                  {section.name}: ({String.fromCharCode(105 + idx)})
                                </div>
                                <input 
                                  type="text" 
                                  className="w-full p-2 border rounded-md text-gray-800"
                                  placeholder="Enter word here"
                                  value={answersB[section.id || `section-${idx}`] || ''}
                                  onChange={(e) => {
                                    // Use a unique identifier for each section
                                    const sectionKey = section.id || `section-${idx}`;
                                    setAnswersB(prev => ({
                                      ...prev,
                                      [sectionKey]: e.target.value
                                    }));
                                  }}
                                />
                                
                                {/* Add arrow between sections except after the last one */}
                                {idx < narrativeExercise.flowchart.sections.length - 1 && (
                                  <div className="flex justify-center my-4">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                                    </svg>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Original questions interface */
                      Object.values(questionsB).map(question => (
                        <div key={question.id} className="bg-white rounded-2xl shadow-sm p-6">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600 font-medium text-sm">
                              {question.id}
                            </div>
                            <h2 className="text-lg font-medium text-gray-800 flex-1">{question.text}</h2>
                            <div className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-md whitespace-nowrap">
                              {question.marks || 1} {(question.marks || 1) === 1 ? 'mark' : 'marks'}
                            </div>
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
                      ))
                    )}
                  </>
                )}
                
                {currentSection === "C" && (
                  <>
                    {/* Section C Questions */}
                    {Object.values(questionsC).map((question, index, array) => {
                      const isLastQuestion = index === array.length - 1;
                      return (
                      <div key={question.id} className="bg-white rounded-2xl shadow-sm p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600 font-medium text-sm">
                            {question.id}
                          </div>
                          <h2 className="text-lg font-medium text-gray-800 flex-1">{question.text}</h2>
                          <div className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-md whitespace-nowrap">
                            {question.marks || 1} {(question.marks || 1) === 1 ? 'mark' : 'marks'}
                          </div>
                        </div>
                        <div>
                          {question.id === 2 ? (
                            <>
                              <div className="mb-2 text-sm text-gray-500 flex justify-between">
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
                          ) : isLastQuestion ? (
                            <>
                              <div className="mb-2 text-sm text-gray-600 flex justify-between">
                                <span className="bg-blue-100 px-3 py-1 rounded-md font-medium text-blue-700">Word count: {answersC[question.id]?.trim().split(/\s+/).filter(Boolean).length || 0}</span>
                              </div>
                              <textarea
                                className="w-full h-24 p-4 border border-gray-200 text-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Type your answer here..."
                                value={answersC[question.id]}
                                onChange={(e) => handleAnswerChangeC(question.id, e.target.value)}
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
                    )})}
                  </>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-8 flex justify-between flex-shrink-0">
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
              
              {/* Exercise navigation + Next button */}
              <div className="flex items-center gap-2">
                {/* Exercise navigation controls */}
                {currentSection === "A" && allVisualExercises.length > 1 && (
                  <div className="flex items-center gap-2 mr-3 bg-gray-50 px-2 py-1 rounded-full">
                    <button 
                      onClick={handlePrevVisualExercise}
                      disabled={currentVisualExerciseIndex === 0}
                      className={`p-1.5 rounded-full ${currentVisualExerciseIndex === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <span className="text-sm text-gray-600">
                      Exercise {currentVisualExerciseIndex + 1}/{allVisualExercises.length}
                    </span>
                    <button 
                      onClick={handleNextVisualExercise}
                      disabled={currentVisualExerciseIndex === allVisualExercises.length - 1}
                      className={`p-1.5 rounded-full ${currentVisualExerciseIndex === allVisualExercises.length - 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                      <ArrowRight size={16} />
                    </button>
                  </div>
                )}
                
                {currentSection === "B" && allNarrativeExercises.length > 1 && (
                  <div className="flex items-center gap-2 mr-3 bg-gray-50 px-2 py-1 rounded-full">
                    <button 
                      onClick={handlePrevNarrativeExercise}
                      disabled={currentNarrativeExerciseIndex === 0}
                      className={`p-1.5 rounded-full ${currentNarrativeExerciseIndex === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <span className="text-sm text-gray-600">
                      Exercise {currentNarrativeExerciseIndex + 1}/{allNarrativeExercises.length}
                    </span>
                    <button 
                      onClick={handleNextNarrativeExercise}
                      disabled={currentNarrativeExerciseIndex === allNarrativeExercises.length - 1}
                      className={`p-1.5 rounded-full ${currentNarrativeExerciseIndex === allNarrativeExercises.length - 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                      <ArrowRight size={16} />
                    </button>
                  </div>
                )}
                
                {currentSection === "C" && allNonNarrativeExercises.length > 1 && (
                  <div className="flex items-center gap-2 mr-3 bg-gray-50 px-2 py-1 rounded-full">
                    <button 
                      onClick={handlePrevNonNarrativeExercise}
                      disabled={currentNonNarrativeExerciseIndex === 0}
                      className={`p-1.5 rounded-full ${currentNonNarrativeExerciseIndex === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <span className="text-sm text-gray-600">
                      Exercise {currentNonNarrativeExerciseIndex + 1}/{allNonNarrativeExercises.length}
                    </span>
                    <button 
                      onClick={handleNextNonNarrativeExercise}
                      disabled={currentNonNarrativeExerciseIndex === allNonNarrativeExercises.length - 1}
                      className={`p-1.5 rounded-full ${currentNonNarrativeExerciseIndex === allNonNarrativeExercises.length - 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                      <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              
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
            </div>
          </div>
        )}
      </main>
      
      {/* Feedback is now on a separate page at /fullpractice/feedback */}
    </div>
  )
} 