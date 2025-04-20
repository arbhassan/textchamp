export interface VisualExercise {
  id: number;
  title: string;
  image_url: string;
  description?: string;
}

export interface Question {
  id: number;
  exercise_id: number;
  text: string;
  ideal_answer: string;
  question_order: number;
}

export interface NarrativeExercise {
  id: number;
  title: string;
  story_text: string;
  description?: string;
  time_limit: number;
  questions: NarrativeQuestion[];
}

export interface NarrativeQuestion {
  id: number;
  question_text: string;
  ideal_answer: string;
  question_order: number;
} 