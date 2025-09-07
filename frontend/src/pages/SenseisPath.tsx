import React, { useState, useRef } from 'react';
import { Map, Upload, FileText, Target, Clock, BookOpen, Sparkles, TrendingUp, CheckCircle, ArrowRight, Loader2, Download, Share2 } from 'lucide-react';
import Lottie from 'lottie-react';
import senseiAnimation from '../data/senseiAnimation.json';

interface StudyPlan {
  plan_id: string;
  title: string;
  created_at: string;
  study_goal: string;
  materials_analyzed: string;
  plan_content: string;
  estimated_duration: string;
  difficulty_level: string;
  key_milestones: string[];
  weekly_schedule: any[];
}

interface SenseisPathProps {
  user: any;
}

export default function SenseisPath({ user }: SenseisPathProps) {
  const [studyGoal, setStudyGoal] = useState('');
  const [materials, setMaterials] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<StudyPlan[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMaterials(file);
    }
  };

  const removeMaterial = () => {
    setMaterials(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generateStudyPlan = async () => {
    if (!studyGoal.trim() || !materials) {
      setError('Please provide both study goal and course materials');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('user_id', user?.id || 'anonymous');
      formData.append('studyGoal', studyGoal.trim());
      formData.append('materials', materials);

      const response = await fetch(`${backendUrl}/api/course-planner`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.answer) {
        // Create a study plan object from the response
        const newStudyPlan: StudyPlan = {
          plan_id: `plan_${Date.now()}`,
          title: `Study Plan: ${studyGoal}`,
          created_at: new Date().toISOString(),
          study_goal: studyGoal,
          materials_analyzed: materials.name,
          plan_content: data.answer,
          estimated_duration: 'Variable',
          difficulty_level: 'Adaptive',
          key_milestones: [],
          weekly_schedule: []
        };

        setStudyPlan(newStudyPlan);
        
        // Add to history
        setHistory(prev => [newStudyPlan, ...prev]);
        
        // Reset form
        setStudyGoal('');
        setMaterials(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error(data.error || 'Failed to generate study plan');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate study plan');
    } finally {
      setLoading(false);
    }
  };

  const formatPlanContent = (content: string) => {
    // Split content into sections and format nicely
    const sections = content.split('\n\n').filter(section => section.trim());
    return sections.map((section, index) => {
      const lines = section.split('\n');
      const title = lines[0];
      const body = lines.slice(1).join('\n');
      
      return (
        <div key={index} className="mb-6">
          <h3 className="font-cinzel text-lg font-semibold text-emerald-200 mb-3">
            {title}
          </h3>
          <div className="text-gray-300 leading-relaxed whitespace-pre-line">
            {body}
          </div>
        </div>
      );
    });
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
          <h3 className="font-cinzel text-2xl font-semibold text-emerald-200 mb-4">
            Sensei is Crafting Your Path...
          </h3>
          <p className="text-gray-300 mb-2">Analyzing your materials and goals</p>
          <p className="text-gray-400 text-sm">Creating a personalized learning journey</p>
        </div>
      </div>
    );
  }

  if (studyPlan) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="font-cinzel text-4xl font-bold bg-gradient-to-r from-white via-emerald-200 to-green-400 bg-clip-text text-transparent">
              Your Learning Path
            </h1>
            <p className="text-xl text-emerald-200 font-medium">
              Sensei has illuminated your journey to mastery
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setStudyPlan(null)}
              className="group inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg font-semibold shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-1 transition-all duration-300"
            >
              <Map className="w-5 h-5" />
              <span>Create New Path</span>
            </button>
          </div>
        </div>

        {/* Plan Overview */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-emerald-700/30">
            <div className="flex items-center space-x-3 mb-4">
              <Target className="w-8 h-8 text-emerald-400" />
              <div>
                <h3 className="font-semibold text-emerald-200">Study Goal</h3>
                <p className="text-sm text-gray-300">{studyPlan.study_goal}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-green-700/30">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-8 h-8 text-green-400" />
              <div>
                <h3 className="font-semibold text-green-200">Materials</h3>
                <p className="text-sm text-gray-300">{studyPlan.materials_analyzed}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-teal-700/30">
            <div className="flex items-center space-x-3 mb-4">
              <Clock className="w-8 h-8 text-teal-400" />
              <div>
                <h3 className="font-semibold text-teal-200">Created</h3>
                <p className="text-sm text-gray-300">
                  {new Date(studyPlan.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Study Plan Content */}
        <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-8 border border-emerald-700/30">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-cinzel text-2xl font-semibold text-emerald-200 flex items-center">
              <BookOpen className="w-6 h-6 mr-3" />
              Your Personalized Learning Journey
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
            <div className="prose prose-invert max-w-none">
              {formatPlanContent(studyPlan.plan_content)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-sm rounded-xl p-8 border border-green-700/30">
          <h3 className="font-cinzel text-2xl font-semibold text-green-200 mb-4">
            Ready to Begin Your Journey?
          </h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Your personalized study plan has been crafted by Sensei. Follow this path to achieve mastery in your chosen field.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="inline-flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg font-semibold shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-1 transition-all duration-300">
              <CheckCircle className="w-5 h-5" />
              <span>Start Learning</span>
            </button>
            <button
              onClick={() => setStudyPlan(null)}
              className="inline-flex items-center space-x-2 px-8 py-3 border-2 border-emerald-400/50 text-emerald-400 rounded-lg font-semibold hover:bg-emerald-400/10 transition-all duration-300"
            >
              <Map className="w-5 h-5" />
              <span>Create Another Path</span>
            </button>
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
          <h1 className="font-cinzel text-4xl font-bold bg-gradient-to-r from-white via-emerald-200 to-green-400 bg-clip-text text-transparent">
            Sensei's Path
          </h1>
          <p className="text-xl text-emerald-200 font-medium">
            Let the master guide your learning journey with a personalized study plan
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Map className="w-8 h-8 text-emerald-400" />
          <div className="text-right">
            <p className="text-emerald-200 font-medium">Wisdom & Guidance</p>
            <p className="text-gray-400 text-sm">Tailored for you</p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-8 border border-emerald-700/30">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-6">
            <Lottie 
              animationData={senseiAnimation} 
              loop={true}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <h2 className="font-cinzel text-2xl font-semibold text-emerald-200 mb-4">
            Share Your Learning Quest
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Tell Sensei your study goals and upload your course materials. 
            The master will analyze your content and craft a personalized learning path to guide you to mastery.
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Study Goal Input */}
          <div>
            <label className="block text-emerald-200 font-medium mb-3">
              What do you wish to master? <span className="text-red-400">*</span>
            </label>
            <textarea
              value={studyGoal}
              onChange={(e) => setStudyGoal(e.target.value)}
              placeholder="Describe your learning goals, what you want to achieve, your current level, and any specific areas you want to focus on..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-800/50 border border-emerald-700/30 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 resize-none"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-emerald-200 font-medium mb-3">
              Course Materials <span className="text-red-400">*</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-8 border-2 border-dashed border-emerald-500/50 rounded-xl text-emerald-300 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all duration-300 group"
            >
              <Upload className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <p className="text-lg font-medium mb-2">Upload Your Course Materials</p>
              <p className="text-sm text-gray-400">PDF, DOC, DOCX, or TXT files</p>
            </button>

            {materials && (
              <div className="mt-4 bg-slate-800/50 border border-emerald-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-emerald-200 font-medium">{materials.name}</p>
                      <p className="text-gray-400 text-sm">
                        {(materials.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={removeMaterial}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-900/40 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-300 text-center">{error}</p>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={generateStudyPlan}
              disabled={!studyGoal.trim() || !materials}
              className="group inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg font-semibold shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Map className="w-6 h-6" />
              <span>Illuminate My Path</span>
              <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
            </button>
          </div>
        </div>
      </div>

      {/* Features Preview */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-emerald-700/30 text-center">
          <Target className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h3 className="font-cinzel text-lg font-semibold text-emerald-200 mb-2">Goal-Oriented</h3>
          <p className="text-gray-300 text-sm">Personalized plans aligned with your specific learning objectives</p>
        </div>

        <div className="bg-gradient-to-br from-green-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-green-700/30 text-center">
          <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="font-cinzel text-lg font-semibold text-green-200 mb-2">Progressive Learning</h3>
          <p className="text-gray-300 text-sm">Structured approach that builds knowledge step by step</p>
        </div>

        <div className="bg-gradient-to-br from-teal-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-teal-700/30 text-center">
          <BookOpen className="w-12 h-12 text-teal-400 mx-auto mb-4" />
          <h3 className="font-cinzel text-lg font-semibold text-teal-200 mb-2">Content Analysis</h3>
          <p className="text-gray-300 text-sm">AI-powered analysis of your materials for optimal learning</p>
        </div>
      </div>

      {/* History Section */}
      {history.length > 0 && (
        <div className="bg-gradient-to-br from-slate-900/40 to-emerald-900/40 backdrop-blur-sm rounded-xl p-6 border border-emerald-700/30">
          <h3 className="font-cinzel text-xl font-semibold text-emerald-200 mb-4">Previous Learning Paths</h3>
          <div className="space-y-3">
            {history.slice(0, 3).map((plan) => (
              <button
                key={plan.plan_id}
                onClick={() => setStudyPlan(plan)}
                className="w-full text-left p-4 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg border border-slate-600/30 hover:border-emerald-500/50 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-200 font-medium">{plan.study_goal}</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {new Date(plan.created_at).toLocaleDateString()} • {plan.materials_analyzed}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-emerald-400" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}