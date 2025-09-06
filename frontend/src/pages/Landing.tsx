
import { Link } from 'react-router-dom';
import { Torus as Torii, Brain, Users, Trophy, BookOpen, Zap, Sparkles } from 'lucide-react';
import Lottie from 'lottie-react';
import japaneseViewAnimation from '../data/japanseseViewAnimation.json';
import senseiAnimation  from '../data/senseiAnimation.json';
import StarryBackground from '../components/StarryBackground';
import ScrollingParticles from '../components/ScrollingParticles';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-800 text-white overflow-hidden relative">
      <StarryBackground />
      <ScrollingParticles />
      
      {/* Navigation */}
      <nav className="relative z-20 p-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <Torii className="w-8 h-8 text-emerald-400" />
            <span className="font-cinzel text-2xl font-semibold text-white">Sensei AI</span>
          </div>
          <div className="flex space-x-4">
            <Link 
              to="/login"
              className="px-6 py-2 text-emerald-400 border border-emerald-400 rounded-lg hover:bg-emerald-400 hover:text-slate-900 transition-all duration-300 font-medium"
            >
              Login
            </Link>
            <Link 
              to="/signup"
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-all duration-300 font-medium shadow-lg hover:shadow-emerald-500/25"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <h1 className="font-noto text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-emerald-200 to-emerald-400 bg-clip-text text-transparent leading-tight">
                Sensei AI
              </h1>
              <h2 className="font-cinzel text-2xl lg:text-3xl text-emerald-200 font-medium">
                古代の知恵、現代の学習
              </h2>
              <p className="text-xl text-gray-300 font-light">
                Ancient Wisdom, Modern Learning
              </p>
            </div>
            
            <p className="text-lg text-gray-300 leading-relaxed max-w-2xl">
              Experience the perfect intersection of technical innovation and learning mastery. 
              Our AI-powered micro-learning engine adapts to your competency, creating personalized 
              quiz dojos from your PDFs and lectures.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link 
                to="/signup"
                className="group px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg font-semibold shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-1 transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  Begin Your Journey
                  <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                </span>
              </Link>
              <button className="px-8 py-4 border-2 border-emerald-400 text-emerald-400 rounded-lg font-semibold hover:bg-emerald-400 hover:text-slate-900 transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
            <div className="flex justify-center lg:justify-end">
            <div className="w-[28rem] h-[28rem] lg:w-[32rem] lg:h-[32rem]">
              <Lottie 
              animationData={senseiAnimation} 
              loop={true}
              style={{ width: '100%', height: '100%' }}
              className="drop-shadow-3xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="font-cinzel text-3xl font-semibold text-emerald-200 mb-8">
            The Challenge We Solve
          </h3>
          <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900/60 backdrop-blur-sm rounded-2xl p-12 border border-emerald-700/30">
            <p className="text-lg text-gray-200 leading-relaxed">
              This AI-powered micro-learning engine represents the perfect intersection of technical feasibility, 
              market impact, and innovation potential. The system leverages machine learning to infer learner 
              competency from interactions and dynamically adapts content delivery to optimize learning outcomes 
              while reducing fatigue.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h3 className="font-cinzel text-4xl font-semibold text-center text-emerald-200 mb-16">
            Ancient Wisdom Meets AI Innovation
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-8 border border-emerald-700/30 hover:border-emerald-500/50 transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-cinzel text-xl font-semibold text-emerald-200 mb-4">AI Quiz Generation</h4>
              <p className="text-gray-300 leading-relaxed">
                Transform your PDF lectures and notes into intelligent quizzes and flashcards using advanced AI algorithms.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-8 border border-emerald-700/30 hover:border-emerald-500/50 transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Torii className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-cinzel text-xl font-semibold text-emerald-200 mb-4">Dojo Sessions</h4>
              <p className="text-gray-300 leading-relaxed">
                Enter focused learning dojos where adaptive AI creates personalized challenges based on your progress.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-8 border border-emerald-700/30 hover:border-emerald-500/50 transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-cinzel text-xl font-semibold text-emerald-200 mb-4">Micro Video Lectures</h4>
              <p className="text-gray-300 leading-relaxed">
                AI-generated bite-sized video content that reinforces key concepts from your study materials.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-8 border border-emerald-700/30 hover:border-emerald-500/50 transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-cinzel text-xl font-semibold text-emerald-200 mb-4">Leaderboards</h4>
              <p className="text-gray-300 leading-relaxed">
                Compete with fellow learners and track your mastery across different subjects and skill levels.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-8 border border-emerald-700/30 hover:border-emerald-500/50 transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-cinzel text-xl font-semibold text-emerald-200 mb-4">Adaptive Learning</h4>
              <p className="text-gray-300 leading-relaxed">
                Machine learning infers your competency and dynamically optimizes content delivery for maximum retention.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-8 border border-emerald-700/30 hover:border-emerald-500/50 transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-cinzel text-xl font-semibold text-emerald-200 mb-4">Community Learning</h4>
              <p className="text-gray-300 leading-relaxed">
                Join a community of learners, share knowledge, and grow together in the digital dojo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h3 className="font-cinzel text-4xl font-semibold text-center text-emerald-200 mb-16">
            The Path to Mastery
          </h3>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 mt-1">
                  1
                </div>
                <div>
                  <h4 className="font-cinzel text-xl font-semibold text-emerald-200 mb-2">Upload Your Materials</h4>
                  <p className="text-gray-300">Upload PDF lectures, notes, and study materials to begin your learning journey.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 mt-1">
                  2
                </div>
                <div>
                  <h4 className="font-cinzel text-xl font-semibold text-emerald-200 mb-2">AI Analysis</h4>
                  <p className="text-gray-300">Our AI analyzes your content and creates personalized quizzes, flashcards, and micro-lectures.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 mt-1">
                  3
                </div>
                <div>
                  <h4 className="font-cinzel text-xl font-semibold text-emerald-200 mb-2">Enter the Dojo</h4>
                  <p className="text-gray-300">Practice in focused learning sessions that adapt to your performance and learning style.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 mt-1">
                  4
                </div>
                <div>
                  <h4 className="font-cinzel text-xl font-semibold text-emerald-200 mb-2">Track & Compete</h4>
                  <p className="text-gray-300">Monitor your progress on leaderboards and achieve mastery through consistent practice.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-80 h-80">
                <Lottie 
                  animationData={japaneseViewAnimation}
                  loop={true}
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="font-cinzel text-4xl font-semibold text-emerald-200 mb-4">
              Meet the Dojo Masters
            </h3>
            <p className="text-gray-300 text-lg">
              The warriors behind Sensei AI's innovative learning experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-8 border border-emerald-700/30 hover:border-emerald-500/50 transition-all duration-300 transform hover:-translate-y-2 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">A</span>
              </div>
              <h4 className="font-cinzel text-xl font-semibold text-emerald-200 mb-2">Animish Agrahari</h4>
              <p className="text-emerald-400 text-sm font-medium mb-3">Full Stack Developer</p>
              <p className="text-gray-300 text-sm italic">
                "Pixel pusher by day, bug hunter by night."
              </p>
            </div>

            <div className="group bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-8 border border-emerald-700/30 hover:border-emerald-500/50 transition-all duration-300 transform hover:-translate-y-2 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">D</span>
              </div>
              <h4 className="font-cinzel text-xl font-semibold text-emerald-200 mb-2">Dhairya Luthra</h4>
              <p className="text-emerald-400 text-sm font-medium mb-3">Full Stack Developer</p>
              <p className="text-gray-300 text-sm italic">
                "Made this app during a caffeine high. Now debugging it during a caffeine crash."
              </p>
            </div>

            <div className="group bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-8 border border-emerald-700/30 hover:border-emerald-500/50 transition-all duration-300 transform hover:-translate-y-2 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">A</span>
              </div>
              <h4 className="font-cinzel text-xl font-semibold text-emerald-200 mb-2">Aariv Walia</h4>
              <p className="text-emerald-400 text-sm font-medium mb-3">Full Stack Developer</p>
              <p className="text-gray-300 text-sm italic">
                "The Ctrl+C, Ctrl+V wizard you've been looking for."
              </p>
            </div>

            <div className="group bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-8 border border-emerald-700/30 hover:border-emerald-500/50 transition-all duration-300 transform hover:-translate-y-2 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">S</span>
              </div>
              <h4 className="font-cinzel text-xl font-semibold text-emerald-200 mb-2">Shreejeet Mishra</h4>
              <p className="text-emerald-400 text-sm font-medium mb-3">Full Stack Developer</p>
              <p className="text-gray-300 text-sm italic">
                "Thinks in binary, dreams in color."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-emerald-900/60 to-slate-900/60 backdrop-blur-sm rounded-2xl p-12 border border-emerald-700/30">
            <h3 className="font-cinzel text-3xl font-semibold text-emerald-200 mb-6">
              Ready to Begin Your Learning Journey?
            </h3>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of learners who have discovered the power of AI-enhanced education. 
              Start your first dojo session today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/signup"
                className="group px-10 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg font-semibold text-lg shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-1 transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  Start Free Trial
                  <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                </span>
              </Link>
              <Link 
                to="/login"
                className="px-10 py-4 border-2 border-emerald-400 text-emerald-400 rounded-lg font-semibold text-lg hover:bg-emerald-400 hover:text-slate-900 transition-all duration-300"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-emerald-700/30">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Torii className="w-6 h-6 text-emerald-400" />
            <span className="font-cinzel text-xl font-semibold text-white">Sensei AI</span>
          </div>
          <p className="text-gray-400">
            © 2025 Sensei AI. Crafted with ancient wisdom and modern innovation.
          </p>
        </div>
      </footer>
    </div>
  );
}