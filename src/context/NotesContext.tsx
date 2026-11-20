import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Note, Block, BlockType, ViewFilter } from '../types';
import { StorageAdapter } from '../lib/storage';
import { useAuth } from './AuthContext';

function generateId(): string {
  return Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
}

interface NotesContextType {
  notes: Note[];
  activeNote: Note | null;
  activeNoteId: string | null;
  setActiveNoteId: (id: string | null) => void;
  activeFilter: ViewFilter;
  setActiveFilter: (filter: ViewFilter) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isCloudModalOpen: boolean;
  setIsCloudModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isSyncing: boolean;
  createNote: (parentId?: string | null) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string, permanent?: boolean) => void;
  restoreNote: (id: string) => void;
  duplicateNote: (id: string) => void;
  togglePin: (id: string) => void;
  updateBlock: (noteId: string, blockId: string, updates: Partial<Block>) => void;
  insertBlock: (noteId: string, afterBlockId: string | null, type?: BlockType) => string;
  deleteBlock: (noteId: string, blockId: string) => void;
  moveBlock: (noteId: string, blockId: string, direction: 'up' | 'down') => void;
  exportNoteMarkdown: (noteId: string) => void;
  allTags: string[];
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>(() => StorageAdapter.loadLocalNotes());
  const [activeNoteId, setActiveNoteId] = useState<string | null>(() => {
    const local = StorageAdapter.loadLocalNotes();
    const firstActive = local.find(n => !n.isTrash && !n.isArchived);
    return firstActive ? firstActive.id : (local[0]?.id || null);
  });
  const [activeFilter, setActiveFilter] = useState<ViewFilter>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Theme support
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('notesapp_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('notesapp_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Keyboard shortcut listener (Cmd/Ctrl + K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save notes locally whenever they change
  useEffect(() => {
    StorageAdapter.saveLocalNotes(notes);
  }, [notes]);

  // Sync with cloud on auth change or periodically
  const syncTimeoutRef = useRef<number | null>(null);

  const triggerCloudSync = useCallback((notesToSync: Note[]) => {
    if (!user) return;
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    syncTimeoutRef.current = window.setTimeout(async () => {
      setIsSyncing(true);
      await StorageAdapter.syncToCloud(notesToSync);
      setIsSyncing(false);
    }, 1500);
  }, [user]);

  // Fetch initial notes from cloud when user logs in
  useEffect(() => {
    if (user) {
      setIsSyncing(true);
      StorageAdapter.fetchFromCloud().then(cloudNotes => {
        setIsSyncing(false);
        if (cloudNotes && cloudNotes.length > 0) {
          // Merge or replace
          setNotes(cloudNotes);
          if (!activeNoteId || !cloudNotes.some(n => n.id === activeNoteId)) {
            setActiveNoteId(cloudNotes[0]?.id || null);
          }
        } else {
          // Upload local notes to new cloud account
          StorageAdapter.syncToCloud(notes);
        }
      });
    }
  }, [user]);

  const createNote = (parentId: string | null = null): Note => {
    const newNote: Note = {
      id: generateId(),
      title: 'Untitled Note',
      icon: '📄',
      isPinned: false,
      isArchived: false,
      isTrash: false,
      parentId: parentId || null,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      blocks: [
        {
          id: generateId(),
          type: 'paragraph',
          content: ''
        }
      ]
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    setActiveNoteId(newNote.id);
    triggerCloudSync(updated);
    return newNote;
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => {
      const updated = prev.map(note =>
        note.id === id
          ? { ...note, ...updates, updatedAt: new Date().toISOString() }
          : note
      );
      triggerCloudSync(updated);
      return updated;
    });
  };

  const deleteNote = (id: string, permanent: boolean = false) => {
    setNotes(prev => {
      let updated: Note[];
      if (permanent) {
        updated = prev.filter(n => n.id !== id);
      } else {
        updated = prev.map(n => n.id === id ? { ...n, isTrash: true } : n);
      }

      if (activeNoteId === id) {
        const remaining = updated.filter(n => !n.isTrash);
        setActiveNoteId(remaining[0]?.id || null);
      }

      triggerCloudSync(updated);
      return updated;
    });
  };

  const restoreNote = (id: string) => {
    setNotes(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, isTrash: false } : n);
      setActiveNoteId(id);
      triggerCloudSync(updated);
      return updated;
    });
  };

  const duplicateNote = (id: string) => {
    const target = notes.find(n => n.id === id);
    if (!target) return;

    const dup: Note = {
      ...target,
      id: generateId(),
      title: `${target.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      blocks: target.blocks.map(b => ({ ...b, id: generateId() }))
    };

    const updated = [dup, ...notes];
    setNotes(updated);
    setActiveNoteId(dup.id);
    triggerCloudSync(updated);
  };

  const togglePin = (id: string) => {
    setNotes(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n);
      triggerCloudSync(updated);
      return updated;
    });
  };

  const updateBlock = (noteId: string, blockId: string, updates: Partial<Block>) => {
    setNotes(prev => {
      const updated = prev.map(note => {
        if (note.id !== noteId) return note;
        const newBlocks = note.blocks.map(block =>
          block.id === blockId ? { ...block, ...updates } : block
        );
        return { ...note, blocks: newBlocks, updatedAt: new Date().toISOString() };
      });
      triggerCloudSync(updated);
      return updated;
    });
  };

  const insertBlock = (noteId: string, afterBlockId: string | null, type: BlockType = 'paragraph'): string => {
    const newBlockId = generateId();
    const newBlock: Block = {
      id: newBlockId,
      type,
      content: '',
      checked: type === 'todo' ? false : undefined
    };

    setNotes(prev => {
      const updated = prev.map(note => {
        if (note.id !== noteId) return note;
        const index = afterBlockId ? note.blocks.findIndex(b => b.id === afterBlockId) : -1;
        const newBlocks = [...note.blocks];

        if (index === -1) {
          newBlocks.push(newBlock);
        } else {
          newBlocks.splice(index + 1, 0, newBlock);
        }

        return { ...note, blocks: newBlocks, updatedAt: new Date().toISOString() };
      });
      triggerCloudSync(updated);
      return updated;
    });

    return newBlockId;
  };

  const deleteBlock = (noteId: string, blockId: string) => {
    setNotes(prev => {
      const updated = prev.map(note => {
        if (note.id !== noteId) return note;
        if (note.blocks.length <= 1) {
          // Keep at least one empty block
          return {
            ...note,
            blocks: [{ id: generateId(), type: 'paragraph' as BlockType, content: '' }],
            updatedAt: new Date().toISOString()
          };
        }
        return {
          ...note,
          blocks: note.blocks.filter(b => b.id !== blockId),
          updatedAt: new Date().toISOString()
        };
      });
      triggerCloudSync(updated);
      return updated;
    });
  };

  const moveBlock = (noteId: string, blockId: string, direction: 'up' | 'down') => {
    setNotes(prev => {
      const updated = prev.map(note => {
        if (note.id !== noteId) return note;
        const index = note.blocks.findIndex(b => b.id === blockId);
        if (index === -1) return note;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= note.blocks.length) return note;

        const newBlocks = [...note.blocks];
        const [moved] = newBlocks.splice(index, 1);
        newBlocks.splice(targetIndex, 0, moved);

        return { ...note, blocks: newBlocks, updatedAt: new Date().toISOString() };
      });
      triggerCloudSync(updated);
      return updated;
    });
  };

  const exportNoteMarkdown = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    let md = `# ${note.title}\n\n`;
    for (const b of note.blocks) {
      switch (b.type) {
        case 'heading-1':
          md += `# ${b.content}\n\n`;
          break;
        case 'heading-2':
          md += `## ${b.content}\n\n`;
          break;
        case 'heading-3':
          md += `### ${b.content}\n\n`;
          break;
        case 'todo':
          md += `- [${b.checked ? 'x' : ' '}] ${b.content}\n`;
          break;
        case 'bullet-list':
          md += `- ${b.content}\n`;
          break;
        case 'numbered-list':
          md += `1. ${b.content}\n`;
          break;
        case 'quote':
          md += `> ${b.content}\n\n`;
          break;
        case 'code':
          md += `\`\`\`${b.language || ''}\n${b.content}\n\`\`\`\n\n`;
          break;
        case 'callout':
          md += `> **${b.calloutIcon || '💡'}** ${b.content}\n\n`;
          break;
        case 'divider':
          md += `---\n\n`;
          break;
        case 'paragraph':
        default:
          md += `${b.content}\n\n`;
          break;
      }
    }

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${note.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'note'}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const activeNote = notes.find(n => n.id === activeNoteId) || null;

  // Collect all unique tags
  const allTags = Array.from(
    new Set(notes.flatMap(n => n.tags || []))
  ).filter(Boolean);

  return (
    <NotesContext.Provider
      value={{
        notes,
        activeNote,
        activeNoteId,
        setActiveNoteId,
        activeFilter,
        setActiveFilter,
        selectedTag,
        setSelectedTag,
        isSearchOpen,
        setIsSearchOpen,
        isCloudModalOpen,
        setIsCloudModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isSidebarOpen,
        setIsSidebarOpen,
        theme,
        toggleTheme,
        isSyncing,
        createNote,
        updateNote,
        deleteNote,
        restoreNote,
        duplicateNote,
        togglePin,
        updateBlock,
        insertBlock,
        deleteBlock,
        moveBlock,
        exportNoteMarkdown,
        allTags,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};
