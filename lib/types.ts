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
  marks?: number;
}

export interface NarrativeExercise {
  id: number;
  title: string;
  story_text: string;
  description?: string;
  time_limit: number;
  exercise_type?: "questions" | "combined";
  questions?: NarrativeQuestion[];
  flowchart?: FlowChartExercise;
}

export interface NarrativeQuestion {
  id: number;
  question_text: string;
  ideal_answer: string;
  question_order: number;
  marks?: number;
}

export interface FlowChartExercise {
  options: string[];
  sections: FlowChartSection[];
}

export interface FlowChartSection {
  id: number;
  name: string;
  paragraphs: string;
  correct_answer?: string;
}

export interface NonNarrativeExercise {
  id: number;
  title: string;
  passage_text: string;
  description?: string;
  time_limit: number;
  questions: NonNarrativeQuestion[];
}

export interface NonNarrativeQuestion {
  id: number;
  question_text: string;
  ideal_answer: string;
  question_order: number;
  marks?: number;
} 