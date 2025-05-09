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
  const incorrectQuestions = Object.values(questions).filter(q => q.mark === 0);
  
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
        {incorrectQuestions.map((question, index) => (
          <div key={`incorrect-question-${question.id || index}`} className="flex items-start gap-2">
            <XCircle className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
            <div>
              <span className="text-sm font-medium text-gray-700">Question {question.question_order || question.id}:</span>
              <p className="text-sm text-gray-600">{question.text || question.question_text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function NonNarrativeCompFeedback() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  
  // Data from the completed test
  const [answers, setAnswers] = useState({})
  const [questions, setQuestions] = useState({})
  const [score, setScore] = useState(null)
  const [feedback, setFeedback] = useState("")
  const [markSummary, setMarkSummary] = useState({ total: 0, correct: 0 })
  const [totalMarks, setTotalMarks] = useState({ possible: 0, earned: 0 })
  
  // Load test data when component mounts
  useEffect(() => {
    try {
      setLoading(true)
      const savedSession = localStorage.getItem('savedSession_sectionC')
      
      if (savedSession) {
        const session = JSON.parse(savedSession)
        
        // Load answers
        if (session.answers) setAnswers(session.answers)
        
        // Load questions - these need to be retrieved from the session too
        if (session.questions) {
          // Use marks directly from the database/session
          // Ensure questions have a mark property and correct field names
          const questionsWithMarks = Object.values(session.questions).reduce((acc, question) => {
            acc[question.id] = {
              ...question,
              // Ensure question has text field for consistent access
              text: question.question_text || question.text || "",
              // Ensure question has answer field for consistent access
              answer: question.ideal_answer || question.answer || "",
              // Use mark from database if available, otherwise default to 0
              mark: question.mark !== undefined ? question.mark : 0
            };
            return acc;
          }, {});
          
          setQuestions(questionsWithMarks);
          
          // Update mark summary
          const marks = Object.values(questionsWithMarks).reduce(
            (summary, q) => ({
              total: summary.total + 1,
              correct: summary.correct + (q.mark || 0)
            }),
            { total: 0, correct: 0 }
          );
          
          setMarkSummary(marks);
          
          // Calculate total marks possible and earned
          const totalPossibleMarks = Object.values(questionsWithMarks).reduce(
            (sum, q) => sum + (q.marks || 1), 0
          );
          
          const totalEarnedMarks = Object.values(questionsWithMarks).reduce(
            (sum, q) => sum + ((q.mark > 0) ? (q.marks || 1) : 0), 0
          );
          
          setTotalMarks({ possible: totalPossibleMarks, earned: totalEarnedMarks });
        } else {
          // If questions aren't saved in the session, redirect back to practice
          router.push('/nonnarratcomp')
          return
        }
        
        // Load score
        if (session.score !== undefined) {
          setScore(session.score)
        }
        
        // Load feedback
        if (session.feedback) {
          setFeedback(session.feedback)
        }
      } else {
        // If no session data exists, redirect back to practice
        router.push('/nonnarratcomp')
        return
      }
    } catch (error) {
      console.error('Error loading feedback data:', error)
      router.push('/nonnarratcomp')
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
  
  // Format feedback text with mark information
  const formatFeedback = (feedbackText) => {
    if (!feedbackText) return ""
    
    // Add mark summary to the feedback
    const scorePercentage = markSummary.total > 0 ? Math.round((markSummary.correct / markSummary.total) * 100) : 0;
    
    let performanceLevel = "needs improvement";
    if (scorePercentage >= 80) performanceLevel = "excellent";
    else if (scorePercentage >= 60) performanceLevel = "good";
    else if (scorePercentage >= 40) performanceLevel = "fair";
    
    const markSummaryText = `
## Performance Summary
You scored **${markSummary.correct}/${markSummary.total}** questions correctly (${scorePercentage}%) on this section.
Total marks earned: **${totalMarks.earned}/${totalMarks.possible}**
Your performance in this section is **${performanceLevel}**.

${feedbackText}
`;
    
    return markSummaryText;
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
              Non-Narrative Comprehension Results
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
                  {score !== null && (
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#a855f7" /* purple-500 */
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
                  <span className="text-sm text-gray-500 mt-1">Score</span>
                </div>
              </div>
            </div>
            
            {/* Section score */}
            <div className="md:col-span-3 grid grid-cols-1 gap-4">
              {/* Section C Score */}
              <div className="bg-purple-50 p-4 rounded-xl">
                <h3 className="font-medium text-purple-800 mb-2">Non-Narrative Comprehension</h3>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-purple-700">{score || 0}</div>
                  <div className="text-purple-600">/5 points</div>
                </div>
                <div className="flex flex-col text-sm text-purple-700 mt-1">
                  <span>{markSummary.correct} out of {markSummary.total} correct</span>
                  <span>{totalMarks.earned} out of {totalMarks.possible} marks</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Feedback Section */}
        <div className="bg-white rounded-3xl shadow-sm p-8">
          <h3 className="text-lg font-bold text-purple-800 mb-4">Non-Narrative Comprehension Questions</h3>
               
          {Object.values(questions).length > 0 && (
            <AreasForImprovement questions={questions} />
          )}
          
          {Object.keys(questions).length > 0 ? (
            Object.keys(questions).map((questionId) => {
              const question = questions[questionId];
              // Get the user's answer for this question
              const userAnswer = question.userAnswer || answers[questionId] || "";
              return (
                <div key={questionId} className="mb-8 p-4 border border-gray-100 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-medium text-xs">
                        {question.question_order || question.id}
                      </div>
                      <h4 className="font-medium text-gray-800">{question.text || question.question_text}</h4>
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
                      {userAnswer || <span className="text-gray-400 italic">No answer provided</span>}
                      {userAnswer && (
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
                      {question.answer || question.ideal_answer}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-4 bg-blue-50 text-blue-700 rounded-lg">
              No questions found. Please try again.
            </div>
          )}
          
          {feedback && (
            <div className="prose prose-sm max-w-none text-gray-700 markdown-content mt-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-medium text-purple-800">AI Feedback:</h4>
                <ScoreBadge 
                  score={markSummary.correct} 
                  total={markSummary.total} 
                  maxScore={totalMarks.possible}
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
                {formatFeedback(feedback)}
              </ReactMarkdown>
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