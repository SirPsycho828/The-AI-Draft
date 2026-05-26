import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  type User,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import type { UserProfile } from '../types';

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
});

const googleProvider = new GoogleAuthProvider();

async function toUserProfile(user: User): Promise<UserProfile> {
  const token = await user.getIdTokenResult();
  return {
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? '',
    photoURL: user.photoURL ?? undefined,
    isAdmin: token.claims.admin === true,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(await toUserProfile(firebaseUser));
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
