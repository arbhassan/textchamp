-- Update the constraint to include 'combined' as a valid exercise type
ALTER TABLE public.narrative_exercises 
  DROP CONSTRAINT valid_exercise_type, 
  ADD CONSTRAINT valid_exercise_type CHECK (
    exercise_type = ANY (ARRAY['questions'::text, 'flowchart'::text, 'combined'::text])
  ); 