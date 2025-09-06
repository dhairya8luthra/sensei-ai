import React, { useState } from 'react';
import { X, Target, Sparkles, Loader2 } from 'lucide-react';

interface CreateDojoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDojoCreated: () => void;
  user: any;
}

export default function CreateDojoModal({ isOpen, onClose, onDojoCreated, user }: CreateDojoModalProps) {
  const [sessionName, setSessionName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionName.trim()) {
      setError('Dojo name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${backendUrl}/api/create-dojo-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          session_name: sessionName.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create dojo session');
      }

      // Reset form and close modal
      setSessionName('');
      onClose();
      onDojoCreated();
    } catch (err: any) {
      setError(err.message || 'Failed to create dojo session');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-emerald-900/90 to-slate-900/90 backdrop-blur-sm rounded-2xl p-8 border border-emerald-700/30 shadow-2xl max-w-md w-full transform animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-cinzel text-2xl font-semibold text-emerald-200">
              Create New Dojo
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-emerald-200 font-medium mb-3" htmlFor="sessionName">
              Dojo Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                id="sessionName"
                type="text"
                placeholder="Enter your dojo session name..."
                value={sessionName}
                onChange={(e) => {
                  setSessionName(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 bg-slate-800/50 border border-emerald-700/30 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                required
                maxLength={100}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="text-xs text-gray-400">
                  {sessionName.length}/100
                </span>
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Choose a descriptive name for your learning session
            </p>
          </div>

          {error && (
            <div className="bg-red-900/40 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-emerald-400/50 text-emerald-400 rounded-lg font-semibold hover:bg-emerald-400/10 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !sessionName.trim()}
              className="flex-1 group px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg font-semibold shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Dojo
                    <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                  </>
                )}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}