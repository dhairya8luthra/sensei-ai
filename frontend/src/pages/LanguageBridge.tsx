import React, { useState, useRef, useEffect } from 'react';
import { Languages, Upload, FileText, Download, Share2, History, ArrowRight, Globe, BookOpen, Sparkles, Loader2, Copy, Check } from 'lucide-react';
import Lottie from 'lottie-react';
import senseiAnimation from '../data/senseiAnimation.json';

interface Translation {
  translation_id: string;
  original_filename: string;
  original_language: string;
  translated_language: string;
  translated_text: string;
  word_count: number;
  created_at: string;
}

interface TranslationHistory {
  translation_id: string;
  original_filename: string;
  source_language: string;
  target_language: string;
  created_at: string;
}

interface LanguageBridgeProps {
  user: any;
}

export default function LanguageBridge({ user }: LanguageBridgeProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [translation, setTranslation] = useState<Translation | null>(null);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<TranslationHistory[]>([]);
  const [sessionId] = useState(`translation_${user?.id || 'anonymous'}_${Date.now()}`);
  const [copied, setCopied] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  useEffect(() => {
    if (user) {
      fetchTranslationHistory();
    }
  }, [user]);

  const fetchTranslationHistory = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/translation-history/${sessionId}`);
      const data = await response.json();
      
      if (response.ok) {
        setHistory(data.translations || []);
      }
    } catch (err) {
      console.error('Failed to fetch translation history:', err);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setError('');
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const translateDocument = async () => {
    if (!file) {
      setError('Please select a PDF file to translate');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('session_id', sessionId);
      formData.append('file', file);

      const response = await fetch(`${backendUrl}/api/translate-pdf`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setTranslation(data);
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        fetchTranslationHistory(); // Refresh history
      } else {
        throw new Error(data.error || 'Failed to translate document');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to translate document');
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryTranslation = async (translationId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/translation/${translationId}`);
      const data = await response.json();
      
      if (response.ok) {
        setTranslation({
          translation_id: data.translation_id,
          original_filename: data.original_filename,
          original_language: data.source_language,
          translated_language: data.target_language,
          translated_text: data.translated_text,
          word_count: data.original_text?.split(' ').length || 0,
          created_at: data.created_at
        });
        setShowHistory(false);
      }
    } catch (err) {
      setError('Failed to load translation');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (translation?.translated_text) {
      try {
        await navigator.clipboard.writeText(translation.translated_text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text:', err);
      }
    }
  };

  const downloadTranslation = () => {
    if (translation?.translated_text) {
      const blob = new Blob([translation.translated_text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${translation.original_filename}_hindi_translation.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
          <h3 className="font-cinzel text-2xl font-semibold text-orange-200 mb-4">
            Building Language Bridge...
          </h3>
          <p className="text-gray-300 mb-2">Translating your document to Hindi</p>
          <p className="text-gray-400 text-sm">Breaking down language barriers for better learning</p>
        </div>
      </div>
    );
  }

  if (translation) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="font-cinzel text-4xl font-bold bg-gradient-to-r from-white via-orange-200 to-red-400 bg-clip-text text-transparent">
              Translation Complete
            </h1>
            <p className="text-xl text-orange-200 font-medium">
              Your document has been successfully translated to Hindi
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setTranslation(null)}
              className="group inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg font-semibold shadow-xl hover:shadow-orange-500/30 transform hover:-translate-y-1 transition-all duration-300"
            >
              <Languages className="w-5 h-5" />
              <span>New Translation</span>
            </button>
          </div>
        </div>

        {/* Translation Overview */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-orange-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-orange-700/30">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-8 h-8 text-orange-400" />
              <div>
                <h3 className="font-semibold text-orange-200">Document</h3>
                <p className="text-sm text-gray-300 truncate">{translation.original_filename}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-red-700/30">
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="w-8 h-8 text-red-400" />
              <div>
                <h3 className="font-semibold text-red-200">Languages</h3>
                <p className="text-sm text-gray-300">English → Hindi</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-yellow-700/30">
            <div className="flex items-center space-x-3 mb-4">
              <BookOpen className="w-8 h-8 text-yellow-400" />
              <div>
                <h3 className="font-semibold text-yellow-200">Word Count</h3>
                <p className="text-sm text-gray-300">{translation.word_count} words</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-green-700/30">
            <div className="flex items-center space-x-3 mb-4">
              <Sparkles className="w-8 h-8 text-green-400" />
              <div>
                <h3 className="font-semibold text-green-200">Status</h3>
                <p className="text-sm text-gray-300">Complete</p>
              </div>
            </div>
          </div>
        </div>

        {/* Translation Content */}
        <div className="bg-gradient-to-br from-orange-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-8 border border-orange-700/30">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-cinzel text-2xl font-semibold text-orange-200 flex items-center">
              <Languages className="w-6 h-6 mr-3" />
              Hindi Translation
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={copyToClipboard}
                className="p-2 bg-orange-600/20 hover:bg-orange-600/30 rounded-lg text-orange-400 transition-colors"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
              <button
                onClick={downloadTranslation}
                className="p-2 bg-orange-600/20 hover:bg-orange-600/30 rounded-lg text-orange-400 transition-colors"
              >
                <Download className="w-5 h-5" />
              </button>
              <button className="p-2 bg-orange-600/20 hover:bg-orange-600/30 rounded-lg text-orange-400 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600/30 max-h-96 overflow-y-auto">
            <div className="text-gray-300 leading-relaxed whitespace-pre-wrap font-hindi">
              {translation.translated_text}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center bg-gradient-to-br from-red-900/40 to-orange-900/40 backdrop-blur-sm rounded-xl p-8 border border-red-700/30">
          <h3 className="font-cinzel text-2xl font-semibold text-red-200 mb-4">
            Translation Bridge Complete
          </h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Your document has been successfully translated to Hindi, making learning accessible in your preferred language.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={downloadTranslation}
              className="inline-flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg font-semibold shadow-xl hover:shadow-orange-500/30 transform hover:-translate-y-1 transition-all duration-300"
            >
              <Download className="w-5 h-5" />
              <span>Download Translation</span>
            </button>
            <button
              onClick={() => setTranslation(null)}
              className="inline-flex items-center space-x-2 px-8 py-3 border-2 border-orange-400/50 text-orange-400 rounded-lg font-semibold hover:bg-orange-400/10 transition-all duration-300"
            >
              <Languages className="w-5 h-5" />
              <span>Translate Another Document</span>
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
          <h1 className="font-cinzel text-4xl font-bold bg-gradient-to-r from-white via-orange-200 to-red-400 bg-clip-text text-transparent">
            Language Bridge
          </h1>
          <p className="text-xl text-orange-200 font-medium">
            Break language barriers - translate your learning materials to Hindi
          </p>
        </div>

        <button
          onClick={() => setShowHistory(!showHistory)}
          className="group inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg font-semibold shadow-xl hover:shadow-orange-500/30 transform hover:-translate-y-1 transition-all duration-300"
        >
          <History className="w-5 h-5" />
          <span>Translation History</span>
        </button>
      </div>

      {/* History Panel */}
      {showHistory && (
        <div className="bg-gradient-to-br from-orange-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-orange-700/30">
          <h3 className="font-cinzel text-xl font-semibold text-orange-200 mb-4">Translation History</h3>
          {history.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No previous translations</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {history.map((item) => (
                <button
                  key={item.translation_id}
                  onClick={() => loadHistoryTranslation(item.translation_id)}
                  className="w-full text-left p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg border border-slate-600/30 hover:border-orange-500/50 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-200 font-medium">{item.original_filename}</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {item.source_language} → {item.target_language} • {formatDate(item.created_at)}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-orange-400" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-gradient-to-br from-orange-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-8 border border-orange-700/30">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-6">
            <Lottie 
              animationData={senseiAnimation} 
              loop={true}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <h2 className="font-cinzel text-2xl font-semibold text-orange-200 mb-4">
            Bridge the Language Gap
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Upload your PDF documents and get them translated to Hindi instantly. 
            Make learning accessible in your preferred language with AI-powered translation.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* File Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-8 border-2 border-dashed border-orange-500/50 rounded-xl text-orange-300 hover:border-orange-500 hover:bg-orange-500/10 transition-all duration-300 group"
          >
            <Upload className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <p className="text-lg font-medium mb-2">Upload PDF Document</p>
            <p className="text-sm text-gray-400">Click to select your PDF file for translation</p>
          </button>

          {/* Uploaded File */}
          {file && (
            <div className="mt-6 bg-slate-800/50 border border-orange-700/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="text-orange-200 font-medium">{file.name}</p>
                    <p className="text-gray-400 text-sm">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • Ready for translation
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 bg-red-900/40 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-300 text-center">{error}</p>
            </div>
          )}

          {file && (
            <div className="mt-8 text-center">
              <button
                onClick={translateDocument}
                disabled={loading}
                className="group inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg font-semibold shadow-xl hover:shadow-orange-500/30 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Languages className="w-6 h-6" />
                <span>Translate to Hindi</span>
                <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Features Preview */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-orange-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-orange-700/30 text-center">
          <Languages className="w-12 h-12 text-orange-400 mx-auto mb-4" />
          <h3 className="font-cinzel text-lg font-semibold text-orange-200 mb-2">AI Translation</h3>
          <p className="text-gray-300 text-sm">Advanced AI-powered translation preserving context and meaning</p>
        </div>

        <div className="bg-gradient-to-br from-red-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-red-700/30 text-center">
          <Globe className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="font-cinzel text-lg font-semibold text-red-200 mb-2">Cultural Context</h3>
          <p className="text-gray-300 text-sm">Maintains technical terms and cultural nuances appropriately</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-yellow-700/30 text-center">
          <BookOpen className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="font-cinzel text-lg font-semibold text-yellow-200 mb-2">Learning Support</h3>
          <p className="text-gray-300 text-sm">Makes educational content accessible in your native language</p>
        </div>
      </div>
    </div>
  );
}