import { initializeApp, getApps } from "firebase/app"
import { getAnalytics, isSupported } from "firebase/analytics"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyBu0-wfHxWP-7kESYJl_g6LBoBCKe9PuWA",
  authDomain: "civicpulse-a0888.firebaseapp.com",
  projectId: "civicpulse-a0888",
  sstorageBucket: "civicpulse-a0888.firebasestorage.app",
  messagingSenderId: "501341591338",
  appId: "1:501341591338:web:0ba2840b7f4ec4ab1ab053",
  measurementId: "G-MHQLF45PGN"
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize services
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

// Initialize Analytics conditionally (only in browser)
let analytics = null
if (typeof window !== "undefined") {
  isSupported().then(yes => yes && (analytics = getAnalytics(app)))
}

export { app, auth, db, storage, analytics } 