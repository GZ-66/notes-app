import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'notesapp_supabase_url';
const STORAGE_KEY_ANON = 'notesapp_supabase_key';

export function normalizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();

  // If user pasted dashboard project URL: https://supabase.com/dashboard/project/fuixflikrflhxzjeixil
  const dashboardMatch = url.match(/supabase\.com\/dashboard\/project\/([a-zA-Z0-9_-]+)/);
  if (dashboardMatch) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  // If user pasted without protocol: abc.supabase.co
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  // Strip trailing slashes
  return url.replace(/\/+$/, '');
}

export function getSupabaseCredentials(): { url: string; key: string } {
  const envUrl = normalizeSupabaseUrl((import.meta as any).env?.VITE_SUPABASE_URL || '');
  const envKey = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '').trim();

  const storedUrl = normalizeSupabaseUrl(localStorage.getItem(STORAGE_KEY_URL) || '');
  const storedKey = (localStorage.getItem(STORAGE_KEY_ANON) || '').trim();

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
  const cleanedUrl = normalizeSupabaseUrl(url);
  const cleanedKey = key.trim();

  if (cleanedUrl) {
    localStorage.setItem(STORAGE_KEY_URL, cleanedUrl);
  } else {
    localStorage.removeItem(STORAGE_KEY_URL);
  }

  if (cleanedKey) {
    localStorage.setItem(STORAGE_KEY_ANON, cleanedKey);
  } else {
    localStorage.removeItem(STORAGE_KEY_ANON);
  }

  supabaseInstance = null; // Reset to allow recreation
}
