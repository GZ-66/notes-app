import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'notesapp_supabase_url';
const STORAGE_KEY_ANON = 'notesapp_supabase_key';

export function getSupabaseCredentials(): { url: string; key: string } {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = localStorage.getItem(STORAGE_KEY_URL) || '';
  const storedKey = localStorage.getItem(STORAGE_KEY_ANON) || '';

  return {
    url: storedUrl || envUrl,
    key: storedKey || envKey,
  };
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();

  if (!url || !key || !url.startsWith('http')) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }

  return supabaseInstance;
}

export function saveSupabaseCredentials(url: string, key: string) {
  if (url) {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_URL);
  }

  if (key) {
    localStorage.setItem(STORAGE_KEY_ANON, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_ANON);
  }

  supabaseInstance = null; // Reset to allow recreation
}
