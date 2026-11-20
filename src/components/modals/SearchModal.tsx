import React, { useState, useEffect, useRef } from 'react';
import { useNotes } from '../../context/NotesContext';
import { Search, FileText, ArrowRight, X } from 'lucide-react';

export const SearchModal: React.FC = () => {
  const { notes, isSearchOpen, setIsSearchOpen, setActiveNoteId, setActiveFilter } = useNotes();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const cleanQuery = query.toLowerCase().trim();
  const filteredNotes = notes.filter(note => {
    if (note.isTrash) return false;
    if (!cleanQuery) return true;

    const matchesTitle = note.title.toLowerCase().includes(cleanQuery);
    const matchesTag = note.tags?.some(t => t.toLowerCase().includes(cleanQuery));
    const matchesBlocks = note.blocks.some(b => b.content.toLowerCase().includes(cleanQuery));

    return matchesTitle || matchesTag || matchesBlocks;
  });

  const handleSelectNote = (id: string) => {
    setActiveFilter('all');
    setActiveNoteId(id);
    setIsSearchOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredNotes.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredNotes.length) % Math.max(1, filteredNotes.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredNotes[selectedIndex]) {
        handleSelectNote(filteredNotes[selectedIndex].id);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsSearchOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-100">
      <div
        className="w-full max-w-xl bg-white dark:bg-neutral-800 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden flex flex-col max-h-[70vh] animate-in zoom-in-95 duration-100"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search notes, text, or tags..."
            className="flex-1 bg-transparent text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] bg-neutral-100 dark:bg-neutral-700 text-neutral-500 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-600 font-mono">
            ESC
          </kbd>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-neutral-100 dark:divide-neutral-700/50">
          {filteredNotes.length === 0 ? (
            <div className="py-12 text-center text-sm text-neutral-400">
              No matching notes found.
            </div>
          ) : (
            filteredNotes.map((note, idx) => {
              const isSelected = idx === selectedIndex;
              // Find matching block snippet if any
              const matchingBlock = cleanQuery
                ? note.blocks.find(b => b.content.toLowerCase().includes(cleanQuery))
                : null;

              return (
                <div
                  key={note.id}
                  onClick={() => handleSelectNote(note.id)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-start justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-neutral-700/60 text-blue-900 dark:text-blue-100'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-750 text-neutral-700 dark:text-neutral-200'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span className="text-xl shrink-0 mt-0.5">{note.icon || '📄'}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm text-neutral-900 dark:text-neutral-100 truncate">
                        {note.title || 'Untitled Note'}
                      </div>
                      {matchingBlock && (
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5 font-mono">
                          "{matchingBlock.content.trim()}"
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-400">
                        <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                        {note.tags?.map(t => (
                          <span key={t} className="text-blue-500">#{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-neutral-400 shrink-0 self-center ml-2 opacity-0 group-hover:opacity-100" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
