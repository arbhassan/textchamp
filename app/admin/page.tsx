"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"
import { VisualExercise, Question, NarrativeExercise, NarrativeQuestion } from "../../lib/types"
import { Trash2, Plus, Save, Edit, ChevronDown, ChevronUp, Upload, X, Eye, ArrowLeft, BookOpen, Image, FileText, Lock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Define interface for non-narrative exercises
interface NonNarrativeExercise {
  id: number
  title: string
  passage_text: string
  description?: string
  time_limit: number
  questions: NonNarrativeQuestion[]
}

interface NonNarrativeQuestion {
  id: number
  question_text: string
  ideal_answer: string
  question_order: number
}

export default function AdminPanel() {
  const router = useRouter()
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState("")
  
  // Original app states
  const [activeTab, setActiveTab] = useState<'visual' | 'narrative' | 'non-narrative'>('visual')
  const [exercises, setExercises] = useState<VisualExercise[]>([])
  const [narrativeExercises, setNarrativeExercises] = useState<NarrativeExercise[]>([])
  const [nonNarrativeExercises, setNonNarrativeExercises] = useState<NonNarrativeExercise[]>([])
  const [selectedExercise, setSelectedExercise] = useState<VisualExercise | null>(null)
  const [selectedNarrativeExercise, setSelectedNarrativeExercise] = useState<NarrativeExercise | null>(null)
  const [selectedNonNarrativeExercise, setSelectedNonNarrativeExercise] = useState<NonNarrativeExercise | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null)
  const [expandedNarrativeExercise, setExpandedNarrativeExercise] = useState<number | null>(null)
  const [expandedNonNarrativeExercise, setExpandedNonNarrativeExercise] = useState<number | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingNarrative, setIsEditingNarrative] = useState(false)
  const [isEditingNonNarrative, setIsEditingNonNarrative] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })

  // Form states for exercise
  const [formExercise, setFormExercise] = useState<{
    id?: number;
    title: string;
    image_url: string;
    description: string;
  }>({
    title: "",
    image_url: "",
    description: ""
  })

  // Form states for narrative exercise
  const [formNarrativeExercise, setFormNarrativeExercise] = useState<{
    id?: number;
    title: string;
    story_text: string;
    description: string;
    time_limit: number;
    exercise_type: "questions" | "flowchart";
  }>({
    title: "",
    story_text: "",
    description: "",
    time_limit: 1800, // Default 30 minutes
    exercise_type: "questions" // Default to questions type
  })

  // Form states for questions
  const [formQuestions, setFormQuestions] = useState<{
    id?: number;
    text: string;
    ideal_answer: string;
    question_order: number;
    exercise_id?: number;
    marks?: number;
    isNew?: boolean;
  }[]>([])

  // Form states for narrative questions
  const [formNarrativeQuestions, setFormNarrativeQuestions] = useState<{
    id: number;
    question_text: string;
    ideal_answer: string;
    question_order: number;
    marks?: number;
    isNew?: boolean;
  }[]>([])

  // Form states for flowchart (when exercise_type is flowchart)
  const [formFlowchart, setFormFlowchart] = useState<{
    options: string[];
    sections: {
      id: number;
      name: string;
      paragraphs: string;
      correct_answer?: string;
      isNew?: boolean;
    }[];
  }>({
    options: [],
    sections: []
  })

  // Form states for non-narrative exercise
  const [formNonNarrativeExercise, setFormNonNarrativeExercise] = useState<{
    id?: number;
    title: string;
    passage_text: string;
    description: string;
    time_limit: number;
  }>({
    title: "",
    passage_text: "",
    description: "",
    time_limit: 1500 // Default 25 minutes
  })

  // Form states for non-narrative questions
  const [formNonNarrativeQuestions, setFormNonNarrativeQuestions] = useState<{
    id: number;
    question_text: string;
    ideal_answer: string;
    question_order: number;
    marks?: number;
    isNew?: boolean;
  }[]>([])

  // Check for existing authentication
  useEffect(() => {
    const isAdminAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true'
    if (isAdminAuthenticated) {
      setIsAuthenticated(true)
    }
  }, [])
  
  // Fetch exercises based on active tab
  useEffect(() => {
    async function fetchExercises() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('visual_exercises')
          .select('*')
          .order('id')

        if (error) throw error
        setExercises(data || [])
      } catch (error) {
        console.error('Error fetching exercises:', error)
        setMessage({ text: "Failed to fetch exercises", type: "error" })
      } finally {
        setLoading(false)
      }
    }

    async function fetchNarrativeExercises() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('narrative_exercises')
          .select('*')
          .order('id')

        if (error) throw error
        setNarrativeExercises(data || [])
      } catch (error) {
        console.error('Error fetching narrative exercises:', error)
        setMessage({ text: "Failed to fetch narrative exercises", type: "error" })
      } finally {
        setLoading(false)
      }
    }

    async function fetchNonNarrativeExercises() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('non_narrative_exercises')
          .select('*')
          .order('id')

        if (error) throw error
        setNonNarrativeExercises(data || [])
      } catch (error) {
        console.error('Error fetching non-narrative exercises:', error)
        setMessage({ text: "Failed to fetch non-narrative exercises", type: "error" })
      } finally {
        setLoading(false)
      }
    }

    if (activeTab === 'visual') {
      fetchExercises()
    } else if (activeTab === 'narrative') {
      fetchNarrativeExercises()
    } else if (activeTab === 'non-narrative') {
      fetchNonNarrativeExercises()
    }
  }, [activeTab])
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === "admin123") {
      setIsAuthenticated(true)
      // Store authentication in session storage
      sessionStorage.setItem('adminAuthenticated', 'true')
      setAuthError("")
    } else {
      setAuthError("Incorrect password. Please try again.")
    }
  }

  // Fetch questions for an exercise
  const fetchQuestionsForExercise = async (exerciseId: number) => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('exercise_id', exerciseId)
        .order('question_order')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching questions:', error)
      setMessage({ text: "Failed to fetch questions", type: "error" })
      return []
    }
  }

  // Toggle exercise expansion to show questions
  const toggleExerciseExpansion = async (exerciseId: number) => {
    if (expandedExercise === exerciseId) {
      setExpandedExercise(null)
    } else {
      setExpandedExercise(exerciseId)
      const questionsData = await fetchQuestionsForExercise(exerciseId)
      setQuestions(questionsData)
    }
  }

  // Create a new visual exercise
  const handleCreateExercise = () => {
    setSelectedExercise(null);
    setFormExercise({
      title: "New Visual Exercise",
      image_url: "",
      description: ""
    });
    
    // Initialize with one empty question
    setFormQuestions([
      {
        text: "",
        ideal_answer: "",
        question_order: 1,
        marks: 1,
        isNew: true
      }
    ]);
    
    setImagePreview(null);
    setImageFile(null);
    setIsEditing(true);
  };

  // Handle editing an existing exercise
  const handleEditExercise = async (exercise: VisualExercise) => {
    try {
      setSelectedExercise(exercise);
      
      // Set form data for editing
      setFormExercise({
        id: exercise.id,
        title: exercise.title,
        image_url: exercise.image_url,
        description: exercise.description || ""
      });
      
      // Fetch questions for this exercise
      const questionsData = await fetchQuestionsForExercise(exercise.id);
      
      // Format questions for form
      const questionsForForm = questionsData.map(q => ({
        id: q.id,
        text: q.text,
        ideal_answer: q.ideal_answer,
        question_order: q.question_order,
        marks: q.marks || 1,
        exercise_id: q.exercise_id
      }));
      
      setFormQuestions(questionsForForm);
      setIsEditing(true);
      
    } catch (error) {
      console.error('Error preparing exercise for editing:', error);
      setMessage({ text: "Failed to load exercise data", type: "error" });
    }
  }

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <Lock className="h-12 w-12 text-blue-500 mx-auto" />
            <h1 className="text-2xl font-bold mt-4">Admin Authentication</h1>
            <p className="text-gray-600 mt-2">Please enter the password to access the admin panel</p>
          </div>
          
          {authError && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {authError}
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 text-black py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter admin password"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Login
            </button>
            
            <div className="mt-4 text-center">
              <Link href="/" className="text-sm text-blue-600 hover:text-blue-800">
                Return to Home
              </Link>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      
      // Create a preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle adding a new question to the form
  const handleAddQuestion = () => {
    const newOrder = formQuestions.length > 0 
      ? Math.max(...formQuestions.map(q => q.question_order)) + 1 
      : 1;
    
    setFormQuestions([
      ...formQuestions, 
      {
        text: "",
        ideal_answer: "",
        question_order: newOrder,
        marks: 1,
        isNew: true
      }
    ]);
  }

  // Handle removing a question from the form
  const handleRemoveQuestion = (index: number) => {
    const updatedQuestions = [...formQuestions]
    updatedQuestions.splice(index, 1)
    
    // Update question order for remaining questions
    updatedQuestions.forEach((q, idx) => {
      q.question_order = idx + 1
    })
    
    setFormQuestions(updatedQuestions)
  }

  // Handle changes to exercise form fields
  const handleExerciseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormExercise(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle changes to question form fields
  const handleQuestionChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const updatedQuestions = [...formQuestions];
    const field = e.target.name;
    const value = field === 'question_order' || field === 'marks' ? parseInt(e.target.value) || 0 : e.target.value;
    
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    
    setFormQuestions(updatedQuestions);
  }

  // Upload image to Supabase storage
  const uploadImage = async (file: File): Promise<string> => {
    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError, data } = await supabase.storage
        .from('textchamp')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('textchamp')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      setMessage({ text: "Failed to upload image", type: "error" })
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  // Save exercise and questions
  const handleSave = async () => {
    try {
      setIsUploading(true);
      console.log("Saving with questions:", formQuestions);

      // Validate form data
      if (!formExercise.title.trim()) {
        setMessage({ text: "Title is required", type: "error" });
        return;
      }

      if (formQuestions.length === 0) {
        setMessage({ text: "At least one question is required", type: "error" });
        return;
      }

      let imageUrl = formExercise.image_url;
      
      // Upload image if a new one was selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const exerciseId = formExercise.id;
      console.log("Updating exercise with ID:", exerciseId);

      // Process based on whether this is a new exercise or an existing one
      if (!exerciseId) {
        // Creating a new exercise
        // First insert the exercise to get its ID
        const { data: newExercise, error: insertError } = await supabase
          .from('visual_exercises')
          .insert({
            title: formExercise.title,
            image_url: imageUrl,
            description: formExercise.description
          })
          .select('id')
          .single();

        if (insertError) throw insertError;

        // Now insert all questions for the new exercise
        for (const question of formQuestions) {
          const { error: insertQuestionError } = await supabase
            .from('questions')
            .insert({
              text: question.text,
              ideal_answer: question.ideal_answer,
              question_order: question.question_order,
              marks: question.marks || 1,
              exercise_id: newExercise.id
            });

          if (insertQuestionError) throw insertQuestionError;
        }

        setMessage({ text: "New exercise created successfully", type: "success" });
      } else {
        // Update existing exercise
        const { error } = await supabase
          .from('visual_exercises')
          .update({
            title: formExercise.title,
            image_url: imageUrl,
            description: formExercise.description
          })
          .eq('id', exerciseId);

        if (error) throw error;

        // Process questions
        console.log("Processing questions for exercise ID:", exerciseId);
        
        // Keep track of all question IDs to keep (existing and newly created)
        const keepIds = [];
        
        // Update or create questions
        for (const question of formQuestions) {
          if (!question.text.trim()) {
            console.log("Skipping empty question");
            continue;
          }

          if (question.id && !question.isNew) {
            // Update existing question
            console.log("Updating existing question ID:", question.id);
            const { error: updateError } = await supabase
              .from('questions')
              .update({
                text: question.text,
                ideal_answer: question.ideal_answer,
                question_order: question.question_order,
                marks: question.marks || 1
              })
              .eq('id', question.id);

            if (updateError) {
              console.error("Error updating question:", updateError);
              throw updateError;
            }
            // Add this ID to our keep list
            keepIds.push(question.id);
          } else {
            // Create new question
            console.log("Creating new question for exercise ID:", exerciseId);
            const newQuestion = {
              exercise_id: exerciseId,
              text: question.text,
              ideal_answer: question.ideal_answer,
              question_order: question.question_order,
              marks: question.marks || 1
            };
            console.log("New question data:", newQuestion);
            
            const { data: insertData, error: insertError } = await supabase
              .from('questions')
              .insert(newQuestion)
              .select();

            if (insertError) {
              console.error("Error inserting question:", insertError);
              throw insertError;
            }
            
            console.log("Inserted question result:", insertData);
            
            // Add the newly created question ID to our keep list
            if (insertData && insertData.length > 0) {
              keepIds.push(insertData[0].id);
            }
          }
        }

        // Get list of questions to potentially delete
        const existingQuestions = await fetchQuestionsForExercise(exerciseId);
        console.log("Existing questions:", existingQuestions);
        console.log("Questions to keep IDs:", keepIds);
        
        // Delete questions that are no longer in the form
        for (const question of existingQuestions) {
          if (!keepIds.includes(question.id)) {
            console.log("Deleting question ID:", question.id);
            const { error: deleteError } = await supabase
              .from('questions')
              .delete()
              .eq('id', question.id);

            if (deleteError) {
              console.error("Error deleting question:", deleteError);
              throw deleteError;
            }
          }
        }

        setMessage({ text: "Saved successfully", type: "success" });
        setIsEditing(false);
        
        // Refresh the questions for the expanded exercise
        if (expandedExercise === exerciseId) {
          const refreshedQuestions = await fetchQuestionsForExercise(exerciseId);
          setQuestions(refreshedQuestions);
        }
        
        // Refresh exercise list
        const { data, error: refreshError } = await supabase
          .from('visual_exercises')
          .select('*')
          .order('id');

        if (refreshError) throw refreshError;
        setExercises(data || []);

      }

    } catch (error) {
      console.error('Error saving data:', error);
      setMessage({ text: "Failed to save data", type: "error" });
    } finally {
      setIsUploading(false);
    }
  };

  // Preview the exercise
  const handlePreviewExercise = (exerciseId: number) => {
    router.push(`/visualtextcomp?exercise=${exerciseId}`)
  }

  // Toggle narrative exercise expansion
  const toggleNarrativeExerciseExpansion = (exerciseId: number) => {
    if (expandedNarrativeExercise === exerciseId) {
      setExpandedNarrativeExercise(null)
    } else {
      setExpandedNarrativeExercise(exerciseId)
    }
  }

  // Create a new narrative exercise
  const handleCreateNarrativeExercise = () => {
    setSelectedNarrativeExercise(null);
    setFormNarrativeExercise({
      title: "New Narrative Exercise",
      story_text: "",
      description: "",
      time_limit: 1800, // Default 30 minutes
      exercise_type: "questions" // Default to questions type
    });
    
    // Initialize with one empty question
    setFormNarrativeQuestions([
      {
        id: Date.now(),
        question_text: "",
        ideal_answer: "",
        question_order: 1,
        marks: 1,
        isNew: true
      }
    ]);
    
    // Initialize with empty flowchart
    setFormFlowchart({
      options: ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5", "Option 6", "Option 7"],
      sections: [
        {
          id: Date.now(),
          name: "Paragraphs 1-2",
          paragraphs: "1-2",
          isNew: true
        }
      ]
    });
    
    setIsEditingNarrative(true);
  };

  // Handle editing an existing narrative exercise
  const handleEditNarrativeExercise = (exercise: NarrativeExercise) => {
    // Set form data for editing
    setFormNarrativeExercise({
      id: exercise.id,
      title: exercise.title,
      story_text: exercise.story_text,
      description: exercise.description || "",
      time_limit: exercise.time_limit || 1800, // Default 30 minutes
      exercise_type: exercise.exercise_type || "questions" // Default to questions type if not specified
    });
    
    if (exercise.exercise_type === "flowchart" && exercise.flowchart) {
      // Format flowchart for form
      setFormFlowchart({
        options: exercise.flowchart.options,
        sections: exercise.flowchart.sections.map(s => ({
          ...s,
          isNew: false
        }))
      });
    } else {
      // Format questions for form
      const questionsForForm = (exercise.questions || []).map(q => ({
        id: q.id,
        question_text: q.question_text,
        ideal_answer: q.ideal_answer,
        question_order: q.question_order,
        marks: q.marks || 1,
        isNew: false
      }));
      
      setFormNarrativeQuestions(questionsForForm);
    }
    
    setSelectedNarrativeExercise(exercise);
    setIsEditingNarrative(true);
  }

  // Handle adding a question to narrative exercise
  const handleAddNarrativeQuestion = () => {
    const newOrder = formNarrativeQuestions.length > 0 
      ? Math.max(...formNarrativeQuestions.map(q => q.question_order)) + 1 
      : 1;
    
    setFormNarrativeQuestions([
      ...formNarrativeQuestions, 
      {
        id: Date.now(), // Temporary ID for new questions
        question_text: "",
        ideal_answer: "",
        question_order: newOrder,
        marks: 1,
        isNew: true
      }
    ])
  }

  // Handle removing a question from narrative exercise
  const handleRemoveNarrativeQuestion = (index: number) => {
    const updatedQuestions = [...formNarrativeQuestions]
    updatedQuestions.splice(index, 1)
    
    // Update question order for remaining questions
    updatedQuestions.forEach((q, idx) => {
      q.question_order = idx + 1
    })
    
    setFormNarrativeQuestions(updatedQuestions)
  }

  // Handle changes to narrative exercise form fields
  const handleNarrativeExerciseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormNarrativeExercise(prev => ({
      ...prev,
      [name]: name === 'time_limit' ? parseInt(value) || 0 : value
    }))
  }

  // Handle changes to narrative question form fields
  const handleNarrativeQuestionChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const updatedQuestions = [...formNarrativeQuestions]
    const field = e.target.name
    const value = field === 'question_order' || field === 'marks' ? parseInt(e.target.value) || 0 : e.target.value
    
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    }
    
    setFormNarrativeQuestions(updatedQuestions)
  }

  // Save narrative exercise and questions
  const handleSaveNarrative = async () => {
    try {
      setIsUploading(true);
      
      // Validate form data
      if (!formNarrativeExercise.title.trim()) {
        setMessage({ text: "Title is required", type: "error" });
        return;
      }
      
      if (!formNarrativeExercise.story_text.trim()) {
        setMessage({ text: "Story text is required", type: "error" });
        return;
      }

      if (formNarrativeExercise.exercise_type === "questions") {
        if (formNarrativeQuestions.length === 0) {
          setMessage({ text: "At least one question is required", type: "error" });
          return;
        }
      } else if (formNarrativeExercise.exercise_type === "flowchart") {
        if (formFlowchart.sections.length === 0) {
          setMessage({ text: "At least one flowchart section is required", type: "error" });
          return;
        }
        
        if (formFlowchart.options.length === 0) {
          setMessage({ text: "At least one option is required", type: "error" });
          return;
        }
      }
      
      // Prepare data based on exercise type
      let exerciseData: any = {
        title: formNarrativeExercise.title,
        story_text: formNarrativeExercise.story_text,
        description: formNarrativeExercise.description,
        time_limit: formNarrativeExercise.time_limit,
        exercise_type: formNarrativeExercise.exercise_type
      };
      
      if (formNarrativeExercise.exercise_type === "questions") {
        // Prepare questions with correct format
        const questionsToSave = formNarrativeQuestions.map(q => ({
          id: q.isNew ? undefined : q.id,
          question_text: q.question_text,
          ideal_answer: q.ideal_answer,
          question_order: q.question_order,
          marks: q.marks || 1
        }));
        
        exerciseData.questions = questionsToSave;
        
      } else if (formNarrativeExercise.exercise_type === "flowchart") {
        // Prepare flowchart data
        const flowchartToSave = {
          options: formFlowchart.options,
          sections: formFlowchart.sections.map(s => ({
            id: s.isNew ? undefined : s.id,
            name: s.name,
            paragraphs: s.paragraphs,
            correct_answer: s.correct_answer
          }))
        };
        
        exerciseData.flowchart = flowchartToSave;
      }
      
      const exerciseId = formNarrativeExercise.id;
      
      if (!exerciseId) {
        // Creating a new narrative exercise
        const { data: newExercise, error: insertError } = await supabase
          .from('narrative_exercises')
          .insert(exerciseData)
          .select('*')
          .single();
          
        if (insertError) throw insertError;
        
        setMessage({ text: "New narrative exercise created successfully", type: "success" });
      } else {
        // Update existing exercise
        const { error } = await supabase
          .from('narrative_exercises')
          .update(exerciseData)
          .eq('id', exerciseId);

        if (error) throw error;
        
        setMessage({ text: "Narrative exercise updated successfully", type: "success" });
      }
      
      setIsEditingNarrative(false);
      
      // Refresh exercise list
      const { data, error: refreshError } = await supabase
        .from('narrative_exercises')
        .select('*')
        .order('id');

      if (refreshError) throw refreshError;
      setNarrativeExercises(data || []);

    } catch (error) {
      console.error('Error saving narrative exercise:', error);
      setMessage({ text: "Failed to save narrative exercise", type: "error" });
    } finally {
      setIsUploading(false);
    }
  };

  // Preview the narrative exercise
  const handlePreviewNarrativeExercise = (exerciseId: number) => {
    router.push(`/narratcomp?exercise=${exerciseId}`)
  }
  
  // Delete narrative exercise
  const handleDeleteNarrativeExercise = async (exerciseId: number) => {
    if (!confirm("Are you sure you want to delete this exercise? This action cannot be undone.")) {
      return
    }
    
    try {
      setLoading(true)
      
      const { error } = await supabase
        .from('narrative_exercises')
        .delete()
        .eq('id', exerciseId)
      
      if (error) throw error
      
      // Refresh the list after deletion
      const { data, error: refreshError } = await supabase
        .from('narrative_exercises')
        .select('*')
        .order('id')
      
      if (refreshError) throw refreshError
      
      setNarrativeExercises(data || [])
      setMessage({ text: "Exercise deleted successfully", type: "success" })
      
    } catch (error) {
      console.error('Error deleting narrative exercise:', error)
      setMessage({ text: "Failed to delete exercise", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  // Toggle non-narrative exercise expansion
  const toggleNonNarrativeExerciseExpansion = (exerciseId: number) => {
    if (expandedNonNarrativeExercise === exerciseId) {
      setExpandedNonNarrativeExercise(null)
    } else {
      setExpandedNonNarrativeExercise(exerciseId)
    }
  }

  // Create a new non-narrative exercise
  const handleCreateNonNarrativeExercise = () => {
    setSelectedNonNarrativeExercise(null);
    setFormNonNarrativeExercise({
      title: "New Non-Narrative Exercise",
      passage_text: "",
      description: "",
      time_limit: 1500 // Default 25 minutes
    });
    
    // Initialize with one empty question
    setFormNonNarrativeQuestions([
      {
        id: 1,
        question_text: "",
        ideal_answer: "",
        question_order: 1,
        isNew: true
      }
    ]);
    
    setIsEditingNonNarrative(true);
  };

  // Handle editing an existing non-narrative exercise
  const handleEditNonNarrativeExercise = (exercise: NonNarrativeExercise) => {
    // Set form data for editing
    setFormNonNarrativeExercise({
      id: exercise.id,
      title: exercise.title,
      passage_text: exercise.passage_text,
      description: exercise.description || "",
      time_limit: exercise.time_limit || 1500 // Default 25 minutes
    })
    
    // Format questions for form
    const questionsForForm = exercise.questions.map(q => ({
      id: q.id,
      question_text: q.question_text,
      ideal_answer: q.ideal_answer,
      question_order: q.question_order,
      marks: q.marks || 1
    }))
    
    setFormNonNarrativeQuestions(questionsForForm)
    setSelectedNonNarrativeExercise(exercise)
    setIsEditingNonNarrative(true)
  }

  // Handle adding a question to non-narrative exercise
  const handleAddNonNarrativeQuestion = () => {
    const newOrder = formNonNarrativeQuestions.length > 0 
      ? Math.max(...formNonNarrativeQuestions.map(q => q.question_order)) + 1 
      : 1;
    
    setFormNonNarrativeQuestions([
      ...formNonNarrativeQuestions, 
      {
        id: Date.now(), // Temporary ID for new questions
        question_text: "",
        ideal_answer: "",
        question_order: newOrder,
        marks: 1,
        isNew: true
      }
    ])
  }

  // Handle removing a question from non-narrative exercise
  const handleRemoveNonNarrativeQuestion = (index: number) => {
    const updatedQuestions = [...formNonNarrativeQuestions]
    updatedQuestions.splice(index, 1)
    
    // Update question order for remaining questions
    updatedQuestions.forEach((q, idx) => {
      q.question_order = idx + 1
    })
    
    setFormNonNarrativeQuestions(updatedQuestions)
  }

  // Handle changes to non-narrative exercise form fields
  const handleNonNarrativeExerciseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormNonNarrativeExercise(prev => ({
      ...prev,
      [name]: name === 'time_limit' ? parseInt(value) || 0 : value
    }))
  }

  // Handle changes to non-narrative question form fields
  const handleNonNarrativeQuestionChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const updatedQuestions = [...formNonNarrativeQuestions]
    const field = e.target.name
    const value = field === 'question_order' || field === 'marks' ? parseInt(e.target.value) || 0 : e.target.value
    
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    }
    
    setFormNonNarrativeQuestions(updatedQuestions)
  }

  // Save non-narrative exercise and questions
  const handleSaveNonNarrative = async () => {
    try {
      setIsUploading(true);
      
      // Validate form data
      if (!formNonNarrativeExercise.title.trim()) {
        setMessage({ text: "Title is required", type: "error" });
        return;
      }

      if (!formNonNarrativeExercise.passage_text.trim()) {
        setMessage({ text: "Passage text is required", type: "error" });
        return;
      }

      if (formNonNarrativeQuestions.length === 0) {
        setMessage({ text: "At least one question is required", type: "error" });
        return;
      }

      const exerciseId = formNonNarrativeExercise.id;
      
      // Prepare questions with correct format
      const questionsToSave = formNonNarrativeQuestions.map(q => ({
        id: q.isNew ? undefined : q.id,
        question_text: q.question_text,
        ideal_answer: q.ideal_answer,
        question_order: q.question_order,
        marks: q.marks || 1
      }));

      if (!exerciseId) {
        // Creating a new exercise
        const { data: newExercise, error: insertError } = await supabase
          .from('non_narrative_exercises')
          .insert({
            title: formNonNarrativeExercise.title,
            passage_text: formNonNarrativeExercise.passage_text,
            description: formNonNarrativeExercise.description,
            time_limit: formNonNarrativeExercise.time_limit,
            questions: questionsToSave
          })
          .select('*')
          .single();
          
        if (insertError) throw insertError;
        
        setMessage({ text: "New non-narrative exercise created successfully", type: "success" });
      } else {
        // Update existing exercise with questions
        const { error } = await supabase
          .from('non_narrative_exercises')
          .update({
            title: formNonNarrativeExercise.title,
            passage_text: formNonNarrativeExercise.passage_text,
            description: formNonNarrativeExercise.description,
            time_limit: formNonNarrativeExercise.time_limit,
            questions: questionsToSave
          })
          .eq('id', exerciseId);

        if (error) throw error;
        
        setMessage({ text: "Non-narrative exercise updated successfully", type: "success" });
      }

      setIsEditingNonNarrative(false);
      
      // Refresh exercise list
      const { data, error: refreshError } = await supabase
        .from('non_narrative_exercises')
        .select('*')
        .order('id');

      if (refreshError) throw refreshError;
      setNonNarrativeExercises(data || []);

    } catch (error) {
      console.error('Error saving non-narrative exercise:', error);
      setMessage({ text: "Failed to save non-narrative exercise", type: "error" });
    } finally {
      setIsUploading(false);
    }
  };

  // Preview the non-narrative exercise
  const handlePreviewNonNarrativeExercise = (exerciseId: number) => {
    router.push(`/nonnarratcomp?exercise=${exerciseId}`)
  }
  
  // Delete non-narrative exercise
  const handleDeleteNonNarrativeExercise = async (exerciseId: number) => {
    if (!confirm("Are you sure you want to delete this exercise? This action cannot be undone.")) {
      return
    }
    
    try {
      setLoading(true)
      
      const { error } = await supabase
        .from('non_narrative_exercises')
        .delete()
        .eq('id', exerciseId)
      
      if (error) throw error
      
      // Refresh the list after deletion
      const { data, error: refreshError } = await supabase
        .from('non_narrative_exercises')
        .select('*')
        .order('id')
      
      if (refreshError) throw refreshError
      
      setNonNarrativeExercises(data || [])
      setMessage({ text: "Exercise deleted successfully", type: "success" })
      
    } catch (error) {
      console.error('Error deleting non-narrative exercise:', error)
      setMessage({ text: "Failed to delete exercise", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  // Delete visual exercise
  const handleDeleteExercise = async (exerciseId: number) => {
    if (!confirm("Are you sure you want to delete this exercise? This action cannot be undone.")) {
      return
    }
    
    try {
      setLoading(true)
      
      const { error } = await supabase
        .from('visual_exercises')
        .delete()
        .eq('id', exerciseId)
      
      if (error) throw error
      
      // Refresh the list after deletion
      const { data, error: refreshError } = await supabase
        .from('visual_exercises')
        .select('*')
        .order('id')
      
      if (refreshError) throw refreshError
      
      setExercises(data || [])
      setMessage({ text: "Exercise deleted successfully", type: "success" })
      
    } catch (error) {
      console.error('Error deleting exercise:', error)
      setMessage({ text: "Failed to delete exercise", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  // Toggle exercise type between questions and flowchart
  const toggleExerciseType = () => {
    setFormNarrativeExercise(prev => ({
      ...prev,
      exercise_type: prev.exercise_type === "questions" ? "flowchart" : "questions"
    }));
  };

  // Add a flowchart option
  const handleAddFlowchartOption = () => {
    setFormFlowchart(prev => ({
      ...prev,
      options: [...prev.options, `Option ${prev.options.length + 1}`]
    }));
  };

  // Remove a flowchart option
  const handleRemoveFlowchartOption = (index: number) => {
    setFormFlowchart(prev => {
      const updatedOptions = [...prev.options];
      updatedOptions.splice(index, 1);
      return {
        ...prev,
        options: updatedOptions
      };
    });
  };

  // Edit a flowchart option
  const handleFlowchartOptionChange = (index: number, value: string) => {
    setFormFlowchart(prev => {
      const updatedOptions = [...prev.options];
      updatedOptions[index] = value;
      return {
        ...prev,
        options: updatedOptions
      };
    });
  };

  // Add a flowchart section
  const handleAddFlowchartSection = () => {
    const newOrder = formFlowchart.sections.length + 1;
    
    setFormFlowchart(prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: Date.now(),
          name: `Paragraphs ${newOrder}`,
          paragraphs: `${newOrder}`,
          isNew: true
        }
      ]
    }));
  };

  // Remove a flowchart section
  const handleRemoveFlowchartSection = (index: number) => {
    setFormFlowchart(prev => {
      const updatedSections = [...prev.sections];
      updatedSections.splice(index, 1);
      return {
        ...prev,
        sections: updatedSections
      };
    });
  };

  // Edit a flowchart section
  const handleFlowchartSectionChange = (index: number, field: string, value: string) => {
    setFormFlowchart(prev => {
      const updatedSections = [...prev.sections];
      updatedSections[index] = {
        ...updatedSections[index],
        [field]: value
      };
      return {
        ...prev,
        sections: updatedSections
      };
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center text-gray-500 hover:text-gray-700">
              <ArrowLeft size={20} />
              <span className="ml-2">Back to Home</span>
            </Link>
            <h1 className="text-xl font-semibold text-gray-800">Exercise Management</h1>
          </div>
          <button 
            onClick={() => {
              sessionStorage.removeItem('adminAuthenticated')
              setIsAuthenticated(false)
            }}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Logout
          </button>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
        {/* Message display */}
        {message.text && (
          <div className={`mb-4 p-3 rounded ${message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"} flex justify-between items-center`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage({ text: "", type: "" })} className="text-gray-500 hover:text-gray-700">
              <X size={18} />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('visual')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'visual'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center">
                <Image size={16} className="mr-2" />
                Visual Exercises
              </div>
            </button>
            <button
              onClick={() => setActiveTab('narrative')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'narrative'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center">
                <BookOpen size={16} className="mr-2" />
                Narrative Exercises
              </div>
            </button>
            <button
              onClick={() => setActiveTab('non-narrative')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'non-narrative'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center">
                <FileText size={16} className="mr-2" />
                Non-Narrative Exercises
              </div>
            </button>
          </nav>
        </div>

        {activeTab === 'visual' ? (
          /* Visual Exercises UI */
          isEditing ? (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Edit Exercise: {selectedExercise?.title}
                </h2>
                
                {/* Exercise Form */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={formExercise.title}
                      onChange={handleExerciseChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="Exercise Title"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      id="description"
                      rows={3}
                      value={formExercise.description}
                      onChange={handleExerciseChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="Exercise Description"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Image</label>
                    <div className="mt-1 flex items-center">
                      <div className="flex-shrink-0">
                        {imagePreview ? (
                          <div className="relative w-64 h-40 bg-gray-100 rounded-md overflow-hidden">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            <button 
                              onClick={() => {
                                setImagePreview(selectedExercise?.image_url || null);
                                setImageFile(null);
                                setFormExercise(prev => ({ ...prev, image_url: selectedExercise?.image_url || "" }));
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="w-64 h-40 bg-gray-100 rounded-md flex items-center justify-center">
                            <span className="text-gray-400">No image selected</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <label htmlFor="image-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                          <span>Upload Image</span>
                          <input 
                            id="image-upload" 
                            name="image" 
                            type="file" 
                            accept="image/*"
                            className="sr-only" 
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Questions Section */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Questions</h3>
                    <button 
                      onClick={handleAddQuestion}
                      className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 flex items-center text-sm"
                    >
                      <Plus size={16} className="mr-1" />
                      Add Question
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    {formQuestions.map((question, index) => (
                      <div key={index} className="p-6 bg-gray-50 rounded-lg mb-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-700">Question {index + 1}</h3>
                          <div className="flex gap-2">
                            
                            <div className="flex items-center">
                              <label className="text-sm text-gray-600 mr-2">Marks:</label>
                              <input
                                type="number"
                                name="marks"
                                value={question.marks || 1}
                                onChange={(e) => handleQuestionChange(index, e)}
                                className="border p-2 w-16 text-gray-900 text-center rounded"
                                min="1"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        <div>
                          <label htmlFor={`question-${index}`} className="block text-sm font-medium text-gray-700">
                            Question {index + 1}
                          </label>
                          <textarea
                            type="text"
                            name="text"
                            id={`question-${index}`}
                            value={question.text}
                            onChange={(e) => handleQuestionChange(index, e)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            placeholder="Question text"
                          />
                        </div>
                        <div>
                          <label htmlFor={`answer-${index}`} className="block text-sm font-medium text-gray-700">
                            Ideal Answer
                          </label>
                          <textarea
                            name="ideal_answer"
                            id={`answer-${index}`}
                            rows={3}
                            value={question.ideal_answer}
                            onChange={(e) => handleQuestionChange(index, e)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            placeholder="Ideal answer"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isUploading}
                    className="bg-blue-600 text-white py-2 px-4 rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 flex items-center"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading exercises...</p>
                </div>
              ) : exercises.length === 0 ? (
                <div className="text-center py-12 bg-white shadow rounded-lg">
                  <p className="text-gray-500 mb-4">No exercises found</p>
                </div>
              ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b flex justify-end">
                    <button
                      onClick={handleCreateExercise}
                      className="bg-blue-600 text-white py-2 px-4 rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 flex items-center"
                    >
                      <Plus size={16} className="mr-2" />
                      Create New Exercise
                    </button>
                  </div>
                  <ul className="divide-y divide-gray-200">
                    {exercises.map((exercise) => (
                      <li key={exercise.id} className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-md overflow-hidden">
                              {exercise.image_url ? (
                                <img src={exercise.image_url} alt={exercise.title} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gray-200">
                                  <Image size={20} className="text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <h3 className="text-lg font-medium text-gray-900">{exercise.title}</h3>
                              <p className="text-sm text-gray-500 truncate max-w-md">
                                {exercise.description || "No description"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handlePreviewExercise(exercise.id)}
                              className="text-gray-600 hover:text-gray-900 p-2"
                              title="Preview"
                            >
                              <Eye size={20} />
                            </button>
                            <button
                              onClick={() => handleEditExercise(exercise)}
                              className="text-blue-600 hover:text-blue-800 p-2"
                              title="Edit"
                            >
                              <Edit size={20} />
                            </button>
                            <button
                              onClick={() => toggleExerciseExpansion(exercise.id)}
                              className="text-gray-600 hover:text-gray-900 p-2"
                              title={expandedExercise === exercise.id ? "Collapse" : "Expand"}
                            >
                              {expandedExercise === exercise.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                            <button
                              onClick={() => handleDeleteExercise(exercise.id)}
                              className="text-red-600 hover:text-red-800 p-2"
                              title="Delete"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                        
                        {/* Show questions when expanded */}
                        {expandedExercise === exercise.id && (
                          <div className="mt-4 pl-16">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Questions</h4>
                            {questions.length === 0 ? (
                              <p className="text-sm text-gray-500">No questions available</p>
                            ) : (
                              <ul className="space-y-3">
                                {questions.map((question) => (
                                  <li key={question.id} className="bg-gray-50 p-3 rounded-md">
                                    <p className="font-medium text-gray-800">{question.text}</p>
                                    <p className="text-sm text-gray-600 mt-1">
                                      <span className="font-medium">Ideal answer:</span> {question.ideal_answer}
                                    </p>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        ) : activeTab === 'narrative' ? (
          /* Narrative Exercises UI */
          isEditingNarrative ? (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Edit Exercise: {selectedNarrativeExercise?.title}
                </h2>
                
                {/* Narrative Exercise Form */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={formNarrativeExercise.title}
                      onChange={handleNarrativeExerciseChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="Exercise Title"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      id="description"
                      rows={2}
                      value={formNarrativeExercise.description}
                      onChange={handleNarrativeExerciseChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="Exercise Description"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="time_limit" className="block text-sm font-medium text-gray-700">Time Limit (seconds)</label>
                    <input
                      type="number"
                      name="time_limit"
                      id="time_limit"
                      value={formNarrativeExercise.time_limit}
                      onChange={handleNarrativeExerciseChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="Time limit in seconds (e.g., 1800 for 30 minutes)"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      {Math.floor(formNarrativeExercise.time_limit / 60)} minutes and {formNarrativeExercise.time_limit % 60} seconds
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="story_text" className="block text-sm font-medium text-gray-700">Story Text</label>
                    <textarea
                      name="story_text"
                      id="story_text"
                      rows={10}
                      value={formNarrativeExercise.story_text}
                      onChange={handleNarrativeExerciseChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                      placeholder="Enter the story text. You can use Markdown formatting."
                    />
                  </div>
                </div>
                
                {/* Add this after the story_text textarea in the narrative exercise form */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exercise Type</label>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setFormNarrativeExercise(prev => ({ ...prev, exercise_type: "questions" }))}
                      className={`px-4 py-2 rounded-md ${
                        formNarrativeExercise.exercise_type === "questions"
                          ? "bg-blue-100 text-blue-700 border border-blue-300"
                          : "bg-gray-100 text-gray-700 border border-gray-300"
                      }`}
                    >
                      Questions
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormNarrativeExercise(prev => ({ ...prev, exercise_type: "flowchart" }))}
                      className={`px-4 py-2 rounded-md ${
                        formNarrativeExercise.exercise_type === "flowchart"
                          ? "bg-blue-100 text-blue-700 border border-blue-300"
                          : "bg-gray-100 text-gray-700 border border-gray-300"
                      }`}
                    >
                      Flow Chart
                    </button>
                  </div>
                </div>
                
                {/* Replace the questions section with a conditional rendering based on exercise_type */}
                {formNarrativeExercise.exercise_type === "questions" ? (
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Questions</h3>
                      <button
                        type="button"
                        onClick={handleAddNarrativeQuestion}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Plus size={16} className="mr-2" />
                        Add Question
                      </button>
                    </div>
                    
                    {formNarrativeQuestions.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No questions yet. Add some questions.</p>
                    ) : (
                      <div className="space-y-6">
                        {formNarrativeQuestions.map((question, index) => (
                          <div key={question.id} className="bg-gray-50 p-4 rounded-md border border-gray-200 relative">
                            <button
                              type="button"
                              onClick={() => handleRemoveNarrativeQuestion(index)}
                              className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={18} />
                            </button>
                            
                            <div className="flex space-x-4 mb-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Order</label>
                                <input
                                  type="number"
                                  name="question_order"
                                  value={question.question_order}
                                  onChange={(e) => handleNarrativeQuestionChange(index, e)}
                                  className="w-16 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Marks</label>
                                <input
                                  type="number"
                                  name="marks"
                                  value={question.marks}
                                  onChange={(e) => handleNarrativeQuestionChange(index, e)}
                                  className="w-16 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                />
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                              <textarea
                                name="question_text"
                                value={question.question_text}
                                onChange={(e) => handleNarrativeQuestionChange(index, e)}
                                rows={2}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                placeholder="Question text"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Ideal Answer</label>
                              <textarea
                                name="ideal_answer"
                                value={question.ideal_answer}
                                onChange={(e) => handleNarrativeQuestionChange(index, e)}
                                rows={3}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                placeholder="Ideal answer for this question"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-8">
                    {/* Flowchart Options */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Word Options</h3>
                        <button
                          type="button"
                          onClick={handleAddFlowchartOption}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Plus size={16} className="mr-2" />
                          Add Option
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                        {formFlowchart.options.map((option, index) => (
                          <div key={index} className="relative">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleFlowchartOptionChange(index, e.target.value)}
                              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pr-8 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveFlowchartOption(index)}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Flowchart Sections */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Flow Chart Sections</h3>
                        <button
                          type="button"
                          onClick={handleAddFlowchartSection}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Plus size={16} className="mr-2" />
                          Add Section
                        </button>
                      </div>
                      
                      {formFlowchart.sections.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No sections yet. Add some sections to your flow chart.</p>
                      ) : (
                        <div className="space-y-6">
                          {formFlowchart.sections.map((section, index) => (
                            <div key={section.id} className="bg-gray-50 p-4 rounded-md border border-gray-200 relative">
                              <button
                                type="button"
                                onClick={() => handleRemoveFlowchartSection(index)}
                                className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                              >
                                <Trash2 size={18} />
                              </button>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Section Name</label>
                                  <input
                                    type="text"
                                    value={section.name}
                                    onChange={(e) => handleFlowchartSectionChange(index, "name", e.target.value)}
                                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                    placeholder="e.g., Paragraphs 1-2"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Paragraph Reference</label>
                                  <input
                                    type="text"
                                    value={section.paragraphs}
                                    onChange={(e) => handleFlowchartSectionChange(index, "paragraphs", e.target.value)}
                                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                    placeholder="e.g., 1-2 or 3"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                                <select
                                  value={section.correct_answer || ""}
                                  onChange={(e) => handleFlowchartSectionChange(index, "correct_answer", e.target.value)}
                                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                >
                                  <option value="">-- Select correct answer --</option>
                                  {formFlowchart.options.map((option, optIdx) => (
                                    <option key={optIdx} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setIsEditingNarrative(false)}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNarrative}
                    disabled={isUploading}
                    className="bg-blue-600 text-white py-2 px-4 rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 flex items-center"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading exercises...</p>
                </div>
              ) : (
                <>
                  {narrativeExercises.length === 0 ? (
                    <div className="text-center py-12 bg-white shadow rounded-lg">
                      <p className="text-gray-500 mb-4">No narrative exercises found</p>
                    </div>
                  ) : (
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                      <div className="p-4 bg-gray-50 border-b flex justify-end">
                        <button
                          onClick={handleCreateNarrativeExercise}
                          className="bg-blue-600 text-white py-2 px-4 rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 flex items-center"
                        >
                          <Plus size={16} className="mr-2" />
                          Create New Exercise
                        </button>
                      </div>
                      <ul className="divide-y divide-gray-200">
                        {narrativeExercises.map((exercise) => (
                          <li key={exercise.id} className="px-4 py-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">{exercise.title}</h3>
                                <p className="text-sm text-gray-500 truncate max-w-md">
                                  {exercise.description || "No description"}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  Time Limit: {Math.floor(exercise.time_limit / 60)}m {exercise.time_limit % 60}s | 
                                  Questions: {exercise.questions ? exercise.questions.length : 0}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handlePreviewNarrativeExercise(exercise.id)}
                                  className="text-gray-600 hover:text-gray-900 p-2"
                                  title="Preview"
                                >
                                  <Eye size={20} />
                                </button>
                                <button
                                  onClick={() => handleEditNarrativeExercise(exercise)}
                                  className="text-blue-600 hover:text-blue-800 p-2"
                                  title="Edit"
                                >
                                  <Edit size={20} />
                                </button>
                                <button
                                  onClick={() => toggleNarrativeExerciseExpansion(exercise.id)}
                                  className="text-gray-600 hover:text-gray-900 p-2"
                                  title={expandedNarrativeExercise === exercise.id ? "Collapse" : "Expand"}
                                >
                                  {expandedNarrativeExercise === exercise.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                                <button
                                  onClick={() => handleDeleteNarrativeExercise(exercise.id)}
                                  className="text-red-600 hover:text-red-800 p-2"
                                  title="Delete"
                                >
                                  <Trash2 size={20} />
                                </button>
                              </div>
                            </div>
                            
                            {expandedNarrativeExercise === exercise.id && (
                              <div className="mt-4 bg-gray-50 p-4 rounded-md">
                                <h4 className="font-medium text-gray-700 mb-2">Story Preview:</h4>
                                <div className="bg-white p-3 rounded border border-gray-200 mb-4 max-h-48 overflow-y-auto">
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                    {exercise.story_text.substring(0, 500)}
                                    {exercise.story_text.length > 500 ? "..." : ""}
                                  </p>
                                </div>
                                
                                <h4 className="font-medium text-gray-700 mb-2">Type: {exercise.exercise_type || "questions"}</h4>
                                
                                {(!exercise.exercise_type || exercise.exercise_type === "questions") && exercise.questions && (
                                  <>
                                    <h4 className="font-medium text-gray-700 mb-2">Questions:</h4>
                                    <ul className="space-y-2">
                                      {exercise.questions.map((question, idx) => (
                                        <li key={idx} className="bg-white p-3 rounded border border-gray-200">
                                          <p className="font-medium text-gray-800">{idx + 1}. {question.question_text}</p>
                                          <p className="text-sm text-gray-600 mt-1">
                                            <span className="font-medium">Ideal answer:</span> {question.ideal_answer}
                                          </p>
                                        </li>
                                      ))}
                                    </ul>
                                  </>
                                )}
                                
                                {exercise.exercise_type === "flowchart" && exercise.flowchart && (
                                  <>
                                    <h4 className="font-medium text-gray-700 mb-2">Flow Chart:</h4>
                                    <div className="mb-4">
                                      <h5 className="text-sm font-medium text-gray-700 mb-1">Options:</h5>
                                      <div className="flex flex-wrap gap-2">
                                        {exercise.flowchart.options.map((option, idx) => (
                                          <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm border border-blue-200">
                                            {option}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h5 className="text-sm font-medium text-gray-700 mb-1">Sections:</h5>
                                      <ul className="space-y-2">
                                        {exercise.flowchart.sections.map((section, idx) => (
                                          <li key={idx} className="bg-white p-3 rounded border border-gray-200">
                                            <p className="font-medium text-gray-800">{section.name}</p>
                                            <p className="text-sm text-gray-600">Paragraphs: {section.paragraphs}</p>
                                            {section.correct_answer && (
                                              <p className="text-sm text-green-600 mt-1">
                                                <span className="font-medium">Correct answer:</span> {section.correct_answer}
                                              </p>
                                            )}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )
        ) : (
          /* Non-Narrative Exercises UI */
          isEditingNonNarrative ? (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Edit Exercise: {selectedNonNarrativeExercise?.title}
                </h2>
                
                {/* Non-Narrative Exercise Form */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={formNonNarrativeExercise.title}
                      onChange={handleNonNarrativeExerciseChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="Exercise Title"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      id="description"
                      rows={2}
                      value={formNonNarrativeExercise.description}
                      onChange={handleNonNarrativeExerciseChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="Exercise Description"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="time_limit" className="block text-sm font-medium text-gray-700">Time Limit (seconds)</label>
                    <input
                      type="number"
                      name="time_limit"
                      id="time_limit"
                      value={formNonNarrativeExercise.time_limit}
                      onChange={handleNonNarrativeExerciseChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="Time limit in seconds (e.g., 1500 for 25 minutes)"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      {Math.floor(formNonNarrativeExercise.time_limit / 60)} minutes and {formNonNarrativeExercise.time_limit % 60} seconds
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="passage_text" className="block text-sm font-medium text-gray-700">Passage Text</label>
                    <textarea
                      name="passage_text"
                      id="passage_text"
                      rows={10}
                      value={formNonNarrativeExercise.passage_text}
                      onChange={handleNonNarrativeExerciseChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
                      placeholder="Enter the passage text. Use empty lines to separate paragraphs."
                    />
                  </div>
                </div>
                
                {/* Questions Section */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Questions</h3>
                    <button 
                      onClick={handleAddNonNarrativeQuestion}
                      className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 flex items-center text-sm"
                    >
                      <Plus size={16} className="mr-1" />
                      Add Question
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    {formNonNarrativeQuestions.map((question, index) => (
                      <div key={index} className="p-6 bg-gray-50 rounded-lg mb-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-700">Question {index + 1}</h3>
                          <div className="flex gap-2">
                            
                            <div className="flex items-center">
                              <label className="text-sm text-gray-600 mr-2">Marks:</label>
                              <input
                                type="number"
                                name="marks"
                                value={question.marks || 1}
                                onChange={(e) => handleNonNarrativeQuestionChange(index, e)}
                                className="border p-2 w-16 text-gray-900 text-center rounded"
                                min="1"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveNonNarrativeQuestion(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        <div>
                          <label htmlFor={`question-text-${index}`} className="block text-sm font-medium text-gray-700">
                            Question Text
                          </label>
                          <textarea
                            id={`question-text-${index}`}
                            name="question_text"
                            value={question.question_text}
                            onChange={(e) => handleNonNarrativeQuestionChange(index, e)}
                            rows={3}
                            className="mt-1 w-full rounded-md text-gray-900 border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Enter the question text"
                          />
                        </div>
                        <div className="mt-4">
                          <label htmlFor={`ideal-answer-${index}`} className="block text-sm font-medium text-gray-700">
                            Ideal Answer
                          </label>
                          <textarea
                            id={`ideal-answer-${index}`}
                            name="ideal_answer"
                            value={question.ideal_answer}
                            onChange={(e) => handleNonNarrativeQuestionChange(index, e)}
                            rows={4}
                            className="mt-1 w-full rounded-md text-gray-900 border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Enter the ideal answer"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setIsEditingNonNarrative(false)}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNonNarrative}
                    disabled={isUploading}
                    className="bg-blue-600 text-white py-2 px-4 rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 flex items-center"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading exercises...</p>
                </div>
              ) : (
                <>
                  {nonNarrativeExercises.length === 0 ? (
                    <div className="text-center py-12 bg-white shadow rounded-lg">
                      <p className="text-gray-500 mb-4">No non-narrative exercises found</p>
                    </div>
                  ) : (
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                      <div className="p-4 bg-gray-50 border-b flex justify-end">
                        <button
                          onClick={handleCreateNonNarrativeExercise}
                          className="bg-blue-600 text-white py-2 px-4 rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 flex items-center"
                        >
                          <Plus size={16} className="mr-2" />
                          Create New Exercise
                        </button>
                      </div>
                      <ul className="divide-y divide-gray-200">
                        {nonNarrativeExercises.map((exercise) => (
                          <li key={exercise.id} className="px-4 py-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">{exercise.title}</h3>
                                <p className="text-sm text-gray-500 truncate max-w-md">
                                  {exercise.description || "No description"}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  Time Limit: {Math.floor(exercise.time_limit / 60)}m {exercise.time_limit % 60}s | 
                                  Questions: {exercise.questions ? exercise.questions.length : 0}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handlePreviewNonNarrativeExercise(exercise.id)}
                                  className="text-gray-600 hover:text-gray-900 p-2"
                                  title="Preview"
                                >
                                  <Eye size={20} />
                                </button>
                                <button
                                  onClick={() => handleEditNonNarrativeExercise(exercise)}
                                  className="text-blue-600 hover:text-blue-800 p-2"
                                  title="Edit"
                                >
                                  <Edit size={20} />
                                </button>
                                <button
                                  onClick={() => toggleNonNarrativeExerciseExpansion(exercise.id)}
                                  className="text-gray-600 hover:text-gray-900 p-2"
                                  title={expandedNonNarrativeExercise === exercise.id ? "Collapse" : "Expand"}
                                >
                                  {expandedNonNarrativeExercise === exercise.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                                <button
                                  onClick={() => handleDeleteNonNarrativeExercise(exercise.id)}
                                  className="text-red-600 hover:text-red-800 p-2"
                                  title="Delete"
                                >
                                  <Trash2 size={20} />
                                </button>
                              </div>
                            </div>
                            
                            {expandedNonNarrativeExercise === exercise.id && (
                              <div className="mt-4 bg-gray-50 p-4 rounded-md">
                                <h4 className="font-medium text-gray-700 mb-2">Passage Preview:</h4>
                                <div className="bg-white p-3 rounded border border-gray-200 mb-4 max-h-48 overflow-y-auto">
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                    {exercise.passage_text.substring(0, 500)}
                                    {exercise.passage_text.length > 500 ? "..." : ""}
                                  </p>
                                </div>
                                
                                <h4 className="font-medium text-gray-700 mb-2">Questions:</h4>
                                <ul className="space-y-2">
                                  {exercise.questions && exercise.questions.map((question, idx) => (
                                    <li key={idx} className="bg-white p-3 rounded border border-gray-200">
                                      <p className="font-medium text-gray-800">{idx + 1}. {question.question_text}</p>
                                      <p className="text-sm text-gray-600 mt-1">
                                        <span className="font-medium">Ideal answer:</span> {question.ideal_answer}
                                      </p>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )
        )}
      </main>
    </div>
  )
} 