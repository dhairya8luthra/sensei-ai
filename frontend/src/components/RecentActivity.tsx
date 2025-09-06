import { Clock, BookOpen, Target, Trophy } from 'lucide-react';

export default function RecentActivity() {
  const activities = [
    {
      icon: Target,
      title: 'Completed Dojo: Machine Learning Basics',
      description: 'Perfect score on neural networks quiz',
      time: '2 hours ago',
      type: 'success'
    },
    {
      icon: BookOpen,
      title: 'Added new material: Data Structures.pdf',
      description: '24 pages processed and ready for practice',
      time: '5 hours ago',
      type: 'info'
    },
    {
      icon: Trophy,
      title: 'Achievement Unlocked: Week Warrior',
      description: 'Completed dojos for 7 days straight',
      time: '1 day ago',
      type: 'achievement'
    },
    {
      icon: Target,
      title: 'Study Session: Algorithms',
      description: 'Scored 85% on sorting algorithms',
      time: '2 days ago',
      type: 'success'
    }
  ];

  const getTypeClasses = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-emerald-400 bg-emerald-600';
      case 'info':
        return 'text-blue-400 bg-blue-600';
      case 'achievement':
        return 'text-yellow-400 bg-yellow-600';
      default:
        return 'text-emerald-400 bg-emerald-600';
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-emerald-700/30">
      <div className="flex items-center space-x-3 mb-6">
        <Clock className="w-6 h-6 text-emerald-400" />
        <h3 className="font-cinzel text-xl font-semibold text-emerald-200">Recent Activity</h3>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          const iconClasses = getTypeClasses(activity.type);
          
          return (
            <div key={index} className="flex items-start space-x-4 p-4 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-200">
              <div className={`w-10 h-10 ${iconClasses} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-emerald-200 font-medium">{activity.title}</p>
                <p className="text-gray-400 text-sm mt-1">{activity.description}</p>
                <p className="text-gray-500 text-xs mt-2">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <button className="text-emerald-400 hover:text-emerald-300 font-medium text-sm transition-colors duration-200">
          View all activity →
        </button>
      </div>
    </div>
  );
}