import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyD5kCn2SL4HIkvO4nCwLTmh5LDxs1Iz3Ws",
  authDomain: "vertical-jump-program.firebaseapp.com",
  projectId: "vertical-jump-program",
  storageBucket: "vertical-jump-program.firebasestorage.app",
  messagingSenderId: "77904941762",
  appId: "1:77904941762:web:bef482d50b1db837fee15b"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
