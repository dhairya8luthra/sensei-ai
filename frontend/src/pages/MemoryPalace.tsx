import { useState, useEffect } from 'react';
import { Brain, Plus, Search, Filter, Sparkles } from 'lucide-react';
import Lottie from 'lottie-react';
import senseiAnimation from '../data/senseiAnimation.json';
import CreateFlashcardModal from '../components/CreateFlashcardModal';
import FlashcardSetCard from '../components/FlashcardSetCard';
import FlashcardViewer from '../components/FlashcardViewer';
import Pagination from '../components/Pagination';

interface FlashcardSet {
  flashcard_set_id: string;
  session_id: string;
  title: string;
  created_at: string;
  flashcards?: Array<{ front: string; back: string }>; // Optional since the user-flashcards endpoint doesn't include full flashcards
  sources: Array<{ type: string; name: string }>;
  total_flashcards: number;
  preview?: { front: string; back: string } | null;
}

interface MemoryPalaceProps {
  user: any;
}

export default function MemoryPalace({ user }: MemoryPalaceProps) {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentFlashcardSet, setCurrentFlashcardSet] = useState<FlashcardSet | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [totalFlashcardSets, setTotalFlashcardSets] = useState(0);

  useEffect(() => {
    if (user) {
      fetchFlashcardSets();
    }
  }, [user, currentPage]);

  const fetchFlashcardSets = async (page = currentPage, search = searchTerm, filter = filterSource) => {
    if (!user) return;
    
    setLoading(true);
    setError('');

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      
      // Use the new user-flashcards endpoint with pagination
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString()
      });

      const url = `${backendUrl}/api/flashcards/user-flashcards/${user.id}`;
      console.log('Fetching flashcards from:', url);

      const response = await fetch(url);
      
      // Check if the response is actually JSON
      const contentType = response.headers.get('content-type');
      console.log('Response content-type:', contentType);
      console.log('Response status:', response.status);

      if (!response.ok) {
        // If it's an HTML error page, get the text
        if (contentType && contentType.includes('text/html')) {
          const htmlText = await response.text();
          console.error('HTML Error Response:', htmlText.substring(0, 500));
          throw new Error(`Server error (${response.status}): The API endpoint may not exist or the server is not running properly`);
        }
        
        // Try to parse as JSON for API errors
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch flashcard sets`);
        } catch (parseError) {
          throw new Error(`HTTP ${response.status}: Failed to fetch flashcard sets`);
        }
      }

      // Ensure we're getting JSON
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Non-JSON Response:', responseText.substring(0, 500));
        throw new Error('Server returned non-JSON response. Please check if the backend server is running correctly.');
      }

      const data = await response.json();
      console.log('Fetched flashcard sets:', data);
      
      setFlashcardSets(data.flashcard_sets || []);
      setTotalFlashcardSets(data.total_flashcard_sets || 0);
      
    } catch (err: any) {
      console.error('Error fetching flashcard sets:', err);
      
      // Provide more specific error messages
      let errorMessage = err.message;
      
      if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server. Please check if the backend is running on http://localhost:3000';
      } else if (err.message.includes('DOCTYPE')) {
        errorMessage = 'Server returned HTML instead of JSON. The API endpoint may not exist or there\'s a server configuration issue.';
      }
      
      setError(errorMessage);
      setFlashcardSets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFlashcardsCreated = (flashcardData: any) => {
    // Add the new flashcard set to the beginning of the list
    const newFlashcardSet: FlashcardSet = {
      flashcard_set_id: flashcardData.flashcard_set_id,
      session_id: flashcardData.session_id,
      title: flashcardData.title,
      created_at: flashcardData.created_at,
      flashcards: flashcardData.flashcards,
      sources: flashcardData.sources,
      total_flashcards: flashcardData.flashcards?.length || 0,
      preview: flashcardData.flashcards?.[0] || null
    };
    
    setFlashcardSets(prev => [newFlashcardSet, ...prev]);
    setTotalFlashcardSets(prev => prev + 1);
  };

  const handleStartStudy = async (flashcardSetId: string) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const url = `${backendUrl}/api/flashcards/flashcard-set/${flashcardSetId}?user_id=${user.id}`;
      console.log('Fetching flashcard set from:', url);
      
      const response = await fetch(url);
      
      // Check content type
      const contentType = response.headers.get('content-type');
      if (!response.ok || !contentType?.includes('application/json')) {
        const responseText = await response.text();
        console.error('Error response:', responseText.substring(0, 500));
        throw new Error('Failed to fetch flashcard set');
      }

      const data = await response.json();

      const flashcardSet: FlashcardSet = {
        flashcard_set_id: data.flashcard_set_id,
        session_id: data.session_id,
        title: data.title,
        created_at: data.created_at,
        flashcards: data.flashcards,
        sources: data.sources,
        total_flashcards: data.flashcards?.length || 0
      };

      setCurrentFlashcardSet(flashcardSet);
    } catch (err: any) {
      console.error('Error starting study:', err);
      setError(err.message || 'Failed to start study session');
    }
  };

  const handleStudyComplete = (results: any) => {
    console.log('Study session completed:', results);
    setCurrentFlashcardSet(null);
    // Here you could save the study results to the backend
  };

  // Client-side filtering (since we're using server-side pagination, we might want to implement server-side filtering too)
  const filteredFlashcardSets = flashcardSets.filter(set => {
    const matchesSearch = set.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSource === 'all' || 
      set.sources.some(source => source.type.toLowerCase() === filterSource.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  // Handle search and filter changes
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (currentPage === 1) {
        fetchFlashcardSets(1, searchTerm, filterSource);
      } else {
        setCurrentPage(1); // This will trigger fetchFlashcardSets via the useEffect dependency
      }
    }, 300); // Debounce search

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, filterSource]);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Calculate pagination based on server response
  const totalPages = Math.ceil(totalFlashcardSets / itemsPerPage);

  // Show flashcard viewer if a set is selected
  if (currentFlashcardSet) {
    return (
      <FlashcardViewer
        flashcards={currentFlashcardSet.flashcards || []}
        title={currentFlashcardSet.title}
        onComplete={handleStudyComplete}
        onBack={() => setCurrentFlashcardSet(null)}
      />
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
          <h1 className="font-cinzel text-4xl font-bold bg-gradient-to-r from-white via-emerald-200 to-emerald-400 bg-clip-text text-transparent">
            Memory Palace
          </h1>
          <p className="text-xl text-emerald-200 font-medium">
            Master knowledge through spaced repetition and active recall
          </p>
          {totalFlashcardSets > 0 && (
            <p className="text-emerald-300 text-sm">
              {totalFlashcardSets} memory card sets in your collection
            </p>
          )}
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="group inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg font-semibold shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-1 transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          <span>Create Memory Cards</span>
          <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-400" />
          <input
            type="text"
            placeholder="Search your memory cards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gradient-to-r from-emerald-900/40 to-slate-900/40 backdrop-blur-sm border border-emerald-700/30 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-400" />
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="pl-12 pr-8 py-3 bg-gradient-to-r from-emerald-900/40 to-slate-900/40 backdrop-blur-sm border border-emerald-700/30 rounded-lg text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 appearance-none cursor-pointer"
          >
            <option value="all">All Sources</option>
            <option value="pdf">PDF</option>
            <option value="youtube">YouTube</option>
            <option value="text">Text</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-900/40 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-300 text-center font-medium mb-2">⚠️ Error Loading Flashcards</p>
          <p className="text-red-200 text-center text-sm mb-4">{error}</p>
          <div className="flex flex-col items-center gap-2">
            <button 
              onClick={() => fetchFlashcardSets()}
              className="text-red-200 hover:text-white underline text-sm"
            >
              Try again
            </button>
            <p className="text-red-300 text-xs">
              Make sure your backend server is running on http://localhost:3000
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredFlashcardSets.length === 0 && !error && (
        <div className="text-center py-20">
          <div className="w-32 h-32 mx-auto mb-6">
            <Lottie 
              animationData={senseiAnimation} 
              loop={true}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <h3 className="font-cinzel text-2xl font-semibold text-emerald-200 mb-4">
            {searchTerm || filterSource !== 'all' ? 'No memory cards found' : 'No memory cards yet'}
          </h3>
          <p className="text-gray-300 mb-8 max-w-md mx-auto">
            {searchTerm || filterSource !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first set of memory cards to begin building your knowledge palace'
            }
          </p>
          {!searchTerm && filterSource === 'all' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="group inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg font-semibold shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-1 transition-all duration-300"
            >
              <Brain className="w-5 h-5" />
              <span>Create Your First Memory Cards</span>
              <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
            </button>
          )}
        </div>
      )}

      {/* Flashcard Sets Grid */}
      {filteredFlashcardSets.length > 0 && (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFlashcardSets.map((flashcardSet) => (
              <FlashcardSetCard
                key={flashcardSet.flashcard_set_id}
                flashcardSet={{
                  ...flashcardSet,
                  flashcards: flashcardSet.flashcards || [] // Ensure flashcards is always an array
                }}
                onStartStudy={handleStartStudy}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Results Summary */}
      {filteredFlashcardSets.length > 0 && (
        <div className="text-center text-gray-400 text-sm">
          Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalFlashcardSets)} of {totalFlashcardSets} memory card sets
        </div>
      )}

      {/* Create Flashcard Modal */}
      <CreateFlashcardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onFlashcardsCreated={handleFlashcardsCreated}
        user={user}
        sessionId={`session-${Date.now()}`} // Generate a new session ID for flashcards
      />
    </div>
  );
}