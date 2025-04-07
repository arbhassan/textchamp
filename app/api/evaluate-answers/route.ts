import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { EvaluationRequest, EvaluationResponse } from './types';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { story, questionsWithAnswers } = await request.json() as EvaluationRequest;

    if (!story || !questionsWithAnswers || !Array.isArray(questionsWithAnswers)) {
      return NextResponse.json(
        { 
          error: 'Invalid request body. Missing required fields.',
          feedback: "There was an error processing your answers. Please try again.",
          score: 0
        },
        { status: 400 }
      );
    }

    // Construct the prompt for OpenAI
    const prompt = `
      I need you to evaluate a student's answers to questions about a short story. 
      
      THE STORY:
      ${story}
      
      QUESTIONS AND ANSWERS:
      ${questionsWithAnswers.map((q, i) => `
        Question ${i + 1}: ${q.question}
        Ideal Answer: ${q.idealAnswer}
        Student's Answer: ${q.userAnswer}
      `).join('\n')}
      
      Please evaluate the student's answers and provide:
      1. Specific feedback on each answer
      2. An overall score out of 5
      3. Keep your feedback concise but helpful
      
      FORMAT YOUR FEEDBACK USING MARKDOWN:
      - Use **bold** for important points
      - Use bullet points for listing strengths and areas for improvement
      - Use headings (##) for each question's feedback section
      - You can use other markdown formatting as appropriate
      
      Format your response as JSON with the structure:
      {
        "feedback": "Your markdown formatted feedback here...",
        "score": 3
      }
    `;

    // Call the OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response and validate it
    try {
      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }
      
      const result = JSON.parse(content) as EvaluationResponse;
      
      // Ensure we have the required fields
      if (typeof result.feedback !== 'string' || result.feedback.trim() === '') {
        result.feedback = "Your answers have been evaluated, but detailed feedback couldn't be generated.";
      }
      
      if (typeof result.score !== 'number' || isNaN(result.score)) {
        // Try to convert string to number if possible
        const numericScore = Number(result.score);
        result.score = !isNaN(numericScore) ? numericScore : 0;
      }
      
      // Ensure score is within the 0-5 range
      result.score = Math.max(0, Math.min(5, result.score));
      
      return NextResponse.json(result);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      // Return a fallback response if parsing fails
      return NextResponse.json({
        feedback: "We received your answers, but had trouble generating detailed feedback. Please try again.",
        score: 0
      });
    }
  } catch (error) {
    console.error('Error evaluating answers:', error);
    return NextResponse.json(
      { 
        error: 'Failed to evaluate answers',
        feedback: "There was an error evaluating your answers. Please try again.",
        score: 0  
      },
      { status: 500 }
    );
  }
} 