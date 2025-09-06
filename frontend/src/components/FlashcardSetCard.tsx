
import { Brain, Calendar, Clock, Play, MoreVertical } from 'lucide-react';

interface FlashcardSet {
  flashcard_set_id: string;
  title: string;
  created_at: string;
  flashcards: Array<{ front: string; back: string }>;
  sources: Array<{ type: string; name: string }>;
}

interface FlashcardSetCardProps {
  flashcardSet: FlashcardSet;
  onStartStudy: (flashcardSetId: string) => void;
}

export default function FlashcardSetCard({ flashcardSet, onStartStudy }: FlashcardSetCardProps) {
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

  const getSourceTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return 'text-red-400 bg-red-600';
      case 'youtube':
        return 'text-red-400 bg-red-600';
      case 'text':
        return 'text-blue-400 bg-blue-600';
      default:
        return 'text-gray-400 bg-gray-600';
    }
  };

  return (
    <div className="group bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-emerald-700/30 hover:border-emerald-500/50 transition-all duration-300 transform hover:-translate-y-1">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-cinzel text-lg font-semibold text-emerald-200 group-hover:text-emerald-100 transition-colors duration-200">
              {flashcardSet.title}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(flashcardSet.created_at)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{formatTime(flashcardSet.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <button className="w-8 h-8 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Sources */}
      <div className="flex flex-wrap gap-2 mb-4">
        {flashcardSet.sources.map((source, index) => (
          <span
            key={index}
            className={`px-2 py-1 rounded-full text-xs font-medium ${getSourceTypeColor(source.type)} bg-opacity-20 border border-current border-opacity-30`}
          >
            {source.type}: {source.name}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-400">
          {flashcardSet.flashcards.length} cards
        </div>
        
        <div className="text-xs text-gray-400">
          Ready to study
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onStartStudy(flashcardSet.flashcard_set_id)}
        className="w-full group/btn flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-emerald-600/80 to-emerald-700/80 hover:from-emerald-600 hover:to-emerald-700 rounded-lg font-semibold text-white shadow-lg hover:shadow-emerald-500/25 transform hover:-translate-y-0.5 transition-all duration-300"
      >
        <Play className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200" />
        <span>Start Study Session</span>
      </button>
    </div>
  );
}