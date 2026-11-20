import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabaseClient, getSupabaseCredentials, saveSupabaseCredentials } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isCloudConfigured: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, pass: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateCloudSettings: (url: string, key: string) => void;
  cloudUrl: string;
  cloudKey: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [cloudCredentials, setCloudCredentials] = useState(getSupabaseCredentials());

  const isCloudConfigured = Boolean(
    cloudCredentials.url && cloudCredentials.key && cloudCredentials.url.startsWith('http')
  );

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setUser(null);
      setSession(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [cloudCredentials]);

  const signInWithEmail = async (email: string, pass: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return { error: new Error('Cloud backend is not configured.') };
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    return { error };
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return { error: new Error('Cloud backend is not configured.') };
    const { error } = await supabase.auth.signUp({ email, password: pass });
    return { error };
  };

  const signOut = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
  };

  const updateCloudSettings = (url: string, key: string) => {
    saveSupabaseCredentials(url, key);
    setCloudCredentials({ url, key });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isCloudConfigured,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        updateCloudSettings,
        cloudUrl: cloudCredentials.url,
        cloudKey: cloudCredentials.key,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
