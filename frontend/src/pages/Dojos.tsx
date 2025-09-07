import  { useState, useEffect } from 'react';
import { Target, Plus, Search, Filter, Sparkles } from 'lucide-react';
import Lottie from 'lottie-react';
import senseiAnimation from '../data/senseiAnimation.json';
import CreateDojoModal from '../components/CreateDojoModal';
import DojoCard from '../components/DojoCard';
import Pagination from '../components/Pagination';

interface DojoSession {
  session_id: string;
  session_name: string;
  created_at: string;
  status?: string;
}

interface DojosProps {
  user: any;
  onStartSession?: (sessionId: string, sessionName: string) => void;
}

export default function Dojos({ user, onStartSession }: DojosProps) {
  const [dojos, setDojos] = useState<DojoSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  useEffect(() => {
    if (user) {
      fetchDojos();
    }
  }, [user]);

  const fetchDojos = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/user-sessions/${user.id}`);
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch dojos');
      }

      setDojos(data.sessions || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dojos');
    } finally {
      setLoading(false);
    }
  };

  const handleDojoCreated = () => {
    fetchDojos();
  };

  const handleStartSession = (sessionId: string) => {
    const selectedDojo = dojos.find(dojo => dojo.session_id === sessionId);
    if (selectedDojo) {
      // Pass the session data to parent component
      onStartSession?.(sessionId, selectedDojo.session_name);
    }
  };

  // Filter and search dojos
  const filteredDojos = dojos.filter(dojo => {
    const matchesSearch = dojo.session_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || dojo.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const totalPages = Math.ceil(filteredDojos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDojos = filteredDojos.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

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
          <h1 className="font-cinzel text-4xl font-bold bg-gradient-to-r from-white via-emerald-200 to-emerald-400 bg-clip-text text-transparent">
            Study Dojos
          </h1>
          <p className="text-xl text-emerald-200 font-medium">
            Enter focused learning environments tailored to your mastery
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="group inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg font-semibold shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-1 transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          <span>Create New Dojo</span>
          <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-400" />
          <input
            type="text"
            placeholder="Search your dojos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gradient-to-r from-emerald-900/40 to-slate-900/40 backdrop-blur-sm border border-emerald-700/30 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-12 pr-8 py-3 bg-gradient-to-r from-emerald-900/40 to-slate-900/40 backdrop-blur-sm border border-emerald-700/30 rounded-lg text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-900/40 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-300 text-center">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredDojos.length === 0 && !error && (
        <div className="text-center py-20">
          <div className="w-32 h-32 mx-auto mb-6">
            <Lottie 
              animationData={senseiAnimation} 
              loop={true}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <h3 className="font-cinzel text-2xl font-semibold text-emerald-200 mb-4">
            {searchTerm || filterStatus !== 'all' ? 'No dojos found' : 'No dojos yet'}
          </h3>
          <p className="text-gray-300 mb-8 max-w-md mx-auto">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first dojo session to begin your learning journey'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="group inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg font-semibold shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-1 transition-all duration-300"
            >
              <Target className="w-5 h-5" />
              <span>Create Your First Dojo</span>
              <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
            </button>
          )}
        </div>
      )}

      {/* Dojos Grid */}
      {paginatedDojos.length > 0 && (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedDojos.map((dojo) => (
              <DojoCard
                key={dojo.session_id}
                session={dojo}
                onClick={() => handleStartSession(dojo.session_id)}
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
      {filteredDojos.length > 0 && (
        <div className="text-center text-gray-400 text-sm">
          Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredDojos.length)} of {filteredDojos.length} dojos
        </div>
      )}

      {/* Create Dojo Modal */}
      <CreateDojoModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onDojoCreated={handleDojoCreated}
        user={user}
      />
    </div>
  );
}