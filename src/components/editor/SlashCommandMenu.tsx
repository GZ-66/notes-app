import React, { useEffect, useState, useRef } from 'react';
import { BlockType } from '../../types';
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  CheckSquare,
  List,
  ListOrdered,
  Quote,
  MessageSquare,
  Code,
  Minus
} from 'lucide-react';

interface SlashItem {
  type: BlockType;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const COMMANDS: SlashItem[] = [
  {
    type: 'paragraph',
    title: 'Text',
    description: 'Just start writing with plain text.',
    icon: <Type className="w-4 h-4 text-neutral-500" />
  },
  {
    type: 'heading-1',
    title: 'Heading 1',
    description: 'Big section heading.',
    icon: <Heading1 className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
  },
  {
    type: 'heading-2',
    title: 'Heading 2',
    description: 'Medium section heading.',
    icon: <Heading2 className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
  },
  {
    type: 'heading-3',
    title: 'Heading 3',
    description: 'Small section heading.',
    icon: <Heading3 className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
  },
  {
    type: 'todo',
    title: 'To-do list',
    description: 'Track tasks with a to-do list checkbox.',
    icon: <CheckSquare className="w-4 h-4 text-blue-500" />
  },
  {
    type: 'bullet-list',
    title: 'Bulleted list',
    description: 'Create a simple bulleted list.',
    icon: <List className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
  },
  {
    type: 'numbered-list',
    title: 'Numbered list',
    description: 'Create an ordered sequential list.',
    icon: <ListOrdered className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
  },
  {
    type: 'quote',
    title: 'Quote',
    description: 'Capture a quote or highlighted statement.',
    icon: <Quote className="w-4 h-4 text-amber-500" />
  },
  {
    type: 'callout',
    title: 'Callout',
    description: 'Make writing stand out with an icon background.',
    icon: <MessageSquare className="w-4 h-4 text-purple-500" />
  },
  {
    type: 'code',
    title: 'Code block',
    description: 'Capture a code snippet with formatting.',
    icon: <Code className="w-4 h-4 text-emerald-500" />
  },
  {
    type: 'divider',
    title: 'Divider',
    description: 'Visually divide blocks with a line.',
    icon: <Minus className="w-4 h-4 text-neutral-400" />
  }
];

interface SlashCommandMenuProps {
  filter: string;
  onSelect: (type: BlockType) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

export const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({
  filter,
  onSelect,
  onClose,
  position
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const cleanFilter = filter.toLowerCase().trim();
  const filteredCommands = COMMANDS.filter(cmd =>
    cmd.title.toLowerCase().includes(cleanFilter) ||
    cmd.description.toLowerCase().includes(cleanFilter) ||
    cmd.type.toLowerCase().includes(cleanFilter)
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [filter]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (filteredCommands.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          onSelect(filteredCommands[selectedIndex].type);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredCommands, selectedIndex, onSelect, onClose]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (filteredCommands.length === 0) return null;

  return (
    <div
      ref={menuRef}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      className="fixed z-50 w-72 max-h-80 overflow-y-auto bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 py-1.5 scrollbar-thin text-sm animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
        Basic Blocks
      </div>
      {filteredCommands.map((item, idx) => {
        const isSelected = idx === selectedIndex;
        return (
          <button
            key={item.type}
            type="button"
            onClick={() => onSelect(item.type)}
            onMouseEnter={() => setSelectedIndex(idx)}
            className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
              isSelected
                ? 'bg-blue-50 dark:bg-neutral-700/70 text-blue-900 dark:text-blue-100'
                : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700/50'
            }`}
          >
            <div className="flex items-center justify-center w-7 h-7 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shrink-0">
              {item.icon}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                {item.title}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                {item.description}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
