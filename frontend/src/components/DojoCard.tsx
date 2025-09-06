import { Target, Calendar, Clock, Play, MoreVertical } from 'lucide-react';

interface DojoSession {
  session_id: string;
  session_name: string;
  created_at: string;
  status: string;
}

interface DojoCardProps {
  dojo: DojoSession;
  onStartSession: (sessionId: string) => void;
}

export default function DojoCard({ dojo, onStartSession }: DojoCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-emerald-400 bg-emerald-600';
      case 'completed':
        return 'text-blue-400 bg-blue-600';
      case 'paused':
        return 'text-yellow-400 bg-yellow-600';
      default:
        return 'text-gray-400 bg-gray-600';
    }
  };

  return (
    <div className="group bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-emerald-700/30 hover:border-emerald-500/50 transition-all duration-300 transform hover:-translate-y-1">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 ${getStatusColor(dojo.status)} rounded-lg flex items-center justify-center`}>
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-cinzel text-lg font-semibold text-emerald-200 group-hover:text-emerald-100 transition-colors duration-200">
              {dojo.session_name}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(dojo.created_at)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{formatTime(dojo.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <button className="w-8 h-8 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(dojo.status)} bg-opacity-20 border border-current border-opacity-30`}>
          {dojo.status.charAt(0).toUpperCase() + dojo.status.slice(1)}
        </span>
        
        {/* Progress placeholder - you can add real progress data later */}
        <div className="text-xs text-gray-400">
          Progress: 0/0
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onStartSession(dojo.session_id)}
        className="w-full group/btn flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-emerald-600/80 to-emerald-700/80 hover:from-emerald-600 hover:to-emerald-700 rounded-lg font-semibold text-white shadow-lg hover:shadow-emerald-500/25 transform hover:-translate-y-0.5 transition-all duration-300"
      >
        <Play className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200" />
        <span>
          {dojo.status === 'active' ? 'Continue Session' : 'Start Session'}
        </span>
      </button>
    </div>
  );
}