import React, { useState } from 'react';
import { X, Sword, Upload, Link as LinkIcon, FileText, Sparkles, Loader2 } from 'lucide-react';
import Lottie from 'lottie-react';
import ninjaFight from '../data/fight_ninja.json';
interface CreateTrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrainingCreated: (quizData: any) => void;
  user: any;
  sessionId: string;
}

export default function CreateTrainingModal({ 
  isOpen, 
  onClose, 
  onTrainingCreated, 
  user, 
  sessionId 
}: CreateTrainingModalProps) {
  const [trainingTitle, setTrainingTitle] = useState('');
  const [textualContext, setTextualContext] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [youtubeLinks, setYoutubeLinks] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trainingTitle.trim()) {
      setError('Training title is required');
      return;
    }

    if (!files || files.length === 0) {
      setError('At least one PDF file is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      
      // Add metadata
      formData.append('sessionId', sessionId);
      formData.append('userId', user?.id || '');
      formData.append('trainingTitle', trainingTitle.trim());
      formData.append('textualContext', textualContext.trim());

      // Add files
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      // Add YouTube links (filter out empty ones)
      const validLinks = youtubeLinks.filter(link => link.trim());
      if (validLinks.length > 0) {
        formData.append('youtubeLinks', JSON.stringify(validLinks));
      }

      console.log('Submitting training with sessionId:', sessionId);

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${backendUrl}/api/generate-mcq`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      console.log('Response:', data);

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      // Reset form and close modal
      setTrainingTitle('');
      setTextualContext('');
      setFiles(null);
      setYoutubeLinks(['']);
      onClose();
      onTrainingCreated(data);
      
    } catch (err: any) {
      console.error('Training creation error:', err);
      setError(err.message || 'Failed to create training');
    } finally {
      setLoading(false);
    }
  };

  const addYoutubeLink = () => {
    setYoutubeLinks([...youtubeLinks, '']);
  };

  const updateYoutubeLink = (index: number, value: string) => {
    const newLinks = [...youtubeLinks];
    newLinks[index] = value;
    setYoutubeLinks(newLinks);
  };

  const removeYoutubeLink = (index: number) => {
    if (youtubeLinks.length > 1) {
      setYoutubeLinks(youtubeLinks.filter((_, i) => i !== index));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-emerald-900/90 to-slate-900/90 backdrop-blur-sm rounded-2xl border border-emerald-700/30 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Sword className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-cinzel text-3xl font-semibold text-emerald-200">
                  Create New Training
                </h2>
                <p className="text-gray-400 mt-1">Forge your path to mastery</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Training Title */}
                <div>
                  <label className="block text-emerald-200 font-medium mb-3" htmlFor="trainingTitle">
                    Training Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="trainingTitle"
                    type="text"
                    placeholder="Enter training title..."
                    value={trainingTitle}
                    onChange={(e) => {
                      setTrainingTitle(e.target.value);
                      setError('');
                    }}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-emerald-700/30 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                    required
                    maxLength={100}
                  />
                </div>

                {/* Textual Context */}
                <div>
                  <label className="block text-emerald-200 font-medium mb-3" htmlFor="textualContext">
                    Additional Context
                  </label>
                  <textarea
                    id="textualContext"
                    placeholder="Provide any additional context or instructions..."
                    value={textualContext}
                    onChange={(e) => setTextualContext(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-emerald-700/30 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 resize-none"
                  />
                </div>

                {/* PDF Upload */}
                <div>
                  <label className="block text-emerald-200 font-medium mb-3">
                    Upload PDFs <span className="text-red-400">*</span>
                  </label>
                  <div className="border-2 border-dashed border-emerald-700/30 rounded-lg p-6 text-center hover:border-emerald-500/50 transition-all duration-300">
                    <Upload className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                    <input
                      type="file"
                      multiple
                      accept=".pdf"
                      onChange={(e) => {
                        setFiles(e.target.files);
                        setError('');
                      }}
                      className="hidden"
                      id="pdfUpload"
                    />
                    <label
                      htmlFor="pdfUpload"
                      className="cursor-pointer text-emerald-200 hover:text-emerald-100 transition-colors duration-200"
                    >
                      <span className="font-medium">Click to upload PDFs</span>
                      <p className="text-gray-400 text-sm mt-1">or drag and drop</p>
                    </label>
                    {files && files.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {Array.from(files).map((file, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm text-emerald-300">
                            <FileText className="w-4 h-4" />
                            <span>{file.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* YouTube Links */}
                <div>
                  <label className="block text-emerald-200 font-medium mb-3">
                    YouTube Links (Optional)
                  </label>
                  <div className="space-y-3">
                    {youtubeLinks.map((link, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="flex-1 relative">
                          <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-400" />
                          <input
                            type="url"
                            placeholder="https://youtube.com/watch?v=..."
                            value={link}
                            onChange={(e) => updateYoutubeLink(index, e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-emerald-700/30 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                          />
                        </div>
                        {youtubeLinks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeYoutubeLink(index)}
                            className="w-10 h-10 rounded-lg bg-red-600/20 hover:bg-red-600/30 flex items-center justify-center text-red-400 hover:text-red-300 transition-all duration-200"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addYoutubeLink}
                      className="text-emerald-400 hover:text-emerald-300 font-medium text-sm transition-colors duration-200"
                    >
                      + Add another link
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-900/40 border border-red-500/50 rounded-lg p-4">
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 px-6 py-3 border-2 border-emerald-400/50 text-emerald-400 rounded-lg font-semibold hover:bg-emerald-400/10 transition-all duration-300 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !trainingTitle.trim() || !files}
                    className="flex-1 group px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg font-semibold shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Creating Training...
                        </>
                      ) : (
                        <>
                          Create Training
                          <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </form>
            </div>

            {/* Sensei Animation */}
            <div className="flex items-center justify-center">
              <div className="w-80 h-80">
                <Lottie 
                  animationData={ninjaFight} 
                  loop={true}
                  style={{ width: '100%', height: '100%' }}
                  className="drop-shadow-3xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}