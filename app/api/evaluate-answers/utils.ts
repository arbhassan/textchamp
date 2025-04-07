import { EvaluationRequest, EvaluationResponse, QuestionWithAnswer } from "./types";

/**
 * Evaluates user answers against ideal answers
 * 
 * @param story - The story text that questions are based on
 * @param questionsWithAnswers - Array of questions with ideal and user answers
 * @returns Promise with evaluation feedback and score
 */
export async function evaluateAnswers(
  story: string, 
  questionsWithAnswers: QuestionWithAnswer[]
): Promise<EvaluationResponse> {
  try {
    // Validate inputs before making the API call
    if (!story || typeof story !== 'string' || !story.trim()) {
      throw new Error('Invalid story text provided');
    }
    
    if (!questionsWithAnswers || !Array.isArray(questionsWithAnswers) || questionsWithAnswers.length === 0) {
      throw new Error('Invalid questions or answers provided');
    }
    
    const response = await fetch('/api/evaluate-answers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        story,
        questionsWithAnswers
      } as EvaluationRequest)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API error response:', errorData);
      return {
        feedback: errorData.feedback || "Failed to evaluate answers. Please try again.",
        score: errorData.score || 0
      };
    }

    const result = await response.json() as EvaluationResponse;
    
    // Ensure the result has the expected structure
    if (!result.feedback || typeof result.feedback !== 'string') {
      result.feedback = "Your answers were evaluated, but we couldn't generate detailed feedback.";
    }
    
    if (typeof result.score !== 'number' || isNaN(result.score)) {
      result.score = 0;
    }
    
    return result;
  } catch (error) {
    console.error('Error evaluating answers:', error);
    return {
      feedback: "There was an error evaluating your answers. Please try again.",
      score: 0
    };
  }
} 