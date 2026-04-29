import React, { useState, useRef, useEffect } from 'react';
import { Shield, Bell, User, Sun, Moon, Map as MapIcon, LogOut, LayoutDashboard, Activity } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import MapModal from './MapModal';
import NotificationDropdown from './NotificationDropdown';
import AuthModal from './AuthModal';
import InsightsModal from './InsightsModal';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [unreadCount, setUnreadCount] = useState(2);
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsOpen]);

  const { currentUser, logout, isMayor } = useAuth();
  const navigate = useNavigate();

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    setIsDarkMode(isDark);
  };

  const handleToggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (!isNotificationsOpen) {
      setUnreadCount(0);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <>
      <nav className="liquid-glass" style={{
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'fixed',
        top: '1.5rem',
        left: '1.5rem',
        right: '1.5rem',
        zIndex: 100,
        color: 'var(--foreground)'
      }}>
        <div className="logo-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit' }}>
            <div className="logo-icon-container" style={{
              background: 'var(--primary)',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px var(--ring)'
            }}>
              <Shield size={24} color="var(--primary-foreground)" />
            </div>
            <span className="logo-text" style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--foreground)',
              letterSpacing: '-0.5px'
            }}>
              CityGuard
            </span>
          </Link>
        </div>

        <div className="nav-right-section" style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 4vw, 2rem)' }}>
          <div className="nav-links" style={{ display: 'flex', gap: '1.5rem', color: 'var(--muted-foreground)', fontWeight: 500, alignItems: 'center' }}>
            <Link to="/" style={{ color: 'var(--foreground)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LayoutDashboard size={20} className="md:size-[18px]" />
              <span className="nav-text">Dashboard</span>
            </Link>
            <button
              onClick={() => setIsMapOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                textDecoration: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                fontWeight: 'inherit',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <MapIcon size={20} className="md:size-[18px]" />
              <span className="nav-text">Map</span>
            </button>
            <button
              onClick={() => setIsInsightsOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                textDecoration: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                fontWeight: 'inherit',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Activity size={20} className="md:size-[18px]" />
              <span className="nav-text">Insights</span>
            </button>
            {isMayor && (
              <Link to="/mayor-console" style={{
                color: 'var(--primary)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 600
              }}>
                <Shield size={20} className="md:size-[18px]" />
                <span className="nav-text">Console</span>
              </Link>
            )}
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'clamp(0.5rem, 3vw, 1rem)', 
            borderLeft: '1px solid var(--border)', 
            paddingLeft: 'clamp(0.5rem, 3vw, 1.5rem)' 
          }}>
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--glass-border)',
                color: 'var(--foreground)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(8px)'
              }}
            >
              {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <div ref={notificationRef} style={{ position: 'relative' }}>
              <button
                onClick={handleToggleNotifications}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--muted-foreground)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#ef4444',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    padding: '2px 5px',
                    borderRadius: '50%',
                    border: '2px solid var(--bg-primary)'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <NotificationDropdown
                    isOpen={isNotificationsOpen}
                    onClose={() => setIsNotificationsOpen(false)}
                    onOpenInsights={() => {
                      setIsNotificationsOpen(false);
                      setIsInsightsOpen(true);
                    }}
                  />
                )}
              </AnimatePresence>
            </div>

            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  color: 'var(--primary-foreground)'
                }}>
                  {currentUser.email.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0
                  }}
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <User size={20} color="var(--muted-foreground)" />
              </button>
            )}
          </div>
        </div>
      </nav>

      <MapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
      />
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
      <InsightsModal
        isOpen={isInsightsOpen}
        onClose={() => setIsInsightsOpen(false)}
      />
    </>
  );
};

export default Navbar;



