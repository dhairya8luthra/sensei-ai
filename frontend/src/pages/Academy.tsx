import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import senseiAnimation from '../data/senseiAnimation.json';
import CreateExplainerModal from '../components/CreateExplainerModal';
import ExplainerVideoCard from '../components/ExplainerVideoCard';
import { GraduationCap, Plus, Search, Filter, Sparkles, X } from 'lucide-react';
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

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  useEffect(() => {
    if (user) fetchUserExplainers();
  }, [user]);

  const fetchUserExplainers = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      // IMPORTANT: use the academy endpoint that reads from Supabase
      const response = await fetch(`${backendUrl}/api/academy/user-explainers/${user.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch explainer videos');
      }

      const list = data.explainer_videos || [];
      setExplainerVideos(list);
    } catch (err: any) {
      console.error('Error fetching explainer videos:', err);
      setError(err.message || 'Failed to fetch explainer videos');
    } finally {
      setLoading(false);
    }
  };

  const handleExplainerCreated = (explainerData: any) => {
    const newExplainer: ExplainerVideo = {
      explainer_id: explainerData.explainer_id || explainerData.id,
      title: explainerData.title || explainerData.lesson_title || 'New Explainer',
      created_at: explainerData.created_at || new Date().toISOString(),
      duration: explainerData.duration || 0,
      language: explainerData.language || 'english',
      target_audience: explainerData.target_audience || 'beginner',
      video_url: explainerData.video_url,
      thumbnail_url: explainerData.thumbnail_url,
      status: explainerData.status || 'completed',
      sources: explainerData.sources || []
    };

    // FIX: correct spread order (old code had a stray ".prev")
    setExplainerVideos(prev => [newExplainer, ...prev]);

    // Also refresh from backend to ensure parity with DB
    fetchUserExplainers();
  };

  const handlePlayVideo = (explainerId: string) => {
    const video = explainerVideos.find(v => v.explainer_id === explainerId);
    if (video) setCurrentVideo(video);
    else setError('Video not found');
  };

  // Filter + pagination
  const filtered = explainerVideos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAudience =
      filterAudience === 'all' ||
      (video.target_audience && video.target_audience.toLowerCase() === filterAudience.toLowerCase()) ||
      (video.difficulty && video.difficulty.toLowerCase() === filterAudience.toLowerCase());
    const matchesLanguage =
      filterLanguage === 'all' ||
      (video.language && video.language.toLowerCase() === filterLanguage.toLowerCase());
    return matchesSearch && matchesAudience && matchesLanguage;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => setCurrentPage(1), [searchTerm, filterAudience, filterLanguage]);

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto">
            <Lottie animationData={senseiAnimation} loop style={{ width: '100%', height: '100%' }} />
          </div>
          <h3 className="font-cinzel text-xl font-semibold text-purple-200 mb-2">Loading Your Explainer Videos</h3>
          <p className="text-gray-300">Please wait while we fetch your content.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="font-cinzel text-4xl font-bold bg-gradient-to-r from-white via-purple-2 00 to-emerald-400 bg-clip-text text-transparent">
            Concept Academy
          </h1>
          <p className="text-xl text-purple-200 font-medium">Transform knowledge into engaging AI-powered explainer videos</p>
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

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
          <input
            type="text"
            placeholder="Search explainer videos…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gradient-to-r from-purple-900/40 to-slate-900/40 backdrop-blur-sm border border-purple-700/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
          />
        </div>

        <div className="flex gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
            <select
              value={filterAudience}
              onChange={(e) => setFilterAudience(e.target.value)}
              className="pl-10 pr-4 py-3 bg-gradient-to-r from-purple-900/40 to-slate-900/40 backdrop-blur-sm border border-purple-700/30 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
            >
              <option value="all">All audiences</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="pl-10 pr-4 py-3 bg-gradient-to-r from-purple-900/40 to-slate-900/40 backdrop-blur-sm border border-purple-700/30 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
            >
              <option value="all">All languages</option>
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4">
            <Lottie animationData={senseiAnimation} loop style={{ width: '100%', height: '100%' }} />
          </div>
          <h3 className="font-cinzel text-2xl font-semibold text-purple-200 mb-4">
            {searchTerm || filterAudience !== 'all' || filterLanguage !== 'all'
              ? 'No explainer videos found'
              : 'No explainer videos yet'}
          </h3>
          <p className="text-gray-300 mb-8 max-w-md mx-auto">
            {searchTerm || filterAudience !== 'all' || filterLanguage !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first AI-powered explainer video to start your library'}
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

      {/* Grid */}
      {pageItems.length > 0 && (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pageItems.map(video => (
              <ExplainerVideoCard
                key={video.explainer_id}
                video={video}
                onPlayVideo={handlePlayVideo}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}

      {/* Results Summary */}
      {filtered.length > 0 && (
        <div className="text-center text-gray-400 text-sm">
          Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length} explainer videos
        </div>
      )}

      {/* Modal */}
      <CreateExplainerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onExplainerCreated={handleExplainerCreated}
        user={user}
      />

      {/* Video Player Overlay */}
      {currentVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl border border-slate-700 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="font-cinzel text-xl font-semibold text-white">
                {currentVideo.title}
              </h3>
              <button
                onClick={() => setCurrentVideo(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  controls
                  autoPlay
                  className="w-full h-full"
                  src={currentVideo.video_url?.startsWith('http')
                    ? currentVideo.video_url
                    : `${backendUrl}${currentVideo.video_url}`
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
