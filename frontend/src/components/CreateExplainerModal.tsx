import React, { useState } from 'react';
import { X, GraduationCap, Upload, FileText, Sparkles } from 'lucide-react';
import Lottie from 'lottie-react';
import senseiAnimation from '../data/senseiAnimation.json';

interface CreateExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExplainerCreated: (explainerData: any) => void;
  user: any;
}

export default function CreateExplainerModal({
  isOpen,
  onClose,
  onExplainerCreated,
  user
}: CreateExplainerModalProps) {
  const [conceptTitle, setConceptTitle] = useState('');
  const [targetAudience, setTargetAudience] = useState('beginner');
  const [videoDuration, setVideoDuration] = useState(30);
  const [language, setLanguage] = useState('english');
  const [textualContext, setTextualContext] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [youtubeLinks, setYoutubeLinks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  const resetForm = () => {
    setConceptTitle('');
    setTargetAudience('beginner');
    setVideoDuration(30);
    setLanguage('english');
    setTextualContext('');
    setYoutubeLinks('');
    setFiles(null);
    setCurrentStep(1);
    setError('');
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  const getStepDescription = (step: number) => {
    switch (step) {
      case 1: return 'Analyzing content and generating concept slides.';
      case 2: return 'Creating PowerPoint.';
      case 3: return 'Generating narration audio.';
      case 4: return 'Stitching slides + audio into video.';
      default: return 'Processing.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hasFiles = files && files.length > 0;
    const hasTextualContext = textualContext.trim().length > 0;

    if (!conceptTitle.trim()) {
      setError('Concept title is required');
      return;
    }
    if (!hasFiles && !hasTextualContext) {
      setError('At least one content source is required (text or PDF)');
      return;
    }

    setLoading(true);
    setError('');
    setCurrentStep(1);

    // Simple progress ticker for UI
    const progressTimer = setInterval(() => {
      setCurrentStep(prev => (prev < 4 ? prev + 1 : prev));
    }, 2000);

    try {
      // STEP 1: generate slides (academy endpoint expects different keys + multiple "files")
      const fd = new FormData();
      fd.append('user_id', user?.id || 'current_user');
      fd.append('conceptTitle', conceptTitle.trim());
      fd.append('targetAudience', targetAudience);
      fd.append('videoDuration', String(videoDuration));
      fd.append('language', language);
      fd.append('textualContext', textualContext.trim());
      const links = youtubeLinks
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);
      fd.append('youtubeLinks', JSON.stringify(links));
      if (files && files.length > 0) {
        Array.from(files).forEach(f => fd.append('files', f));
      }

      const genRes = await fetch(`${backendUrl}/api/academy/generate-slides`, {
        method: 'POST',
        body: fd
      });
      const genData = await genRes.json();
      if (!genRes.ok) {
        throw new Error(genData.error || 'Failed to generate slides');
      }
      // genData should include explainer_id, slides[], script, title
const explainer_id = genData.explainer_id;     // we reuse as lesson_id
const slides = genData.slides;
const script = genData.script;

// STEP 2: create video (uploads to Supabase + DB row)
const vidRes = await fetch(`${backendUrl}/api/academy/create-video`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    explainer_id,
    lesson_id: explainer_id,          // <<< important for your schema
    slides,
    script,
    conceptTitle,
    target_audience: targetAudience,
    language,
    user_id: user?.id || 'current_user'
  })
});
      const vidData = await vidRes.json();
      if (!vidRes.ok) {
        throw new Error(vidData.error || 'Failed to create video');
      }

      // Backend returns { success, videoData, message }
      const created = vidData.videoData || vidData;
      resetForm();
      onClose();
      onExplainerCreated(created);
    } catch (err: any) {
      console.error('Error creating explainer:', err);
      setError(err.message || 'Failed to create explainer video');
    } finally {
      clearInterval(progressTimer);
      setLoading(false);
      setCurrentStep(1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-emerald-900/90 to-slate-900/90 backdrop-blur-sm rounded-2xl border border-emerald-700/30 shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-emerald-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-cinzel text-3xl font-semibold text-emerald-200">
                  Create Concept Explainer
                </h2>
                <p className="text-gray-400 mt-1">Transform knowledge into engaging video lessons</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="w-10 h-10 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Loading Progress */}
          {loading && (
            <div className="mb-8 bg-gradient-to-r from-purple-900/40 to-emerald-900/40 backdrop-blur-sm rounded-xl p-6 border border-purple-700/30">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-8 h-8">
                  <Lottie animationData={senseiAnimation} loop={true} style={{ width: '100%', height: '100%' }} />
                </div>
                <div>
                  <h3 className="font-cinzel text-lg font-semibold text-purple-200">
                    Creating Your Explainer Video
                  </h3>
                  <p className="text-gray-300 text-sm">{getStepDescription(currentStep)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      step < currentStep ? 'bg-emerald-600 text-white' : step === currentStep ? 'bg-purple-600 text-white animate-pulse' : 'bg-slate-700 text-gray-400'
                    }`}>
                      {step < currentStep ? '✓' : step}
                    </div>
                    {step < 4 && (
                      <div className={`w-12 h-1 mx-2 rounded transition-all duration-300 ${
                        step < currentStep ? 'bg-emerald-600' : 'bg-slate-700'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Form + Preview */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Concept Title */}
                <div>
                  <label className="block text-emerald-200 font-medium mb-3" htmlFor="conceptTitle">
                    Concept Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="conceptTitle"
                    type="text"
                    placeholder="e.g. Machine Learning Fundamentals"
                    value={conceptTitle}
                    onChange={(e) => { setConceptTitle(e.target.value); setError(''); }}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-emerald-700/30 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                    maxLength={100}
                    disabled={loading}
                  />
                </div>

                {/* Settings */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-emerald-200 font-medium mb-3">Target Audience</label>
                    <select
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-emerald-700/30 rounded-lg text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                      disabled={loading}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-emerald-200 font-medium mb-3">Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-emerald-700/30 rounded-lg text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                      disabled={loading}
                    >
                      <option value="english">English</option>
                      <option value="hindi">Hindi</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-emerald-200 font-medium mb-3">Desired Duration (sec)</label>
                  <input
                    type="number"
                    min={20}
                    max={180}
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(parseInt(e.target.value || '30', 10))}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-emerald-700/30 rounded-lg text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-emerald-200 font-medium mb-3">Paste extra context (optional)</label>
                  <textarea
                    rows={5}
                    placeholder="Any extra instructions or text to include…"
                    value={textualContext}
                    onChange={(e) => setTextualContext(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-emerald-700/30 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-emerald-200 font-medium mb-3">YouTube links (one per line, optional)</label>
                  <textarea
                    rows={3}
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeLinks}
                    onChange={(e) => setYoutubeLinks(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-emerald-700/30 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                    disabled={loading}
                  />
                </div>

                {/* Files */}
                <div>
                  <label className="block text-emerald-200 font-medium mb-3">Attach PDFs/Docs (optional)</label>
                  <label className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800/50 border border-dashed border-emerald-700/30 rounded-lg cursor-pointer hover:border-emerald-500 transition">
                    <Upload className="w-5 h-5" />
                    <span className="text-gray-300">Upload files</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx"
                      multiple
                      className="hidden"
                      onChange={(e) => setFiles(e.target.files)}
                      disabled={loading}
                    />
                  </label>
                  {files && files.length > 0 && (
                    <div className="mt-2 text-sm text-gray-400">{files.length} file(s) selected</div>
                  )}
                </div>

                {error && (
                  <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-red-300">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-emerald-600 font-semibold shadow hover:shadow-purple-500/30 transition"
                >
                  <Sparkles className="w-5 h-5" />
                  Create Explainer
                </button>
              </form>
            </div>

            {/* Right Pane: Tips/Preview */}
            <div className="space-y-6">
              <div className="rounded-xl border border-emerald-700/30 bg-slate-800/40 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-5 h-5 text-emerald-300" />
                  <h3 className="text-emerald-200 font-semibold">What happens</h3>
                </div>
                <ul className="list-disc ml-5 text-gray-300 space-y-1">
                  <li>We generate slides from your content & cues</li>
                  <li>We narrate the script and stitch a video</li>
                  <li>Video & thumbnail are uploaded to Supabase</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
