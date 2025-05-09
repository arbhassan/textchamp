"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface ExerciseReviewModalProps {
  isOpen: boolean
  onClose: () => void
  sessionData: any
}

export function ExerciseReviewModal({ isOpen, onClose, sessionData }: ExerciseReviewModalProps) {
  if (!sessionData) return null

  // Format the feedback properly
  const formatFeedback = (feedbackText: string) => {
    if (!feedbackText) return ""
    return String(feedbackText)
  }

  // Get section data based on section ID
  const getSectionData = (sectionId: string) => {
    // Get saved session data from localStorage - check both formats
    const savedSessionKey = `savedSession_${sectionId}`;
    const savedSessionKeyAlt = `savedSession_section${sectionId}`;
    
    // Try both key formats
    let savedSession = localStorage.getItem(savedSessionKey);
    if (!savedSession) {
      savedSession = localStorage.getItem(savedSessionKeyAlt);
    }
    
    if (!savedSession) return null;
    return JSON.parse(savedSession);
  }

  const renderSectionQuestions = (sectionId: string, questions: any, answers: any, feedback: any) => {
    if (!questions || !answers) return <p>No data available</p>

    return (
      <div className="space-y-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">Score</h3>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {sessionData.score || sessionData.sectionScores?.[sectionId] || 0} marks
            </div>
          </div>
        </div>

        {Object.values(questions).map((question: any, index: number) => {
          const questionId = question.id || index
          const userAnswer = answers[questionId] || ""
          
          // Handle different field names based on section type
          const questionText = question.text || question.question_text || ""
          const modelAnswer = question.answer || question.ideal_answer || ""
          
          return (
            <div key={questionId} className="border rounded-lg p-4">
              <div className="mb-4">
                <h4 className="font-medium text-lg text-foreground">{questionText}</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Your Answer</h5>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded min-h-[60px] text-gray-900 dark:text-gray-100">
                    {userAnswer || <span className="text-gray-400 italic">No answer provided</span>}
                  </div>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Model Answer</h5>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded min-h-[60px] text-gray-900 dark:text-gray-100">
                    {modelAnswer || <span className="text-gray-400 italic">No model answer available</span>}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        
        {feedback && (
          <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Feedback</h3>
            <div className="prose prose-sm dark:prose-invert max-w-none text-gray-900 dark:text-gray-100">
              <ReactMarkdown>{formatFeedback(feedback)}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Get the session ID from the sessionData
  const sessionId = sessionData.id

  // Get the full saved session data
  const fullSessionData = getSectionData(sessionId)

  // Determine which sections to show based on the session type
  const isSectionA = sessionId === 'sectionA'
  const isSectionB = sessionId === 'sectionB'
  const isSectionC = sessionId === 'sectionC'
  const isFullPractice = sessionId === 'fullPractice'

  // Get section feedback from the fullSessionData if available
  const sectionFeedback = fullSessionData?.sectionFeedback || {}

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-foreground">{sessionData.name} Review</DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        
        {isFullPractice ? (
          <Tabs defaultValue="sectionA" className="w-full">
            <TabsList className="mb-4 w-full grid grid-cols-3">
              <TabsTrigger value="sectionA">Section A</TabsTrigger>
              <TabsTrigger value="sectionB">Section B</TabsTrigger>
              <TabsTrigger value="sectionC">Section C</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sectionA">
              {renderSectionQuestions(
                "A", 
                fullSessionData?.questionsA, 
                fullSessionData?.answersA,
                fullSessionData?.sectionFeedback?.A
              )}
            </TabsContent>
            
            <TabsContent value="sectionB">
              {renderSectionQuestions(
                "B", 
                fullSessionData?.questionsB, 
                fullSessionData?.answersB,
                fullSessionData?.sectionFeedback?.B
              )}
            </TabsContent>
            
            <TabsContent value="sectionC">
              {renderSectionQuestions(
                "C", 
                fullSessionData?.questionsC, 
                fullSessionData?.answersC,
                fullSessionData?.sectionFeedback?.C
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <>
            {isSectionA && renderSectionQuestions(
              "A", 
              fullSessionData?.questions, 
              fullSessionData?.answers,
              fullSessionData?.feedback
            )}
            
            {isSectionB && renderSectionQuestions(
              "B", 
              fullSessionData?.questions, 
              fullSessionData?.answers,
              fullSessionData?.feedback
            )}
            
            {isSectionC && renderSectionQuestions(
              "C", 
              fullSessionData?.questions, 
              fullSessionData?.answers,
              fullSessionData?.feedback
            )}
          </>
        )}
        
        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 