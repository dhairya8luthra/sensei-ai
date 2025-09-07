import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Torus as Torii, Mail, Lock, Chrome, ArrowLeft, Sparkles } from 'lucide-react';
import Lottie from 'lottie-react';
import { supabase } from '@/lib/supabaseClient';
import senseiAnimation from '../data/senseiAnimation.json';
import StarryBackground from '../components/StarryBackground';
import ScrollingParticles from '../components/ScrollingParticles';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Handle OAuth callback on component mount
  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data,error } = await supabase.auth.getSession();
      
      if (data?.session) {
        // User is logged in, redirect to dashboard
        navigate('/dashboard', { replace: true });
      }
    };
    console.log(error);

    // Check if there's a hash in the URL (OAuth callback)
    if (window.location.hash) {
      handleAuthCallback();
    }
  }, [navigate]);

  const handleEmailLogin = async () => {
    setLoading(true);
    setError('');
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setError(error.message);
    } else {
      navigate('/dashboard');
    }
    
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
    
    if (error) {
      setError(error.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-800 text-white overflow-hidden relative">
      <StarryBackground />
      <ScrollingParticles />
      
      {/* Navigation */}
      <nav className="relative z-20 p-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link to="/" className="flex items-center space-x-3 group">
            <ArrowLeft className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform duration-300" />
            <span className="text-emerald-400 font-medium">Back to Home</span>
          </Link>
          <div className="flex items-center space-x-3">
            <Torii className="w-8 h-8 text-emerald-400" />
            <span className="font-cinzel text-2xl font-semibold text-white">Sensei AI</span>
          </div>
        </div>
      </nav>

      {/* Login Form */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Lottie Animation */}
          <div className="hidden lg:flex justify-center">
            <div className="w-[28rem] h-[28rem]">
              <Lottie 
                animationData={senseiAnimation} 
                loop={true}
                style={{ width: '100%', height: '100%' }}
                className="drop-shadow-3xl"
              />
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-2xl p-8 border border-emerald-700/30 shadow-2xl">
              <div className="text-center mb-8">
                <h1 className="font-cinzel text-3xl font-semibold text-emerald-200 mb-2">
                  Welcome Back, Sensei
                </h1>
                <p className="text-gray-300">
                  Continue your journey to mastery
                </p>
              </div>

              {error && (
                <div className="bg-red-900/40 border border-red-500/50 rounded-lg p-4 mb-6">
                  <p className="text-red-300 text-sm text-center">{error}</p>
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); handleEmailLogin(); }} className="space-y-6">
                <div>
                  <label className="block text-emerald-200 font-medium mb-2" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-400" />
                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-emerald-700/30 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-emerald-200 font-medium mb-2" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-400" />
                    <input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-emerald-700/30 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg font-semibold shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? 'Signing In...' : 'Enter the Dragon'}
                    {!loading && <Sparkles className="w-5 h-5 group-hover:animate-pulse" />}
                  </span>
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-emerald-700/30"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gradient-to-br from-emerald-900/40 to-slate-900/40 text-gray-300">
                    Or continue with
                  </span>
                </div>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-emerald-400 text-emerald-400 rounded-lg font-semibold hover:bg-emerald-400 hover:text-slate-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Chrome className="w-5 h-5" />
                {loading ? 'Connecting...' : 'Continue with Google'}
              </button>

              <div className="mt-8 text-center">
                <p className="text-gray-300">
                  New to Sensei AI ?{' '}
                  <Link 
                    to="/signup" 
                    className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors duration-300"
                  >
                    Begin your journey
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}