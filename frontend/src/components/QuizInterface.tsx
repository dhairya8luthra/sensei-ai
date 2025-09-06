import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Clock, Award } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
}

interface Quiz {
  fileName: string;
  quiz: QuizQuestion[];
  quizId: string;
}

interface QuizData {
  quizzes: Quiz[];
}

interface QuizInterfaceProps {
  quizData: QuizData;
  onQuizComplete: (results: any) => void;
}

export default function QuizInterface({ quizData, onQuizComplete }: QuizInterfaceProps) {
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: string]: string}>({});
  const [showResults, setShowResults] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const currentQuiz = quizData?.quizzes?.[currentQuizIndex];
  const currentQuestion = currentQuiz?.quiz?.[currentQuestionIndex];
  const totalQuestions = currentQuiz?.quiz?.length || 0;

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answer: string) => {
    const questionKey = `${currentQuizIndex}-${currentQuestionIndex}`;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionKey]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentQuizIndex < quizData.quizzes.length - 1) {
      // Move to next quiz
      setCurrentQuizIndex(currentQuizIndex + 1);
      setCurrentQuestionIndex(0);
    } else {
      // All quizzes completed
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentQuizIndex > 0) {
      // Move to previous quiz
      setCurrentQuizIndex(currentQuizIndex - 1);
      const prevQuiz = quizData.quizzes[currentQuizIndex - 1];
      setCurrentQuestionIndex(prevQuiz.quiz.length - 1);
    }
  };

  const handleFinish = () => {
    const results = {
      totalQuestions: quizData.quizzes.reduce((total, quiz) => total + quiz.quiz.length, 0),
      answeredQuestions: Object.keys(selectedAnswers).length,
      timeElapsed,
      answers: selectedAnswers
    };
    onQuizComplete(results);
  };

  const getProgress = () => {
    const totalQuestions = quizData.quizzes.reduce((total, quiz) => total + quiz.quiz.length, 0);
    const currentProgress = quizData.quizzes.slice(0, currentQuizIndex).reduce((total, quiz) => total + quiz.quiz.length, 0) + currentQuestionIndex + 1;
    return (currentProgress / totalQuestions) * 100;
  };

  if (!quizData || !quizData.quizzes || quizData.quizzes.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-300 text-lg">No quiz data available</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    const totalQuestions = quizData.quizzes.reduce((total, quiz) => total + quiz.quiz.length, 0);
    const answeredQuestions = Object.keys(selectedAnswers).length;
    
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-20">
          <Award className="w-24 h-24 text-emerald-400 mx-auto mb-6" />
          <h2 className="font-cinzel text-3xl font-bold text-emerald-200 mb-4">
            Training Completed!
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mb-8 max-w-2xl mx-auto">
            <div className="bg-emerald-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-emerald-400">{answeredQuestions}</div>
              <div className="text-gray-300">Questions Answered</div>
            </div>
            <div className="bg-emerald-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-emerald-400">{totalQuestions}</div>
              <div className="text-gray-300">Total Questions</div>
            </div>
            <div className="bg-emerald-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-emerald-400">{formatTime(timeElapsed)}</div>
              <div className="text-gray-300">Time Elapsed</div>
            </div>
          </div>
          <button
            onClick={handleFinish}
            className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg font-semibold hover:from-emerald-500 hover:to-emerald-600 transition-all duration-300"
          >
            Complete Training
          </button>
        </div>
      </div>
    );
  }

  const questionKey = `${currentQuizIndex}-${currentQuestionIndex}`;
  const currentAnswer = selectedAnswers[questionKey];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-cinzel text-2xl font-bold text-emerald-200 mb-2">
          {currentQuiz.fileName}
        </h1>
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeElapsed)}</span>
          </div>
          <div>
            Quiz {currentQuizIndex + 1} of {quizData.quizzes.length}
          </div>
          <div>
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-2 mb-8">
        <div
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${getProgress()}%` }}
        ></div>
      </div>

      {/* Question */}
      <div className="bg-gradient-to-br from-emerald-900/20 to-slate-900/40 backdrop-blur-sm rounded-xl p-8 border border-emerald-700/30 mb-8">
        <h2 className="font-cinzel text-xl font-semibold text-emerald-200 mb-6">
          {currentQuestion?.question}
        </h2>

        <div className="space-y-4">
          {currentQuestion?.options?.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              className={`w-full text-left p-4 rounded-lg border transition-all duration-300 ${
                currentAnswer === option
                  ? 'border-emerald-500 bg-emerald-900/30 text-emerald-200'
                  : 'border-emerald-700/30 bg-slate-900/40 text-gray-300 hover:border-emerald-600/50 hover:bg-emerald-900/20'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuizIndex === 0 && currentQuestionIndex === 0}
          className="px-6 py-3 bg-slate-700 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
        >
          Previous
        </button>

        <span className="text-gray-400">
          {Object.keys(selectedAnswers).length} / {quizData.quizzes.reduce((total, quiz) => total + quiz.quiz.length, 0)} answered
        </span>

        <button
          onClick={handleNext}
          disabled={!currentAnswer}
          className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-emerald-500 hover:to-emerald-600 transition-all duration-300"
        >
          {currentQuizIndex === quizData.quizzes.length - 1 && currentQuestionIndex === totalQuestions - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
}