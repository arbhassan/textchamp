"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { supabase } from "../lib/supabase"

export default function LandingPage() {
  const [showStickyCTA, setShowStickyCTA] = useState(false)
  const router = useRouter()

  // Landing page form states
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Sticky form states
  const [stickyEmail, setStickyEmail] = useState("")
  const [stickyPassword, setStickyPassword] = useState("")
  const [stickyLoading, setStickyLoading] = useState(false)

  // Intersection Observer for sticky CTA
  useEffect(() => {
    const hero = document.getElementById('hero')
    if (!hero) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyCTA(!entry.isIntersecting)
      },
      { rootMargin: "-50% 0px 0px 0px" }
    )

    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  // Fade in animation
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        }
      })
    }, observerOptions)

    document.querySelectorAll('.fade-in').forEach(el => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate all required fields
    if (!name || !email || !password) {
      setError("Please fill in all fields.")
      setLoading(false)
      return
    }

    try {
      // Split name into first and last name
      const nameParts = name.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      const userData = {
        first_name: firstName,
        last_name: lastName,
        user_type: 'Student' // Default to student
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        },
      })

      if (error) {
        throw error
      }

      // If signup successful, redirect directly to the app
      router.push("/")
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStickySignUp = async (e) => {
    e.preventDefault()
    setStickyLoading(true)
    setError(null)

    // Validate required fields
    if (!stickyEmail || !stickyPassword) {
      setError("Please fill in email and password.")
      setStickyLoading(false)
      return
    }

    try {
      const userData = {
        first_name: '',
        last_name: '',
        user_type: 'Student'
      }

      const { data, error } = await supabase.auth.signUp({
        email: stickyEmail,
        password: stickyPassword,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        },
      })

      if (error) {
        throw error
      }

      router.push("/")
    } catch (error) {
      setError(error.message)
    } finally {
      setStickyLoading(false)
    }
  }

  return (
    <div className="bg-gray-50">
      {/* Logo */}
      <div className="absolute top-1 left-2 md:top-0 md:left-6 z-30">
        <Image
          src="/logo.png"
          alt="TextChamp Logo"
          width={150}
          height={180}
          className="w-32 h-32 md:w-[150px] md:h-[150px] drop-shadow-lg"
        />
      </div>

      {/* Sticky CTA */}
      {showStickyCTA && (
        <div className="fixed top-0 left-0 w-full bg-white shadow-lg py-3 px-4 z-40 border-b">
          <form onSubmit={handleStickySignUp} className="flex items-center gap-2 max-w-2xl mx-auto">
            <span className="text-sm font-medium text-gray-700 hidden md:block">TextChamp:</span>
            <input 
              type="email" 
              value={stickyEmail}
              onChange={(e) => setStickyEmail(e.target.value)}
              placeholder="Email"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none text-sm" 
              required 
            />
            <input 
              type="password" 
              value={stickyPassword}
              onChange={(e) => setStickyPassword(e.target.value)}
              placeholder="Password"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none text-sm" 
              required 
            />
            <button 
              type="submit"
              disabled={stickyLoading}
              className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:scale-105 transition-all duration-200 text-sm disabled:opacity-50"
            >
              {stickyLoading ? 'Signing up...' : 'Start Free Trial'}
            </button>
          </form>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-50 border border-red-200 rounded-md p-3 flex items-start max-w-md">
          <i className="fas fa-exclamation-circle text-red-500 mr-2 mt-0.5"></i>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Hero Section */}
      <section id="hero" className="min-h-screen flex flex-col justify-center items-center bg-blue-50 p-6 pt-40 md:pt-6">
        {/* Video placeholder */}
        <div className="w-full max-w-2xl h-64 md:h-80 rounded-lg bg-gray-200 fade-in mb-8">
          {/* Empty space for future video */}
        </div>

        {/* Text and form */}
        <h1 className="text-3xl md:text-4xl font-semibold text-center mt-6 text-gray-800 fade-in">
          Ace English Language Paper 2 with TextChamp
        </h1>
        <p className="text-center mt-2 text-gray-600 fade-in">
          100+ JC students • 85% scored A/B
        </p>

        <form onSubmit={handleSignUp} className="mt-6 flex flex-col gap-3 w-full max-w-lg fade-in">
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" 
            required 
          />
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" 
            required 
          />
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" 
            required 
          />
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? 'Signing up...' : 'Start Free Trial'}
          </button>
        </form>
        
        <div className="mt-4 text-center fade-in">
          <small className="text-gray-500 block">No credit card. Cancel anytime.</small>
          <p className="text-sm text-gray-600 mt-2">
            Already have an account?{" "}
            <Link href="/signin" className="text-blue-600 font-medium hover:underline">
              Sign in here
            </Link>
          </p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-6 mt-8 fade-in">
          <div className="flex items-center gap-2 text-gray-700">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            250+ case studies
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 002 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 2a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
            </svg>
            Exam-ready model essays
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            AI feedback in seconds
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd"/>
            </svg>
            Track progress visually
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm py-8 bg-blue-50 border-t border-gray-200">
        <div className="max-w-2xl mx-auto px-6">
          <div className="flex justify-center gap-6 mb-4">
            <Link href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">Privacy</Link>
            <Link href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">Terms</Link>
            <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</Link>
          </div>
          <div className="flex justify-center gap-4">
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
              </svg>
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
              </svg>
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.120.112.225.085.347-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.759 2.893c-.274 1.068-.999 2.404-1.487 3.216C9.075 23.763 10.5 24.001 12.017 24.001c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
              </svg>
            </a>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            ©️ 2024 TextChamp. All rights reserved.
          </div>
        </div>
      </footer>

      <style jsx>{`
        .fade-in {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s ease-out;
        }
        .fade-in.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  )
} 