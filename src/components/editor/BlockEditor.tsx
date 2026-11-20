import React, { useRef } from 'react';
import { useNotes } from '../../context/NotesContext';
import { BlockItem } from './BlockItem';
import {
  Pin,
  Download,
  Copy,
  Trash2,
  RotateCcw,
  Plus,
  Tag,
  X,
  FileText
} from 'lucide-react';

const EMOJI_PALETTE = ['📝', '🚀', '💡', '🎯', '📚', '💻', '☕', '🌟', '💼', '🎨', '🧪', '📂', '📌', '⚡', '🔥', '✨'];

export const BlockEditor: React.FC = () => {
  const {
    activeNote,
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
    createNote
  } = useNotes();

  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const [tagInput, setTagInput] = React.useState('');
  const [showTagInput, setShowTagInput] = React.useState(false);
  const titleTextareaRef = useRef<HTMLTextAreaElement>(null);

  if (!activeNote) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-400 dark:text-neutral-500">
        <FileText className="w-16 h-16 stroke-1 mb-4 opacity-50" />
        <h2 className="text-xl font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Select a note or create a new one
        </h2>
        <p className="text-sm max-w-sm mb-6 text-neutral-500">
          Choose a page from the sidebar on the left, or start from scratch right now.
        </p>
        <button
          type="button"
          onClick={() => createNote()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create New Page
        </button>
      </div>
    );
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeNote.blocks.length > 0) {
        // Focus first block
      } else {
        insertBlock(activeNote.id, null, 'paragraph');
      }
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const cleanTag = tagInput.trim().toLowerCase();
      if (!activeNote.tags.includes(cleanTag)) {
        updateNote(activeNote.id, {
          tags: [...activeNote.tags, cleanTag]
        });
      }
      setTagInput('');
      setShowTagInput(false);
    } else if (e.key === 'Escape') {
      setShowTagInput(false);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateNote(activeNote.id, {
      tags: activeNote.tags.filter(t => t !== tagToRemove)
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-white dark:bg-notion-dark transition-colors">
      {/* Trash Banner if in trash */}
      {activeNote.isTrash && (
        <div className="sticky top-0 z-20 bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 flex items-center justify-between text-sm text-amber-700 dark:text-amber-400">
          <span>This note is currently in the Trash.</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => restoreNote(activeNote.id)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restore
            </button>
            <button
              type="button"
              onClick={() => deleteNote(activeNote.id, true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-medium text-xs transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Permanently
            </button>
          </div>
        </div>
      )}

      {/* Top Note Actions Toolbar */}
      <div className="px-8 sm:px-16 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500">
          <span>Last edited {new Date(activeNote.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => togglePin(activeNote.id)}
            title={activeNote.isPinned ? 'Unpin note' : 'Pin note'}
            className={`p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
              activeNote.isPinned ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
            }`}
          >
            <Pin className={`w-4 h-4 ${activeNote.isPinned ? 'fill-current' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => exportNoteMarkdown(activeNote.id)}
            title="Export as Markdown (.md)"
            className="p-1.5 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => duplicateNote(activeNote.id)}
            title="Duplicate note"
            className="p-1.5 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>

          {!activeNote.isTrash && (
            <button
              type="button"
              onClick={() => deleteNote(activeNote.id)}
              title="Move to Trash"
              className="p-1.5 rounded text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Note Content Container */}
      <div className="w-full max-w-4xl mx-auto px-8 sm:px-16 py-6 flex-1 flex flex-col">
        {/* Note Icon & Icon Picker */}
        <div className="relative mb-3">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-4xl p-1 -ml-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors select-none"
            title="Change icon"
          >
            {activeNote.icon || '📝'}
          </button>

          {showEmojiPicker && (
            <div className="absolute top-14 left-0 z-40 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-xl rounded-xl p-3 grid grid-cols-8 gap-1.5 animate-in fade-in zoom-in-95">
              {EMOJI_PALETTE.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    updateNote(activeNote.id, { icon: emoji });
                    setShowEmojiPicker(false);
                  }}
                  className="w-8 h-8 flex items-center justify-center text-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Note Title */}
        <textarea
          ref={titleTextareaRef}
          value={activeNote.title}
          onChange={e => updateNote(activeNote.id, { title: e.target.value })}
          onKeyDown={handleTitleKeyDown}
          placeholder="Untitled"
          rows={1}
          className="w-full font-bold text-3xl sm:text-4xl text-neutral-900 dark:text-neutral-50 bg-transparent resize-none border-none outline-none p-0 focus:ring-0 mb-4 placeholder:text-neutral-300 dark:placeholder:text-neutral-600"
        />

        {/* Tags Section */}
        <div className="flex flex-wrap items-center gap-1.5 mb-8">
          {activeNote.tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 group/tag border border-neutral-200/60 dark:border-neutral-700/60"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-red-500 rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {showTagInput ? (
            <div className="inline-flex items-center">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="tag name + enter"
                autoFocus
                className="text-xs px-2 py-0.5 rounded bg-transparent border border-blue-500 dark:border-blue-400 text-neutral-800 dark:text-neutral-200 outline-none w-28"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowTagInput(true)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Tag className="w-3 h-3" />
              Add tag
            </button>
          )}
        </div>

        {/* Blocks Render List */}
        <div className="space-y-1">
          {activeNote.blocks.map((block, index) => (
            <BlockItem
              key={block.id}
              block={block}
              index={index}
              totalBlocks={activeNote.blocks.length}
              onUpdate={updates => updateBlock(activeNote.id, block.id, updates)}
              onInsertBelow={type => insertBlock(activeNote.id, block.id, type)}
              onDelete={() => deleteBlock(activeNote.id, block.id)}
              onMove={direction => moveBlock(activeNote.id, block.id, direction)}
            />
          ))}
        </div>

        {/* Bottom click area to append new block */}
        <div
          className="flex-1 min-h-[200px] cursor-text py-8"
          onClick={() => {
            const lastBlock = activeNote.blocks[activeNote.blocks.length - 1];
            if (!lastBlock || lastBlock.content.trim() !== '') {
              insertBlock(activeNote.id, lastBlock?.id || null, 'paragraph');
            }
          }}
        />
      </div>
    </div>
  );
};
