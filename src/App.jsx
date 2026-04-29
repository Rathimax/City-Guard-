import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero.tsx';
import IssueForm from './components/IssueForm';
import IssueFeed from './components/IssueFeed';
import LiveInsights from './components/LiveInsights';
import MayorConsole from './components/MayorConsole';
import { GradientBackground } from '@/components/ui/dark-gradient-background';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, FileText, LifeBuoy } from 'lucide-react';
import './App.css';

const Home = () => {
  const { isMayor } = useAuth();
  
  return (
    <main>
      <Hero />
      {!isMayor && (
        <div className="container" style={{ margin: '2rem auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)',
            gap: '2rem',
            alignItems: 'stretch'
          }} className="split-layout">
            <IssueForm />
            <LiveInsights />
          </div>
        </div>
      )}
      <div style={{ marginTop: isMayor ? '1rem' : '3rem' }}>
        <IssueFeed />
      </div>
    </main>
  );
};

function App() {
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeModal]);

  const modalContent = {
    privacy: {
      title: "Privacy Policy",
      icon: <Shield size={24} color="var(--primary)" />,
      text: "At CityGuard, your privacy is integral to civic trust. We collect precise location data and media only when you submit a report, purely for validation and resolution purposes. All personal identifiers are encrypted and never shared with third-party advertisers. Your data is managed on secure architecture designed by Abhay Raj Rathi."
    },
    terms: {
      title: "Terms of Service",
      icon: <FileText size={24} color="var(--primary)" />,
      text: "By accessing CityGuard, you agree to provide accurate, non-malicious information to the Smart City network. This platform is an advanced civic engagement tool; any misuse for spam or false alarms will result in immediate access revocation. This entire system was conceptualized and engineered by Abhay Raj Rathi."
    },
    support: {
      title: "Contact Support",
      icon: <LifeBuoy size={24} color="var(--primary)" />,
      text: "Encountering technical issues? Our rapid response team is here to help. For critical bugs or account inquiries, please reach out to our development lead. Project Head: Abhay Raj Rathi. Support Email: abhayrajrathi616@gmail.com"
    }
  };

  return (
    <AuthProvider>
      <Router>
        <GradientBackground>
          <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

          <div style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/mayor-console" element={<MayorConsole />} />
            </Routes>
          </div>

          <footer style={{
            marginTop: '1rem',
            padding: '2rem 0',
            borderTop: '1px solid var(--glass-border)',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            background: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(10px)'
          }}>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
              <p>© 2026 CityGuard Smart City Systems. All rights reserved.</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
                <button onClick={() => setActiveModal('privacy')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 'inherit', fontFamily: 'inherit' }}>Privacy Policy</button>
                <button onClick={() => setActiveModal('terms')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 'inherit', fontFamily: 'inherit' }}>Terms of Service</button>
                <button onClick={() => setActiveModal('support')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 'inherit', fontFamily: 'inherit' }}>Contact Support</button>
              </div>
            </div>
          </footer>

          <AnimatePresence>
            {activeModal && (
              <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setActiveModal(null)}
                  style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
                />
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '500px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '24px',
                    padding: '2rem',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    zIndex: 1001
                  }}
                >
                  <button 
                    onClick={() => setActiveModal(null)}
                    style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                  >
                    <X size={20} />
                  </button>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                    {modalContent[activeModal].icon}
                    <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>{modalContent[activeModal].title}</h2>
                  </div>
                  
                  <div style={{ color: 'var(--text-primary)', lineHeight: '1.7', fontSize: '1.05rem' }}>
                    <p>{modalContent[activeModal].text}</p>
                  </div>
                  
                  <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => setActiveModal(null)}
                      style={{ 
                        padding: '0.75rem 1.5rem', 
                        borderRadius: '12px', 
                        background: 'var(--primary)', 
                        color: 'white', 
                        border: 'none', 
                        fontWeight: 600, 
                        cursor: 'pointer'
                      }}
                    >
                      Got it
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
        </GradientBackground>
      </Router>
    </AuthProvider>
  );
}

export default App;

