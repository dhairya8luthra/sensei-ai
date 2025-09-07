import  { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, RotateCcw, Timer, TrendingUp, BookOpen, AlertTriangle, Lightbulb, X } from 'lucide-react';

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
  sessionId?: string;
  onQuizComplete: (results: any) => void;
}

export default function QuizInterface({ quizData, sessionId, onQuizComplete }: QuizInterfaceProps) {
  const [_, setComponentError] = useState<string | null>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [customTime, setCustomTime] = useState(30);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationResults, setValidationResults] = useState<any>(null);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  
  // Add error handling for the component
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('QuizInterface runtime error:', error);
      setComponentError('A runtime error occurred in the quiz interface');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Safe calculation of total questions with error handling
  const getTotalQuestions = () => {
    try {
      if (!quizData?.quizzes) return 0;
      return quizData.quizzes.reduce((sum, quiz) => {
        return sum + (quiz?.quiz?.length || 0);
      }, 0);
    } catch (error) {
      console.error('Error calculating total questions:', error);
      return 0;
    }
  };

  const currentQuiz = quizData?.quizzes?.[currentQuizIndex];
  const currentQuestion = currentQuiz?.quiz?.[currentQuestionIndex];
  const totalQuestions = getTotalQuestions();
  const answeredQuestions = Object.keys(answers).length;

  // Timer effect
  useEffect(() => {
    if (timerEnabled && timeLeft !== null && timeLeft > 0 && quizStarted && !showResults) {
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
  }, [timeLeft, timerEnabled, quizStarted, showResults]);

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

  const handleSubmitQuiz = async () => {
    if (submitting) return; // Prevent double submission
    
    console.log('=== STARTING QUIZ SUBMISSION ===');
    setSubmitting(true);
    
    try {
      // Prepare answers in the format expected by the API
      const solution = Object.entries(answers).map(([questionKey, userAnswer]) => {
        try {
          const [quizIndex, questionIndex] = questionKey.split('-').map(Number);
          
          if (isNaN(quizIndex) || isNaN(questionIndex)) {
            console.warn(`Invalid question key format: ${questionKey}`);
            return null;
          }
          
          const quiz = quizData?.quizzes?.[quizIndex];
          const question = quiz?.quiz?.[questionIndex];
          
          if (!question || !question.question) {
            console.warn(`Question not found for key: ${questionKey}`);
            return null;
          }
          
          // Extract just the letter from the user's answer (A, B, C, D)
          const answerLetter = userAnswer.split('.')[0].trim();
          
          return {
            question: question.question,
            solution: answerLetter
          };
        } catch (err) {
          console.error(`Error processing answer for key ${questionKey}:`, err);
          return null;
        }
      }).filter(item => item !== null);

      if (solution.length === 0) {
        throw new Error('No valid answers to submit');
      }

      console.log('Submitting solution:', solution);

      // Submit to the correct API endpoint
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${backendUrl}/api/calculate-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          quiz_id: currentQuiz?.quizId,
          solution: solution
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const validationData = await response.json();
      console.log('=== VALIDATION DATA RECEIVED ===');
      console.log('Validation results:', validationData);
      
      setValidationResults(validationData);
      
    } catch (error) {
      console.error('Error submitting quiz:', error);
      
      // Create fallback results
      const fallbackResults = {
        score: answeredQuestions,
        insights: 'Unable to validate answers at this time. Please try again later.'
      };
      setValidationResults(fallbackResults);
    } finally {
      console.log('=== SETTING SHOW RESULTS TO TRUE ===');
      setSubmitting(false);
      setShowResults(true);
      
      // Show insights modal after a short delay
      setTimeout(() => {
        setShowInsightsModal(true);
      }, 1000);
    }
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

  // Enhanced insights rendering function
  const renderInsights = (insights: string) => {
    try {
      if (!insights) {
        console.log('No insights provided');
        return (
          <div className="bg-slate-900/40 border border-slate-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <BookOpen className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
              <p className="text-slate-300">No insights available for this quiz.</p>
            </div>
          </div>
        );
      }

      console.log('Raw insights:', insights);
      console.log('Insights type:', typeof insights);

      // Handle case where insights might be an object instead of string
      let insightsText = insights;
      if (typeof insights === 'object') {
        insightsText = JSON.stringify(insights, null, 2);
      }

      // Split by various delimiters to handle different insight formats
      const lines = insightsText.split(/\n|\\n|\r\n/).filter(line => line.trim());
      
      console.log('Processed lines:', lines);

      if (lines.length === 0) {
        return (
          <div className="bg-slate-900/40 border border-slate-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <BookOpen className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
              <p className="text-slate-300">No specific insights available for this quiz.</p>
            </div>
          </div>
        );
      }
      
      return (
        <div className="space-y-4 text-left">
          {lines.map((line: string, index: number) => {
            const trimmedLine = line.trim();
            
            // Skip empty lines
            if (!trimmedLine) return null;

            // Handle different types of insights
            if (trimmedLine.toLowerCase().includes('wrong answer') || trimmedLine.startsWith('❌')) {
              return (
                <div key={index} className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-red-300 font-medium">
                        {trimmedLine.replace(/wrong answer:?/i, '').replace('❌', '').trim()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
            
            if (trimmedLine.toLowerCase().includes('recommendation') || trimmedLine.startsWith('💡')) {
              return (
                <div key={index} className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Lightbulb className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-blue-200 font-medium mb-1">Recommendation:</p>
                      <p className="text-blue-300">
                        {trimmedLine.replace(/recommendation:?/i, '').replace('💡', '').trim()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            if (trimmedLine.toLowerCase().includes('overall') || trimmedLine.toLowerCase().includes('summary')) {
              return (
                <div key={index} className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4 mt-6">
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-emerald-200 font-medium mb-2">Overall Assessment:</p>
                      <p className="text-emerald-300">
                        {trimmedLine.replace(/overall recommendation:?/i, '').replace(/summary:?/i, '').trim()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            if (trimmedLine.toLowerCase().includes('correct') || trimmedLine.startsWith('✅')) {
              return (
                <div key={index} className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-green-300">
                        {trimmedLine.replace('✅', '').trim()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            // Default insight formatting - show all content
            return (
              <div key={index} className="bg-slate-900/40 border border-slate-500/30 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <BookOpen className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <p className="text-slate-300">{trimmedLine}</p>
                </div>
              </div>
            );
          })}
        </div>
      );
    } catch (error) {
      console.error('Error rendering insights:', error);
      return (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-300 font-medium mb-2">Error displaying insights</p>
              <p className="text-red-400 text-sm">Raw data: {JSON.stringify(insights)}</p>
            </div>
          </div>
        </div>
      );
    }
  };

  // Insights Modal Component
  const InsightsModal = () => {
    if (!showInsightsModal || !validationResults) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-slate-900 to-emerald-900/20 rounded-2xl p-8 border border-emerald-700/30 max-w-2xl max-h-[80vh] overflow-y-auto relative">
          {/* Close Button */}
          <button
            onClick={() => setShowInsightsModal(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Header */}
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="w-8 h-8 text-emerald-400" />
            <h3 className="font-cinzel text-3xl font-semibold text-emerald-200">
              Learning Insights
            </h3>
          </div>

          {/* Score Summary */}
          <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4 mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-2">
                {validationResults.score}/{totalQuestions}
              </div>
              <div className="text-lg text-emerald-300">
                Score: {Math.round((validationResults.score / totalQuestions) * 100)}%
              </div>
            </div>
          </div>

          {/* Insights Content */}
          <div className="mb-6">
            {validationResults.insights ? (
              renderInsights(validationResults.insights)
            ) : (
              <div className="bg-slate-900/40 border border-slate-500/30 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <BookOpen className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-300">No insights available for this quiz.</p>
                    <p className="text-slate-400 mt-2">
                      You scored {validationResults.score} out of {totalQuestions} questions correctly.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setShowInsightsModal(false)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg font-semibold hover:from-emerald-500 hover:to-emerald-600 transition-all duration-300"
            >
              Continue
            </button>
            <button
              onClick={() => {
                setShowInsightsModal(false);
                onQuizComplete({ 
                  completed: true,
                  answers,
                  totalQuestions,
                  answeredQuestions,
                  timeUsed: timerEnabled ? (customTime * 60 - (timeLeft || 0)) : null,
                  validationResults
                });
              }}
              className="px-6 py-3 border-2 border-emerald-400/50 text-emerald-400 rounded-lg font-semibold hover:bg-emerald-400/10 transition-all duration-300"
            >
              Back to Session
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Early validation - show error if data is invalid
  if (!quizData || !quizData.quizzes || quizData.quizzes.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-red-900/40 to-slate-900/40 backdrop-blur-sm rounded-2xl p-8 border border-red-700/30 text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-6" />
          <h2 className="font-cinzel text-2xl font-semibold text-red-200 mb-4">
            No Quiz Data
          </h2>
          <p className="text-gray-300 mb-6">No quiz data available. Please try again.</p>
          <button
            onClick={() => onQuizComplete({ error: 'No quiz data' })}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-lg font-semibold hover:from-red-500 hover:to-red-600 transition-all duration-300"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  console.log('=== RENDER STATE DEBUG ===');
  console.log('quizStarted:', quizStarted);
  console.log('showResults:', showResults);
  console.log('submitting:', submitting);
  console.log('validationResults:', validationResults);

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
    console.log('=== SHOWING RESULTS ===');
    console.log('ValidationResults in render:', validationResults);
    
    return (
      <>
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            {/* Score Card */}
            <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-2xl p-8 border border-emerald-700/30 text-center">
              <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
              <h2 className="font-cinzel text-3xl font-semibold text-emerald-200 mb-6">
                Training Complete!
              </h2>
              
              {/* Always show some score */}
              <div className="mb-6">
                {validationResults && validationResults.score !== undefined ? (
                  <>
                    <div className="text-6xl font-bold text-emerald-400 mb-2">
                      {validationResults.score}/{totalQuestions}
                    </div>
                    <div className="text-xl text-gray-300 mb-4">
                      Score: {Math.round((validationResults.score / totalQuestions) * 100)}%
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-6xl font-bold text-emerald-400 mb-2">
                      {answeredQuestions}/{totalQuestions}
                    </div>
                    <div className="text-xl text-gray-300 mb-4">
                      Questions Answered: {Math.round((answeredQuestions / totalQuestions) * 100)}%
                    </div>
                  </>
                )}
              </div>
              
              <div className="space-y-4 text-lg">
                <p className="text-gray-300">
                  Questions Answered: <span className="text-emerald-400 font-semibold">{answeredQuestions}/{totalQuestions}</span>
                </p>
                {timerEnabled && timeLeft !== null && (
                  <p className="text-gray-300">
                    Time Used: <span className="text-emerald-400 font-semibold">
                      {formatTime((customTime * 60) - timeLeft)}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="text-center space-y-4">
              {validationResults && validationResults.insights && (
                <button
                  onClick={() => setShowInsightsModal(true)}
                  className="group px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg font-semibold shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-1 transition-all duration-300 mr-4"
                >
                  <span className="flex items-center justify-center gap-2">
                    View Insights
                    <TrendingUp className="w-5 h-5 group-hover:animate-pulse" />
                  </span>
                </button>
              )}
              
              <button
                onClick={() => {
                  console.log('Back to session clicked');
                  onQuizComplete({ 
                    completed: true,
                    answers,
                    totalQuestions,
                    answeredQuestions,
                    timeUsed: timerEnabled ? (customTime * 60 - (timeLeft || 0)) : null,
                    validationResults
                  });
                }}
                className="group px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg font-semibold shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-1 transition-all duration-300"
              >
                <span className="flex items-center justify-center gap-2">
                  Back to Session
                  <RotateCcw className="w-5 h-5 group-hover:animate-pulse" />
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Insights Modal */}
        <InsightsModal />
      </>
    );
  }

  // Validate current question exists
  if (!currentQuestion || !currentQuestion.options || !Array.isArray(currentQuestion.options)) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-red-900/40 to-slate-900/40 backdrop-blur-sm rounded-2xl p-8 border border-red-700/30 text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-6" />
          <h2 className="font-cinzel text-2xl font-semibold text-red-200 mb-4">
            Invalid Question
          </h2>
          <p className="text-gray-300 mb-6">This question is malformed. Skipping to next question.</p>
          <button
            onClick={handleNextQuestion}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg font-semibold hover:from-emerald-500 hover:to-emerald-600 transition-all duration-300"
          >
            Skip Question
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
              {currentQuiz?.fileName || 'Quiz'}
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
            style={{ width: `${totalQuestions > 0 ? (getCurrentQuestionNumber() / totalQuestions) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-8 border border-emerald-700/30 mb-8">
        <h2 className="text-2xl font-semibold text-emerald-200 mb-8 leading-relaxed">
          {currentQuestion.question}
        </h2>

        <div className="space-y-4">
          {currentQuestion.options.map((option, index) => {
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
            disabled={submitting}
            className="group px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg font-semibold shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-1 transition-all duration-300"
          >
            <span className="flex items-center gap-2">
              {submitting ? 'Validating...' : 'Submit Quiz'}
              <CheckCircle className={`w-5 h-5 ${submitting ? 'animate-spin' : 'group-hover:animate-pulse'}`} />
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