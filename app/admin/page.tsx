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
  }>({
    title: "",
    story_text: "",
    description: "",
    time_limit: 1800 // Default 30 minutes
  })

  // Form states for questions
  const [formQuestions, setFormQuestions] = useState<{
    id?: number;
    text: string;
    ideal_answer: string;
    question_order: number;
    exercise_id?: number;
    isNew?: boolean;
  }[]>([])

  // Form states for narrative questions
  const [formNarrativeQuestions, setFormNarrativeQuestions] = useState<{
    id: number;
    question_text: string;
    ideal_answer: string;
    question_order: number;
    isNew?: boolean;
  }[]>([])

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

  // Handle editing an existing exercise
  const handleEditExercise = async (exercise: VisualExercise) => {
    setSelectedExercise(exercise)
    setFormExercise({
      id: exercise.id,
      title: exercise.title,
      image_url: exercise.image_url,
      description: exercise.description || ""
    })
    
    const questionsData = await fetchQuestionsForExercise(exercise.id)
    setFormQuestions(questionsData.map(q => ({ ...q })))
    setImagePreview(exercise.image_url)
    setIsEditing(true)
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
    console.log("Adding new question to exercise", selectedExercise?.id);
    
    setFormQuestions([
      ...formQuestions, 
      {
        text: "",
        ideal_answer: "",
        question_order: formQuestions.length + 1,
        exercise_id: selectedExercise?.id, // Ensure exercise_id is set
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
    const { name, value } = e.target
    const updatedQuestions = [...formQuestions]
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [name]: value
    }
    setFormQuestions(updatedQuestions)
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
              question_order: question.question_order
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
            question_order: question.question_order
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

  // Handle editing an existing narrative exercise
  const handleEditNarrativeExercise = (exercise: NarrativeExercise) => {
    setSelectedNarrativeExercise(exercise)
    
    setFormNarrativeExercise({
      id: exercise.id,
      title: exercise.title,
      story_text: exercise.story_text,
      description: exercise.description || "",
      time_limit: exercise.time_limit
    })
    
    // Convert the JSONB questions array to our form format
    const narrativeQuestions = exercise.questions || []
    setFormNarrativeQuestions(narrativeQuestions.map(q => ({ ...q, isNew: false })))
    
    setIsEditingNarrative(true)
  }

  // Handle adding a question to narrative exercise
  const handleAddNarrativeQuestion = () => {
    setFormNarrativeQuestions([
      ...formNarrativeQuestions,
      {
        id: Math.max(0, ...formNarrativeQuestions.map(q => q.id)) + 1,
        question_text: "",
        ideal_answer: "",
        question_order: formNarrativeQuestions.length + 1,
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
    const { name, value } = e.target
    const updatedQuestions = [...formNarrativeQuestions]
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [name]: value
    }
    setFormNarrativeQuestions(updatedQuestions)
  }

  // Save narrative exercise and questions
  const handleSaveNarrative = async () => {
    try {
      setIsUploading(true)
      
      // Validate form data
      if (!formNarrativeExercise.title.trim()) {
        setMessage({ text: "Title is required", type: "error" })
        return
      }
      
      if (!formNarrativeExercise.story_text.trim()) {
        setMessage({ text: "Story text is required", type: "error" })
        return
      }
      
      if (formNarrativeQuestions.length === 0) {
        setMessage({ text: "At least one question is required", type: "error" })
        return
      }
      
      // Update existing exercise
      const { error: updateError } = await supabase
        .from('narrative_exercises')
        .update({
          title: formNarrativeExercise.title,
          story_text: formNarrativeExercise.story_text,
          description: formNarrativeExercise.description,
          time_limit: formNarrativeExercise.time_limit,
          questions: formNarrativeQuestions
        })
        .eq('id', formNarrativeExercise.id)
      
      if (updateError) throw updateError
      
      setMessage({ text: "Exercise updated successfully", type: "success" })
      
      // Refresh narrative exercises list
      const { data: refreshData, error: refreshError } = await supabase
        .from('narrative_exercises')
        .select('*')
        .order('id')
      
      if (refreshError) throw refreshError
      setNarrativeExercises(refreshData || [])
      
      // Reset form and close editing mode
      setIsEditingNarrative(false)
      
    } catch (error) {
      console.error('Error saving narrative exercise:', error)
      setMessage({ text: "Failed to save narrative exercise", type: "error" })
    } finally {
      setIsUploading(false)
    }
  }

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
    setSelectedNonNarrativeExercise(exercise)
    
    setFormNonNarrativeExercise({
      id: exercise.id,
      title: exercise.title,
      passage_text: exercise.passage_text,
      description: exercise.description || "",
      time_limit: exercise.time_limit
    })
    
    // Convert the JSONB questions array to our form format
    const nonNarrativeQuestions = exercise.questions || []
    setFormNonNarrativeQuestions(nonNarrativeQuestions.map(q => ({ ...q, isNew: false })))
    
    setIsEditingNonNarrative(true)
  }

  // Handle adding a question to non-narrative exercise
  const handleAddNonNarrativeQuestion = () => {
    setFormNonNarrativeQuestions([
      ...formNonNarrativeQuestions,
      {
        id: Math.max(0, ...formNonNarrativeQuestions.map(q => q.id)) + 1,
        question_text: "",
        ideal_answer: "",
        question_order: formNonNarrativeQuestions.length + 1,
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
    const { name, value } = e.target
    const updatedQuestions = [...formNonNarrativeQuestions]
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [name]: value
    }
    setFormNonNarrativeQuestions(updatedQuestions)
  }

  // Save non-narrative exercise and questions
  const handleSaveNonNarrative = async () => {
    try {
      setIsUploading(true)
      
      // Validate form data
      if (!formNonNarrativeExercise.title.trim()) {
        setMessage({ text: "Title is required", type: "error" })
        return
      }
      
      if (!formNonNarrativeExercise.passage_text.trim()) {
        setMessage({ text: "Passage text is required", type: "error" })
        return
      }
      
      if (formNonNarrativeQuestions.length === 0) {
        setMessage({ text: "At least one question is required", type: "error" })
        return
      }
      
      // Check if we're creating a new exercise or updating an existing one
      if (formNonNarrativeExercise.id) {
        // Update existing exercise
        const { error: updateError } = await supabase
          .from('non_narrative_exercises')
          .update({
            title: formNonNarrativeExercise.title,
            passage_text: formNonNarrativeExercise.passage_text,
            description: formNonNarrativeExercise.description,
            time_limit: formNonNarrativeExercise.time_limit,
            questions: formNonNarrativeQuestions
          })
          .eq('id', formNonNarrativeExercise.id)
        
        if (updateError) throw updateError
        
        setMessage({ text: "Exercise updated successfully", type: "success" })
      } else {
        // Create new exercise
        const { data: newExercise, error: createError } = await supabase
          .from('non_narrative_exercises')
          .insert({
            title: formNonNarrativeExercise.title,
            passage_text: formNonNarrativeExercise.passage_text,
            description: formNonNarrativeExercise.description,
            time_limit: formNonNarrativeExercise.time_limit,
            questions: formNonNarrativeQuestions
          })
          .select()
        
        if (createError) throw createError
        
        setMessage({ text: "New exercise created successfully", type: "success" })
      }
      
      // Refresh non-narrative exercises list
      const { data: refreshData, error: refreshError } = await supabase
        .from('non_narrative_exercises')
        .select('*')
        .order('id')
      
      if (refreshError) throw refreshError
      setNonNarrativeExercises(refreshData || [])
      
      // Reset form and close editing mode
      setIsEditingNonNarrative(false)
      
    } catch (error) {
      console.error('Error saving non-narrative exercise:', error)
      setMessage({ text: "Failed to save non-narrative exercise", type: "error" })
    } finally {
      setIsUploading(false)
    }
  }

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
                      <div key={index} className="bg-gray-50 p-4 rounded-md relative">
                        <div className="absolute top-2 right-2">
                          <button 
                            onClick={() => handleRemoveQuestion(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        
                        <div className="mb-4">
                          <label htmlFor={`question-${index}`} className="block text-sm font-medium text-gray-700">
                            Question {index + 1}
                          </label>
                          <input
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
                  <ul className="divide-y divide-gray-200">
                    {exercises.map((exercise) => (
                      <li key={exercise.id} className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-md overflow-hidden">
                              <img src={exercise.image_url} alt={exercise.title} className="h-full w-full object-cover" />
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
                
                {/* Questions Section */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Questions</h3>
                    <button 
                      onClick={handleAddNarrativeQuestion}
                      className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 flex items-center text-sm"
                    >
                      <Plus size={16} className="mr-1" />
                      Add Question
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    {formNarrativeQuestions.map((question, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-md relative">
                        <div className="absolute top-2 right-2">
                          <button 
                            onClick={() => handleRemoveNarrativeQuestion(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        
                        <div className="mb-4">
                          <label htmlFor={`question-text-${index}`} className="block text-sm font-medium text-gray-700">
                            Question {index + 1}
                          </label>
                          <input
                            type="text"
                            name="question_text"
                            id={`question-text-${index}`}
                            value={question.question_text}
                            onChange={(e) => handleNarrativeQuestionChange(index, e)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            placeholder="Question text"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor={`ideal-answer-${index}`} className="block text-sm font-medium text-gray-700">
                            Ideal Answer
                          </label>
                          <textarea
                            name="ideal_answer"
                            id={`ideal-answer-${index}`}
                            rows={3}
                            value={question.ideal_answer}
                            onChange={(e) => handleNarrativeQuestionChange(index, e)}
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
                      <div key={index} className="bg-gray-50 p-4 rounded-md relative">
                        <div className="absolute top-2 right-2">
                          <button 
                            onClick={() => handleRemoveNonNarrativeQuestion(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        
                        <div className="mb-4">
                          <label htmlFor={`question-text-${index}`} className="block text-sm font-medium text-gray-700">
                            Question {index + 1}
                          </label>
                          <input
                            type="text"
                            name="question_text"
                            id={`question-text-${index}`}
                            value={question.question_text}
                            onChange={(e) => handleNonNarrativeQuestionChange(index, e)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            placeholder="Question text"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor={`ideal-answer-${index}`} className="block text-sm font-medium text-gray-700">
                            Ideal Answer
                          </label>
                          <textarea
                            name="ideal_answer"
                            id={`ideal-answer-${index}`}
                            rows={3}
                            value={question.ideal_answer}
                            onChange={(e) => handleNonNarrativeQuestionChange(index, e)}
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