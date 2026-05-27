import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'https://city-guard-backend.onrender.com';

  // Sync with MongoDB
  const syncWithMongo = async (firebaseUser, region = null) => {
    try {
      const payload = {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
      };
      if (region) payload.region = region;
      
      const res = await fetch(`${API_URL}/api/users/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const mongoUser = await res.json();
        return {
          ...firebaseUser,
          mongoId: mongoUser._id,
          role: mongoUser.role,
          isMayor: mongoUser.role === 'mayor',
          region: mongoUser.region
        };
      } else {
        console.warn("Mongo sync failed", await res.text());
        return { ...firebaseUser, isMayor: false, region: region || 'Unknown' };
      }
    } catch (err) {
      console.error("Mongo sync error", err);
      return { ...firebaseUser, isMayor: false, region: region || 'Unknown' };
    }
  };

  const signup = async (email, password, region) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const fullUser = await syncWithMongo(userCredential.user, region);
    setCurrentUser(fullUser);
    return userCredential;
  };

  const loginWithGoogle = async (region) => {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const fullUser = await syncWithMongo(userCredential.user, region);
    setCurrentUser(fullUser);
    return userCredential;
  };

  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const fullUser = await syncWithMongo(userCredential.user);
    setCurrentUser(fullUser);
    return userCredential;
  };

  const logout = async () => {
    try {
      setCurrentUser(null);
      if (auth.signOut) {
        await signOut(auth);
      }
    } catch (err) {
      console.error("Firebase logout error:", err);
    }
  };

  const updateRegion = async (newRegion) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_URL}/api/users/region`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseUid: currentUser.uid, region: newRegion })
      });
      if (res.ok) {
        setCurrentUser(prev => ({ ...prev, region: newRegion }));
      }
    } catch (err) {
      console.error("Failed to update region", err);
    }
  };

  useEffect(() => {
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    const isConfigured = !!apiKey && apiKey.trim().length > 5;
    
    if (!isConfigured) {
      console.warn("Firebase is not configured. Authentication features will be disabled.");
      setTimeout(() => setLoading(false), 200);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const fullUser = await syncWithMongo(user);
        setCurrentUser(fullUser);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000); // Increased timeout to allow sync

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
    updateRegion,
    isMayor: currentUser?.isMayor || false,
    userRegion: currentUser?.region || 'Universal'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
