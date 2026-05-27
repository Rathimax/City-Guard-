import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRegions } from '../hooks/useRegions';
import CustomDropdown from './CustomDropdown';

const RegionPromptModal = () => {
  const { currentUser, userRegion, updateRegion } = useAuth();
  const { regions, loading: regionsLoading } = useRegions();
  const [selectedRegion, setSelectedRegion] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Trigger modal if user is logged in but region is "Unknown"
  useEffect(() => {
    if (currentUser && userRegion === 'Unknown') {
      setIsOpen(true);
      document.documentElement.classList.add('scroll-locked');
      document.body.classList.add('scroll-locked');
    } else {
      setIsOpen(false);
      document.documentElement.classList.remove('scroll-locked');
      document.body.classList.remove('scroll-locked');
    }
    return () => {
      document.documentElement.classList.remove('scroll-locked');
      document.body.classList.remove('scroll-locked');
    };
  }, [currentUser, userRegion]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRegion) return;
    setLoading(true);
    try {
      await updateRegion(selectedRegion);
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to set region during onboarding:", err);
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
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'flex-start', // Use flex-start with padding for robust centering on all viewport heights
            justifyContent: 'center',
            padding: '4rem 1.5rem',
            overflowY: 'auto', // Allow scrolling of the modal card on very short screens
            zIndex: 99999 // Ensure it sits on top of everything including other modals
          }}
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
              padding: '2.5rem',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
              borderRadius: '24px',
              border: '1px solid var(--glass-border)',
              overflow: 'visible' // Ensure the CustomDropdown is never clipped by the modal container
            }}
          >
            {/* Logo and Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                background: 'var(--primary)',
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                boxShadow: '0 0 35px var(--ring)',
                transform: 'rotate(-4deg)',
                color: 'var(--primary-foreground)'
              }}>
                <ShieldCheck size={36} />
              </div>
              <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
                Set Your Active Region
              </h2>
              
              <div style={{ 
                background: 'rgba(var(--primary-rgb, 255, 192, 203), 0.05)', 
                border: '1px dashed var(--glass-border)',
                borderRadius: '16px',
                padding: '1.25rem',
                marginTop: '1.25rem',
                fontSize: '0.9rem',
                lineHeight: '1.6',
                color: 'var(--text-secondary)',
                textAlign: 'left'
              }}>
                Choose the region or city you are from. If your city/society is not here, then your city hasn't adopted **CityGuard** yet...
                <br /><br />
                You can always change the region you picked from the settings in the future **if you ever move out from your current region**.
              </div>
            </div>

            {/* Selection Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.625rem', fontSize: '0.875rem', fontWeight: 600 }}>Select Region/Society</label>
                <CustomDropdown
                  value={selectedRegion}
                  onChange={setSelectedRegion}
                  options={regions}
                  placeholder="Find your region..."
                  isLoading={regionsLoading}
                  leftIcon={MapPin}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '1.125rem', fontSize: '1rem' }}
                disabled={loading || !selectedRegion}
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : (
                  <>
                    Confirm & Enter CityGuard
                    <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default RegionPromptModal;
