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
          width={853}
          height={1280}
          className="w-20 h-auto md:w-28 md:h-auto drop-shadow-lg"
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
        {/* Video */}
        <div className="w-full max-w-3xl aspect-video rounded-lg overflow-hidden fade-in mb-8 shadow-lg">
          <iframe
            src="https://www.youtube.com/embed/ehkHx7azu2g?autoplay=1&mute=1&playbackRate=2"
            title="TextChamp Demo Video"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
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