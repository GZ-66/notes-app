import { Note } from '../types';
import { getSupabaseClient } from './supabase';

const LOCAL_STORAGE_KEY = 'notesapp_data_v1';

export const INITIAL_WELCOME_NOTE: Note = {
  id: 'welcome-note',
  title: '👋 Welcome to your Notion-style Notes!',
  icon: '🚀',
  isPinned: true,
  isArchived: false,
  isTrash: false,
  parentId: null,
  tags: ['getting-started', 'guide'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  blocks: [
    {
      id: 'b1',
      type: 'callout',
      content: 'This notes app works completely **offline first**! Your notes are saved locally in real-time, and you can also connect **Supabase** for instant cloud sync across devices.',
      calloutIcon: '💡'
    },
    {
      id: 'b2',
      type: 'heading-1',
      content: '✨ Powerful Block Editing'
    },
    {
      id: 'b3',
      type: 'paragraph',
      content: 'Every piece of content is an independent block. Try these shortcuts to get the hang of it:'
    },
    {
      id: 'b4',
      type: 'todo',
      content: 'Type "/" on any new line to trigger the block selector menu',
      checked: true
    },
    {
      id: 'b5',
      type: 'todo',
      content: 'Press "Enter" to create a new block below the current one',
      checked: false
    },
    {
      id: 'b6',
      type: 'todo',
      content: 'Press "Backspace" on an empty block to convert or remove it',
      checked: false
    },
    {
      id: 'b7',
      type: 'heading-2',
      content: '💻 Code Blocks, Quotes, and Formatting'
    },
    {
      id: 'b8',
      type: 'code',
      content: '// Quick search anytime\nconst shortcut = "Ctrl + K"; // or Cmd + K\nconsole.log("Find any note in milliseconds!");',
      language: 'typescript'
    },
    {
      id: 'b9',
      type: 'quote',
      content: '"Organizing isn\'t about perfection. It\'s about efficiency, reducing stress and clutter, saving time and money, and improving your overall quality of life."'
    },
    {
      id: 'b10',
      type: 'divider',
      content: ''
    },
    {
      id: 'b11',
      type: 'paragraph',
      content: 'Create your first custom note by clicking **+ New Page** in the sidebar on the left.'
    }
  ]
};

export const StorageAdapter = {
  // Load notes locally
  loadLocalNotes(): Note[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!data) {
        return [INITIAL_WELCOME_NOTE];
      }
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [INITIAL_WELCOME_NOTE];
    } catch (e) {
      console.error('Error reading from localStorage', e);
      return [INITIAL_WELCOME_NOTE];
    }
  },

  // Save notes locally
  saveLocalNotes(notes: Note[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
      console.error('Error writing to localStorage', e);
    }
  },

  // Sync to Supabase if connected and user is logged in
  async syncToCloud(notes: Note[]): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    if (!user) return false;

    try {
      const rows = notes.map(note => ({
        id: note.id,
        user_id: user.id,
        title: note.title,
        icon: note.icon || '📝',
        cover_image: note.coverImage || null,
        is_pinned: note.isPinned,
        is_archived: note.isArchived,
        is_trash: note.isTrash,
        parent_id: note.parentId || null,
        blocks: note.blocks,
        tags: note.tags || [],
        updated_at: note.updatedAt || new Date().toISOString()
      }));

      const { error } = await supabase
        .from('notes')
        .upsert(rows, { onConflict: 'id' });

      if (error) {
        console.error('Supabase upsert error:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Supabase sync exception:', err);
      return false;
    }
  },

  // Fetch from Supabase cloud
  async fetchFromCloud(): Promise<Note[] | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error || !data) {
        console.error('Supabase fetch error:', error);
        return null;
      }

      const mappedNotes: Note[] = data.map((row: any) => ({
        id: row.id,
        title: row.title,
        icon: row.icon,
        coverImage: row.cover_image,
        isPinned: row.is_pinned,
        isArchived: row.is_archived,
        isTrash: row.is_trash,
        parentId: row.parent_id,
        blocks: row.blocks || [],
        tags: row.tags || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        userId: row.user_id
      }));

      return mappedNotes;
    } catch (err) {
      console.error('Supabase fetch exception:', err);
      return null;
    }
  }
};
