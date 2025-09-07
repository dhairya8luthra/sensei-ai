import React, { useState, useRef } from 'react';
import { Eye, Upload, FileText, Sparkles, TrendingUp, Target, Brain, Clock, Award, BarChart3, Download, Share2 } from 'lucide-react';
import Lottie from 'lottie-react';
import senseiAnimation from '../data/senseiAnimation.json';

interface FrequentTopic {
  topic: string;
  frequency: number;
  importance: 'high' | 'medium' | 'low';
  description: string;
}

interface RepeatedConcept {
  concept: string;
  occurrences: number;
  difficulty_level: 'easy' | 'medium' | 'hard';
  keywords: string[];
}

interface QuestionPattern {
  pattern_type: string;
  description: string;
  examples: string[];
}

interface ExamQuestion {
  question_number: number;
  question_text: string;
  marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

interface ExamSection {
  section_name: string;
  marks: number;
  questions: ExamQuestion[];
}

interface SampleExamPaper {
  title: string;
  duration: string;
  total_marks: number;
  instructions: string[];
  sections: ExamSection[];
}

interface Statistics {
  total_questions_analyzed: number;
  most_common_marks_distribution: Record<string, number>;
  difficulty_distribution: Record<string, number>;
  topic_coverage: number;
}

interface Recommendations {
  focus_areas: string[];
  study_strategy: string;
  time_allocation: Record<string, string>;
}

interface PYQAnalysis {
  analysis_id: string;
  files_analyzed: string[];
  frequent_topics: FrequentTopic[];
  repeated_concepts: RepeatedConcept[];
  question_patterns: QuestionPattern[];
  sample_exam_paper: SampleExamPaper;
  statistics: Statistics;
  recommendations: Recommendations;
}

interface OraclesInsightProps {
  user: any;
}

export default function OraclesInsight({ user }: OraclesInsightProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<PYQAnalysis | null>(null);
  const [error, setError] = useState('');
  const [sessionId] = useState(`oracle_${user?.id || 'anonymous'}_${Date.now()}`);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    setFiles(prev => [...prev, ...uploadedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const analyzeQuestionPapers = async () => {
    if (files.length === 0) {
      setError('Please upload at least one PDF file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('session_id', sessionId);
      
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`${backendUrl}/api/pyq-analysis`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setAnalysis(data.analysis);
      } else {
        throw new Error(data.error || 'Failed to analyze question papers');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze question papers');
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setFiles([]);
    setAnalysis(null);
    setError('');
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'text-red-400 bg-red-600';
      case 'medium': return 'text-yellow-400 bg-yellow-600';
      case 'low': return 'text-green-400 bg-green-600';
      default: return 'text-gray-400 bg-gray-600';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'hard': return 'text-red-400 bg-red-600';
      case 'medium': return 'text-yellow-400 bg-yellow-600';
      case 'easy': return 'text-green-400 bg-green-600';
      default: return 'text-gray-400 bg-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-6">
            <Lottie 
              animationData={senseiAnimation} 
              loop={true}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <h3 className="font-cinzel text-2xl font-semibold text-purple-200 mb-4">
            Oracle's Vision Awakening...
          </h3>
          <p className="text-gray-300 mb-2">Analyzing the patterns of knowledge</p>
          <p className="text-gray-400 text-sm">Deciphering the secrets hidden in past examinations</p>
        </div>
      </div>
    );
  }

  if (analysis) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="font-cinzel text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-indigo-400 bg-clip-text text-transparent">
              Oracle's Revelation
            </h1>
            <p className="text-xl text-purple-200 font-medium">
              The patterns have been revealed. Your path to mastery is illuminated.
            </p>
          </div>

          <button
            onClick={resetAnalysis}
            className="group inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-semibold shadow-xl hover:shadow-purple-500/30 transform hover:-translate-y-1 transition-all duration-300"
          >
            <Eye className="w-5 h-5" />
            <span>New Vision</span>
          </button>
        </div>

        {/* Analysis Overview */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-purple-700/30">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-8 h-8 text-purple-400" />
              <div>
                <h3 className="font-semibold text-purple-200">Files Analyzed</h3>
                <p className="text-2xl font-bold text-white">{analysis.files_analyzed.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-indigo-700/30">
            <div className="flex items-center space-x-3 mb-4">
              <BarChart3 className="w-8 h-8 text-indigo-400" />
              <div>
                <h3 className="font-semibold text-indigo-200">Questions</h3>
                <p className="text-2xl font-bold text-white">{analysis.statistics.total_questions_analyzed}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-emerald-700/30">
            <div className="flex items-center space-x-3 mb-4">
              <Target className="w-8 h-8 text-emerald-400" />
              <div>
                <h3 className="font-semibold text-emerald-200">Topics</h3>
                <p className="text-2xl font-bold text-white">{analysis.frequent_topics.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-yellow-700/30">
            <div className="flex items-center space-x-3 mb-4">
              <Award className="w-8 h-8 text-yellow-400" />
              <div>
                <h3 className="font-semibold text-yellow-200">Coverage</h3>
                <p className="text-2xl font-bold text-white">{analysis.statistics.topic_coverage}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Frequent Topics */}
        <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-purple-700/30">
          <h2 className="font-cinzel text-2xl font-semibold text-purple-200 mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 mr-3" />
            Sacred Knowledge Domains
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysis.frequent_topics.map((topic, index) => (
              <div key={index} className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/30">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-purple-200">{topic.topic}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImportanceColor(topic.importance)} bg-opacity-20 border border-current border-opacity-30`}>
                    {topic.importance}
                  </span>
                </div>
                <p className="text-gray-300 text-sm mb-2">{topic.description}</p>
                <div className="flex items-center text-xs text-gray-400">
                  <span>Frequency: {topic.frequency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Question Patterns */}
        <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-indigo-700/30">
          <h2 className="font-cinzel text-2xl font-semibold text-indigo-200 mb-6 flex items-center">
            <Brain className="w-6 h-6 mr-3" />
            Mystical Patterns Revealed
          </h2>
          <div className="space-y-4">
            {analysis.question_patterns.map((pattern, index) => (
              <div key={index} className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/30">
                <h3 className="font-semibold text-indigo-200 mb-2">{pattern.pattern_type}</h3>
                <p className="text-gray-300 text-sm mb-3">{pattern.description}</p>
                <div className="flex flex-wrap gap-2">
                  {pattern.examples.map((example, exIndex) => (
                    <span key={exIndex} className="px-2 py-1 bg-indigo-600/20 text-indigo-300 rounded text-xs">
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sample Exam Paper */}
        <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-emerald-700/30">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-cinzel text-2xl font-semibold text-emerald-200 flex items-center">
              <FileText className="w-6 h-6 mr-3" />
              Prophetic Examination
            </h2>
            <div className="flex space-x-2">
              <button className="p-2 bg-emerald-600/20 hover:bg-emerald-600/30 rounded-lg text-emerald-400 transition-colors">
                <Download className="w-5 h-5" />
              </button>
              <button className="p-2 bg-emerald-600/20 hover:bg-emerald-600/30 rounded-lg text-emerald-400 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600/30">
            <div className="mb-6">
              <h3 className="font-cinzel text-xl font-bold text-emerald-200 mb-2">{analysis.sample_exam_paper.title}</h3>
              <div className="flex items-center space-x-6 text-sm text-gray-300">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Duration: {analysis.sample_exam_paper.duration}
                </span>
                <span className="flex items-center">
                  <Award className="w-4 h-4 mr-1" />
                  Total Marks: {analysis.sample_exam_paper.total_marks}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-emerald-200 mb-3">Instructions:</h4>
              <ul className="space-y-1 text-gray-300 text-sm">
                {analysis.sample_exam_paper.instructions.map((instruction, index) => (
                  <li key={index}>• {instruction}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              {analysis.sample_exam_paper.sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="border-l-4 border-emerald-500 pl-4">
                  <h4 className="font-semibold text-emerald-200 mb-3">
                    {section.section_name} ({section.marks} marks)
                  </h4>
                  <div className="space-y-3">
                    {section.questions.map((question, qIndex) => (
                      <div key={qIndex} className="bg-slate-700/30 rounded p-3">
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-medium text-white">Q{question.question_number}.</span>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(question.difficulty)} bg-opacity-20 border border-current border-opacity-30`}>
                              {question.difficulty}
                            </span>
                            <span className="text-xs text-gray-400">[{question.marks} marks]</span>
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm mb-1">{question.question_text}</p>
                        <p className="text-xs text-gray-500">Topic: {question.topic}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-gradient-to-br from-yellow-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-yellow-700/30">
          <h2 className="font-cinzel text-2xl font-semibold text-yellow-200 mb-6 flex items-center">
            <Sparkles className="w-6 h-6 mr-3" />
            Oracle's Wisdom
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-yellow-200 mb-3">Focus Areas</h3>
              <div className="space-y-2">
                {analysis.recommendations.focus_areas.map((area, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-300">{area}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-yellow-200 mb-3">Time Allocation</h3>
              <div className="space-y-2">
                {Object.entries(analysis.recommendations.time_allocation).map(([topic, percentage], index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-300">{topic}</span>
                    <span className="text-yellow-400 font-medium">{percentage}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-600/10 rounded-lg border border-yellow-600/20">
            <h3 className="font-semibold text-yellow-200 mb-2">Study Strategy</h3>
            <p className="text-gray-300">{analysis.recommendations.study_strategy}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="font-cinzel text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-indigo-400 bg-clip-text text-transparent">
            Oracle's Insight
          </h1>
          <p className="text-xl text-purple-200 font-medium">
            Unveil the hidden patterns in previous year questions
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Eye className="w-8 h-8 text-purple-400" />
          <div className="text-right">
            <p className="text-purple-200 font-medium">Ancient Wisdom</p>
            <p className="text-gray-400 text-sm">Sees all, knows all</p>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-8 border border-purple-700/30">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-6">
            <Lottie 
              animationData={senseiAnimation} 
              loop={true}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <h2 className="font-cinzel text-2xl font-semibold text-purple-200 mb-4">
            Offer Your Sacred Texts
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Upload your previous year question papers and let the Oracle reveal the hidden patterns, 
            frequent topics, and generate a prophetic examination for your preparation.
          </p>
        </div>

        {/* File Upload */}
        <div className="max-w-2xl mx-auto">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-8 border-2 border-dashed border-purple-500/50 rounded-xl text-purple-300 hover:border-purple-500 hover:bg-purple-500/10 transition-all duration-300 group"
          >
            <Upload className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <p className="text-lg font-medium mb-2">Click to upload PDF files</p>
            <p className="text-sm text-gray-400">Upload multiple previous year question papers</p>
          </button>

          {/* Uploaded Files */}
          {files.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="font-semibold text-purple-200">Sacred Texts Received ({files.length})</h3>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-800/50 px-4 py-3 rounded-lg border border-slate-600/30">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-300">{file.name}</span>
                    <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="mt-6 bg-red-900/40 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-300 text-center">{error}</p>
            </div>
          )}

          {files.length > 0 && (
            <div className="mt-8 text-center">
              <button
                onClick={analyzeQuestionPapers}
                disabled={loading}
                className="group inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-semibold shadow-xl hover:shadow-purple-500/30 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye className="w-6 h-6" />
                <span>Awaken the Oracle's Vision</span>
                <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Features Preview */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-purple-700/30 text-center">
          <TrendingUp className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="font-cinzel text-lg font-semibold text-purple-200 mb-2">Pattern Recognition</h3>
          <p className="text-gray-300 text-sm">Identify recurring themes and question patterns across years</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-indigo-700/30 text-center">
          <Brain className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
          <h3 className="font-cinzel text-lg font-semibold text-indigo-200 mb-2">Smart Analysis</h3>
          <p className="text-gray-300 text-sm">AI-powered insights into topic frequency and importance</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-emerald-700/30 text-center">
          <FileText className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h3 className="font-cinzel text-lg font-semibold text-emerald-200 mb-2">Sample Paper</h3>
          <p className="text-gray-300 text-sm">Generate practice papers based on historical patterns</p>
        </div>
      </div>
    </div>
  );
}