import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './firebase';

const googleProvider = new GoogleAuthProvider();

export const authService = {
  signInWithEmail: (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  },

  signUpWithEmail: (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  },

  signInWithGoogle: () => {
    return signInWithPopup(auth, googleProvider);
  },

  signOut: () => {
    return firebaseSignOut(auth);
  },

  onAuthStateChanged: (callback) => {
    return onAuthStateChanged(auth, callback);
  },

  getCurrentUser: () => {
    return auth.currentUser;
  }
};
