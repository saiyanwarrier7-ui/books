import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { UserProfile } from '../types.ts';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  token: string | null;
  isAdmin: boolean;
  isStudent: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsDemoStudent: () => void;
  loginAsDemoAdmin: () => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  token: null,
  isAdmin: false,
  isStudent: false,
  isLoading: true,
  loginWithGoogle: async () => {},
  loginAsDemoStudent: () => {},
  loginAsDemoAdmin: () => {},
  logout: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for saved demo sessions
  useEffect(() => {
    const savedDemo = localStorage.getItem('hub-demo-auth');
    if (savedDemo === 'admin') {
      loginAsDemoAdmin();
      return;
    } else if (savedDemo === 'student') {
      loginAsDemoStudent();
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          setUser(firebaseUser);
          setToken(idToken);
          // Sync profile
          await fetchProfile(idToken);
        } catch (err) {
          console.error('Error getting ID token:', err);
        }
      } else {
        setUser(null);
        setProfile(null);
        setToken(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchProfile = async (authToken: string) => {
    try {
      const res = await fetch('/api/student/profile', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      const cred = await signInWithPopup(auth, googleAuthProvider);
      const idToken = await cred.user.getIdToken();
      setUser(cred.user);
      setToken(idToken);
      localStorage.removeItem('hub-demo-auth');
      await fetchProfile(idToken);
    } catch (error: any) {
      console.error('Google Sign-In failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemoStudent = () => {
    const demoToken = 'demo-student-token-hub-2026';
    setToken(demoToken);
    setUser({
      uid: 'student-demo-uid',
      email: 'student@itstudyhub.edu',
      displayName: 'Aditya Sharma',
    } as any);
    setProfile({
      id: 'student-demo-uid',
      email: 'student@itstudyhub.edu',
      fullName: 'Aditya Sharma',
      role: 'student',
    });
    localStorage.setItem('hub-demo-auth', 'student');
    setIsLoading(false);
  };

  const loginAsDemoAdmin = () => {
    const demoToken = 'demo-admin-token-hub-2026';
    setToken(demoToken);
    setUser({
      uid: 'admin-super-uid',
      email: 'admin@itstudyhub.edu',
      displayName: 'Academic Administrator',
    } as any);
    setProfile({
      id: 'admin-super-uid',
      email: 'admin@itstudyhub.edu',
      fullName: 'Academic Administrator',
      role: 'admin',
    });
    localStorage.setItem('hub-demo-auth', 'admin');
    setIsLoading(false);
  };

  const logout = async () => {
    localStorage.removeItem('hub-demo-auth');
    try {
      await signOut(auth);
    } catch {
      // Ignore if not in firebase
    }
    setUser(null);
    setProfile(null);
    setToken(null);
  };

  const refreshProfile = async () => {
    if (token) {
      await fetchProfile(token);
    }
  };

  const isAdmin = profile?.role === 'admin' || user?.email === 'admin@itstudyhub.edu';
  const isStudent = !isAdmin && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isAdmin,
        isStudent,
        isLoading,
        loginWithGoogle,
        loginAsDemoStudent,
        loginAsDemoAdmin,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
