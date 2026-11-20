import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotes } from '../../context/NotesContext';
import { Cloud, X, Check, ExternalLink, Key, Database } from 'lucide-react';

export const CloudSettingsModal: React.FC = () => {
  const { isCloudModalOpen, setIsCloudModalOpen } = useNotes();
  const { cloudUrl, cloudKey, updateCloudSettings, isCloudConfigured } = useAuth();

  const [url, setUrl] = useState(cloudUrl);
  const [key, setKey] = useState(cloudKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  React.useEffect(() => {
    if (isCloudModalOpen) {
      setUrl(cloudUrl);
      setKey(cloudKey);
    }
  }, [isCloudModalOpen, cloudUrl, cloudKey]);

  if (!isCloudModalOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCloudSettings(url, key);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsCloudModalOpen(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-100">
      <div className="w-full max-w-lg bg-white dark:bg-neutral-800 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden animate-in zoom-in-95 duration-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg text-emerald-600 dark:text-emerald-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-neutral-900 dark:text-neutral-100">
                Cloud Sync & Supabase
              </h3>
              <p className="text-xs text-neutral-500">
                Configure your cloud backend for real-time multi-device sync.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCloudModalOpen(false)}
            className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-600 dark:text-neutral-300 space-y-1.5">
            <div className="flex items-center gap-1.5 font-medium text-neutral-800 dark:text-neutral-200">
              <Database className="w-3.5 h-3.5 text-blue-500" />
              <span>How Cloud Sync Works</span>
            </div>
            <p>
              Your notes are always saved locally in your browser first. Connecting a free Supabase project allows you to sync across devices and access your notes anywhere.
            </p>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline pt-1"
            >
              Get free Supabase API keys <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Supabase Project URL
            </label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Supabase Anon / Public Key
            </label>
            <input
              type="password"
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3">
            <span className="text-xs text-neutral-400">
              {isCloudConfigured ? '🟢 Connected' : '⚪ Not configured'}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setUrl('');
                  setKey('');
                  updateCloudSettings('', '');
                }}
                className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
              >
                Clear
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Configuration</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
