import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Lottie from 'lottie-react';
import senseiAnimation from '../data/senseiAnimation.json';
import StarryBackground from '../components/StarryBackground';
import ScrollingParticles from '../components/ScrollingParticles';
import Sidebar from '../components/Sidebar';
import UserDropdown from '../components/UserDropdown';
import ActivityGraph from '../components/ActivityGraph';
import DashboardStats from '../components/DashboardStats';
import RecentActivity from '../components/RecentActivity';
import Dojos from './Dojos';
import DojoSession from './DojoSession';
import MemoryPalace from './MemoryPalace';
import CourseAdvisor from './CourseAdvisor';
import OraclesInsight from './OraclesInsight';
import SenseisPath from './SenseisPath';
import LanguageBridge from './LanguageBridge';
import { Sparkles } from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentDojoSession, setCurrentDojoSession] = useState<{
    sessionId: string;
    sessionName: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get logged-in user
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error) console.error('Error fetching user:', error);
      else setUser(user);
      setLoading(false);
    });
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleStartDojoSession = (sessionId: string, sessionName: string) => {
    setCurrentDojoSession({ sessionId, sessionName });
  };

  const handleBackToDojos = () => {
    setCurrentDojoSession(null);
    setActiveTab('dojos');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div>
                  <h1 className="font-cinzel text-4xl font-bold bg-gradient-to-r from-white via-emerald-200 to-emerald-400 bg-clip-text text-transparent">
                    {getGreeting()}, {user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Sensei'}!
                  </h1>
                  <p className="text-xl text-emerald-200 font-medium mt-2 font-cinzel">
                    Ready to continue your journey?
                  </p>
                  <p className="text-gray-300 mt-4 text-lg">
                    Let's learn and practice together. Your dedication shapes your mastery.
                  </p>
                </div>

                <button className="group inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg font-semibold shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-1 transition-all duration-300">
                  <span>Start Learning Session</span>
                  <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                </button>
              </div>

              <div className="flex justify-center">
                <div className="w-64 h-64">
                  <Lottie 
                    animationData={senseiAnimation} 
                    loop={true}
                    style={{ width: '100%', height: '100%' }}
                    className="drop-shadow-3xl"
                  />
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <DashboardStats />

            {/* Activity Graph and Recent Activity */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <ActivityGraph />
              </div>
              <div>
                <RecentActivity />
              </div>
            </div>
          </div>
        );
      case 'dojos':
        return (
          <Dojos user={user} onStartSession={handleStartDojoSession} />
        );
      case 'memory-palace':
        return (
          <MemoryPalace user={user} />
        );
      
      case 'course-advisor':
        return (
          <CourseAdvisor user={user} />
        );
      case 'oracles-insight':
        return (
          <OraclesInsight user={user} />
        );
      case 'senseis-path':
        return (
          <SenseisPath user={user} />
        );
      case 'language-bridge':
        return (
          <LanguageBridge user={user} />
        );
      case 'progress':
        return (
          <div className="text-center py-20">
            <h2 className="font-cinzel text-3xl font-bold text-emerald-200 mb-4">Progress Analytics</h2>
            <p className="text-gray-300">Track your learning journey and identify areas for improvement.</p>
          </div>
        );
      case 'community':
        return (
          <div className="text-center py-20">
            <h2 className="font-cinzel text-3xl font-bold text-emerald-200 mb-4">Community</h2>
            <p className="text-gray-300">Connect with fellow learners and climb the leaderboards.</p>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-800 flex items-center justify-center">
        <div className="w-32 h-32">
          <Lottie 
            animationData={senseiAnimation} 
            loop={true}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>
    );
  }

  // Show Dojo Session if one is active
  if (currentDojoSession) {
    return (
      <DojoSession
        sessionId={currentDojoSession.sessionId}
        sessionName={currentDojoSession.sessionName}
        user={user}
        onBackToDojos={handleBackToDojos}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-800 text-white relative overflow-hidden">
      <StarryBackground />
      <ScrollingParticles />
      
      <div className="flex relative z-10">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content */}
        <div className="flex-1 min-h-screen">
          {/* Top Bar */}
          <div className="flex items-center justify-between p-6 border-b border-emerald-700/30 backdrop-blur-sm">
            <div>
              <h2 className="font-cinzel text-2xl font-semibold text-emerald-200 capitalize">
                {activeTab === 'dashboard' ? 'Dashboard' : 
                 activeTab === 'memory-palace' ? 'Memory Palace' : 
                 activeTab === 'academy' ? 'Concept Academy' :
                 activeTab === 'course-advisor' ? 'Course Advisor' :
                 activeTab === 'oracles-insight' ? "Oracle's Insight" :
                 activeTab === 'senseis-path' ? "Sensei's Path" :
                 activeTab === 'language-bridge' ? 'Language Bridge' :
                 activeTab}
              </h2>
              <p className="text-gray-400 text-sm">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <UserDropdown user={user} />
          </div>

          {/* Page Content */}
          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}