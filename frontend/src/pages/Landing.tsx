import { Link } from 'react-router-dom';
import { 
  Torus as Torii, 
  Brain, 
  Users, 
  Trophy, 
  BookOpen, 
  Zap, 
  Sparkles,
  Target,
  GraduationCap,
  Compass,
  Eye,
  Map,
  Languages,
  TrendingUp,
  FileText,
  Play,
  Download,
  Share2,
  Clock,
  Award
} from 'lucide-react';
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
              Our comprehensive AI-powered learning platform transforms your study materials into 
              personalized learning experiences with quizzes, flashcards, explainer videos, and more.
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
            <p className="text-lg text-gray-200 leading-relaxed mb-6">
              Traditional learning methods fail to adapt to individual needs, leaving students overwhelmed 
              with generic content and no personalized guidance. Language barriers, lack of practice materials, 
              and absence of career direction further hinder effective learning.
            </p>
            <p className="text-lg text-gray-200 leading-relaxed">
              Sensei AI bridges this gap with an intelligent learning ecosystem that adapts to your pace, 
              creates personalized content from your materials, and provides comprehensive guidance for 
              your educational journey.
            </p>
          </div>
        </div>
      </section>

      {/* Core Features Overview */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h3 className="font-cinzel text-4xl font-semibold text-center text-emerald-200 mb-16">
            Complete Learning Ecosystem
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-8 border border-emerald-700/30 hover:border-emerald-500/50 transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-cinzel text-xl font-semibold text-emerald-200 mb-4">Study Dojos</h4>
              <p className="text-gray-300 leading-relaxed">
                Focused learning sessions with AI-generated quizzes from your PDFs and materials.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-8 border border-purple-700/30 hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-cinzel text-xl font-semibold text-purple-200 mb-4">Concept Academy</h4>
              <p className="text-gray-300 leading-relaxed">
                AI-powered explainer videos that transform complex concepts into engaging visual content.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-blue-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-8 border border-blue-700/30 hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-cinzel text-xl font-semibold text-blue-200 mb-4">Course Advisor</h4>
              <p className="text-gray-300 leading-relaxed">
                Personalized upGrad course recommendations based on your career goals and interests.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-8 border border-emerald-700/30 hover:border-emerald-500/50 transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-cinzel text-xl font-semibold text-emerald-200 mb-4">Memory Palace</h4>
              <p className="text-gray-300 leading-relaxed">
                Spaced repetition flashcards with active recall for long-term knowledge retention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="relative z-10 py-24 px-6 bg-gradient-to-r from-slate-900/50 to-emerald-950/50">
        <div className="max-w-7xl mx-auto">
          <h3 className="font-cinzel text-4xl font-semibold text-center text-emerald-200 mb-16">
            Advanced AI-Powered Tools
          </h3>
          
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Oracle's Insight */}
            <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm rounded-2xl p-8 border border-purple-700/30">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h4 className="font-cinzel text-2xl font-semibold text-purple-200">Oracle's Insight</h4>
                  <p className="text-purple-300">Previous Year Question Analysis</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6">
                Upload your previous year question papers and let our AI Oracle reveal hidden patterns, 
                frequent topics, and generate prophetic sample papers for your preparation.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-300">Pattern Recognition</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-300">Sample Papers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-300">Smart Analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-300">Focus Areas</span>
                </div>
              </div>
            </div>

            {/* Sensei's Path */}
            <div className="bg-gradient-to-br from-emerald-900/40 to-green-900/40 backdrop-blur-sm rounded-2xl p-8 border border-emerald-700/30">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-emerald-600 rounded-xl flex items-center justify-center">
                  <Map className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h4 className="font-cinzel text-2xl font-semibold text-emerald-200">Sensei's Path</h4>
                  <p className="text-emerald-300">Personalized Study Plans</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6">
                Let the master guide your learning journey with comprehensive study plans generated 
                from your course materials using advanced CRAG (Corrective Retrieval Augmented Generation).
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-gray-300">Goal-Oriented</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-gray-300">Progressive Learning</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-gray-300">Content Analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-gray-300">Time Management</span>
                </div>
              </div>
            </div>

            {/* Language Bridge */}
            <div className="bg-gradient-to-br from-orange-900/40 to-red-900/40 backdrop-blur-sm rounded-2xl p-8 border border-orange-700/30">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-orange-600 rounded-xl flex items-center justify-center">
                  <Languages className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h4 className="font-cinzel text-2xl font-semibold text-orange-200">Language Bridge</h4>
                  <p className="text-orange-300">Hindi Translation Service</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6">
                Break language barriers with our AI-powered translation service that converts your 
                English study materials to Hindi, making education accessible to all students.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-gray-300">PDF Translation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Download className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-gray-300">Download Support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-gray-300">Context Aware</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-gray-300">Inclusive Learning</span>
                </div>
              </div>
            </div>

            {/* Video Generation */}
            <div className="bg-gradient-to-br from-purple-900/40 to-emerald-900/40 backdrop-blur-sm rounded-2xl p-8 border border-purple-700/30">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Play className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h4 className="font-cinzel text-2xl font-semibold text-purple-200">AI Video Creation</h4>
                  <p className="text-purple-300">Explainer Video Generation</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6">
                Transform complex concepts into engaging explainer videos with AI-generated slides, 
                professional narration, and synchronized visual content for better understanding.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-300">Slide Generation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Play className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-300">Voice Narration</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Download className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-300">PowerPoint Export</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Share2 className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-300">Easy Sharing</span>
                </div>
              </div>
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
                  <p className="text-gray-300">Upload PDF lectures, notes, and study materials to begin your personalized learning journey.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 mt-1">
                  2
                </div>
                <div>
                  <h4 className="font-cinzel text-xl font-semibold text-emerald-200 mb-2">AI Analysis & Generation</h4>
                  <p className="text-gray-300">Our advanced AI analyzes your content and creates quizzes, flashcards, videos, translations, and study plans.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 mt-1">
                  3
                </div>
                <div>
                  <h4 className="font-cinzel text-xl font-semibold text-emerald-200 mb-2">Practice & Learn</h4>
                  <p className="text-gray-300">Engage with adaptive learning sessions, watch explainer videos, and practice with spaced repetition.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 mt-1">
                  4
                </div>
                <div>
                  <h4 className="font-cinzel text-xl font-semibold text-emerald-200 mb-2">Track Progress & Achieve Mastery</h4>
                  <p className="text-gray-300">Monitor your learning journey, get career guidance, and achieve mastery through consistent practice.</p>
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

      {/* Statistics Section */}
      <section className="relative z-10 py-24 px-6 bg-gradient-to-r from-emerald-950/50 to-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h3 className="font-cinzel text-4xl font-semibold text-center text-emerald-200 mb-16">
            Powered by Advanced AI
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-3xl font-bold text-emerald-400 mb-2">8+</h4>
              <p className="text-gray-300">AI-Powered Features</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-3xl font-bold text-purple-400 mb-2">PDF</h4>
              <p className="text-gray-300">Content Processing</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Languages className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-3xl font-bold text-blue-400 mb-2">2</h4>
              <p className="text-gray-300">Languages Supported</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-3xl font-bold text-orange-400 mb-2">100%</h4>
              <p className="text-gray-300">Personalized Learning</p>
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
              Ready to Transform Your Learning Journey?
            </h3>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Join the future of education with AI-powered personalized learning. From quiz generation 
              to career guidance, we've got everything you need to succeed.
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