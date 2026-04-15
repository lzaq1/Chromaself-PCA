import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export interface UserProfile {
  uid: string;
  email: string;
  usageCount: number;
  isAuthorized: boolean;
  role: 'admin' | 'user';
}

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
};

export const createUserProfile = async (user: FirebaseUser): Promise<UserProfile> => {
  const isAdmin = user.email === 'lukmanzakaria9f@gmail.com';
  const profile: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    usageCount: 0,
    isAuthorized: isAdmin, // Admin is auto-authorized
    role: isAdmin ? 'admin' : 'user'
  };
  await setDoc(doc(db, 'users', user.uid), profile);
  return profile;
};

export const incrementUsage = async (uid: string) => {
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, {
    usageCount: increment(1)
  });
};

export const validateAccessCode = async (uid: string, code: string): Promise<boolean> => {
  const codeRef = doc(db, 'access_codes', code);
  const codeSnap = await getDoc(codeRef);
  
  if (codeSnap.exists() && !codeSnap.data().isUsed) {
    await updateDoc(codeRef, {
      isUsed: true,
      usedBy: uid,
      usedAt: serverTimestamp()
    });
    
    await updateDoc(doc(db, 'users', uid), {
      isAuthorized: true
    });
    
    return true;
  }
  return false;
};

export const generateAccessCode = async (adminUid: string): Promise<string> => {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  await setDoc(doc(db, 'access_codes', code), {
    code,
    createdBy: adminUid,
    createdAt: serverTimestamp(),
    isUsed: false
  });
  return code;
};
