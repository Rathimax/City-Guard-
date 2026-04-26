import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let auth;

try {
  // Only initialize if we have a real looking API key
  const hasValidKey = firebaseConfig.apiKey && firebaseConfig.apiKey.trim().length > 5;
  
  if (hasValidKey) {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  } else {
    console.warn("Firebase API Key is missing or invalid. Auth features will be unavailable.");
    // Mock auth for prevention of crashes in components that expect it
    auth = { 
      onAuthStateChanged: () => () => {}, 
      signInWithEmailAndPassword: () => Promise.reject("Not configured"), 
      signOut: () => Promise.resolve() 
    };
  }
} catch (error) {
  console.error("Firebase initialization failed:", error);
  auth = { onAuthStateChanged: () => () => {}, signInWithEmailAndPassword: () => Promise.reject("Init failed"), signOut: () => Promise.resolve() };
}

const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
