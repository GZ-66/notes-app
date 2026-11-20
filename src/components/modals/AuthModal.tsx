import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotes } from '../../context/NotesContext';
import { User, LogIn, UserPlus, LogOut, X, AlertCircle } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, setIsCloudModalOpen } = useNotes();
  const { user, signInWithEmail, signUpWithEmail, signOut, isCloudConfigured } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [infoMsg, setInfoMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!isCloudConfigured) {
      setErrorMsg('Please configure your Supabase Project URL & Key first.');
      return;
    }

    setLoading(true);
    if (mode === 'signin') {
      const { error } = await signInWithEmail(email, password);
      setLoading(false);
      if (error) {
        setErrorMsg(error.message);
      } else {
        setIsAuthModalOpen(false);
      }
    } else {
      const { error } = await signUpWithEmail(email, password);
      setLoading(false);
      if (error) {
        setErrorMsg(error.message);
      } else {
        setInfoMsg('Account created! Please check your email inbox to confirm registration.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-100">
      <div className="w-full max-w-md bg-white dark:bg-neutral-800 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden animate-in zoom-in-95 duration-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-base text-neutral-900 dark:text-neutral-100">
              {user ? 'Account Profile' : mode === 'signin' ? 'Sign In to Workspace' : 'Create an Account'}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {user ? (
          /* User Profile View */
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-700">
              <span className="text-xs text-neutral-400 uppercase font-medium">Logged in as</span>
              <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mt-1">
                {user.email}
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                User ID: <span className="font-mono">{user.id.substring(0, 12)}...</span>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                await signOut();
                setIsAuthModalOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg text-xs font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        ) : (
          /* Auth Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {!isCloudConfigured && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  Cloud is not configured yet.{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsAuthModalOpen(false);
                      setIsCloudModalOpen(true);
                    }}
                    className="underline font-semibold"
                  >
                    Open Cloud Settings
                  </button>{' '}
                  to add your Supabase keys.
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-xs text-red-600 dark:text-red-400">
                {errorMsg}
              </div>
            )}

            {infoMsg && (
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-600 dark:text-emerald-400">
                {infoMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span>Loading...</span>
              ) : mode === 'signin' ? (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setErrorMsg('');
                  setInfoMsg('');
                }}
                className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
              >
                {mode === 'signin'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
