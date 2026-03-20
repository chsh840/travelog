import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

export async function signUp(email, password, name, nickname) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName: name });
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    name,
    nickname,
    email,
    bio: '',
    photoURL: '',
    followerCount: 0,
    followingCount: 0,
    tripCount: 0,
    countryCount: 0,
    createdAt: serverTimestamp(),
  });
  return user;
}

export async function signIn(email, password) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const { user } = await signInWithPopup(auth, provider);
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      name: user.displayName || '',
      nickname: user.email.split('@')[0],
      email: user.email,
      bio: '',
      photoURL: user.photoURL || '',
      followerCount: 0,
      followingCount: 0,
      tripCount: 0,
      countryCount: 0,
      createdAt: serverTimestamp(),
    });
  }
  return user;
}

export async function logOut() {
  await signOut(auth);
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}
