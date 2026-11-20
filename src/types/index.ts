export type BlockType =
  | 'paragraph'
  | 'heading-1'
  | 'heading-2'
  | 'heading-3'
  | 'todo'
  | 'bullet-list'
  | 'numbered-list'
  | 'quote'
  | 'callout'
  | 'code'
  | 'divider';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean;
  language?: string;
  calloutIcon?: string;
}

export interface Note {
  id: string;
  title: string;
  icon?: string;
  coverImage?: string;
  isPinned: boolean;
  isArchived: boolean;
  isTrash: boolean;
  parentId?: string | null;
  blocks: Block[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  userId?: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
}

export type ViewFilter = 'all' | 'favorites' | 'trash' | 'archived' | 'tag';

export interface CloudConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isConnected: boolean;
}
