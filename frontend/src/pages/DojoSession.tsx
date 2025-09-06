import  { useState, useEffect } from 'react';
import { ArrowLeft, Sword, Sparkles } from 'lucide-react';
import Lottie from 'lottie-react';
import senseiAnimation from '../data/senseiAnimation.json';
import StarryBackground from '../components/StarryBackground';
import ScrollingParticles from '../components/ScrollingParticles';
import CreateTrainingModal from '../components/CreateTrainingModal';
import TrainingCard from '../components/TrainingCard';
import QuizInterface from '../components/QuizInterface';

interface DojoSessionProps {
  sessionId: string;
  sessionName: string;
  user: any;
  onBackToDojos: () => void;
}

interface Quiz {
  id: string;
  quizId: string;
  sessionId: string;
  userId: string;
  quiz: Array<{
    quizId: string;
    question: string;
    options: string[];
  }>;
  createdAt: string;
  fileName: string;
}

interface Training {
  quizId: string;
  fileName: string;
  createdAt: string;
  status: string;
  questionsCount?: number;
}

export default function DojoSession({ sessionId, sessionName, user, onBackToDojos }: DojoSessionProps) {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [showEntryAnimation, setShowEntryAnimation] = useState(true);

  useEffect(() => {
    // Show entry animation for 2 seconds
    const timer = setTimeout(() => {
      setShowEntryAnimation(false);
      fetchTrainings();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const fetchTrainings = async () => {
    setLoading(true);
    setError('');

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${backendUrl}/api/session-quizzes/${sessionId}`);
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch trainings');
      }

      // Transform quiz data to training format
      const transformedTrainings: Training[] = data.quizzes.map((quiz: Quiz) => ({
        quizId: quiz.quizId,
        fileName: quiz.fileName,
        createdAt: quiz.createdAt,
        status: 'completed', // You can add logic to determine status
        questionsCount: quiz.quiz.length
      }));

      setTrainings(transformedTrainings);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch trainings');
    } finally {
      setLoading(false);
    }
  };

  const handleTrainingCreated = (quizData: any) => {
    setCurrentQuiz(quizData);
    fetchTrainings();
  };

  const handleStartTraining = async (quizId: string) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${backendUrl}/api/session-quizzes/${sessionId}`);
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch quiz data');
      }

      // Find the specific quiz and format it for the QuizInterface
      const selectedQuiz = data.quizzes.find((quiz: Quiz) => quiz.quizId === quizId);
      
      if (selectedQuiz) {
        const formattedQuizData = {
          quizzes: [
            {
              fileName: selectedQuiz.fileName,
              quiz: selectedQuiz.quiz.map((q: any) => ({
                question: q.question,
                options: q.options
              })),
              quizId: selectedQuiz.quizId
            }
          ]
        };
        setCurrentQuiz(formattedQuizData);
      } else {
        setError('Quiz not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start training');
    }
  };

  const handleQuizComplete = (results: any) => {
    console.log('Quiz completed:', results);
    setCurrentQuiz(null);
    fetchTrainings();
  };

  // Entry Animation
  if (showEntryAnimation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-800 text-white relative overflow-hidden">
        <StarryBackground />
        <ScrollingParticles />
        
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center animate-in fade-in-0 zoom-in-95 duration-1000">
            <div className="w-40 h-40 mx-auto mb-8">
              <Lottie 
                animationData={senseiAnimation} 
                loop={true}
                style={{ width: '100%', height: '100%' }}
                className="drop-shadow-3xl"
              />
            </div>
            <h1 className="font-cinzel text-5xl font-bold bg-gradient-to-r from-white via-emerald-200 to-emerald-400 bg-clip-text text-transparent mb-4">
              Entering Dojo
            </h1>
            <h2 className="font-cinzel text-2xl text-emerald-200 font-medium mb-8">
              {sessionName}
            </h2>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Interface
  if (currentQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-800 text-white relative overflow-hidden">
        <StarryBackground />
        <ScrollingParticles />
        
        <div className="relative z-10 min-h-screen p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setCurrentQuiz(null)}
              className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Training</span>
            </button>
            
            <h1 className="font-cinzel text-2xl font-semibold text-emerald-200">
              {sessionName}
            </h1>
          </div>

          <QuizInterface 
            quizData={currentQuiz} 
            sessionId={sessionId}
            onQuizComplete={handleQuizComplete}
          />
        </div>
      </div>
    );
  }

  // Main Dojo Session Interface
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-800 text-white relative overflow-hidden">
      <StarryBackground />
      <ScrollingParticles />
      
      <div className="relative z-10 min-h-screen p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBackToDojos}
            className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dojos</span>
          </button>
          
          <h1 className="font-cinzel text-3xl font-semibold text-emerald-200">
            {sessionName}
          </h1>
          
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        {/* Create New Training Button */}
        <div className="flex justify-center mb-12">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="group inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg font-semibold shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-1 transition-all duration-300"
          >
            <Sword className="w-6 h-6" />
            <span>Create New Training</span>
            <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-900/40 border border-red-500/50 rounded-lg p-4 mb-8">
            <p className="text-red-300 text-center">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-32 h-32">
              <Lottie 
                animationData={senseiAnimation} 
                loop={true}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </div>
        )}

        {/* Trainings List */}
        {!loading && (
          <>
            <div className="mb-8">
              <h2 className="font-cinzel text-2xl font-semibold text-emerald-200 mb-6">
                Past Trainings
              </h2>
              
              {trainings.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-32 h-32 mx-auto mb-6">
                    <Lottie 
                      animationData={senseiAnimation} 
                      loop={true}
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                  <h3 className="font-cinzel text-xl font-semibold text-emerald-200 mb-4">
                    No trainings yet
                  </h3>
                  <p className="text-gray-300 mb-8 max-w-md mx-auto">
                    Create your first training session to begin your learning journey in this dojo
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trainings.map((training) => (
                    <TrainingCard
                      key={training.quizId}
                      training={training}
                      onStartTraining={handleStartTraining}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Create Training Modal */}
        <CreateTrainingModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onTrainingCreated={handleTrainingCreated}
          user={user}
          sessionId={sessionId}
        />
      </div>
    </div>
  );
}