import { 
  Home, 
  BookOpen, 
  TrendingUp, 
  Users, 
  Target,
  Torus as Torii,

  GraduationCap,

  Compass,
  Eye,
  Map,
  Languages

} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'dojos', label: 'Study Dojos', icon: Target },

  { id: 'academy', label: 'Concept Academy', icon: GraduationCap },

  { id: 'course-advisor', label: 'Course Advisor', icon: Compass },
  { id: 'oracles-insight', label: "Oracle's Insight", icon: Eye },
  { id: 'senseis-path', label: "Sensei's Path", icon: Map },
  { id: 'language-bridge', label: 'Language Bridge', icon: Languages },

  { id: 'memory-palace', label: 'Memory Palace', icon: BookOpen },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'community', label: 'Community', icon: Users },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="w-64 min-h-screen bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-900 border-r border-emerald-700/30 relative">
      {/* Logo */}
      <div className="p-6 border-b border-emerald-700/30">
        <div className="flex items-center space-x-3">
          <Torii className="w-8 h-8 text-emerald-400" />
          <span className="font-cinzel text-2xl font-semibold text-white">Sensei AI</span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="p-4 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 group ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600/20 to-emerald-700/20 border border-emerald-500/50 text-emerald-200'
                  : 'text-gray-300 hover:bg-emerald-900/20 hover:text-emerald-200 border border-transparent hover:border-emerald-700/30'
              }`}
            >
              <Icon className={`w-5 h-5 transition-all duration-300 ${
                isActive ? 'text-emerald-400 scale-110' : 'group-hover:text-emerald-400 group-hover:scale-105'
              }`} />
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom decoration */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-gradient-to-r from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-lg p-4 border border-emerald-700/30">
          <p className="text-emerald-200 text-sm font-cinzel text-center">
            "The way of the warrior is to stop trouble before it starts."
          </p>
          <p className="text-gray-400 text-xs text-center mt-2">- Ancient Wisdom</p>
        </div>
      </div>
    </div>
  );
}