    import React, { useState, useRef } from 'react';
    import { X, Upload, FileText, Youtube, Globe, Clock, Users, Plus, Trash2, Play, Download, Loader2 } from 'lucide-react';

    interface CreateExplainerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExplainerCreated: (explainer: any) => void;
    }

    export default function CreateExplainerModal({ isOpen, onClose, onExplainerCreated }: CreateExplainerModalProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Form data
    const [conceptTitle, setConceptTitle] = useState('');
    const [targetAudience, setTargetAudience] = useState('beginner');
    const [videoDuration, setVideoDuration] = useState('60');
    const [language, setLanguage] = useState('english');
    const [textualContext, setTextualContext] = useState('');
    const [youtubeLinks, setYoutubeLinks] = useState(['']);
    const [files, setFiles] = useState<File[]>([]);
    
    // Generated data
    const [currentExplainerId, setCurrentExplainerId] = useState('');
    const [slides, setSlides] = useState<any[]>([]);
    const [script, setScript] = useState('');
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

    const resetForm = () => {
        setCurrentStep(1);
        setLoading(false);
        setError('');
        setConceptTitle('');
        setTargetAudience('beginner');
        setVideoDuration('60');
        setLanguage('english');
        setTextualContext('');
        setYoutubeLinks(['']);
        setFiles([]);
        setCurrentExplainerId('');
        setSlides([]);
        setScript('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFiles = Array.from(event.target.files || []);
        setFiles(prev => [...prev, ...uploadedFiles]);
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const addYoutubeLink = () => {
        setYoutubeLinks(prev => [...prev, '']);
    };

    const updateYoutubeLink = (index: number, value: string) => {
        setYoutubeLinks(prev => prev.map((link, i) => i === index ? value : link));
    };

    const removeYoutubeLink = (index: number) => {
        setYoutubeLinks(prev => prev.filter((_, i) => i !== index));
    };

    const generateSlides = async () => {
        setCurrentStep(2);
        setLoading(true);
        setError('');

        try {
        const formData = new FormData();
        formData.append('user_id', 'current_user'); // Replace with actual user ID
        formData.append('conceptTitle', conceptTitle);
        formData.append('targetAudience', targetAudience);
        formData.append('videoDuration', videoDuration);
        formData.append('language', language);
        formData.append('textualContext', textualContext);
        formData.append('youtubeLinks', JSON.stringify(youtubeLinks.filter(link => link.trim())));

        files.forEach(file => {
            formData.append('files', file);
        });

        const response = await fetch(`${backendUrl}/api/explainers/generate-slides`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (data.success) {
            setCurrentExplainerId(data.explainer_id);
            setSlides(data.slides);
            setScript(data.script);
            setCurrentStep(3);
        } else {
            throw new Error(data.error || 'Failed to generate slides');
        }
        } catch (err: any) {
        setError(err.message);
        setCurrentStep(1);
        } finally {
        setLoading(false);
        }
    };

    const createVideo = async () => {
        setCurrentStep(4);
        setLoading(true);
        setError('');

        try {
        // Create the video
        const response = await fetch(`${backendUrl}/api/explainers/create-video`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
            explainer_id: currentExplainerId,
            slides: slides,
            script: script,
            conceptTitle: conceptTitle,
            target_audience: targetAudience,
            language: language
            })
        });

        const data = await response.json();
        
        if (data.success) {
            onExplainerCreated(data);
            handleClose();
        } else {
            throw new Error(data.error || 'Failed to create video');
        }
        } catch (err: any) {
        setError(err.message);
        setCurrentStep(3);
        } finally {
        setLoading(false);
        }
    };

    const downloadPowerPoint = async () => {
        try {
        const response = await fetch(`${backendUrl}/api/academy/create-powerpoint`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
            slides: slides,
            conceptTitle: conceptTitle,
            explainer_id: currentExplainerId
            })
        });

        const data = await response.json();
        
        if (data.success) {
            // Download the PowerPoint file
            window.open(`${backendUrl}/api/academy/download-pptx/${currentExplainerId}`, '_blank');
        }
        } catch (err: any) {
        console.error('Failed to download PowerPoint:', err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-xl border border-purple-500/30 w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-purple-500/30">
            <h2 className="text-2xl font-cinzel font-bold text-purple-200">
                Create Explainer Video
            </h2>
            <button
                onClick={handleClose}
                className="w-8 h-8 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
                {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep >= step 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-slate-700 text-gray-400'
                    }`}>
                    {step === 2 && loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : step === 4 && loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        step
                    )}
                    </div>
                    {step < 4 && (
                    <div className={`w-16 h-1 mx-2 ${
                        currentStep > step ? 'bg-purple-600' : 'bg-slate-700'
                    }`} />
                    )}
                </div>
                ))}
            </div>

            {/* Step Content */}
            {currentStep === 1 && (
                <div className="space-y-6">
                <h3 className="text-xl font-semibold text-purple-200 mb-4">Video Configuration</h3>
                
                {/* Concept Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                    Concept Title *
                    </label>
                    <input
                    type="text"
                    value={conceptTitle}
                    onChange={(e) => setConceptTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                    placeholder="Enter the main concept or topic"
                    />
                </div>

                {/* Target Audience & Duration */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Target Audience
                    </label>
                    <select
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Duration (seconds)
                    </label>
                    <select
                        value={videoDuration}
                        onChange={(e) => setVideoDuration(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    >
                        <option value="30">30 seconds</option>
                        <option value="60">1 minute</option>
                        <option value="90">1.5 minutes</option>
                        <option value="120">2 minutes</option>
                        <option value="180">3 minutes</option>
                    </select>
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Language
                    </label>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    >
                        <option value="english">English</option>
                        <option value="spanish">Spanish</option>
                        <option value="french">French</option>
                        <option value="german">German</option>
                    </select>
                    </div>
                </div>

                {/* Content Sources */}
                <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-purple-200">Content Sources</h4>
                    
                    {/* Text Content */}
                    <div>
                    <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                        <FileText className="w-4 h-4 mr-2" />
                        Text Content
                    </label>
                    <textarea
                        value={textualContext}
                        onChange={(e) => setTextualContext(e.target.value)}
                        rows={6}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                        placeholder="Enter your content, concepts, or explanations..."
                    />
                    </div>

                    {/* File Upload */}
                    <div>
                    <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Files (PDF)
                    </label>
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
                        className="w-full px-4 py-2 border-2 border-dashed border-purple-500/50 rounded-lg text-purple-300 hover:border-purple-500 hover:bg-purple-500/10 transition-colors"
                    >
                        Click to upload PDF files
                    </button>
                    
                    {files.length > 0 && (
                        <div className="mt-2 space-y-1">
                        {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-slate-800/50 px-3 py-2 rounded">
                            <span className="text-sm text-gray-300">{file.name}</span>
                            <button
                                onClick={() => removeFile(index)}
                                className="text-red-400 hover:text-red-300"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            </div>
                        ))}
                        </div>
                    )}
                    </div>

                    {/* YouTube Links */}
                    <div>
                    <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                        <Youtube className="w-4 h-4 mr-2" />
                        YouTube Links
                    </label>
                    <div className="space-y-2">
                        {youtubeLinks.map((link, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                            type="url"
                            value={link}
                            onChange={(e) => updateYoutubeLink(index, e.target.value)}
                            className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                            placeholder="https://youtube.com/watch?v=..."
                            />
                            {youtubeLinks.length > 1 && (
                            <button
                                onClick={() => removeYoutubeLink(index)}
                                className="px-3 py-2 text-red-400 hover:text-red-300"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            )}
                        </div>
                        ))}
                        <button
                        onClick={addYoutubeLink}
                        className="flex items-center text-purple-400 hover:text-purple-300 text-sm"
                        >
                        <Plus className="w-4 h-4 mr-1" />
                        Add another link
                        </button>
                    </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                <div className="flex justify-end">
                    <button
                    onClick={generateSlides}
                    disabled={!conceptTitle.trim() || (!textualContext.trim() && files.length === 0)}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    Generate Slides
                    </button>
                </div>
                </div>
            )}

            {currentStep === 2 && (
                <div className="text-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-purple-200 mb-2">Generating Slides</h3>
                <p className="text-gray-400">Creating your explainer video content...</p>
                </div>
            )}

            {currentStep === 3 && (
                <div className="space-y-6">
                <h3 className="text-xl font-semibold text-purple-200 mb-4">Generated Content</h3>
                
                {/* Slides Preview */}
                <div>
                    <h4 className="text-lg font-semibold text-purple-200 mb-3">Slides ({slides.length})</h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                    {slides.map((slide, index) => (
                        <div key={index} className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
                        <h5 className="font-semibold text-white mb-2">
                            {index + 1}. {slide.title}
                        </h5>
                        <ul className="text-sm text-gray-300 space-y-1">
                            {(slide.key_points || slide.bullet_points || []).map((point: string, pointIndex: number) => (
                            <li key={pointIndex}>• {point}</li>
                            ))}
                        </ul>
                        </div>
                    ))}
                    </div>
                </div>

                {/* Script Preview */}
                <div>
                    <h4 className="text-lg font-semibold text-purple-200 mb-3">Narration Script</h4>
                    <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4 max-h-40 overflow-y-auto">
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{script}</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                <div className="flex justify-between">
                    <button
                    onClick={downloadPowerPoint}
                    className="flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                    <Download className="w-4 h-4 mr-2" />
                    Download PowerPoint
                    </button>
                    <button
                    onClick={createVideo}
                    className="flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-emerald-700 transition-all duration-200"
                    >
                    <Play className="w-4 h-4 mr-2" />
                    Create Video
                    </button>
                </div>
                </div>
            )}

            {currentStep === 4 && (
                <div className="text-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-purple-200 mb-2">Creating Video</h3>
                <p className="text-gray-400">Generating audio, creating slides, and assembling your video...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few minutes</p>
                </div>
            )}
            </div>
        </div>
        </div>
    );
    }