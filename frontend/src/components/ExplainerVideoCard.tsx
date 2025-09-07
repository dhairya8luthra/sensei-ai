import { Play, Calendar, Clock, Download, Share2, MoreVertical, GraduationCap } from 'lucide-react';

interface ExplainerVideo {
  explainer_id: string;
  title: string;
  created_at: string;
  duration: number;
  language?: string;
  target_audience?: string;
  video_url?: string;
  thumbnail_url?: string;
  status: 'processing' | 'completed' | 'failed';
  sources?: Array<{ type: string; name: string }>;
  description?: string;
  difficulty?: string;
}

interface ExplainerVideoCardProps {
  video: ExplainerVideo;
  onPlayVideo: (videoId: string) => void;
}

export default function ExplainerVideoCard({ video, onPlayVideo }: ExplainerVideoCardProps) {
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-400 bg-emerald-600';
      case 'processing':
        return 'text-yellow-400 bg-yellow-600';
      case 'failed':
        return 'text-red-400 bg-red-600';
      default:
        return 'text-gray-400 bg-gray-600';
    }
  };

  const getAudienceColor = (audience: string | undefined) => {
    switch (audience?.toLowerCase()) {
      case 'beginner':
        return 'text-green-400 bg-green-600';
      case 'intermediate':
        return 'text-blue-400 bg-blue-600';
      case 'advanced':
        return 'text-purple-400 bg-purple-600';
      case 'expert':
        return 'text-red-400 bg-red-600';
      default:
        return 'text-gray-400 bg-gray-600';
    }
  };

  return (
    <div className="group bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl border border-purple-700/30 hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      {/* Thumbnail/Preview */}
      <div className="relative h-48 bg-gradient-to-br from-purple-800/50 to-emerald-800/50 flex items-center justify-center">
        {video.thumbnail_url ? (
          <img 
            src={video.thumbnail_url} 
            alt={video.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <GraduationCap className="w-16 h-16 text-purple-300" />
            <div className="text-center">
              <p className="text-purple-200 font-medium">{video.title}</p>
              <p className="text-gray-400 text-sm mt-1">{formatDuration(video.duration)}</p>
            </div>
          </div>
        )}
        
        {/* Play Overlay */}
        {video.status === 'completed' && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={() => onPlayVideo(video.explainer_id)}
              className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 transform hover:scale-110"
            >
              <Play className="w-8 h-8 text-white ml-1" />
            </button>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(video.status)} bg-opacity-20 border border-current border-opacity-30`}>
            {video.status === 'completed' ? 'Ready' : 'Processing'}
          </span>
        </div>

        {/* Duration Badge */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-medium">
          {formatDuration(video.duration)}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-cinzel text-lg font-semibold text-purple-200 group-hover:text-purple-100 transition-colors duration-200 line-clamp-2">
              {video.title}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-400 mt-2">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(video.created_at)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{formatTime(video.created_at)}</span>
              </div>
            </div>
          </div>
          
          <button className="w-8 h-8 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(video.target_audience || video.difficulty) && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAudienceColor(video.target_audience || video.difficulty)} bg-opacity-20 border border-current border-opacity-30`}>
              {(video.target_audience || video.difficulty || 'Unknown').charAt(0).toUpperCase() + (video.target_audience || video.difficulty || 'Unknown').slice(1)}
            </span>
          )}
          {video.language && (
            <span className="px-2 py-1 rounded-full text-xs font-medium text-blue-400 bg-blue-600 bg-opacity-20 border border-current border-opacity-30">
              {video.language.charAt(0).toUpperCase() + video.language.slice(1)}
            </span>
          )}
        </div>

        {/* Sources */}
        <div className="flex flex-wrap gap-1 mb-4">
          {video.sources && video.sources.length > 0 ? video.sources.map((source, index) => (
            <span
              key={index}
              className="px-2 py-1 rounded text-xs font-medium text-gray-400 bg-slate-800/50"
            >
              {source.type}: {source.name}
            </span>
          )) : (
            <span className="px-2 py-1 rounded text-xs font-medium text-gray-400 bg-slate-800/50">
              Generated Content
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onPlayVideo(video.explainer_id)}
            disabled={video.status !== 'completed'}
            className="group/btn flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600/80 to-emerald-600/80 hover:from-purple-600 hover:to-emerald-600 rounded-lg font-semibold text-white shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Play className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200" />
            <span>
              {video.status === 'processing' ? 'Processing...' : 
               video.status === 'failed' ? 'Failed' : 'Watch'}
            </span>
          </button>

          {video.status === 'completed' && (
            <div className="flex items-center space-x-2">
              <button className="w-8 h-8 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200">
                <Download 
                  className="w-4 h-4" 
                  onClick={() => {
                    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
                    window.open(`${backendUrl}/api/academy/download-pptx/${video.explainer_id}`, '_blank');
                  }}
                />
              </button>
              <button className="w-8 h-8 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}