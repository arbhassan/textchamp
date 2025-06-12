"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Moon, Sun, X } from "lucide-react"

export default function LandingPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [showMobileModal, setShowMobileModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Form submitted:", { email, password, remember })
    // For now, redirect to signup
    router.push('/signup')
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-open modal/popup when page loads
  useEffect(() => {
    // Small delay to ensure the page is fully loaded and mobile detection is complete
    const timer = setTimeout(() => {
      handleStartPracticing()
    }, 1000)

    return () => clearTimeout(timer)
  }, [isMobile])

  // Handle Start Practicing Now button click
  const handleStartPracticing = () => {
    if (isMobile) {
      setShowMobileModal(true)
    } else {
      // Desktop: Open in centered popup window
      const width = 500
      const height = 1000
      const left = (screen.width - width) / 2
      const top = (screen.height - height) / 2
      
      window.open(
        '/signup',
        'signup',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
      )
    }
  }

  // Handle mobile modal signup button
  const handleMobileSignup = () => {
    setShowMobileModal(false)
    router.push('/signup')
  }

  return (
    <div className="bg-gray-50 min-h-screen">
                  {/* Hero Section */}
      <section className="pt-1 pb-1 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            <div className="mb-12 lg:mb-0">
              {/* Logo */}
              <div className="mb-8">
                <img 
                  src="/logo.png" 
                  alt="TextChamp Logo" 
                  className="h-40 w-auto"
                />
              </div>
              
              {/* Main Headline */}
              <h1 className="text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-6">
                From <span className="text-red-600">C6 to A1</span> in 90 Days
                <span className="block text-4xl lg:text-5xl text-gray-700 mt-2">
                  The Secret Singapore Secondary Students Use to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">ACE English Paper 2</span>
                </span>
              </h1>
              
              {/* Subheadline */}
              <p className="text-xl lg:text-2xl text-gray-600 mb-8 leading-relaxed">
                Join <strong>2,847+ students</strong> who've transformed their <strong>comprehension</strong>, <strong>summary writing</strong>, and <strong>visual text analysis</strong> skills using Singapore's most comprehensive O-Level Paper 2 mastery system.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button 
                  onClick={handleStartPracticing}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transform hover:-translate-y-0.5 transition-all duration-300 px-8 py-4 rounded-xl text-white font-bold text-lg shadow-xl"
                >
                  <span className="mr-2">🚀</span>
                  Start Practicing Now - FREE
                </button>
              </div>
              
              {/* Social Proof */}
              <div className="flex items-center text-sm text-gray-600">
                <div className="flex -space-x-2 mr-4">
                  <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">S</div>
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">M</div>
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">L</div>
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">+</div>
                </div>
                <span><strong>127 students</strong> signed up in the last 24 hours</span>
              </div>
            </div>
            
            {/* Hero Illustration */}
            <div className="relative">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 transform hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden">
                {/* Mockup of TextChamp Interface */}
                <div className="bg-white rounded-xl p-6 shadow-2xl relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="ml-auto text-sm font-semibold text-gray-600">TextChamp Dashboard</div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-indigo-200 rounded w-1/2"></div>
                    <div className="h-8 bg-green-100 rounded flex items-center px-3">
                      <span className="text-green-600 mr-2">✅</span>
                      <span className="text-sm font-semibold text-green-800">Summary Question Completed</span>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
                
                {/* Floating Keywords */}
                <div className="absolute -top-4 -left-4 bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg border-2 border-gray-800">
                  Summary
                </div>
                <div className="absolute top-8 -right-6 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg border-2 border-gray-800">
                  Visual Text
                </div>
                <div className="absolute -bottom-4 left-8 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg border-2 border-gray-800">
                  Vocabulary
                </div>
                <div className="absolute bottom-8 -right-4 bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg border-2 border-gray-800">
                  Feedback
                </div>
                <div className="absolute top-20 -left-8 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg border-2 border-gray-800">
                  MOE-Aligned
                </div>
                <div className="absolute -top-8 right-4 bg-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg border-2 border-gray-800">
                  SEAB Format
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="text-center mt-16">
          <div className="inline-block text-gray-400 animate-bounce">
            <span className="text-2xl">⬇️</span>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
              The Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">O-Level English Paper 2 Arsenal</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Master every section of Singapore's O-Level English Paper 2 with our comprehensive, <strong>MOE-aligned curriculum</strong> designed by top educators for <strong>Secondary 1-5 students</strong>.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Benefit 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl">✍️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">📝 Summary Writing Mastery</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Proven <strong>7-step method</strong> used by A1 students. Learn to identify key points, eliminate redundancy, and craft concise summaries that score maximum marks in <strong>O-Level Paper 2</strong>.
              </p>
            </div>
            
            {/* Benefit 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">📊 Visual Text Decoding</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                <strong>Website, posters, infographics</strong> made simple. Master the step-by-step visual text analysis methods that help you extract information accurately and answer questions precisely.
              </p>
            </div>
            
            {/* Benefit 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🧠 Inference & Analysis Skills</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Read between the lines like a pro. Master <strong>inference questions</strong> and <strong>language use analysis</strong> with proven techniques that boost your comprehension scores.
              </p>
            </div>
            
            {/* Benefit 4 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">📚 Vocabulary Power-Up</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                <strong>500+ Paper 2 essential words</strong> with context. Learn synonyms, context clues, and word formation to boost your comprehension and summary writing skills.
              </p>
            </div>
            
            {/* Benefit 5 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl">👨‍🎓</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">✅ Expert Feedback System</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Get <strong>personalized feedback</strong> from <strong>experienced educators</strong>. Submit your answers and receive detailed insights on how to improve your comprehension skills.
              </p>
            </div>
            
            {/* Benefit 6 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl">⏰</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🎯 Exam Technique Training</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Master <strong>time management</strong> and <strong>question prioritization</strong> strategies. Learn how to maximize your Paper 2 scores within the exam time limit.
              </p>
            </div>
            
            {/* Benefit 7 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">📈 Progress Tracking</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                See your improvement in real-time with detailed analytics. Track your performance across <strong>summary writing</strong>, <strong>visual text</strong>, and <strong>comprehension questions</strong>.
              </p>
            </div>
          </div>
          
          {/* Parent Value Proposition */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 lg:p-12 text-white text-center">
            <h3 className="text-3xl lg:text-4xl font-black mb-6">
              No More $200/month Tuition Fees
            </h3>
            <p className="text-xl lg:text-2xl opacity-90 mb-8">
              Give your child the structured support they need to ace <strong>O-Level English comprehension</strong> with <strong>MOE-aligned learning</strong> at home.
            </p>
            <button 
              onClick={() => router.push('/signup')}
              className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all"
            >
              Start Free Trial for Your Child
            </button>
          </div>
        </div>
      </section>

      {/* Parent Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-8">
                Track Your Child's Progress Like a Pro—<span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">See Results in Real-Time</span>
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-white text-sm">📈</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Real-time Progress Tracking with Comprehension Submissions</h4>
                    <p className="text-gray-600 text-lg">Monitor your child's <strong>O-Level Paper 2</strong> practice with detailed analytics showing strengths and areas for improvement in <strong>summary writing</strong>, <strong>visual text analysis</strong>, and <strong>open-ended questions</strong>.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-white text-sm">🏆</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Expert-reviewed Answers—Know Your Child is Learning from the Best</h4>
                    <p className="text-gray-600 text-lg"><strong>Experienced educators</strong> review model answers and provide feedback, ensuring your child learns from Singapore's best English teachers—giving you complete peace of mind.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-white text-sm">🏠</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">No More Guesswork—Everything You Need in One App</h4>
                    <p className="text-gray-600 text-lg">Your child can practice <strong>O-Level Paper 2 skills</strong> anytime, anywhere with <strong>SEAB-aligned content</strong>—perfect for busy family schedules and <strong>Express/Normal Academic</strong> streams.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12 lg:mt-0">
              <div className="bg-gray-50 rounded-2xl p-8">
                <div className="text-center mb-6">
                  <div className="text-4xl font-black text-gray-900 mb-2">vs Traditional Tuition</div>
                  <p className="text-gray-600">See why parents choose TextChamp</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-700">Monthly Cost</span>
                    <div className="text-right">
                      <div className="text-green-600 font-bold">$0/month</div>
                      <div className="text-gray-400 line-through text-sm">$200-400/month</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-700">Travel Time</span>
                    <div className="text-right">
                      <div className="text-green-600 font-bold">0 minutes</div>
                      <div className="text-gray-400 text-sm">2-4 hours/week</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-700">Practice Questions</span>
                    <div className="text-right">
                      <div className="text-green-600 font-bold">Unlimited</div>
                      <div className="text-gray-400 text-sm">Limited</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-700">Progress Tracking</span>
                    <div className="text-right">
                      <div className="text-green-600 font-bold">24/7 Access</div>
                      <div className="text-gray-400 text-sm">Weekly Updates</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
              What <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-600">Students and Parents</span> Are Saying
            </h2>
            <p className="text-xl text-gray-600">Real results from real Singapore students preparing for <strong>O-Level English Paper 2</strong></p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-indigo-600 font-bold text-lg">Z</span>
                </div>
                <div>
                  <div className="font-bold text-gray-900">Zachary Lim</div>
                  <div className="text-gray-600 text-sm">Sec 4 Student, Raffles Institution</div>
                </div>
              </div>
              <div className="flex mb-4">
                {[1,2,3,4,5].map((star) => (
                  <span key={star} className="text-yellow-400">⭐</span>
                ))}
              </div>
              <p className="text-gray-700 italic text-lg leading-relaxed">
                "TextChamp's model answers and vocabulary builder made Paper 2 so much easier! My grades jumped from C6 to B3 in just one term. The summary techniques are pure gold!"
              </p>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-pink-600 font-bold text-lg">K</span>
                </div>
                <div>
                  <div className="font-bold text-gray-900">Mrs. Koh Wei Lin</div>
                  <div className="text-gray-600 text-sm">Parent of Sec 3 Student</div>
                </div>
              </div>
              <div className="flex mb-4">
                {[1,2,3,4,5].map((star) => (
                  <span key={star} className="text-yellow-400">⭐</span>
                ))}
              </div>
              <p className="text-gray-700 italic text-lg leading-relaxed">
                "My daughter's confidence improved dramatically. She now understands summary and visual text questions completely. TextChamp saved us thousands in tuition fees!"
              </p>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-600 font-bold text-lg">C</span>
                </div>
                <div>
                  <div className="font-bold text-gray-900">Cheryl Tan</div>
                  <div className="text-gray-600 text-sm">Sec 3 Student, CHIJ St. Nicholas</div>
                </div>
              </div>
              <div className="flex mb-4">
                {[1,2,3,4,5].map((star) => (
                  <span key={star} className="text-yellow-400">⭐</span>
                ))}
              </div>
              <p className="text-gray-700 italic text-lg leading-relaxed">
                "The feedback system is incredible! I submit my answers and get detailed explanations on how to improve. My open-ended question scores went from 8/15 to 13/15!"
              </p>
            </div>
            
            {/* Additional testimonials in a grid that wraps */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-bold text-lg">L</span>
                </div>
                <div>
                  <div className="font-bold text-gray-900">Mr. Lim Han Wei</div>
                  <div className="text-gray-600 text-sm">Parent of Sec 4 Student</div>
                </div>
              </div>
              <div className="flex mb-4">
                {[1,2,3,4,5].map((star) => (
                  <span key={star} className="text-yellow-400">⭐</span>
                ))}
              </div>
              <p className="text-gray-700 italic text-lg leading-relaxed">
                "TextChamp is like having an English tutor at home 24/7. My son's O-Level Paper 2 preparation is so much more structured now. His prelim marks improved by 2 grades!"
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-purple-600 font-bold text-lg">A</span>
                </div>
                <div>
                  <div className="font-bold text-gray-900">Arjun Krishnan</div>
                  <div className="text-gray-600 text-sm">Sec 5 Student, Victoria School</div>
                </div>
              </div>
              <div className="flex mb-4">
                {[1,2,3,4,5].map((star) => (
                  <span key={star} className="text-yellow-400">⭐</span>
                ))}
              </div>
              <p className="text-gray-700 italic text-lg leading-relaxed">
                "Finally understand how to tackle visual text questions! The step-by-step approach helped me score full marks in my last practice paper. Can't wait for O-Levels!"
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-yellow-600 font-bold text-lg">S</span>
                </div>
                <div>
                  <div className="font-bold text-gray-900">Sarah Wong</div>
                  <div className="text-gray-600 text-sm">Parent of Sec 2 Student</div>
                </div>
              </div>
              <div className="flex mb-4">
                {[1,2,3,4,5].map((star) => (
                  <span key={star} className="text-yellow-400">⭐</span>
                ))}
              </div>
              <p className="text-gray-700 italic text-lg leading-relaxed">
                "My daughter started using TextChamp in Sec 2 and her comprehension skills are already so strong. The vocabulary builder is especially effective for building confidence."
              </p>
            </div>
          </div>
        </div>
      </section>

           {/* Cross-Brand Awareness */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl lg:text-3xl font-bold mb-8">
            Also from the creators of <span className="text-yellow-400">Singapore's most trusted</span> English and GP learning platforms
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-6 rounded-xl">
              <div className="text-yellow-400 text-3xl font-black mb-2">EssayMaster</div>
              <p className="text-gray-300">For O-Level English mastery</p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-xl">
              <div className="text-green-400 text-3xl font-black mb-2">CompreAce</div>
              <p className="text-gray-300">For A-Level GP Paper 2 excellence</p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-xl">
              <div className="text-blue-400 text-3xl font-black mb-2">KnowledgeBank</div>
              <p className="text-gray-300">For A-Level GP Paper 1 success</p>
            </div>
          </div>
          
          <div className="mt-8 text-gray-400">
            Trusted by over 10,000+ students across Singapore's top schools
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-2xl font-black text-indigo-600 mb-4">TextChamp</div>
          <p className="text-gray-600 mb-6">Singapore's #1 O-Level English Paper 2 Mastery Platform</p>
          
          <div className="text-gray-700">
            Already have an account? 
            <button 
              onClick={() => router.push('/signin')}
              className="text-indigo-600 font-semibold hover:text-indigo-800 underline ml-1"
            >
              Sign in here
            </button>
          </div>
          
          <div className="mt-8 text-sm text-gray-500">
            © 2024 TextChamp. All rights reserved. | Privacy Policy | Terms of Service
          </div>
                  </div>
        </footer>

        {/* Mobile Modal */}
        {showMobileModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative">
              {/* Close Button */}
              <button 
                onClick={() => setShowMobileModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
              
              {/* Modal Content */}
              <div className="text-center">
                {/* Header */}
                <h2 className="text-2xl font-black text-gray-900 mb-2">
                  Your Success Story Starts Here.
                </h2>
                <h3 className="text-xl font-bold text-indigo-600 mb-6">
                  TextChamp Makes It Happen.
                </h3>
                
                {/* Body Text */}
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Practice, Feedback, and Growth — All in One Place.<br />
                  <strong>Ace Your English Comprehension with TextChamp!</strong>
                </p>
                
                {/* CTA Button */}
                <button 
                  onClick={handleMobileSignup}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-xl font-bold text-lg shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  <span className="mr-2">🚀</span>
                  Start Practicing Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  } 