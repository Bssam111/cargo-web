'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { UserRole } from '@/types';

interface AuthUser {
  uid: string;
  email: string | null;
  fullName: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isEmployee: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const role: UserRole = data.role ?? 'renter';

          if (role === 'admin' || role === 'employee') {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              fullName: data.fullName ?? data.name ?? '',
              role,
            });
            document.cookie = 'cargo-session=1; path=/; SameSite=Strict';
          } else {
            await firebaseSignOut(auth);
            setUser(null);
          }
        } else {
          await firebaseSignOut(auth);
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  async function signIn(email: string, password: string) {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', credential.user.uid));
    if (!userDoc.exists()) throw new Error('User record not found.');

    const role: UserRole = userDoc.data().role;
    if (role !== 'admin' && role !== 'employee') {
      await firebaseSignOut(auth);
      throw new Error('Access denied. Portal is for admin and employees only.');
    }
  }

  async function signOut() {
    await firebaseSignOut(auth);
    document.cookie = 'cargo-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        isAdmin: user?.role === 'admin',
        isEmployee: user?.role === 'employee',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
