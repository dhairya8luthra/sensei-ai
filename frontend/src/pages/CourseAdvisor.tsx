import React, { useState, useEffect } from 'react';
import { Compass, Send, BookOpen, Clock, Star, TrendingUp, Sparkles, MessageCircle, History, Loader2 } from 'lucide-react';
import Lottie from 'lottie-react';
import senseiAnimation from '../data/senseiAnimation.json';

interface CourseRecommendation {
  course_name: string;
  course_description: string;
  course_link: string;
}

interface RecommendationResponse {
  success: boolean;
  recommendation_id: string;
  session_id: string;
  user_query: string;
  total_courses_analyzed: number;
  recommendations: CourseRecommendation[];
  created_at: string;
  error?: string;
}

interface RecommendationHistory {
  recommendation_id: string;
  user_input: string;
  created_at: string;
}

interface CourseAdvisorProps {
  user: any;
}

export default function CourseAdvisor({ user }: CourseAdvisorProps) {
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<CourseRecommendation[]>([]);
  const [currentQuery, setCurrentQuery] = useState('');
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<RecommendationHistory[]>([]);
  const [sessionId] = useState(`session_${user?.id || 'anonymous'}_${Date.now()}`);

  const backendUrl = import.meta.env.VITE_BACKEND_URL ;

  useEffect(() => {
    if (user) {
      fetchRecommendationHistory();
    }
  }, [user]);

  const fetchRecommendationHistory = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/recommendation-history/${sessionId}`);
      const data = await response.json();
      
      if (response.ok) {
        setHistory(data.recommendation_history || []);
      }
    } catch (err) {
      console.error('Failed to fetch recommendation history:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || loading) return;

    setLoading(true);
    setError('');
    setCurrentQuery(userInput);

    try {
      const formData = new FormData();
      formData.append('session_id', sessionId);
      formData.append('user_input', userInput.trim());

      const response = await fetch(`${backendUrl}/api/recommend-courses`, {
        method: 'POST',
        body: formData
      });

      const data: RecommendationResponse = await response.json();

      if (data.success) {
        setRecommendations(data.recommendations);
        setUserInput('');
        fetchRecommendationHistory(); // Refresh history
      } else {
        throw new Error(data.error || 'Failed to get recommendations');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to get course recommendations');
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryRecommendation = async (recommendationId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/recommendation/${recommendationId}`);
      const data = await response.json();
      
      if (response.ok) {
        setRecommendations(data.recommendations_data.recommendations);
        setCurrentQuery(data.user_input);
        setShowHistory(false);
      }
    } catch (err) {
      setError('Failed to load recommendation');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="font-cinzel text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-emerald-400 bg-clip-text text-transparent">
            Course Advisor
          </h1>
          <p className="text-xl text-blue-200 font-medium">
            Get personalized upGrad course recommendations for your career goals
          </p>
        </div>

        <button
          onClick={() => setShowHistory(!showHistory)}
          className="group inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg font-semibold shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-1 transition-all duration-300"
        >
          <History className="w-5 h-5" />
          <span>View History</span>
        </button>
      </div>

      {/* History Panel */}
      {showHistory && (
        <div className="bg-gradient-to-br from-blue-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-blue-700/30">
          <h3 className="font-cinzel text-xl font-semibold text-blue-200 mb-4">Recommendation History</h3>
          {history.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No previous recommendations</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {history.map((item) => (
                <button
                  key={item.recommendation_id}
                  onClick={() => loadHistoryRecommendation(item.recommendation_id)}
                  className="w-full text-left p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg border border-slate-600/30 hover:border-blue-500/50 transition-all duration-200"
                >
                  <p className="text-blue-200 font-medium">{item.user_input}</p>
                  <p className="text-gray-400 text-sm mt-1">{formatDate(item.created_at)}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Input Section */}
      <div className="bg-gradient-to-br from-blue-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-blue-700/30">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-blue-200 font-medium mb-3">
              Tell us about your career goals and interests
            </label>
            <div className="relative">
              <MessageCircle className="absolute left-3 top-3 w-5 h-5 text-blue-400" />
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="e.g., I want to transition into data science from a marketing background. I'm interested in machine learning and have basic Python knowledge..."
                rows={4}
                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-blue-700/30 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 resize-none"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-900/40 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!userInput.trim() || loading}
            className="group inline-flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg font-semibold shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Getting Recommendations...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Get Course Recommendations</span>
                <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Loading State */}
      {loading && !recommendations.length && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-6">
              <Lottie 
                animationData={senseiAnimation} 
                loop={true}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
            <h3 className="font-cinzel text-xl font-semibold text-blue-200 mb-2">
              Analyzing Your Goals
            </h3>
            <p className="text-gray-300">Finding the perfect courses for your career journey...</p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {recommendations.length > 0 && (
        <div className="space-y-6">
          {/* Query Display */}
          <div className="bg-gradient-to-br from-slate-900/40 to-blue-900/40 backdrop-blur-sm rounded-xl p-6 border border-blue-700/30">
            <div className="flex items-start space-x-3">
              <Compass className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-cinzel text-lg font-semibold text-blue-200 mb-2">Your Query</h3>
                <p className="text-gray-300 leading-relaxed">{currentQuery}</p>
              </div>
            </div>
          </div>

          {/* Recommendations Header */}
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <h2 className="font-cinzel text-2xl font-semibold text-emerald-200">
              Recommended Courses
            </h2>
            <span className="px-3 py-1 bg-emerald-600/20 text-emerald-400 rounded-full text-sm font-medium">
              {recommendations.length} courses
            </span>
          </div>

          {/* Course Cards */}
          <div className="grid gap-6">
            {recommendations.map((course, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-blue-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-blue-700/30 hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-cinzel text-xl font-semibold text-blue-200 group-hover:text-blue-100 transition-colors duration-200 mb-2">
                        {course.course_name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span>upGrad Certified</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Self-paced</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-emerald-600/20 text-emerald-400 rounded-full text-xs font-medium">
                      Recommended
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-gray-300 leading-relaxed">
                    {course.course_description}
                  </p>
                </div>

                <div className="flex items-center justify-center">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-sm text-gray-400">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span>Career Growth</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-400">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      <span>Industry Relevant</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center bg-gradient-to-br from-emerald-900/40 to-blue-900/40 backdrop-blur-sm rounded-xl p-8 border border-emerald-700/30">
            <h3 className="font-cinzel text-2xl font-semibold text-emerald-200 mb-4">
              Ready to Start Your Journey?
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              These courses are carefully selected based on your career goals and current skill level. 
              Each course is designed to help you achieve your professional objectives.
            </p>
            <button
              onClick={() => {
                setRecommendations([]);
                setCurrentQuery('');
                setUserInput('');
              }}
              className="inline-flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-lg font-semibold shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-1 transition-all duration-300"
            >
              <Compass className="w-5 h-5" />
              <span>Get New Recommendations</span>
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && recommendations.length === 0 && !currentQuery && (
        <div className="text-center py-20">
          <div className="w-32 h-32 mx-auto mb-6">
            <Lottie 
              animationData={senseiAnimation} 
              loop={true}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <h3 className="font-cinzel text-2xl font-semibold text-blue-200 mb-4">
            Your Personal Course Advisor
          </h3>
          <p className="text-gray-300 mb-8 max-w-md mx-auto">
            Tell us about your career goals, interests, and current skills. 
            We'll recommend the perfect upGrad courses to help you succeed.
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-blue-700/30">
              <BookOpen className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h4 className="font-semibold text-blue-200 mb-2">Career Transition</h4>
              <p className="text-gray-400 text-sm">Switch careers with confidence using our curated learning paths</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-emerald-700/30">
              <TrendingUp className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <h4 className="font-semibold text-emerald-200 mb-2">Skill Enhancement</h4>
              <p className="text-gray-400 text-sm">Level up your existing skills with advanced courses</p>
            </div>
            <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-purple-700/30">
              <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h4 className="font-semibold text-purple-200 mb-2">Future-Ready</h4>
              <p className="text-gray-400 text-sm">Stay ahead with courses in emerging technologies</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}