"use client"

import { useState, useEffect } from "react"
import { Home, X, ArrowLeft, ArrowRight, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import ReactMarkdown from 'react-markdown'

// Score Badge Component
const ScoreBadge = ({ score, total, maxScore }) => {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  
  // Determine color based on score percentage
  let bgColor = "bg-red-100";
  let textColor = "text-red-600";
  
  if (percentage >= 80) {
    bgColor = "bg-green-100";
    textColor = "text-green-600";
  } else if (percentage >= 60) {
    bgColor = "bg-blue-100";
    textColor = "text-blue-600";
  } else if (percentage >= 40) {
    bgColor = "bg-amber-100";
    textColor = "text-amber-600";
  }
  
  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full ${bgColor} ${textColor} text-sm font-medium`}>
      <span>{percentage}%</span>
      <span className="mx-1">•</span>
      <span>{score}/{total} questions</span>
      {maxScore !== undefined && (
        <>
          <span className="mx-1">•</span>
          <span>{score}/{maxScore} marks</span>
        </>
      )}
    </div>
  );
};

// Areas for Improvement Component
const AreasForImprovement = ({ questions }) => {
  // Get incorrect answers - questions with mark of 0
  const incorrectQuestions = Object.values(questions).filter(q => q.mark === 0 && !q.isFlowchart);
  
  if (incorrectQuestions.length === 0) {
    return (
      <div className="bg-green-50 p-4 rounded-lg mt-4 mb-6">
        <div className="flex items-center gap-2">
          <CheckCircle className="text-green-600" size={20} />
          <h5 className="text-green-800 font-medium">Perfect Score!</h5>
        </div>
        <p className="text-green-700 mt-2 text-sm">
          Excellent work! You answered all questions correctly in this section.
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-amber-50 p-4 rounded-lg mt-4 mb-6">
      <div className="flex items-center gap-2">
        <AlertTriangle className="text-amber-600" size={20} />
        <h5 className="text-amber-800 font-medium">Areas for Improvement</h5>
      </div>
      <div className="mt-3 space-y-2">
        {incorrectQuestions.map((question) => (
          <div key={question.id} className="flex items-start gap-2">
            <XCircle className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
            <div>
              <span className="text-sm font-medium text-gray-700">Question {question.id}:</span>
              <p className="text-sm text-gray-600">{question.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Flowchart Areas for Improvement Component
const FlowchartAreasForImprovement = ({ questions, options }) => {
  // Get only flowchart questions
  const flowchartQuestions = Object.values(questions).filter(q => q.isFlowchart);
  
  // Get incorrect answers - flowchart items with mark of 0
  const incorrectQuestions = flowchartQuestions.filter(q => q.mark === 0);
  
  if (flowchartQuestions.length === 0) {
    return null; // No flowchart questions to display
  }
  
  if (incorrectQuestions.length === 0) {
    return (
      <div className="bg-green-50 p-4 rounded-lg mt-4 mb-6">
        <div className="flex items-center gap-2">
          <CheckCircle className="text-green-600" size={20} />
          <h5 className="text-green-800 font-medium">Perfect Flowchart!</h5>
        </div>
        <p className="text-green-700 mt-2 text-sm">
          Excellent work! You completed the flowchart correctly.
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-amber-50 p-4 rounded-lg mt-4 mb-6">
      <div className="flex items-center gap-2">
        <AlertTriangle className="text-amber-600" size={20} />
        <h5 className="text-amber-800 font-medium">Flowchart Areas for Improvement</h5>
      </div>
      
      {options && options.length > 0 && (
        <div className="mt-2 mb-3">
          <p className="text-sm text-amber-800 font-medium mb-1">Available options:</p>
          <div className="flex flex-wrap gap-2">
            {options.map((option, idx) => (
              <span key={idx} className="px-2 py-1 bg-white border border-amber-200 rounded-md text-xs text-amber-700">
                {option}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-3 space-y-2">
        {incorrectQuestions.map((question, index) => (
          <div key={question.id || `flowchart-${index}`} className="flex items-start gap-2">
            <XCircle className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
            <div>
              <span className="text-sm font-medium text-gray-700">{question.question_text || question.text}:</span>
              <p className="text-sm text-gray-600">Your answer was incorrect</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

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
  const [markSummary, setMarkSummary] = useState({
    A: { total: 0, correct: 0 },
    B: { total: 0, correct: 0 },
    C: { total: 0, correct: 0 }
  })
  
  const [totalMarks, setTotalMarks] = useState({
    A: { possible: 0, earned: 0 },
    B: { possible: 0, earned: 0 },
    C: { possible: 0, earned: 0 }
  })
  
  // Add state for exercise types and flowchart options
  const [exerciseTypes, setExerciseTypes] = useState({
    A: "visual",
    B: "questions",
    C: "non-narrative"
  })
  
  const [flowchartOptions, setFlowchartOptions] = useState({
    B: []
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
        if (session.questionsA) {
          // For Section A (Visual), calculate marks based on AI score and answered questions
          const aiScore = session.sectionScores?.A || 0;
          const questionsList = Array.isArray(session.questionsA) ? session.questionsA : Object.values(session.questionsA);
          const sortedQuestions = questionsList.sort((a, b) => a.question_order - b.question_order);
          
          // Check if marks are already calculated
          const hasCalculatedMarks = questionsList.some(q => q.mark !== undefined);
          
          let questionsWithMarks;
          
          if (hasCalculatedMarks) {
            // Use existing marks
            questionsWithMarks = sortedQuestions.reduce((acc, question) => {
              acc[question.id] = {
                ...question,
                mark: question.mark || 0
              };
              return acc;
            }, {});
          } else {
            // Calculate marks based on AI score and answered questions
            const questionsWithAnswers = sortedQuestions.filter(q => {
              const userAnswer = q.userAnswer || session.answersA?.[q.id] || "";
              return userAnswer.trim() !== "";
            });
            
            const scorePercentage = aiScore / 5;
            const answeredQuestionsToMarkCorrect = Math.round(scorePercentage * questionsWithAnswers.length);
            
            questionsWithMarks = sortedQuestions.reduce((acc, question) => {
              let questionMark = 0;
              
              const userAnswer = question.userAnswer || session.answersA?.[question.id] || "";
              if (userAnswer.trim() !== "") {
                const answeredIndex = questionsWithAnswers.findIndex(q => q.id === question.id);
                if (answeredIndex !== -1 && answeredIndex < answeredQuestionsToMarkCorrect) {
                  questionMark = question.marks || 1;
                }
              }
              
              acc[question.id] = {
                ...question,
                mark: questionMark
              };
              return acc;
            }, {});
          }
          
          setQuestionsA(questionsWithMarks);
          
          // Update mark summary for Section A
          const sectionAMarks = Object.values(questionsWithMarks).reduce(
            (summary, q) => ({
              total: summary.total + 1,
              correct: summary.correct + (q.mark > 0 ? 1 : 0)
            }),
            { total: 0, correct: 0 }
          );
          
          setMarkSummary(prev => ({
            ...prev,
            A: sectionAMarks
          }));
          
          // Calculate total marks possible and earned
          const totalPossibleMarks = Object.values(questionsWithMarks).reduce(
            (sum, q) => sum + (q.marks || 1), 0
          );
          
          const totalEarnedMarks = Object.values(questionsWithMarks).reduce(
            (sum, q) => sum + (q.mark || 0), 0
          );
          
          setTotalMarks(prev => ({
            ...prev,
            A: { possible: totalPossibleMarks, earned: totalEarnedMarks }
          }));
        } else {
          // If questions aren't saved in the session, redirect back to practice
          router.push('/fullpractice')
          return
        }
        
        if (session.questionsB) {
          // Set exercise type if available
          if (session.exerciseTypeB) {
            setExerciseTypes(prev => ({
              ...prev,
              B: session.exerciseTypeB
            }));
          }
          
          // Set flowchart options if available
          if (session.flowchartOptionsB) {
            setFlowchartOptions(prev => ({
              ...prev,
              B: session.flowchartOptionsB
            }));
          }
          
          // For Section B (Narrative), calculate marks based on AI score and answered questions
          const aiScore = session.sectionScores?.B || 0;
          const questionsList = Array.isArray(session.questionsB) ? session.questionsB : Object.values(session.questionsB);
          
          // Separate normal questions from flowchart questions
          const normalQuestions = questionsList.filter(q => !q.isFlowchart);
          const flowchartQuestions = questionsList.filter(q => q.isFlowchart);
          
          // Check if marks are already calculated
          const hasCalculatedMarks = questionsList.some(q => q.mark !== undefined);
          
          let questionsWithMarks;
          
          if (hasCalculatedMarks) {
            // Use existing marks
            questionsWithMarks = questionsList.reduce((acc, question) => {
              acc[question.id] = {
                ...question,
                mark: question.mark || 0
              };
              return acc;
            }, {});
          } else {
            // Calculate marks based on AI score and answered questions
            const scorePercentage = aiScore / 5;
            
            questionsWithMarks = questionsList.reduce((acc, question) => {
              let questionMark = 0;
              
              if (question.isFlowchart) {
                // Handle flowchart questions
                const flowchartQuestionsToMarkCorrect = Math.round(scorePercentage * flowchartQuestions.length);
                const flowchartIndex = flowchartQuestions.findIndex(q => q.id === question.id);
                if (flowchartIndex < flowchartQuestionsToMarkCorrect) {
                  questionMark = question.marks || 1;
                }
              } else {
                // Handle normal questions - only assign marks if answered
                const userAnswer = question.userAnswer || session.answersB?.[question.id] || "";
                if (userAnswer.trim() !== "") {
                  const answeredNormalQuestions = normalQuestions.filter(q => {
                    const ans = q.userAnswer || session.answersB?.[q.id] || "";
                    return ans.trim() !== "";
                  });
                  const normalQuestionsToMarkCorrect = Math.round(scorePercentage * answeredNormalQuestions.length);
                  const normalIndex = answeredNormalQuestions.findIndex(q => q.id === question.id);
                  if (normalIndex !== -1 && normalIndex < normalQuestionsToMarkCorrect) {
                    questionMark = question.marks || 1;
                  }
                }
              }
              
              acc[question.id] = {
                ...question,
                mark: questionMark
              };
              return acc;
            }, {});
          }
          
          setQuestionsB(questionsWithMarks);
          
          // Update mark summary for Section B
          // Filter out flowchart items if present for regular question count
          const regularQuestions = Object.values(questionsWithMarks).filter(q => !q.isFlowchart);
          
          const sectionBMarks = regularQuestions.reduce(
            (summary, q) => ({
              total: summary.total + 1,
              correct: summary.correct + (q.mark > 0 ? 1 : 0)
            }),
            { total: 0, correct: 0 }
          );
          
          setMarkSummary(prev => ({
            ...prev,
            B: sectionBMarks
          }));
          
          // Calculate total marks possible and earned for all questions
          const allQuestions = Object.values(questionsWithMarks);
          const totalPossibleMarks = allQuestions.reduce(
            (sum, q) => sum + (q.marks || 1), 0
          );
          
          const totalEarnedMarks = allQuestions.reduce(
            (sum, q) => sum + (q.mark || 0), 0
          );
          
          setTotalMarks(prev => ({
            ...prev,
            B: { possible: totalPossibleMarks, earned: totalEarnedMarks }
          }));
        }
        
        if (session.questionsC) {
          // For Section C (Non-Narrative), calculate marks based on AI score and answered questions
          const aiScore = session.sectionScores?.C || 0;
          const questionsList = Array.isArray(session.questionsC) ? session.questionsC : Object.values(session.questionsC);
          const sortedQuestions = questionsList.sort((a, b) => a.question_order - b.question_order);
          
          // Check if marks are already calculated
          const hasCalculatedMarks = questionsList.some(q => q.mark !== undefined);
          
          let questionsWithMarks;
          
          if (hasCalculatedMarks) {
            // Use existing marks
            questionsWithMarks = sortedQuestions.reduce((acc, question) => {
              acc[question.id] = {
                ...question,
                mark: question.mark || 0
              };
              return acc;
            }, {});
          } else {
            // Calculate marks based on AI score and answered questions
            const questionsWithAnswers = sortedQuestions.filter(q => {
              const userAnswer = q.userAnswer || session.answersC?.[q.id] || "";
              return userAnswer.trim() !== "";
            });
            
            const scorePercentage = aiScore / 5;
            const answeredQuestionsToMarkCorrect = Math.round(scorePercentage * questionsWithAnswers.length);
            
            questionsWithMarks = sortedQuestions.reduce((acc, question) => {
              let questionMark = 0;
              
              const userAnswer = question.userAnswer || session.answersC?.[question.id] || "";
              if (userAnswer.trim() !== "") {
                const answeredIndex = questionsWithAnswers.findIndex(q => q.id === question.id);
                if (answeredIndex !== -1 && answeredIndex < answeredQuestionsToMarkCorrect) {
                  questionMark = question.marks || 1;
                }
              }
              
              acc[question.id] = {
                ...question,
                mark: questionMark
              };
              return acc;
            }, {});
          }
          
          setQuestionsC(questionsWithMarks);
          
          // Update mark summary for Section C
          const sectionCMarks = Object.values(questionsWithMarks).reduce(
            (summary, q) => ({
              total: summary.total + 1,
              correct: summary.correct + (q.mark > 0 ? 1 : 0)
            }),
            { total: 0, correct: 0 }
          );
          
          setMarkSummary(prev => ({
            ...prev,
            C: sectionCMarks
          }));
          
          // Calculate total marks possible and earned
          const totalPossibleMarks = Object.values(questionsWithMarks).reduce(
            (sum, q) => sum + (q.marks || 1), 0
          );
          
          const totalEarnedMarks = Object.values(questionsWithMarks).reduce(
            (sum, q) => sum + (q.mark || 0), 0
          );
          
          setTotalMarks(prev => ({
            ...prev,
            C: { possible: totalPossibleMarks, earned: totalEarnedMarks }
          }));
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
  const calculateCircleProgress = (earned, total) => {
    const radius = 50
    const circumference = 2 * Math.PI * radius
    const percentage = total > 0 ? earned / total : 0
    const offset = circumference - percentage * circumference
    return { circumference, offset }
  }
  
  // Format feedback text with mark information
  const formatFeedback = (feedbackText, sectionKey) => {
    if (!feedbackText) return ""
    
    // Add mark summary to the feedback
    const summary = markSummary[sectionKey];
    const marksInfo = totalMarks[sectionKey];
    const scorePercentage = summary.total > 0 ? Math.round((summary.correct / summary.total) * 100) : 0;
    
    let performanceLevel = "needs improvement";
    if (scorePercentage >= 80) performanceLevel = "excellent";
    else if (scorePercentage >= 60) performanceLevel = "good";
    else if (scorePercentage >= 40) performanceLevel = "fair";
    
    const markSummaryText = `
## Performance Summary
You scored **${summary.correct}/${summary.total}** questions correctly (${scorePercentage}%) on this section.
Total marks earned: **${marksInfo.earned}/${marksInfo.possible}**
Your performance in this section is **${performanceLevel}**.

${feedbackText}
`;
    
    return markSummaryText;
  }
  
  // Separate flowchart questions from normal questions for section B
  const getNormalQuestionsB = () => {
    return Object.values(questionsB).filter(q => !q.isFlowchart);
  };
  
  const getFlowchartQuestionsB = () => {
    return Object.values(questionsB).filter(q => q.isFlowchart);
  };
  
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
                  {totalMarks.C.possible > 0 && (
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#4ade80"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={calculateCircleProgress(totalMarks.C.earned, totalMarks.C.possible).circumference}
                      strokeDashoffset={calculateCircleProgress(totalMarks.C.earned, totalMarks.C.possible).offset}
                      className="transition-all duration-1000 ease-out"
                    />
                  )}
                </svg>
                
                {/* Score text */}
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <div className="flex items-baseline">
                    <span className="text-4xl text-gray-800 font-bold">{totalMarks.C.earned}</span>
                    <span className="text-xl font-medium text-gray-500">/{totalMarks.C.possible}</span>
                  </div>
                  <span className="text-sm text-gray-500 mt-1">Marks</span>
                </div>
              </div>
            </div>
            
            {/* Section scores */}
            <div className="md:col-span-3 grid grid-cols-3 gap-4">
              {/* Section A Score */}
              <div className="bg-amber-50 p-4 rounded-xl">
                <h3 className="font-medium text-amber-800 mb-2">Section A</h3>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-amber-700">{totalMarks.A.earned}</div>
                  <div className="text-amber-600">/{totalMarks.A.possible} marks</div>
                </div>
                <div className="flex flex-col text-sm text-amber-700 mt-1">
                  <span>{markSummary.A.correct} out of {markSummary.A.total} questions correct</span>
                  <span>{Math.round(totalMarks.A.possible > 0 ? (totalMarks.A.earned / totalMarks.A.possible) * 100 : 0)}% accuracy</span>
                </div>
              </div>
              
              {/* Section B Score */}
              <div className="bg-orange-50 p-4 rounded-xl">
                <h3 className="font-medium text-orange-800 mb-2">Section B</h3>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-orange-700">{totalMarks.B.earned}</div>
                  <div className="text-orange-600">/{totalMarks.B.possible} marks</div>
                </div>
                <div className="flex flex-col text-sm text-orange-700 mt-1">
                  <span>{markSummary.B.correct} out of {markSummary.B.total} questions correct</span>
                  <span>{Math.round(totalMarks.B.possible > 0 ? (totalMarks.B.earned / totalMarks.B.possible) * 100 : 0)}% accuracy</span>
                </div>
              </div>
              
              {/* Section C Score */}
              <div className="bg-purple-50 p-4 rounded-xl">
                <h3 className="font-medium text-purple-800 mb-2">Section C</h3>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-purple-700">{totalMarks.C.earned}</div>
                  <div className="text-purple-600">/{totalMarks.C.possible} marks</div>
                </div>
                <div className="flex flex-col text-sm text-purple-700 mt-1">
                  <span>{markSummary.C.correct} out of {markSummary.C.total} questions correct</span>
                  <span>{Math.round(totalMarks.C.possible > 0 ? (totalMarks.C.earned / totalMarks.C.possible) * 100 : 0)}% accuracy</span>
                </div>
              </div>
              
              {/* Total Score */}
              <div className="col-span-3 bg-blue-50 p-4 rounded-xl">
                <h3 className="font-medium text-blue-800 mb-2">Overall Score</h3>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="text-3xl font-bold text-blue-700">
                      {totalMarks.A.earned + totalMarks.B.earned + totalMarks.C.earned}
                    </div>
                    <div className="text-blue-600">/{totalMarks.A.possible + totalMarks.B.possible + totalMarks.C.possible} marks</div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-blue-700">
                    <span>{markSummary.A.correct + markSummary.B.correct + markSummary.C.correct} out of {markSummary.A.total + markSummary.B.total + markSummary.C.total} questions correct</span>
                    <span>{Math.round((totalMarks.A.possible + totalMarks.B.possible + totalMarks.C.possible) > 0 ? ((totalMarks.A.earned + totalMarks.B.earned + totalMarks.C.earned) / (totalMarks.A.possible + totalMarks.B.possible + totalMarks.C.possible)) * 100 : 0)}% accuracy</span>
                  </div>
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
              
              {Object.values(questionsA).length > 0 && (
                <AreasForImprovement questions={questionsA} />
              )}
              
              {Object.values(questionsA).map((question, index) => (
                <div key={index} className="mb-8 p-4 border border-gray-100 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-medium text-xs">
                        {question.id}
                      </div>
                      <h4 className="font-medium text-gray-800">{question.text}</h4>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">Mark:</span>
                      {/* Display marks value from question */}
                      <span className={`text-sm font-bold ${question.mark > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {question.mark || 0}/{question.marks || 1}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Your Answer:</h5>
                    <div className={`p-3 border rounded text-sm ${question.mark > 0 ? 'bg-green-50 border-green-100 text-gray-800' : 'bg-white border-gray-200 text-gray-700'}`}>
                      {answersA[question.id] || <span className="text-gray-400 italic">No answer provided</span>}
                      {answersA[question.id] && (
                        <div className="mt-2 flex items-center">
                          {question.mark > 0 ? (
                            <span className="text-xs text-green-600 font-medium px-2 py-0.5 bg-green-100 rounded-full inline-flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Correct
                            </span>
                          ) : (
                            <span className="text-xs text-red-600 font-medium px-2 py-0.5 bg-red-100 rounded-full inline-flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Incorrect
                            </span>
                          )}
                        </div>
                      )}
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
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-medium text-amber-800">AI Feedback:</h4>
                    <ScoreBadge 
                      score={markSummary.A.correct} 
                      total={markSummary.A.total} 
                      maxScore={totalMarks.A.possible}
                    />
                  </div>
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
                    {formatFeedback(sectionFeedback.A, 'A')}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}
          
          {/* Section B Feedback */}
          {currentFeedbackTab === "B" && (
            <div className="bg-white rounded-3xl shadow-sm p-8">
              <h3 className="text-lg font-bold text-blue-800 mb-4">Narrative Comprehension Questions</h3>
              
              {/* Show areas for improvement */}
              <AreasForImprovement questions={questionsB} />
              
              {/* Show questions and answers */}
              {getNormalQuestionsB().map((question, index) => (
                <div key={index} className="mb-8 p-4 border border-gray-100 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-medium text-xs">
                        {question.id}
                      </div>
                      <h4 className="font-medium text-gray-800">{question.text}</h4>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">Mark:</span>
                      <span className={`text-sm font-bold ${question.mark > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {question.mark || 0}/{question.marks || 1}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Your Answer:</h5>
                    <div className={`p-3 border rounded text-sm ${question.mark > 0 ? 'bg-green-50 border-green-100 text-gray-800' : 'bg-white border-gray-200 text-gray-700'}`}>
                      {answersB[question.id] || <span className="text-gray-400 italic">No answer provided</span>}
                      {answersB[question.id] && (
                        <div className="mt-2 flex items-center">
                          {question.mark > 0 ? (
                            <span className="text-xs text-green-600 font-medium px-2 py-0.5 bg-green-100 rounded-full inline-flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Correct
                            </span>
                          ) : (
                            <span className="text-xs text-red-600 font-medium px-2 py-0.5 bg-red-100 rounded-full inline-flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Incorrect
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-green-700 mb-1">Model Answer:</h5>
                    <div className="p-3 bg-green-50 border border-green-100 rounded text-sm text-gray-800">
                      {question.answer || question.ideal_answer || "No model answer available"}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Flowchart Feedback Section - Only show if exercise type is "combined" and there are flowchart questions */}
              {exerciseTypes.B === "combined" && getFlowchartQuestionsB().length > 0 && (
                <div className="mt-8 border-t pt-8">
                  <h3 className="text-lg font-bold text-blue-800 mb-4">Flowchart Results</h3>
                  
                  {/* Show improvement areas for flowchart questions */}
                  <FlowchartAreasForImprovement questions={questionsB} options={flowchartOptions.B} />
                  
                  {/* Display flowchart questions and answers */}
                  <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-3">Flowchart Answers</h4>
                    
                    {flowchartOptions.B.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Available Options:</h5>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {flowchartOptions.B.map((option, idx) => (
                            <div 
                              key={`option-${idx}`} 
                              className="px-2 py-1 bg-white border border-blue-200 rounded-md text-sm text-blue-800"
                            >
                              {option}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      {getFlowchartQuestionsB().map((question, index) => {
                        // Extract the section ID from the flowchart ID
                        const sectionIdMatch = question.id.match(/flowchart-(.+)/);
                        const sectionId = sectionIdMatch ? sectionIdMatch[1] : `section-${index}`;
                        
                        return (
                          <div key={question.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-100">
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${question.mark > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {question.mark > 0 ? (
                                <CheckCircle size={14} />
                              ) : (
                                <X size={14} />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <h5 className="text-sm font-medium text-gray-800">{question.question_text || question.text}</h5>
                              </div>
                              <div className="mt-2 text-sm">
                                <div className="flex gap-2">
                                  <span className="font-medium text-gray-700">Your answer:</span>
                                  <span className={question.mark > 0 ? 'text-green-600 font-medium' : 'text-red-600'}>
                                    {answersB[sectionId] || <em className="text-gray-400">No answer</em>}
                                  </span>
                                </div>
                                {question.ideal_answer && (
                                  <div className="flex gap-2 mt-1">
                                    <span className="font-medium text-gray-700">Correct answer:</span>
                                    <span className="text-green-600">{question.ideal_answer || question.answer}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Show AI feedback */}
              {sectionFeedback.B && (
                <div className="prose prose-sm max-w-none text-gray-700 markdown-content mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-medium text-blue-800">AI Feedback:</h4>
                    <ScoreBadge 
                      score={markSummary.B.correct} 
                      total={markSummary.B.total} 
                      maxScore={totalMarks.B.possible}
                    />
                  </div>
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
                    {formatFeedback(sectionFeedback.B, "B")}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}
          
          {/* Section C Feedback */}
          {currentFeedbackTab === "C" && (
            <div>
              <h3 className="text-lg font-bold text-purple-800 mb-4">Non-Narrative Comprehension Questions</h3>
              
              {Object.values(questionsC).length > 0 && (
                <AreasForImprovement questions={questionsC} />
              )}
              
              {Object.values(questionsC).map((question, index) => (
                <div key={index} className="mb-8 p-4 border border-gray-100 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-medium text-xs">
                        {question.id}
                      </div>
                      <h4 className="font-medium text-gray-800">{question.text}</h4>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">Mark:</span>
                      {/* Display marks value from question */}
                      <span className={`text-sm font-bold ${question.mark > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {question.mark || 0}/{question.marks || 1}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Your Answer:</h5>
                    <div className={`p-3 border rounded text-sm ${question.mark > 0 ? 'bg-green-50 border-green-100 text-gray-800' : 'bg-white border-gray-200 text-gray-700'}`}>
                      {answersC[question.id] || <span className="text-gray-400 italic">No answer provided</span>}
                      {answersC[question.id] && (
                        <div className="mt-2 flex items-center">
                          {question.mark > 0 ? (
                            <span className="text-xs text-green-600 font-medium px-2 py-0.5 bg-green-100 rounded-full inline-flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Correct
                            </span>
                          ) : (
                            <span className="text-xs text-red-600 font-medium px-2 py-0.5 bg-red-100 rounded-full inline-flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Incorrect
                            </span>
                          )}
                        </div>
                      )}
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
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-medium text-purple-800">AI Feedback:</h4>
                    <ScoreBadge 
                      score={markSummary.C.correct} 
                      total={markSummary.C.total} 
                      maxScore={totalMarks.C.possible}
                    />
                  </div>
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
                    {formatFeedback(sectionFeedback.C, 'C')}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-8 flex justify-center md:justify-end">
            <Link href="/">
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                onClick={() => {
                  // Dispatch event when returning to dashboard to ensure it updates
                  window.dispatchEvent(new CustomEvent('practiceComplete'))
                }}
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