import { auth, db } from './firebase.js'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import {
  doc, setDoc, getDoc, updateDoc,
  collection, getDocs, deleteDoc, serverTimestamp
} from 'firebase/firestore'

const ADMIN_EMAIL = 'gabin@admin.com'

export function isAdmin(email) {
  return email === ADMIN_EMAIL
}

export async function login(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password)
    if (isAdmin(cred.user.email)) return { ok: true }
    // Check user status in Firestore
    const snap = await getDoc(doc(db, 'users', cred.user.uid))
    if (!snap.exists()) return { ok: false, error: 'Account not found.' }
    const data = snap.data()
    if (data.status === 'pending')   return { ok: false, error: 'pending' }
    if (data.status === 'rejected')  return { ok: false, error: 'rejected' }
    return { ok: true }
  } catch (e) {
    if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password') {
      return { ok: false, error: 'Invalid email or password.' }
    }
    return { ok: false, error: e.message }
  }
}

export async function signup(name, email, password) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password)
    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      status: 'pending',
      paidConfirmed: false,
      signedUpAt: serverTimestamp()
    })
    // Sign out immediately — must wait for admin approval
    await signOut(auth)
    return { ok: true }
  } catch (e) {
    if (e.code === 'auth/email-already-in-use') {
      return { ok: false, error: 'An account with this email already exists.' }
    }
    return { ok: false, error: e.message }
  }
}

export async function logout() {
  await signOut(auth)
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback)
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}

// Admin functions
export async function adminGetUsers() {
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs.map(d => d.data())
}

export async function adminConfirm(uid) {
  await updateDoc(doc(db, 'users', uid), { status: 'confirmed' })
}

export async function adminReject(uid) {
  await updateDoc(doc(db, 'users', uid), { status: 'rejected' })
}

export async function adminDelete(uid) {
  await deleteDoc(doc(db, 'users', uid))
}

// Per-user data helpers
export async function loadUserData(uid, key) {
  const snap = await getDoc(doc(db, 'userData', `${uid}_${key}`))
  return snap.exists() ? snap.data().value : null
}

export async function saveUserData(uid, key, value) {
  await setDoc(doc(db, 'userData', `${uid}_${key}`), { value }, { merge: true })
}
