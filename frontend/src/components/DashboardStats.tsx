import { Target, BookOpen, Trophy, Zap } from 'lucide-react';

export default function DashboardStats() {
  const stats = [
    {
      icon: Target,
      label: 'Study Sessions',
      value: '47',
      change: '+12%',
      color: 'emerald'
    },
    {
      icon: BookOpen,
      label: 'Materials Studied',
      value: '23',
      change: '+3 this week',
      color: 'blue'
    },
    {
      icon: Trophy,
      label: 'Streak Days',
      value: '12',
      change: 'Personal Best!',
      color: 'yellow'
    },
    {
      icon: Zap,
      label: 'Mastery Score',
      value: '87%',
      change: '+5% this month',
      color: 'purple'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      emerald: 'text-emerald-400 bg-emerald-600',
      blue: 'text-blue-400 bg-blue-600',
      yellow: 'text-yellow-400 bg-yellow-600',
      purple: 'text-purple-400 bg-purple-600'
    };
    return colors[color as keyof typeof colors] || colors.emerald;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const colorClasses = getColorClasses(stat.color);
        
        return (
          <div
            key={index}
            className="group bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-emerald-700/30 hover:border-emerald-500/50 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${colorClasses} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
              <p className="text-emerald-400 text-sm font-medium">{stat.change}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}