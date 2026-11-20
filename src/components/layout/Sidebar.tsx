import React from 'react';
import { useNotes } from '../../context/NotesContext';
import { useAuth } from '../../context/AuthContext';
import { Note } from '../../types';
import {
  Plus,
  Search,
  Star,
  Trash2,
  ChevronRight,
  ChevronDown,
  Pin,
  Settings,
  PanelLeftClose,
  Tag as TagIcon
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    notes,
    activeNoteId,
    setActiveNoteId,
    activeFilter,
    setActiveFilter,
    selectedTag,
    setSelectedTag,
    isSidebarOpen,
    setIsSidebarOpen,
    setIsSearchOpen,
    setIsCloudModalOpen,
    createNote,
    deleteNote,
    togglePin,
    allTags
  } = useNotes();

  const { user, isCloudConfigured } = useAuth();
  const [expandedParents, setExpandedParents] = React.useState<Record<string, boolean>>({});

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedParents(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!isSidebarOpen) return null;

  const pinnedNotes = notes.filter(n => n.isPinned && !n.isTrash && !n.isArchived);
  const rootNotes = notes.filter(n => !n.parentId && !n.isTrash && !n.isArchived);
  const trashNotes = notes.filter(n => n.isTrash);

  const getSubNotes = (parentId: string) => {
    return notes.filter(n => n.parentId === parentId && !n.isTrash && !n.isArchived);
  };

  const renderNoteItem = (note: Note, depth: number = 0) => {
    const subNotes = getSubNotes(note.id);
    const hasChildren = subNotes.length > 0;
    const isExpanded = !!expandedParents[note.id];
    const isActive = activeNoteId === note.id;

    return (
      <div key={note.id} className="select-none">
        <div
          onClick={() => {
            setActiveFilter('all');
            setSelectedTag(null);
            setActiveNoteId(note.id);
          }}
          style={{ paddingLeft: `${12 + depth * 14}px` }}
          className={`group flex items-center justify-between pr-2 py-1 text-sm rounded-md cursor-pointer transition-colors ${
            isActive
              ? 'bg-neutral-200/70 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {hasChildren ? (
              <button
                type="button"
                onClick={e => toggleExpand(note.id, e)}
                className="p-0.5 hover:bg-neutral-300/60 dark:hover:bg-neutral-700 rounded text-neutral-400"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>
            ) : (
              <span className="w-4" />
            )}

            <span className="text-base shrink-0">{note.icon || '📄'}</span>
            <span className="truncate text-xs">{note.title || 'Untitled'}</span>
          </div>

          {/* Quick Hover Controls */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                createNote(note.id);
                setExpandedParents(prev => ({ ...prev, [note.id]: true }));
              }}
              title="Add sub-page"
              className="p-1 hover:bg-neutral-300 dark:hover:bg-neutral-700 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                togglePin(note.id);
              }}
              title={note.isPinned ? 'Unpin' : 'Pin'}
              className="p-1 hover:bg-neutral-300 dark:hover:bg-neutral-700 rounded text-neutral-400 hover:text-blue-500"
            >
              <Pin className={`w-3 h-3 ${note.isPinned ? 'fill-blue-500 text-blue-500' : ''}`} />
            </button>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                deleteNote(note.id);
              }}
              title="Move to trash"
              className="p-1 hover:bg-neutral-300 dark:hover:bg-neutral-700 rounded text-neutral-400 hover:text-red-500"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Render Nested Sub-pages */}
        {hasChildren && isExpanded && (
          <div>
            {subNotes.map(sub => renderNoteItem(sub, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-64 border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-notion-darker flex flex-col h-full shrink-0 select-none">
      {/* Top Header */}
      <div className="h-12 px-3 border-b border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            N
          </div>
          <span className="font-semibold text-xs tracking-tight text-neutral-800 dark:text-neutral-200 truncate">
            {user ? `${user.email?.split('@')[0]}'s Workspace` : 'Personal Notes'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsSidebarOpen(false)}
          title="Close sidebar"
          className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Primary Actions */}
      <div className="p-2 space-y-0.5">
        <button
          type="button"
          onClick={() => createNote()}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Page</span>
        </button>

        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 rounded-md transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Quick Find</span>
          <span className="ml-auto text-[10px] text-neutral-400">Ctrl+K</span>
        </button>
      </div>

      {/* Notes Tree List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4 scrollbar-thin">
        {/* Pinned Section */}
        {pinnedNotes.length > 0 && (
          <div>
            <div className="px-2 py-1 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>Favorites</span>
            </div>
            <div className="space-y-0.5">
              {pinnedNotes.map(n => renderNoteItem(n, 0))}
            </div>
          </div>
        )}

        {/* All Pages Section */}
        <div>
          <div className="px-2 py-1 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider flex items-center justify-between">
            <span>Pages</span>
            <button
              type="button"
              onClick={() => createNote()}
              title="Add Page"
              className="hover:text-neutral-700 dark:hover:text-neutral-200"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-0.5">
            {rootNotes.length === 0 ? (
              <div className="px-3 py-2 text-xs text-neutral-400 italic">No notes yet. Click + to add one.</div>
            ) : (
              rootNotes.map(n => renderNoteItem(n, 0))
            )}
          </div>
        </div>

        {/* Tags Section */}
        {allTags.length > 0 && (
          <div>
            <div className="px-2 py-1 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
              <TagIcon className="w-3 h-3" />
              <span>Tags</span>
            </div>
            <div className="flex flex-wrap gap-1 px-2 pt-1">
              {allTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSelectedTag(selectedTag === tag ? null : tag);
                    setActiveFilter('tag');
                    const noteWithTag = notes.find(n => n.tags?.includes(tag) && !n.isTrash);
                    if (noteWithTag) setActiveNoteId(noteWithTag.id);
                  }}
                  className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                    selectedTag === tag
                      ? 'bg-blue-600 text-white'
                      : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-300 dark:hover:bg-neutral-700'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Trash Section */}
        <div>
          <button
            type="button"
            onClick={() => {
              setActiveFilter('trash');
              setSelectedTag(null);
              const firstTrash = trashNotes[0];
              if (firstTrash) setActiveNoteId(firstTrash.id);
            }}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md transition-colors ${
              activeFilter === 'trash'
                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium'
                : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Trash ({trashNotes.length})</span>
          </button>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="p-2 border-t border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-between text-xs text-neutral-500">
        <button
          type="button"
          onClick={() => setIsCloudModalOpen(true)}
          className="flex items-center gap-1.5 px-2 py-1 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 rounded transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Settings</span>
        </button>

        <span className="text-[11px] text-neutral-400">
          {isCloudConfigured ? 'Cloud Sync Ready' : 'Local Storage'}
        </span>
      </div>
    </aside>
  );
};
