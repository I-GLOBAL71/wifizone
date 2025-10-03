import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { auth as firebaseAuth } from '@/lib/firebase';
import { signInWithCustomToken, User as FirebaseUser } from 'firebase/auth';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: SupabaseUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      console.error('Error generating Google sign-in URL:', error);
      return;
    }

    if (data.url) {
      const popup = window.open(data.url, 'google-signin', 'width=600,height=700');
      const checkPopup = setInterval(() => {
        if (!popup || popup.closed || popup.closed === undefined) {
          clearInterval(checkPopup);
          // You might want to refresh the session here to reflect the login state
          supabase.auth.refreshSession();
        }
      }, 1000);
    }
  };

  async function signInWithFirebase(supabaseSession: Session) {
    try {
      // NOTE: You need to create a Supabase Edge Function called 'get-firebase-token'
      // This function will take the Supabase access token and return a Firebase custom token.
      const { data, error } = await supabase.functions.invoke('get-firebase-token', {
        headers: {
          'Authorization': `Bearer ${supabaseSession.access_token}`
        },
        body: { uid: supabaseSession.user.id }
      });

      if (error) throw error;

      const { customToken } = data;
      const { user: fbUser } = await signInWithCustomToken(firebaseAuth, customToken);
      setFirebaseUser(fbUser);
    } catch (error) {
      console.error("Error signing in with Firebase:", error);
    }
  }

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      if (session) {
        await signInWithFirebase(session);
      }
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) {
        await signInWithFirebase(session);
      } else {
        setFirebaseUser(null);
        firebaseAuth.signOut();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, firebaseUser, loading, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};