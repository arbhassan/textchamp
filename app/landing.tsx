"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function LandingPage() {
  // Smooth scrolling for navigation links
  useEffect(() => {
    const anchors = document.querySelectorAll('a[href^="#"]')
    anchors.forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault()
        const target = document.querySelector(this.getAttribute('href'))
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        }
      })
    })

    // Add scroll effect to navbar
    const handleScroll = () => {
      const navbar = document.querySelector('nav')
      if (navbar) {
        if (window.scrollY > 50) {
          navbar.classList.add('shadow-lg')
        } else {
          navbar.classList.remove('shadow-lg')
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">NOVUS</h1>
              <span className="ml-2 text-gray-600 font-medium">Education</span>
            </div>
            <div className="hidden md:flex space-x-8 items-center">
              <a href="#apps" className="text-gray-700 hover:text-indigo-600 font-medium">Our Apps</a>
              <a href="#books" className="text-gray-700 hover:text-indigo-600 font-medium">Wall of Books</a>
              <a href="#tutors" className="text-gray-700 hover:text-indigo-600 font-medium">Meet Our Tutors</a>
              <Link href="/signin" className="text-gray-700 hover:text-indigo-600 font-medium">Sign In</Link>
              <Link href="/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">Sign Up</Link>
      </div>
            <div className="md:hidden">
              <button className="text-gray-700">
                <i className="fas fa-bars text-xl"></i>
            </button>
            </div>
        </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gradient-bg pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Master General Paper<br />
              <span className="text-yellow-300">Like Never Before</span>
            </h1>
            <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
              Join Singapore's top JC students who trust NOVUS Education for GP excellence. Our expert tutors from NUS and elite institutions deliver personalized learning through cutting-edge apps and curated resources.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition inline-flex items-center justify-center">
                <i className="fas fa-rocket mr-2"></i>
                Start Free Trial
              </Link>
              <Link href="/signin" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition inline-flex items-center justify-center">
                <i className="fas fa-sign-in-alt mr-2"></i>
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Apps Section */}
      <section id="apps" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Learning Apps</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Revolutionary learning tools designed specifically for GP Paper 1 and Paper 2 success
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-12">
            {/* KnowledgeBank */}
            <div className="card-hover bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center mr-4">
                  <i className="fas fa-database"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">KnowledgeBank</h3>
                  <p className="text-blue-600 font-medium">GP Paper 1 Mastery</p>
                </div>
              </div>
              
              <div className="video-placeholder rounded-xl mb-6 h-48">
                <i className="fas fa-play-circle"></i>
                <div className="ml-4">
                  <p className="text-sm">Demo Video</p>
                  <p className="text-xs opacity-75">KnowledgeBank in Action</p>
                </div>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <i className="fas fa-check-circle text-green-500 mr-3"></i>
                  Comprehensive essay frameworks and structures
                </li>
                <li className="flex items-center text-gray-700">
                  <i className="fas fa-check-circle text-green-500 mr-3"></i>
                  Current affairs database with analysis
                </li>
                <li className="flex items-center text-gray-700">
                  <i className="fas fa-check-circle text-green-500 mr-3"></i>
                  AI-powered essay feedback and scoring
                </li>
                <li className="flex items-center text-gray-700">
                  <i className="fas fa-check-circle text-green-500 mr-3"></i>
                  Practice questions with model answers
                </li>
              </ul>
              
                            <a href="https://knowledgebank.novuseducationsg.com/" target="_blank" rel="noopener noreferrer" className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition block text-center">
                Access KnowledgeBank
              </a>
            </div>

            {/* CompreAce */}
            <div className="card-hover bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <div className="bg-purple-600 text-white w-12 h-12 rounded-xl flex items-center justify-center mr-4">
                  <i className="fas fa-brain"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">CompreAce</h3>
                  <p className="text-purple-600 font-medium">GP Paper 2 Excellence</p>
                </div>
              </div>
              
              <div className="video-placeholder rounded-xl mb-6 h-48">
                <i className="fas fa-play-circle"></i>
                <div className="ml-4">
                  <p className="text-sm">Demo Video</p>
                  <p className="text-xs opacity-75">CompreAce Features</p>
                </div>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <i className="fas fa-check-circle text-green-500 mr-3"></i>
                  Advanced comprehension strategies and techniques
                </li>
                <li className="flex items-center text-gray-700">
                  <i className="fas fa-check-circle text-green-500 mr-3"></i>
                  Timed practice sessions with real exam conditions
                </li>
                <li className="flex items-center text-gray-700">
                  <i className="fas fa-check-circle text-green-500 mr-3"></i>
                  Detailed answer explanations and mark schemes
                </li>
                <li className="flex items-center text-gray-700">
                  <i className="fas fa-check-circle text-green-500 mr-3"></i>
                  Progress tracking and performance analytics
                </li>
              </ul>
              
              <a href="https://compreace.novuseducationsg.com/" target="_blank" rel="noopener noreferrer" className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition block text-center">
                Access CompreAce
              </a>
            </div>

            {/* TextChamp */}
            <div className="card-hover bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <div className="bg-green-600 text-white w-12 h-12 rounded-xl flex items-center justify-center mr-4">
                  <i className="fas fa-book-open"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">TextChamp</h3>
                  <p className="text-green-600 font-medium">Comprehension Mastery</p>
                </div>
              </div>
              
              <div className="video-placeholder rounded-xl mb-6 h-48">
                <i className="fas fa-play-circle"></i>
                <div className="ml-4">
                  <p className="text-sm">Demo Video</p>
                  <p className="text-xs opacity-75">TextChamp Features</p>
                </div>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <i className="fas fa-check-circle text-green-500 mr-3"></i>
                  Interactive text analysis and comprehension exercises
                </li>
                <li className="flex items-center text-gray-700">
                  <i className="fas fa-check-circle text-green-500 mr-3"></i>
                  Vocabulary building and context understanding
                </li>
                <li className="flex items-center text-gray-700">
                  <i className="fas fa-check-circle text-green-500 mr-3"></i>
                  Reading speed and accuracy improvement
                </li>
                <li className="flex items-center text-gray-700">
                  <i className="fas fa-check-circle text-green-500 mr-3"></i>
                  Adaptive learning with personalized pathways
                </li>
              </ul>
              
              <a href="https://textchamp.novuseducationsg.com/" target="_blank" rel="noopener noreferrer" className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition block text-center">
                Access TextChamp
              </a>
            </div>

            {/* EssayMaster */}
            <div className="card-hover bg-gradient-to-br from-orange-50 to-red-100 rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <div className="bg-orange-600 text-white w-12 h-12 rounded-xl flex items-center justify-center mr-4">
                  <i className="fas fa-pen-fancy"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">EssayMaster</h3>
                  <p className="text-orange-600 font-medium">Writing Excellence</p>
                </div>
              </div>
              
              <div className="video-placeholder rounded-xl mb-6 h-48">
                <i className="fas fa-play-circle"></i>
                <div className="ml-4">
                  <p className="text-sm">Demo Video</p>
                  <p className="text-xs opacity-75">EssayMaster in Action</p>
                </div>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <i className="fas fa-check-circle text-green-500 mr-3"></i>
                  Step-by-step essay writing guidance
                </li>
                <li className="flex items-center text-gray-700">
                  <i className="fas fa-check-circle text-green-500 mr-3"></i>
                  Grammar and style enhancement tools
                </li>
                <li className="flex items-center text-gray-700">
                  <i className="fas fa-check-circle text-green-500 mr-3"></i>
                  Plagiarism detection and originality scoring
                </li>
                <li className="flex items-center text-gray-700">
                  <i className="fas fa-check-circle text-green-500 mr-3"></i>
                  Real-time writing feedback and suggestions
                </li>
              </ul>
              
              <a href="https://essaymaster.novuseducationsg.com/" target="_blank" rel="noopener noreferrer" className="w-full bg-orange-600 text-white py-4 rounded-xl font-semibold hover:bg-orange-700 transition block text-center">
                Access EssayMaster
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Wall of Books Section */}
      <section id="books" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Wall of Books</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Curated collection of essential readings handpicked by our expert tutors to broaden your knowledge and enhance your GP performance
            </p>
          </div>

          <div className="carousel-container">
            <div className="carousel-track" style={{width: '200%'}}>
              {/* First set of books */}
              <div className="flex space-x-6 mr-6">
                <div className="book-cover rounded-lg shadow-md">
                  <div>
                    <p className="font-semibold">The Economist</p>
                    <p className="text-xs mt-2">Weekly Edition</p>
                  </div>
                </div>
                <div className="book-cover rounded-lg shadow-md">
                  <div>
                    <p className="font-semibold">Thinking Fast & Slow</p>
                    <p className="text-xs mt-2">Daniel Kahneman</p>
                  </div>
                </div>
                <div className="book-cover rounded-lg shadow-md">
                  <div>
                    <p className="font-semibold">Sapiens</p>
                    <p className="text-xs mt-2">Yuval Harari</p>
                  </div>
                </div>
                <div className="book-cover rounded-lg shadow-md">
                  <div>
                    <p className="font-semibold">The World is Flat</p>
                    <p className="text-xs mt-2">Thomas Friedman</p>
                  </div>
                </div>
                <div className="book-cover rounded-lg shadow-md">
                  <div>
                    <p className="font-semibold">Freakonomics</p>
                    <p className="text-xs mt-2">Levitt & Dubner</p>
                  </div>
                </div>
                <div className="book-cover rounded-lg shadow-md">
                  <div>
                    <p className="font-semibold">The Power of Now</p>
                    <p className="text-xs mt-2">Eckhart Tolle</p>
                  </div>
                </div>
                <div className="book-cover rounded-lg shadow-md">
                  <div>
                    <p className="font-semibold">Outliers</p>
                    <p className="text-xs mt-2">Malcolm Gladwell</p>
                  </div>
                </div>
                <div className="book-cover rounded-lg shadow-md">
                  <div>
                    <p className="font-semibold">The Tipping Point</p>
                    <p className="text-xs mt-2">Malcolm Gladwell</p>
                  </div>
                </div>
              </div>
              {/* Duplicate set for seamless loop */}
              <div className="flex space-x-6">
                <div className="book-cover rounded-lg shadow-md">
                  <div>
                    <p className="font-semibold">The Economist</p>
                    <p className="text-xs mt-2">Weekly Edition</p>
                  </div>
                </div>
                <div className="book-cover rounded-lg shadow-md">
                  <div>
                    <p className="font-semibold">Thinking Fast & Slow</p>
                    <p className="text-xs mt-2">Daniel Kahneman</p>
                  </div>
                </div>
                <div className="book-cover rounded-lg shadow-md">
                  <div>
                    <p className="font-semibold">Sapiens</p>
                    <p className="text-xs mt-2">Yuval Harari</p>
                  </div>
                </div>
                <div className="book-cover rounded-lg shadow-md">
                  <div>
                    <p className="font-semibold">The World is Flat</p>
                    <p className="text-xs mt-2">Thomas Friedman</p>
                  </div>
                </div>
                <div className="book-cover rounded-lg shadow-md">
                  <div>
                    <p className="font-semibold">Freakonomics</p>
                    <p className="text-xs mt-2">Levitt & Dubner</p>
                  </div>
                </div>
                <div className="book-cover rounded-lg shadow-md">
                  <div>
                    <p className="font-semibold">The Power of Now</p>
                    <p className="text-xs mt-2">Eckhart Tolle</p>
                  </div>
                </div>
                <div className="book-cover rounded-lg shadow-md">
                  <div>
                    <p className="font-semibold">Outliers</p>
                    <p className="text-xs mt-2">Malcolm Gladwell</p>
                  </div>
                </div>
                <div className="book-cover rounded-lg shadow-md">
                  <div>
                    <p className="font-semibold">The Tipping Point</p>
                    <p className="text-xs mt-2">Malcolm Gladwell</p>
                  </div>
                </div>
              </div>
            </div>
        </div>

          <div className="text-center mt-12">
            <Link href="/signup" className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-indigo-700 transition inline-block">
              Explore Full Catalogue
            </Link>
          </div>
        </div>
      </section>

      {/* Meet Our Tutors Section */}
      <section id="tutors" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Tutors</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Learn from Singapore's finest GP educators, all graduates from NUS and alumni of top institutions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Adam Anwar */}
            <div className="card-hover bg-white rounded-2xl p-8 border border-gray-200 text-center">
              <div className="tutor-avatar rounded-full mx-auto mb-6">
                <i className="fas fa-user"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Adam Anwar</h3>
              <div className="space-y-1 mb-4">
                <p className="text-indigo-600 font-medium">NUS Law</p>
                <p className="text-gray-600">Raffles Institution</p>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                Specializes in essay writing techniques and argumentation strategies. Known for helping students achieve A grades through structured analytical frameworks.
              </p>
            </div>

            {/* Joshua Lim */}
            <div className="card-hover bg-white rounded-2xl p-8 border border-gray-200 text-center">
              <div className="tutor-avatar rounded-full mx-auto mb-6">
                <i className="fas fa-user"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Joshua Lim</h3>
              <div className="space-y-1 mb-4">
                <p className="text-indigo-600 font-medium">NUS Business</p>
                <p className="text-gray-600">Raffles Institution</p>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                Expert in current affairs and global perspectives. Passionate about connecting real-world events to GP themes for deeper understanding.
              </p>
            </div>

            {/* Megan Ng */}
            <div className="card-hover bg-white rounded-2xl p-8 border border-gray-200 text-center">
              <div className="tutor-avatar rounded-full mx-auto mb-6">
                <i className="fas fa-user"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Megan Ng</h3>
              <div className="space-y-1 mb-4">
                <p className="text-indigo-600 font-medium">NUS Law</p>
                <p className="text-gray-600">Eunoia JC</p>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                Focuses on comprehension skills and critical thinking. Experienced in breaking down complex passages and developing analytical mindsets.
              </p>
            </div>

            {/* Sherlyn Tan */}
            <div className="card-hover bg-white rounded-2xl p-8 border border-gray-200 text-center">
              <div className="tutor-avatar rounded-full mx-auto mb-6">
                <i className="fas fa-user"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sherlyn Tan</h3>
              <div className="space-y-1 mb-4">
                <p className="text-indigo-600 font-medium">NUS Business</p>
                <p className="text-gray-600">Eunoia JC</p>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                Specializes in exam strategies and time management. Helps students optimize their performance under exam conditions with proven techniques.
              </p>
            </div>

            {/* Mae Sann Choo */}
            <div className="card-hover bg-white rounded-2xl p-8 border border-gray-200 text-center lg:col-start-2">
              <div className="tutor-avatar rounded-full mx-auto mb-6">
                <i className="fas fa-user"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Mae Sann Choo</h3>
              <div className="space-y-1 mb-4">
                <p className="text-indigo-600 font-medium">NUS Law</p>
                <p className="text-gray-600">ACS (I)</p>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                Expert in cross-cultural perspectives and global issues. Brings international experience to help students develop nuanced worldviews.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Excel in General Paper?</h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of successful JC students who have transformed their GP performance with NOVUS Education
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition inline-flex items-center justify-center">
              Start Your Free Trial
            </Link>
            <Link href="/signin" className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-indigo-600 transition inline-flex items-center justify-center">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">NOVUS Education</h3>
              <p className="text-gray-300 mb-6 max-w-md">
                Empowering JC students to achieve GP excellence through innovative learning technology and expert guidance from Singapore's top educators.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <i className="fab fa-facebook-f text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <i className="fab fa-instagram text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <i className="fab fa-linkedin-in text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <i className="fab fa-youtube text-xl"></i>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#apps" className="text-gray-300 hover:text-white transition">Our Apps</a></li>
                <li><a href="#books" className="text-gray-300 hover:text-white transition">Wall of Books</a></li>
                <li><a href="#tutors" className="text-gray-300 hover:text-white transition">Meet Our Tutors</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition">Success Stories</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center">
                  <i className="fas fa-envelope mr-2"></i>
                  hello@novuseducation.sg
                </li>
                <li className="flex items-center">
                  <i className="fas fa-phone mr-2"></i>
                  +65 9123 4567
                </li>
                <li className="flex items-center">
                  <i className="fas fa-map-marker-alt mr-2"></i>
                  Singapore
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 NOVUS Education. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style jsx>{`
        body {
          font-family: 'Inter', sans-serif;
        }
        .gradient-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .card-hover {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .carousel-container {
          overflow: hidden;
        }
        .carousel-track {
          display: flex;
          animation: scroll 20s linear infinite;
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .book-cover {
          width: 120px;
          height: 180px;
          background: linear-gradient(45deg, #f3f4f6, #e5e7eb);
          border: 2px solid #d1d5db;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          color: #6b7280;
          text-align: center;
          padding: 8px;
        }
        .video-placeholder {
          background: linear-gradient(45deg, #1f2937, #374151);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 2rem;
        }
        .tutor-avatar {
          width: 120px;
          height: 120px;
          background: linear-gradient(45deg, #e0e7ff, #c7d2fe);
          border: 3px solid #6366f1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: #6366f1;
        }
      `}</style>
    </div>
  )
} 