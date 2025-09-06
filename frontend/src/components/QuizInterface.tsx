import { useState, useEffect } from 'react';
import { Clock, CheckCircle,  RotateCcw, Timer } from 'lucide-react';

interface Quiz {
  fileName: string;
  quiz: Array<{
    question: string;
    options: string[];
  }>;
  quizId: string;
}

interface QuizInterfaceProps {
  quizData: {
    quizzes: Quiz[];
  };
  onQuizComplete: (results: any) => void;
}

export default function QuizInterface({ quizData, onQuizComplete }: QuizInterfaceProps) {
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [customTime, setCustomTime] = useState(30);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const currentQuiz = quizData.quizzes[currentQuizIndex];
  const currentQuestion = currentQuiz?.quiz[currentQuestionIndex];
  const totalQuestions = quizData.quizzes.reduce((sum, quiz) => sum + quiz.quiz.length, 0);
  const answeredQuestions = Object.keys(answers).length;

  // Timer effect
  useEffect(() => {
    if (timerEnabled && timeLeft !== null && timeLeft > 0 && quizStarted) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, timerEnabled, quizStarted]);

  const handleStartQuiz = () => {
    setQuizStarted(true);
    if (timerEnabled) {
      setTimeLeft(customTime * 60); // Convert minutes to seconds
    }
  };

  const handleAnswerSelect = (answer: string) => {
    const questionKey = `${currentQuizIndex}-${currentQuestionIndex}`;
    setAnswers(prev => ({
      ...prev,
      [questionKey]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentQuiz.quiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentQuizIndex < quizData.quizzes.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setCurrentQuestionIndex(0);
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentQuizIndex > 0) {
      setCurrentQuizIndex(currentQuizIndex - 1);
      setCurrentQuestionIndex(quizData.quizzes[currentQuizIndex - 1].quiz.length - 1);
    }
  };

  const handleAutoSubmit = () => {
    handleSubmitQuiz();
  };

  const handleSubmitQuiz = () => {
    setShowResults(true);
    onQuizComplete({
      answers,
      totalQuestions,
      answeredQuestions,
      timeUsed: timerEnabled ? (customTime * 60 - (timeLeft || 0)) : null
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentQuestionNumber = () => {
    let questionNumber = 1;
    for (let i = 0; i < currentQuizIndex; i++) {
      questionNumber += quizData.quizzes[i].quiz.length;
    }
    return questionNumber + currentQuestionIndex;
  };

  if (!quizStarted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-2xl p-8 border border-emerald-700/30">
          <div className="text-center mb-8">
            <h2 className="font-cinzel text-3xl font-semibold text-emerald-200 mb-4">
              Ready to Begin Training?
            </h2>
            <p className="text-gray-300 text-lg">
              You have {totalQuestions} questions across {quizData.quizzes.length} materials
            </p>
          </div>

          {/* Timer Settings */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <input
                type="checkbox"
                id="enableTimer"
                checked={timerEnabled}
                onChange={(e) => setTimerEnabled(e.target.checked)}
                className="w-5 h-5 text-emerald-600 bg-slate-800 border-emerald-700 rounded focus:ring-emerald-500 focus:ring-2"
              />
              <label htmlFor="enableTimer" className="text-emerald-200 font-medium">
                Enable Timer
              </label>
            </div>

            {timerEnabled && (
              <div className="flex items-center space-x-4">
                <Timer className="w-5 h-5 text-emerald-400" />
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={customTime}
                  onChange={(e) => setCustomTime(parseInt(e.target.value) || 30)}
                  className="w-20 px-3 py-2 bg-slate-800/50 border border-emerald-700/30 rounded-lg text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                />
                <span className="text-gray-300">minutes</span>
              </div>
            )}
          </div>

          <button
            onClick={handleStartQuiz}
            className="w-full group px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg font-semibold text-lg shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-1 transition-all duration-300"
          >
            <span className="flex items-center justify-center gap-2">
              Begin Training
              <CheckCircle className="w-5 h-5 group-hover:animate-pulse" />
            </span>
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-2xl p-8 border border-emerald-700/30 text-center">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
          <h2 className="font-cinzel text-3xl font-semibold text-emerald-200 mb-4">
            Training Complete!
          </h2>
          <div className="space-y-4 text-lg">
            <p className="text-gray-300">
              Questions Answered: <span className="text-emerald-400 font-semibold">{answeredQuestions}/{totalQuestions}</span>
            </p>
            {timerEnabled && (
              <p className="text-gray-300">
                Time Used: <span className="text-emerald-400 font-semibold">
                  {formatTime((customTime * 60) - (timeLeft || 0))}
                </span>
              </p>
            )}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-8 group px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg font-semibold shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-1 transition-all duration-300"
          >
            <span className="flex items-center justify-center gap-2">
              Start New Training
              <RotateCcw className="w-5 h-5 group-hover:animate-pulse" />
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Header */}
      <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-emerald-700/30 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-cinzel text-xl font-semibold text-emerald-200">
              {currentQuiz.fileName}
            </h3>
            <p className="text-gray-400">
              Question {getCurrentQuestionNumber()} of {totalQuestions}
            </p>
          </div>
          
          {timerEnabled && timeLeft !== null && (
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <span className={`text-lg font-mono font-semibold ${
                timeLeft < 60 ? 'text-red-400' : 'text-emerald-400'
              }`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-700/50 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(getCurrentQuestionNumber() / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-8 border border-emerald-700/30 mb-8">
        <h2 className="text-2xl font-semibold text-emerald-200 mb-8 leading-relaxed">
          {currentQuestion?.question}
        </h2>

        <div className="space-y-4">
          {currentQuestion?.options.map((option, index) => {
            const questionKey = `${currentQuizIndex}-${currentQuestionIndex}`;
            const isSelected = answers[questionKey] === option;
            
            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-300 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-600/20 text-emerald-200'
                    : 'border-emerald-700/30 bg-slate-800/30 text-gray-300 hover:border-emerald-500/50 hover:bg-emerald-900/20'
                }`}
              >
                <span className="text-lg">{option}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePreviousQuestion}
          disabled={currentQuizIndex === 0 && currentQuestionIndex === 0}
          className="px-6 py-3 border-2 border-emerald-400/50 text-emerald-400 rounded-lg font-semibold hover:bg-emerald-400/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <div className="text-center">
          <p className="text-gray-400 text-sm">
            {answeredQuestions} of {totalQuestions} answered
          </p>
        </div>

        {getCurrentQuestionNumber() === totalQuestions ? (
          <button
            onClick={handleSubmitQuiz}
            className="group px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg font-semibold shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-1 transition-all duration-300"
          >
            <span className="flex items-center gap-2">
              Submit Quiz
              <CheckCircle className="w-5 h-5 group-hover:animate-pulse" />
            </span>
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg font-semibold shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-1 transition-all duration-300"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}