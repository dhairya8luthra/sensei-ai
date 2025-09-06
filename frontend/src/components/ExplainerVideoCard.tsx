import React from 'react';
import { Play, Clock, Users, Globe, FileText, Youtube } from 'lucide-react';

interface ExplainerVideo {
  explainer_id: string;
  title: string;
  video_url: string;
  thumbnail_url: string;
  duration: number;
  language: string;
  target_audience: string;
  status: string;
  sources: Array<{
    type: string;
    name: string;
  }>;
  created_at: string;
}

interface ExplainerVideoCardProps {
  video: ExplainerVideo;
  onPlayVideo: (videoId: string) => void;
}

const ExplainerVideoCard: React.FC<ExplainerVideoCardProps> = ({ video, onPlayVideo }) => {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getAudienceColor = (audience: string) => {
    switch (audience) {
      case 'beginner':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'advanced':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="w-3 h-3" />;
      case 'youtube':
        return <Youtube className="w-3 h-3" />;
      default:
        return <FileText className="w-3 h-3" />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-800 to-purple-800 rounded-xl border border-purple-500/30 overflow-hidden hover:border-purple-400/50 transition-all duration-300 group">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-slate-700/50 overflow-hidden">
        {video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600/20 to-emerald-600/20">
            <Play className="w-16 h-16 text-purple-400" />
          </div>
        )}
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
          <button
            onClick={() => onPlayVideo(video.explainer_id)}
            className="w-16 h-16 bg-purple-600/90 hover:bg-purple-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300"
          >
            <Play className="w-8 h-8 text-white ml-1" />
          </button>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
          <Clock className="w-3 h-3 inline mr-1" />
          {formatDuration(video.duration)}
        </div>

        {/* Status Badge */}
        <div className={`absolute top-2 left-2 px-2 py-1 text-xs rounded-full ${
          video.status === 'completed' 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
        }`}>
          {video.status === 'completed' ? 'Ready' : 'Processing'}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2 group-hover:text-purple-300 transition-colors">
          {video.title}
        </h3>

        {/* Metadata */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            <span className={`px-2 py-1 rounded-full text-xs border ${getAudienceColor(video.target_audience)}`}>
              {video.target_audience}
            </span>
          </div>
          
          <div className="flex items-center">
            <Globe className="w-4 h-4 mr-1" />
            <span className="capitalize">{video.language}</span>
          </div>
        </div>

        {/* Sources */}
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">Sources:</p>
          <div className="flex flex-wrap gap-2">
            {video.sources.map((source, index) => (
              <div
                key={index}
                className="flex items-center text-xs bg-slate-700/50 text-gray-300 px-2 py-1 rounded-full"
              >
                {getSourceIcon(source.type)}
                <span className="ml-1 truncate max-w-20">{source.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
          <span className="text-xs text-gray-500">
            {formatDate(video.created_at)}
          </span>
          
          <button
            onClick={() => onPlayVideo(video.explainer_id)}
            className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
          >
            Watch Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExplainerVideoCard;