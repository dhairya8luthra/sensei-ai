import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Brain, CheckCircle, XCircle, Clock, Shuffle } from 'lucide-react';

interface Flashcard {
  front: string;
  back: string;
}

interface FlashcardViewerProps {
  flashcards: Flashcard[];
  title: string;
  onComplete: (results: any) => void;
  onBack: () => void;
}

export default function FlashcardViewer({ flashcards, title, onComplete, onBack }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyMode, setStudyMode] = useState<'review' | 'spaced'>('review');
  const [spacedRepetitionData, setSpacedRepetitionData] = useState<Record<number, {
    difficulty: number;
    nextReview: Date;
    interval: number;
    repetitions: number;
  }>>({});
  const [sessionResults, setSessionResults] = useState<Record<number, 'easy' | 'medium' | 'hard' | 'again'>>({});
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);

  useEffect(() => {
    // Initialize spaced repetition data
    const initialData: Record<number, any> = {};
    flashcards.forEach((_, index) => {
      initialData[index] = {
        difficulty: 2.5,
        nextReview: new Date(),
        interval: 1,
        repetitions: 0
      };
    });
    setSpacedRepetitionData(initialData);

    // Initialize shuffled indices
    const indices = flashcards.map((_, index) => index);
    setShuffledIndices(indices);
  }, [flashcards]);

  const getCurrentCardIndex = () => {
    return isShuffled ? shuffledIndices[currentIndex] : currentIndex;
  };

  const currentCard = flashcards[getCurrentCardIndex()];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...shuffledIndices].sort(() => Math.random() - 0.5);
    setShuffledIndices(shuffled);
    setIsShuffled(true);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleSpacedRepetitionResponse = (difficulty: 'again' | 'hard' | 'medium' | 'easy') => {
    const cardIndex = getCurrentCardIndex();
    const currentData = spacedRepetitionData[cardIndex];
    
    let newInterval = currentData.interval;
    let newRepetitions = currentData.repetitions;
    let newDifficulty = currentData.difficulty;

    // SM-2 Algorithm implementation
    switch (difficulty) {
      case 'again':
        newInterval = 1;
        newRepetitions = 0;
        break;
      case 'hard':
        newInterval = Math.max(1, Math.round(currentData.interval * 1.2));
        newDifficulty = Math.max(1.3, currentData.difficulty - 0.15);
        newRepetitions = currentData.repetitions + 1;
        break;
      case 'medium':
        newInterval = Math.round(currentData.interval * newDifficulty);
        newRepetitions = currentData.repetitions + 1;
        break;
      case 'easy':
        newInterval = Math.round(currentData.interval * newDifficulty * 1.3);
        newDifficulty = currentData.difficulty + 0.15;
        newRepetitions = currentData.repetitions + 1;
        break;
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newInterval);

    setSpacedRepetitionData(prev => ({
      ...prev,
      [cardIndex]: {
        difficulty: newDifficulty,
        nextReview,
        interval: newInterval,
        repetitions: newRepetitions
      }
    }));

    setSessionResults(prev => ({
      ...prev,
      [cardIndex]: difficulty
    }));

    // Auto-advance to next card
    setTimeout(() => {
      if (currentIndex < flashcards.length - 1) {
        handleNext();
      } else {
        // Session complete
        handleComplete();
      }
    }, 500);
  };

  const handleComplete = () => {
    const results = {
      totalCards: flashcards.length,
      sessionResults,
      spacedRepetitionData,
      studyMode,
      completedAt: new Date().toISOString()
    };
    onComplete(results);
  };

  const getDifficultyColor = (difficulty: 'again' | 'hard' | 'medium' | 'easy') => {
    switch (difficulty) {
      case 'again': return 'bg-red-600 hover:bg-red-700';
      case 'hard': return 'bg-orange-600 hover:bg-orange-700';
      case 'medium': return 'bg-yellow-600 hover:bg-yellow-700';
      case 'easy': return 'bg-green-600 hover:bg-green-700';
    }
  };

  const getProgressStats = () => {
    const total = flashcards.length;
    const reviewed = Object.keys(sessionResults).length;
    const easy = Object.values(sessionResults).filter(r => r === 'easy').length;
    const medium = Object.values(sessionResults).filter(r => r === 'medium').length;
    const hard = Object.values(sessionResults).filter(r => r === 'hard').length;
    const again = Object.values(sessionResults).filter(r => r === 'again').length;

    return { total, reviewed, easy, medium, hard, again };
  };

  const stats = getProgressStats();

  if (!currentCard) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-2xl p-8 border border-emerald-700/30">
          <Brain className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
          <h2 className="font-cinzel text-2xl font-semibold text-emerald-200 mb-4">
            No flashcards available
          </h2>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg font-semibold hover:from-emerald-500 hover:to-emerald-600 transition-all duration-300"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 transition-colors duration-200"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to Memory Palace</span>
        </button>
        
        <h1 className="font-cinzel text-2xl font-semibold text-emerald-200">
          {title}
        </h1>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={handleShuffle}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              isShuffled 
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/50' 
                : 'bg-slate-800/50 text-gray-400 border border-slate-700/30 hover:border-emerald-500/50'
            }`}
          >
            <Shuffle className="w-4 h-4" />
            <span>Shuffle</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-4 border border-emerald-700/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-emerald-200 font-medium">
            Card {currentIndex + 1} of {flashcards.length}
          </span>
          <span className="text-gray-400 text-sm">
            {stats.reviewed} reviewed
          </span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Study Mode Toggle */}
      <div className="flex justify-center">
        <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-lg p-1 border border-emerald-700/30">
          <button
            onClick={() => setStudyMode('review')}
            className={`px-4 py-2 rounded-md font-medium transition-all duration-300 ${
              studyMode === 'review'
                ? 'bg-emerald-600 text-white'
                : 'text-emerald-200 hover:text-emerald-100'
            }`}
          >
            Review Mode
          </button>
          <button
            onClick={() => setStudyMode('spaced')}
            className={`px-4 py-2 rounded-md font-medium transition-all duration-300 ${
              studyMode === 'spaced'
                ? 'bg-emerald-600 text-white'
                : 'text-emerald-200 hover:text-emerald-100'
            }`}
          >
            Spaced Repetition
          </button>
        </div>
      </div>

      {/* Flashcard */}
      <div className="relative">
        <div 
          className={`flashcard-container ${isFlipped ? 'flipped' : ''}`}
          onClick={handleFlip}
        >
          {/* Front */}
          <div className="flashcard-face flashcard-front bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-2xl p-8 border border-emerald-700/30 cursor-pointer hover:border-emerald-500/50 transition-all duration-300">
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <Brain className="w-12 h-12 text-emerald-400 mx-auto mb-6" />
                <h2 className="font-cinzel text-2xl font-semibold text-emerald-200 mb-4">
                  {currentCard.front}
                </h2>
                <p className="text-gray-400 text-sm">
                  Click to reveal answer
                </p>
              </div>
            </div>
          </div>

          {/* Back */}
          <div className="flashcard-face flashcard-back bg-gradient-to-br from-slate-900/40 to-emerald-900/40 backdrop-blur-sm rounded-2xl p-8 border border-emerald-700/30 cursor-pointer hover:border-emerald-500/50 transition-all duration-300">
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-6" />
                <div className="text-emerald-200 text-lg leading-relaxed">
                  {currentCard.back}
                </div>
                <p className="text-gray-400 text-sm mt-4">
                  Click to flip back
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      {studyMode === 'review' ? (
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center space-x-2 px-6 py-3 border-2 border-emerald-400/50 text-emerald-400 rounded-lg font-semibold hover:bg-emerald-400/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleFlip}
            className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg font-semibold shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-1 transition-all duration-300"
          >
            <span className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              {isFlipped ? 'Flip to Front' : 'Reveal Answer'}
            </span>
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg font-semibold shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Next</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      ) : (
        // Spaced Repetition Controls
        isFlipped && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => handleSpacedRepetitionResponse('again')}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${getDifficultyColor('again')}`}
            >
              <XCircle className="w-5 h-5" />
              <span>Again</span>
            </button>
            <button
              onClick={() => handleSpacedRepetitionResponse('hard')}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${getDifficultyColor('hard')}`}
            >
              <Clock className="w-5 h-5" />
              <span>Hard</span>
            </button>
            <button
              onClick={() => handleSpacedRepetitionResponse('medium')}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${getDifficultyColor('medium')}`}
            >
              <Brain className="w-5 h-5" />
              <span>Good</span>
            </button>
            <button
              onClick={() => handleSpacedRepetitionResponse('easy')}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${getDifficultyColor('easy')}`}
            >
              <CheckCircle className="w-5 h-5" />
              <span>Easy</span>
            </button>
          </div>
        )
      )}

      {/* Session Stats */}
      {stats.reviewed > 0 && (
        <div className="bg-gradient-to-br from-slate-900/40 to-emerald-900/40 backdrop-blur-sm rounded-xl p-6 border border-emerald-700/30">
          <h3 className="font-cinzel text-lg font-semibold text-emerald-200 mb-4">Session Progress</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{stats.easy}</div>
              <div className="text-sm text-gray-400">Easy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{stats.medium}</div>
              <div className="text-sm text-gray-400">Good</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{stats.hard}</div>
              <div className="text-sm text-gray-400">Hard</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{stats.again}</div>
              <div className="text-sm text-gray-400">Again</div>
            </div>
          </div>
        </div>
      )}

      {/* Complete Session Button */}
      {currentIndex === flashcards.length - 1 && (
        <div className="text-center">
          <button
            onClick={handleComplete}
            className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg font-semibold text-lg shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-1 transition-all duration-300"
          >
            Complete Session
          </button>
        </div>
      )}

      <style>{`
        .flashcard-container {
          perspective: 1000px;
          height: 400px;
        }
        
        .flashcard-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          transition: transform 0.6s ease-in-out;
        }
        
        .flashcard-front {
          transform: rotateY(0deg);
        }
        
        .flashcard-back {
          transform: rotateY(180deg);
        }
        
        .flashcard-container.flipped .flashcard-front {
          transform: rotateY(-180deg);
        }
        
        .flashcard-container.flipped .flashcard-back {
          transform: rotateY(0deg);
        }
      `}</style>
    </div>
  );
}