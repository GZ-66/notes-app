import React from 'react';
import { useNotes } from '../../context/NotesContext';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  Search,
  Cloud,
  CloudOff,
  RefreshCw,
  Sun,
  Moon,
  User as UserIcon,
  LogIn
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeNote,
    isSidebarOpen,
    setIsSidebarOpen,
    setIsSearchOpen,
    setIsCloudModalOpen,
    setIsAuthModalOpen,
    theme,
    toggleTheme,
    isSyncing
  } = useNotes();

  const { user, isCloudConfigured } = useAuth();

  return (
    <header className="h-12 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-notion-dark/80 backdrop-blur px-4 flex items-center justify-between z-10 shrink-0">
      <div className="flex items-center gap-3">
        {!isSidebarOpen && (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            title="Open Sidebar"
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {/* Breadcrumb / Title preview */}
        {activeNote && (
          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
            <span>{activeNote.icon || '📄'}</span>
            <span className="font-medium max-w-xs truncate">
              {activeNote.title || 'Untitled'}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Quick Search Button */}
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 px-2.5 py-1 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/60 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-white dark:bg-neutral-700 rounded border border-neutral-200 dark:border-neutral-600 font-mono">
            Ctrl K
          </kbd>
        </button>

        {/* Sync Status Indicator */}
        <button
          type="button"
          onClick={() => setIsCloudModalOpen(true)}
          title={
            isCloudConfigured
              ? user
                ? 'Cloud Sync Active'
                : 'Cloud Configured - Sign in to sync'
              : 'Local-first Mode (Click to connect Cloud)'
          }
          className="flex items-center gap-1.5 px-2 py-1 text-xs rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          {isSyncing ? (
            <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />
          ) : isCloudConfigured && user ? (
            <Cloud className="w-3.5 h-3.5 text-emerald-500" />
          ) : isCloudConfigured ? (
            <Cloud className="w-3.5 h-3.5 text-amber-500" />
          ) : (
            <CloudOff className="w-3.5 h-3.5 text-neutral-400" />
          )}
          <span className="hidden md:inline text-neutral-500 dark:text-neutral-400">
            {isSyncing ? 'Syncing...' : isCloudConfigured && user ? 'Synced' : isCloudConfigured ? 'Sign in to sync' : 'Local'}
          </span>
        </button>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Auth / Account Profile Button */}
        <button
          type="button"
          onClick={() => setIsAuthModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 transition-colors"
        >
          {user ? (
            <>
              <UserIcon className="w-3.5 h-3.5 text-blue-500" />
              <span className="max-w-[100px] truncate">{user.email?.split('@')[0]}</span>
            </>
          ) : (
            <>
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
