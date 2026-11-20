import React, { useRef, useEffect, useState } from 'react';
import { Block, BlockType } from '../../types';
import { SlashCommandMenu } from './SlashCommandMenu';
import {
  GripVertical,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Check,
  Copy
} from 'lucide-react';

interface BlockItemProps {
  block: Block;
  index: number;
  totalBlocks: number;
  onUpdate: (updates: Partial<Block>) => void;
  onInsertBelow: (type?: BlockType) => string;
  onDelete: () => void;
  onMove: (direction: 'up' | 'down') => void;
  focusOnMount?: boolean;
}

export const BlockItem: React.FC<BlockItemProps> = ({
  block,
  index,
  totalBlocks,
  onUpdate,
  onInsertBelow,
  onDelete,
  onMove,
  focusOnMount
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashFilter, setSlashFilter] = useState('');
  const [slashPosition, setSlashPosition] = useState({ top: 0, left: 0 });
  const [showActions, setShowActions] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Auto-resize textarea height to fit content
  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 26)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [block.content, block.type]);

  useEffect(() => {
    if (focusOnMount && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [focusOnMount]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    onUpdate({ content: value });

    // Check for slash command trigger
    if (value.startsWith('/')) {
      const rect = e.target.getBoundingClientRect();
      setSlashPosition({
        top: Math.min(rect.bottom + 4, window.innerHeight - 320),
        left: Math.min(rect.left, window.innerWidth - 300)
      });
      setSlashFilter(value.substring(1));
      setShowSlashMenu(true);
    } else {
      setShowSlashMenu(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSlashMenu) {
      // Allow slash menu to handle up/down/enter/escape
      if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(e.key)) {
        return;
      }
    }

    if (e.key === 'Enter') {
      if (block.type === 'code') {
        // Shift+Enter creates next block, plain Enter inserts a newline in code
        if (e.shiftKey) {
          e.preventDefault();
          onInsertBelow('paragraph');
        }
        return;
      }

      e.preventDefault();
      // If list or todo, continue the same type unless empty
      if ((block.type === 'bullet-list' || block.type === 'numbered-list' || block.type === 'todo') && block.content.trim() === '') {
        onUpdate({ type: 'paragraph' });
      } else if (block.type === 'bullet-list' || block.type === 'numbered-list' || block.type === 'todo') {
        onInsertBelow(block.type);
      } else {
        onInsertBelow('paragraph');
      }
    } else if (e.key === 'Backspace') {
      if (block.content === '') {
        e.preventDefault();
        if (block.type !== 'paragraph') {
          onUpdate({ type: 'paragraph' });
        } else {
          onDelete();
        }
      }
    }
  };

  const handleSelectSlashCommand = (type: BlockType) => {
    setShowSlashMenu(false);
    onUpdate({
      type,
      content: '', // Clear the slash command text
      checked: type === 'todo' ? false : undefined,
      calloutIcon: type === 'callout' ? (block.calloutIcon || '💡') : undefined
    });
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(block.content);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Render block content styles
  const getStyleForType = () => {
    switch (block.type) {
      case 'heading-1':
        return 'text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mb-2';
      case 'heading-2':
        return 'text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 mb-1.5';
      case 'heading-3':
        return 'text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-1';
      case 'quote':
        return 'italic text-neutral-700 dark:text-neutral-300';
      case 'code':
        return 'font-mono text-sm leading-relaxed text-emerald-400 bg-neutral-900 selection:bg-emerald-900';
      case 'callout':
        return 'text-neutral-800 dark:text-neutral-200';
      case 'todo':
        return block.checked
          ? 'line-through text-neutral-400 dark:text-neutral-500'
          : 'text-neutral-800 dark:text-neutral-200';
      default:
        return 'text-base text-neutral-800 dark:text-neutral-200 leading-relaxed';
    }
  };

  const placeholderForType = () => {
    switch (block.type) {
      case 'heading-1': return 'Heading 1';
      case 'heading-2': return 'Heading 2';
      case 'heading-3': return 'Heading 3';
      case 'todo': return 'To-do item...';
      case 'bullet-list': return 'List item...';
      case 'numbered-list': return 'Numbered item...';
      case 'quote': return 'Empty quote...';
      case 'callout': return 'Type a note or callout...';
      case 'code': return '// Write or paste code here...';
      default: return "Type '/' for commands...";
    }
  };

  return (
    <div
      className="group relative flex items-start -ml-12 pl-12 py-1 transition-colors rounded-md"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Floating Grip & Action Controls on left margin */}
      <div
        className={`absolute left-0 top-1.5 flex items-center gap-0.5 text-neutral-400 dark:text-neutral-500 transition-opacity ${
          showActions ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          type="button"
          onClick={() => onInsertBelow('paragraph')}
          title="Add block below"
          className="p-1 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        <div className="relative group/grip">
          <button
            type="button"
            title="Drag or block actions"
            className="p-1 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded cursor-grab transition-colors"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          type="button"
          disabled={index === 0}
          onClick={() => onMove('up')}
          title="Move up"
          className="p-1 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded disabled:opacity-20 transition-colors"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          disabled={index === totalBlocks - 1}
          onClick={() => onMove('down')}
          title="Move down"
          className="p-1 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded disabled:opacity-20 transition-colors"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onDelete}
          title="Delete block"
          className="p-1 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Block Body Rendering */}
      <div className="flex-1 w-full min-w-0">
        {block.type === 'divider' ? (
          <div className="py-2 cursor-pointer" onClick={() => onInsertBelow('paragraph')}>
            <hr className="border-t border-neutral-200 dark:border-neutral-800 my-2" />
          </div>
        ) : (
          <div
            className={`w-full flex items-start gap-2.5 ${
              block.type === 'quote'
                ? 'border-l-4 border-amber-500 pl-4 py-1 my-1 bg-amber-50/30 dark:bg-amber-950/20 rounded-r'
                : block.type === 'callout'
                ? 'bg-neutral-100/80 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 rounded-lg p-3 my-1.5'
                : block.type === 'code'
                ? 'bg-neutral-900 border border-neutral-800 rounded-lg p-3 my-2 text-neutral-100 shadow-sm relative'
                : ''
            }`}
          >
            {/* Visual Prefix Icons / Bullet Markers / Checkboxes */}
            {block.type === 'todo' && (
              <button
                type="button"
                onClick={() => onUpdate({ checked: !block.checked })}
                className={`mt-1 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                  block.checked
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-neutral-400 dark:border-neutral-500 hover:border-blue-500'
                }`}
              >
                {block.checked && <Check className="w-3 h-3 stroke-[3]" />}
              </button>
            )}

            {block.type === 'bullet-list' && (
              <span className="mt-1 text-neutral-400 dark:text-neutral-500 select-none text-base shrink-0">
                •
              </span>
            )}

            {block.type === 'numbered-list' && (
              <span className="mt-1 text-neutral-500 dark:text-neutral-400 text-sm font-medium select-none shrink-0 min-w-[1.2rem]">
                {index + 1}.
              </span>
            )}

            {block.type === 'callout' && (
              <span
                className="text-xl select-none cursor-pointer shrink-0"
                title="Change Icon"
                onClick={() => {
                  const icons = ['💡', '⚠️', '📌', '🚀', '🔥', '✅', '❤️', '🧠'];
                  const currentIdx = icons.indexOf(block.calloutIcon || '💡');
                  const nextIcon = icons[(currentIdx + 1) % icons.length];
                  onUpdate({ calloutIcon: nextIcon });
                }}
              >
                {block.calloutIcon || '💡'}
              </span>
            )}

            {/* Main Textarea */}
            <div className="flex-1 min-w-0 relative">
              {block.type === 'code' && (
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800 text-xs text-neutral-400">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold uppercase tracking-wider text-neutral-500">Code Snippet</span>
                    <input
                      type="text"
                      value={block.language || 'typescript'}
                      onChange={e => onUpdate({ language: e.target.value })}
                      placeholder="language"
                      className="bg-transparent border-none text-xs text-neutral-400 focus:outline-none focus:text-neutral-200 w-24"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={copyCode}
                    className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-neutral-800 text-neutral-300 transition-colors"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 text-xs">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span className="text-xs">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              <textarea
                ref={textareaRef}
                value={block.content}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder={placeholderForType()}
                rows={1}
                className={`w-full bg-transparent resize-none border-none outline-none p-0 focus:ring-0 ${getStyleForType()}`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Slash Command Autocomplete Menu */}
      {showSlashMenu && (
        <SlashCommandMenu
          filter={slashFilter}
          onSelect={handleSelectSlashCommand}
          onClose={() => setShowSlashMenu(false)}
          position={slashPosition}
        />
      )}
    </div>
  );
};
