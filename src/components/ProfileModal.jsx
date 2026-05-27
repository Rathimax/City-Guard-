import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MapPin, 
  Save, 
  Loader2, 
  User, 
  LogOut, 
  Mail, 
  Lock, 
  Settings, 
  Activity, 
  Award, 
  CheckCircle, 
  ThumbsUp, 
  AlertCircle,
  Shield,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRegions } from '../hooks/useRegions';
import CustomDropdown from './CustomDropdown';
import { updateProfile } from 'firebase/auth';
import { auth } from '../firebase';

const ProfileModal = ({ isOpen, onClose }) => {
  const { currentUser, userRegion, updateRegion, logout } = useAuth();
  const { regions, loading: regionsLoading } = useRegions();
  
  // Tab State
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' or 'stats'
  
  // Settings Form State
  const [region, setRegion] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Logout confirmation
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Real-time Citizen Stats
  const [stats, setStats] = useState({
    totalReported: 0,
    resolved: 0,
    inProgress: 0,
    upvotes: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Initialize and Reset states
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setRegion(userRegion || '');
      setDisplayName(currentUser?.displayName || currentUser?.email?.split('@')[0] || '');
      setMessage('');
      setActiveTab('settings');
      setShowLogoutConfirm(false);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, userRegion, currentUser]);

  // Fetch real-time contribution stats from MongoDB
  useEffect(() => {
    if (isOpen && currentUser) {
      const fetchUserStats = async () => {
        setStatsLoading(true);
        try {
          const API_URL = import.meta.env.VITE_API_URL || 'https://city-guard-backend.onrender.com';
          const res = await fetch(`${API_URL}/api/issues`);
          if (res.ok) {
            const data = await res.json();
            const myIssues = data.filter(issue => issue.userId === currentUser.uid);
            
            const resolved = myIssues.filter(issue => issue.status === 'Resolved').length;
            const inProgress = myIssues.filter(issue => issue.status === 'In Progress').length;
            
            let upvotes = 0;
            myIssues.forEach(issue => {
              if (issue.upvotes) {
                upvotes += Number(issue.upvotes) || 0;
              }
            });

            setStats({
              totalReported: myIssues.length,
              resolved,
              inProgress,
              upvotes
            });
          }
        } catch (err) {
          console.error("Failed to fetch user stats:", err);
        } finally {
          setStatsLoading(false);
        }
      };
      
      fetchUserStats();
    }
  }, [isOpen, currentUser]);

  if (!currentUser) return null;

  // Format joined date dynamically from Firebase metadata
  const joinedDate = currentUser.metadata?.creationTime
    ? new Date(currentUser.metadata.creationTime).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
    : 'May 2026';

  // Calculate Gamified XP Score
  const xpScore = stats.totalReported * 25 + stats.resolved * 50 + stats.upvotes * 10;
  
  // Level thresholds
  let levelTitle = "Level 1: Active Citizen";
  let levelProgress = 0;
  let nextLevelTitle = "Level 2: Community Pillar";
  let nextLevelXp = 100;

  if (currentUser.role === 'mayor') {
    levelTitle = "Level Executive: City Mayor";
    levelProgress = 100;
  } else if (xpScore < 100) {
    levelTitle = "Level 1: Active Citizen";
    levelProgress = (xpScore / 100) * 100;
  } else if (xpScore >= 100 && xpScore < 300) {
    levelTitle = "Level 2: Community Advocate";
    nextLevelTitle = "Level 3: Vigilant Guardian";
    nextLevelXp = 300;
    levelProgress = ((xpScore - 100) / 200) * 100;
  } else {
    levelTitle = "Level 3: Vigilant Guardian";
    levelProgress = 100;
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      // 1. Update Firebase display name if changed
      if (displayName !== currentUser.displayName) {
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, { displayName });
          currentUser.displayName = displayName; 
        }
      }
      
      // 2. Update Region if changed
      if (region !== userRegion) {
        await updateRegion(region);
      }

      setMessage('Profile updated successfully!');
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      console.error(err);
      setMessage('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="glass"
            style={{
              width: '100%',
              maxWidth: '460px',
              background: 'var(--bg-primary)',
              padding: '2.25rem',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              borderRadius: '28px',
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                padding: '0.5rem',
                borderRadius: '50%',
                transition: 'var(--transition-smooth)',
                zIndex: 10
              }}
              className="glass-hover"
            >
              <X size={18} />
            </button>

            {/* Profile Header Block */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.75rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, #da70d6 100%)',
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px var(--ring)',
                color: 'var(--primary-foreground)',
                fontSize: '1.5rem',
                fontWeight: 800,
                flexShrink: 0
              }}>
                {displayName ? displayName.charAt(0).toUpperCase() : currentUser.email.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-heading)', fontWeight: 800, margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                    {displayName || 'Citizen Profile'}
                  </h2>
                  
                  {/* Glowing Role Badge */}
                  {currentUser.role === 'mayor' ? (
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      boxShadow: '0 0 15px rgba(244, 63, 94, 0.4)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      <Shield size={10} />
                      Mayor
                    </span>
                  ) : (
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      color: '#22c55e',
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.25)',
                      padding: '2px 8px',
                      borderRadius: '20px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      <User size={10} />
                      Citizen
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {currentUser.email}
                  </p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: '0.75rem', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} />
                    Member since {joinedDate}
                  </p>
                </div>
              </div>
            </div>

            {/* Sliding Pill Tab Selector */}
            <div style={{
              display: 'flex',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '4px',
              marginBottom: '1.75rem'
            }}>
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeTab === 'settings' ? 'var(--card)' : 'transparent',
                  color: activeTab === 'settings' ? 'var(--foreground)' : 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: activeTab === 'settings' ? '0 4px 12px rgba(0, 0, 0, 0.05)' : 'none',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <Settings size={16} />
                Profile Settings
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('stats')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeTab === 'stats' ? 'var(--card)' : 'transparent',
                  color: activeTab === 'stats' ? 'var(--foreground)' : 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: activeTab === 'stats' ? '0 4px 12px rgba(0, 0, 0, 0.05)' : 'none',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <Activity size={16} />
                Vigilance Stats
              </button>
            </div>

            {/* Notification / Success Status Message */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: message.includes('success') ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                  color: message.includes('success') ? '#22c55e' : '#ef4444',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  marginBottom: '1.25rem',
                  textAlign: 'center',
                  border: `1px solid ${message.includes('success') ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                }}
              >
                {message}
              </motion.div>
            )}

            {/* Dynamic Tab Content Area */}
            <div style={{ minHeight: '260px' }}>
              <AnimatePresence mode="wait">
                {activeTab === 'settings' ? (
                  <motion.form
                    key="settings-tab"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    onSubmit={handleSave}
                    style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                  >
                    {/* Display Name Input */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <User size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-secondary)', opacity: 0.6 }} />
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Your display name..."
                          required
                          style={{
                            width: '100%',
                            padding: '12px 14px 12px 42px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            fontSize: '0.9rem',
                            fontFamily: 'inherit',
                            color: 'var(--foreground)',
                            outline: 'none',
                            transition: 'var(--transition-smooth)'
                          }}
                          className="glass-hover-input"
                        />
                      </div>
                    </div>

                    {/* Email Input (Locked) */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address</label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', opacity: 0.65 }}>
                        <Mail size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-secondary)', opacity: 0.8 }} />
                        <input
                          type="text"
                          value={currentUser.email}
                          disabled
                          style={{
                            width: '100%',
                            padding: '12px 38px 12px 42px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            fontSize: '0.9rem',
                            fontFamily: 'inherit',
                            color: 'var(--foreground)',
                            cursor: 'not-allowed'
                          }}
                        />
                        <Lock size={14} style={{ position: 'absolute', right: '14px', color: 'var(--text-secondary)', opacity: 0.8 }} />
                      </div>
                    </div>

                    {/* Region Selector */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Your Region/Society</label>
                      <CustomDropdown
                        value={region}
                        onChange={setRegion}
                        options={regionsLoading ? [] : regions}
                        placeholder="Select your region..."
                        isLoading={regionsLoading}
                        leftIcon={MapPin}
                        required
                      />
                    </div>

                    {/* Save Button */}
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ 
                        width: '100%', 
                        justifyContent: 'center', 
                        marginTop: '0.5rem', 
                        padding: '1rem', 
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        borderRadius: '12px'
                      }}
                      disabled={loading || (region === userRegion && displayName === (currentUser?.displayName || ''))}
                    >
                      {loading ? <Loader2 size={18} className="animate-spin" /> : (
                        <>
                          <Save size={16} style={{ marginRight: '0.5rem' }} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="stats-tab"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                  >
                    {statsLoading ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '220px', gap: '10px' }}>
                        <Loader2 className="animate-spin" size={28} color="var(--primary)" />
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>Loading contribution data...</span>
                      </div>
                    ) : (
                      <>
                        {/* Level & XP Progress Card */}
                        <div style={{
                          background: 'rgba(var(--primary-rgb), 0.05)',
                          border: '1px solid rgba(var(--primary-rgb), 0.15)',
                          borderRadius: '16px',
                          padding: '1.25rem',
                          position: 'relative'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Award size={16} color="var(--primary)" />
                              {levelTitle}
                            </span>
                            {currentUser.role !== 'mayor' && (
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                {xpScore} XP
                              </span>
                            )}
                          </div>
                          
                          {/* Progress bar */}
                          <div style={{
                            width: '100%',
                            height: '8px',
                            background: 'var(--bg-secondary)',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            position: 'relative'
                          }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${levelProgress}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                              style={{
                                height: '100%',
                                background: 'linear-gradient(90deg, var(--primary) 0%, #da70d6 100%)',
                                borderRadius: '10px'
                              }}
                            />
                          </div>
                          
                          {currentUser.role !== 'mayor' && xpScore < 300 && (
                            <p style={{ margin: '8px 0 0 0', fontSize: '0.7rem', color: 'var(--muted-foreground)', textAlign: 'right' }}>
                              {nextLevelXp - xpScore} XP to {nextLevelTitle}
                            </p>
                          )}
                          {currentUser.role === 'mayor' && (
                            <p style={{ margin: '8px 0 0 0', fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Sparkles size={12} /> Executive admin privileges active in {userRegion}.
                            </p>
                          )}
                        </div>

                        {/* Stats Grid */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '1rem'
                        }}>
                          {/* Filed Reports */}
                          <div style={{
                            background: 'var(--card)',
                            border: '1px solid var(--border)',
                            borderRadius: '14px',
                            padding: '12px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}>
                            <div style={{
                              background: 'rgba(0, 191, 255, 0.1)',
                              padding: '8px',
                              borderRadius: '10px',
                              color: '#00bfff',
                              display: 'flex'
                            }}>
                              <AlertCircle size={16} />
                            </div>
                            <div>
                              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Reports Filed</p>
                              <p style={{ margin: '2px 0 0 0', fontSize: '1.1rem', fontWeight: 800 }}>{stats.totalReported}</p>
                            </div>
                          </div>

                          {/* Resolved Cases */}
                          <div style={{
                            background: 'var(--card)',
                            border: '1px solid var(--border)',
                            borderRadius: '14px',
                            padding: '12px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}>
                            <div style={{
                              background: 'rgba(34, 197, 94, 0.1)',
                              padding: '8px',
                              borderRadius: '10px',
                              color: '#22c55e',
                              display: 'flex'
                            }}>
                              <CheckCircle size={16} />
                            </div>
                            <div>
                              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Resolved</p>
                              <p style={{ margin: '2px 0 0 0', fontSize: '1.1rem', fontWeight: 800 }}>{stats.resolved}</p>
                            </div>
                          </div>

                          {/* Upvotes Received */}
                          <div style={{
                            background: 'var(--card)',
                            border: '1px solid var(--border)',
                            borderRadius: '14px',
                            padding: '12px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}>
                            <div style={{
                              background: 'rgba(249, 115, 22, 0.1)',
                              padding: '8px',
                              borderRadius: '10px',
                              color: '#f97316',
                              display: 'flex'
                            }}>
                              <ThumbsUp size={16} />
                            </div>
                            <div>
                              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Upvotes Recd</p>
                              <p style={{ margin: '2px 0 0 0', fontSize: '1.1rem', fontWeight: 800 }}>{stats.upvotes}</p>
                            </div>
                          </div>

                          {/* Active Reports */}
                          <div style={{
                            background: 'var(--card)',
                            border: '1px solid var(--border)',
                            borderRadius: '14px',
                            padding: '12px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}>
                            <div style={{
                              background: 'rgba(135, 206, 235, 0.1)',
                              padding: '8px',
                              borderRadius: '10px',
                              color: '#87ceeb',
                              display: 'flex'
                            }}>
                              <Activity size={16} />
                            </div>
                            <div>
                              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Active Reports</p>
                              <p style={{ margin: '2px 0 0 0', fontSize: '1.1rem', fontWeight: 800 }}>{stats.inProgress}</p>
                            </div>
                          </div>
                        </div>

                        {/* Badges Display Row */}
                        <div style={{ marginTop: '0.5rem' }}>
                          <h4 style={{ margin: '0 0 10px 0', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Earned Badges
                          </h4>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {/* Vigilant badge */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              borderRadius: '20px',
                              fontSize: '0.725rem',
                              fontWeight: 700,
                              background: stats.totalReported > 0 ? 'rgba(0, 191, 255, 0.08)' : 'var(--bg-secondary)',
                              color: stats.totalReported > 0 ? '#00bfff' : 'var(--muted-foreground)',
                              border: stats.totalReported > 0 ? '1px solid rgba(0, 191, 255, 0.25)' : '1px solid var(--border)',
                              opacity: stats.totalReported > 0 ? 1 : 0.5,
                              transition: 'var(--transition-smooth)'
                            }} title={stats.totalReported > 0 ? "Reported at least 1 issue in the region" : "Locked: Report at least 1 issue to unlock"}>
                              <span>🎖️</span>
                              <span>Vigilant Star</span>
                            </div>

                            {/* Problem Solver badge */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              borderRadius: '20px',
                              fontSize: '0.725rem',
                              fontWeight: 700,
                              background: stats.resolved > 0 ? 'rgba(34, 197, 94, 0.08)' : 'var(--bg-secondary)',
                              color: stats.resolved > 0 ? '#22c55e' : 'var(--muted-foreground)',
                              border: stats.resolved > 0 ? '1px solid rgba(34, 197, 94, 0.25)' : '1px solid var(--border)',
                              opacity: stats.resolved > 0 ? 1 : 0.5,
                              transition: 'var(--transition-smooth)'
                            }} title={stats.resolved > 0 ? "Had an reported issue resolved by the mayor" : "Locked: Get 1 issue resolved to unlock"}>
                              <span>🌱</span>
                              <span>Problem Solver</span>
                            </div>

                            {/* Popular Voice badge */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              borderRadius: '20px',
                              fontSize: '0.725rem',
                              fontWeight: 700,
                              background: stats.upvotes >= 5 ? 'rgba(249, 115, 22, 0.08)' : 'var(--bg-secondary)',
                              color: stats.upvotes >= 5 ? '#f97316' : 'var(--muted-foreground)',
                              border: stats.upvotes >= 5 ? '1px solid rgba(249, 115, 22, 0.25)' : '1px solid var(--border)',
                              opacity: stats.upvotes >= 5 ? 1 : 0.5,
                              transition: 'var(--transition-smooth)'
                            }} title={stats.upvotes >= 5 ? "Your issues received 5 or more community upvotes" : "Locked: Get 5 upvotes to unlock"}>
                              <span>🔥</span>
                              <span>Popular Voice</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Logout Button Footer */}
            <div style={{ 
              marginTop: '2rem', 
              paddingTop: '1.25rem', 
              borderTop: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowLogoutConfirm(true)}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.875rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  background: 'rgba(239, 68, 68, 0.06)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
                  e.currentTarget.style.border = '1px solid rgba(239, 68, 68, 0.25)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.06)';
                  e.currentTarget.style.border = '1px solid rgba(239, 68, 68, 0.15)';
                }}
              >
                <LogOut size={16} />
                Logout Account
              </button>
            </div>

            {/* Logout Confirmation Dialog (Absolute Overlay) */}
            <AnimatePresence>
              {showLogoutConfirm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.65)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '28px',
                    zIndex: 100,
                    padding: '2rem'
                  }}
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 10 }}
                    style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border)',
                      borderRadius: '20px',
                      padding: '2rem',
                      width: '100%',
                      maxWidth: '320px',
                      textAlign: 'center',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.25rem',
                      color: '#ef4444'
                    }}>
                      <LogOut size={24} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--foreground)' }}>
                      Confirm Logout
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                      Are you sure you want to logout of your CityGuard account?
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        type="button"
                        onClick={() => setShowLogoutConfirm(false)}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border)',
                          borderRadius: '10px',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          color: 'var(--text-primary)',
                          transition: 'var(--transition-smooth)'
                        }}
                        className="glass-hover"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          setLoading(true);
                          try {
                            await logout();
                            onClose();
                          } catch (err) {
                            console.error('Logout error:', err);
                          } finally {
                            setLoading(false);
                            setShowLogoutConfirm(false);
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          background: '#ef4444',
                          border: 'none',
                          borderRadius: '10px',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          color: 'white',
                          transition: 'var(--transition-smooth)',
                          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#dc2626'}
                        onMouseLeave={e => e.currentTarget.style.background = '#ef4444'}
                      >
                        Logout
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ProfileModal;
