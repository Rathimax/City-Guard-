import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // For the purpose of this demo, we'll consider this email as the Mayor
  const MAYOR_EMAIL = "mayor@cityguard.com";

  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = () => {
    return signInWithPopup(auth, googleProvider);
  };

  const login = (email, password) => {
    // Demo Bypass for the user's specific request
    if (email === MAYOR_EMAIL && password === "Mayorhu") {
      const mockUser = {
        email: MAYOR_EMAIL,
        isMayor: true,
        uid: "demo-mayor-id"
      };
      setCurrentUser(mockUser);
      return Promise.resolve(mockUser);
    }
    
    // Fallback to real Firebase if configured
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    try {
      // Clear local state first for immediate UI response
      setCurrentUser(null);
      
      // If Firebase is configured, sign out there too
      if (auth.signOut) {
        await signOut(auth);
      }
    } catch (err) {
      console.error("Firebase logout error:", err);
    }
  };

  useEffect(() => {
    // Check if Firebase is likely configured (string longer than a few characters to avoid space strings)
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    const isConfigured = !!apiKey && apiKey.trim().length > 5;
    
    if (!isConfigured) {
      console.warn("Firebase is not configured. Authentication features will be disabled.");
      // Just timeout to simulate the app initialization without Firebase
      setTimeout(() => setLoading(false), 200);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        user.isMayor = user.email === MAYOR_EMAIL;
      }
      setCurrentUser(user);
      setLoading(false);
    }, (error) => {
      console.error("Auth state change error:", error);
      setLoading(false);
    });

    // Fallback: If Firebase takes too long to respond, stop loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const value = {
    currentUser,
    login,
    signup,
    loginWithGoogle,
    logout,
    isMayor: currentUser?.isMayor || false
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
