import { Calendar, Clock, BookOpen, Users } from 'lucide-react';

interface DojoSession {
  session_id: string;
  session_name: string;
  created_at: string;
  status?: string;
}

interface DojoCardProps {
  session: DojoSession;
  onClick?: () => void;
}

export default function DojoCard({ session, onClick }: DojoCardProps) {
  const getStatusColor = (status?: string) => {
    if (!status) {
      return 'bg-gray-500 text-gray-100';
    }
    
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-emerald-500 text-white';
      case 'completed':
        return 'bg-blue-500 text-white';
      case 'paused':
        return 'bg-yellow-500 text-black';
      case 'inactive':
        return 'bg-gray-500 text-gray-100';
      default:
        return 'bg-gray-500 text-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusText = (status?: string) => {
    return status || 'Active'; // Default to 'Active' instead of 'Unknown'
  };

  // Add safety check for session object
  if (!session) {
    return (
      <div className="bg-gradient-to-br from-red-900/20 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-red-700/30">
        <p className="text-red-300">Error: Session data not available</p>
      </div>
    );
  }

  return (
    <div 
      className="bg-gradient-to-br from-emerald-900/20 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-emerald-700/30 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer group hover:transform hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-cinzel text-xl font-semibold text-emerald-200 mb-2 group-hover:text-emerald-100 transition-colors">
            {session.session_name || 'Untitled Session'}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(session.created_at)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>0 min</span>
            </div>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
          {getStatusText(session.status)}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <div className="flex items-center space-x-1">
            <BookOpen className="w-4 h-4" />
            <span>0 materials</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>Solo</span>
          </div>
        </div>
        <div className="text-emerald-400 text-sm font-medium group-hover:text-emerald-300 transition-colors">
          Continue →
        </div>
      </div>
    </div>
  );
}