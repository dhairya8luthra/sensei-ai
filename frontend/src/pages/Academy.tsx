import  { useState, useEffect } from 'react';
import { GraduationCap, Plus, Search, Filter, Sparkles } from 'lucide-react';
import Lottie from 'lottie-react';
import senseiAnimation from '../data/senseiAnimation.json';
import CreateExplainerModal from '../components/CreateExplainerModal';
import ExplainerVideoCard from '../components/ExplainerVideoCard';
import VideoPlayer from '../components/VideoPlayer';
import Pagination from '../components/Pagination';

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
  difficulty?: string;
}

interface AcademyProps {
  user: any;
}

export default function Academy({ user }: AcademyProps) {
  const [explainerVideos, setExplainerVideos] = useState<ExplainerVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<ExplainerVideo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAudience, setFilterAudience] = useState('all');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  useEffect(() => {
    if (user) {
      fetchUserExplainers();
    }
  }, [user]);

  const fetchUserExplainers = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${backendUrl}/api/explainers/user-explainers/${user.id}`);
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch explainer videos');
      }

      // Use the explainer videos directly from the new API
      const explainerVideos = data.explainer_videos || [];
      
      setExplainerVideos(explainerVideos);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch explainer videos');
    } finally {
      setLoading(false);
    }
  };

  const handleExplainerCreated = (explainerData: any) => {
    // Add the new explainer video to the list
    const newExplainerVideo: ExplainerVideo = {
      explainer_id: explainerData.explainer_id,
      title: explainerData.title,
      created_at: explainerData.created_at,
      duration: explainerData.duration,
      language: explainerData.language,
      target_audience: explainerData.target_audience,
      video_url: explainerData.video_url,
      thumbnail_url: explainerData.thumbnail_url,
      status: explainerData.status,
      sources: explainerData.sources || []
    };
    
    setExplainerVideos(prev => [newExplainerVideo, ...prev]);
  };

  const handlePlayVideo = async (explainerId: string) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${backendUrl}/api/explainers/explainer-video/${explainerId}`);
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch explainer video');
      }

      setCurrentVideo(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load video');
    }
  };

  // Filter and search explainer videos
  const filteredExplainerVideos = explainerVideos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAudience = filterAudience === 'all' || 
      (video.target_audience && video.target_audience.toLowerCase() === filterAudience.toLowerCase()) ||
      (video.difficulty && video.difficulty.toLowerCase() === filterAudience.toLowerCase());
    const matchesLanguage = filterLanguage === 'all' || 
      (video.language && video.language.toLowerCase() === filterLanguage.toLowerCase());
    return matchesSearch && matchesAudience && matchesLanguage;
  });

  // Pagination
  const totalPages = Math.ceil(filteredExplainerVideos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExplainerVideos = filteredExplainerVideos.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterAudience, filterLanguage]);

  // Show video player if a video is selected
  if (currentVideo) {
    return (
      <VideoPlayer {...({ video: currentVideo, onBack: () => setCurrentVideo(null) } as any)} />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
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

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="font-cinzel text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-emerald-400 bg-clip-text text-transparent">
            Concept Academy
          </h1>
          <p className="text-xl text-purple-200 font-medium">
            Transform knowledge into engaging AI-powered explainer videos
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="group inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-emerald-600 rounded-lg font-semibold shadow-xl hover:shadow-purple-500/30 transform hover:-translate-y-1 transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          <span>Create Explainer Video</span>
          <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
          <input
            type="text"
            placeholder="Search explainer videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gradient-to-r from-purple-900/40 to-slate-900/40 backdrop-blur-sm border border-purple-700/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
          />
        </div>

        <div className="flex gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
            <select
              value={filterAudience}
              onChange={(e) => setFilterAudience(e.target.value)}
              className="pl-12 pr-8 py-3 bg-gradient-to-r from-purple-900/40 to-slate-900/40 backdrop-blur-sm border border-purple-700/30 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 appearance-none cursor-pointer"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <div className="relative">
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="pl-4 pr-8 py-3 bg-gradient-to-r from-purple-900/40 to-slate-900/40 backdrop-blur-sm border border-purple-700/30 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 appearance-none cursor-pointer"
            >
              <option value="all">All Languages</option>
              <option value="english">English</option>
              <option value="spanish">Spanish</option>
              <option value="french">French</option>
              <option value="german">German</option>
              <option value="chinese">Chinese</option>
              <option value="japanese">Japanese</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-900/40 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-300 text-center">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredExplainerVideos.length === 0 && !error && (
        <div className="text-center py-20">
          <div className="w-32 h-32 mx-auto mb-6">
            <Lottie 
              animationData={senseiAnimation} 
              loop={true}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <h3 className="font-cinzel text-2xl font-semibold text-purple-200 mb-4">
            {searchTerm || filterAudience !== 'all' || filterLanguage !== 'all' 
              ? 'No explainer videos found' 
              : 'No explainer videos yet'
            }
          </h3>
          <p className="text-gray-300 mb-8 max-w-md mx-auto">
            {searchTerm || filterAudience !== 'all' || filterLanguage !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first AI-powered explainer video to start building your knowledge library'
            }
          </p>
          {!searchTerm && filterAudience === 'all' && filterLanguage === 'all' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="group inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-emerald-600 rounded-lg font-semibold shadow-xl hover:shadow-purple-500/30 transform hover:-translate-y-1 transition-all duration-300"
            >
              <GraduationCap className="w-5 h-5" />
              <span>Create Your First Explainer Video</span>
              <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
            </button>
          )}
        </div>
      )}

      {/* Explainer Videos Grid */}
      {paginatedExplainerVideos.length > 0 && (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedExplainerVideos.map((video) => (
              <ExplainerVideoCard
                key={video.explainer_id}
                video={video}
                onPlayVideo={handlePlayVideo}
              />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {/* Results Summary */}
      {filteredExplainerVideos.length > 0 && (
        <div className="text-center text-gray-400 text-sm">
          Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredExplainerVideos.length)} of {filteredExplainerVideos.length} explainer videos
        </div>
      )}

      {/* Create Explainer Modal */}
      <CreateExplainerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onExplainerCreated={handleExplainerCreated}
      />
    </div>
  );
}