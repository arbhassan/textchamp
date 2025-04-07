export interface QuestionWithAnswer {
  question: string;
  idealAnswer: string;
  userAnswer: string;
}

export interface EvaluationRequest {
  story: string;
  questionsWithAnswers: QuestionWithAnswer[];
}

export interface EvaluationResponse {
  feedback: string;
  score: number;
} 