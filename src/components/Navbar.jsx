import React, { useState } from 'react';
import { Shield, Bell, User, Sun, Moon, Map as MapIcon, LogOut, LayoutDashboard } from 'lucide-react';
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
  const [unreadCount, setUnreadCount] = useState(2);

  const { currentUser, logout, isMayor } = useAuth();
  const navigate = useNavigate();

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit' }}>
            <div style={{
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
            <span style={{
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--muted-foreground)', fontWeight: 500, alignItems: 'center' }}>
            <Link to="/" style={{ color: 'var(--foreground)', textDecoration: 'none' }}>Dashboard</Link>
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
                padding: 0
              }}
            >
              Map
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
                padding: 0
              }}
            >
              Insights
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
                <LayoutDashboard size={18} />
                Console
              </Link>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '1px solid var(--border)', paddingLeft: '1.5rem' }}>
            <button
              onClick={toggleTheme}
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
              <Sun className="dark:hidden" size={20} />
              <Moon className="hidden dark:block" size={20} />
            </button>

            <div style={{ position: 'relative' }}>
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



