import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero.tsx';
import IssueForm from './components/IssueForm';
import IssueFeed from './components/IssueFeed';
import LiveInsights from './components/LiveInsights';
import MayorConsole from './components/MayorConsole';
import { GradientBackground } from '@/components/ui/dark-gradient-background';
import './App.css';

const Home = () => {
  const { isMayor } = useAuth();
  
  return (
    <main>
      <Hero />
      {!isMayor && (
        <div className="container" style={{ margin: '4rem auto' }}>
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
      <div style={{ marginTop: isMayor ? '2rem' : '6rem' }}>
        <IssueFeed />
      </div>
    </main>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <GradientBackground>
          <div className="app-container">
            <Navbar />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/mayor-console" element={<MayorConsole />} />
          </Routes>

          <footer style={{
            marginTop: '3rem',
            padding: '2rem 0',
            borderTop: '1px solid var(--glass-border)',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem'
          }}>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
              <p>© 2026 CityGuard Smart City Systems. All rights reserved.</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
                <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
                <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</a>
                <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Contact Support</a>
              </div>
            </div>
          </footer>
        </div>
        </GradientBackground>
      </Router>
    </AuthProvider>
  );
}

export default App;

