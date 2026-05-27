import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Loader2, Search } from 'lucide-react';

const CustomDropdown = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select an option...',
  isLoading = false,
  leftIcon: LeftIcon = null,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const searchInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDirection, setOpenDirection] = useState('down');
  const [coords, setCoords] = useState({ top: 0, bottom: 0, left: 0, width: 0 });

  // Update coordinates when dropdown opens or window resizes
  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // If there is less than 220px below the trigger and more space above, open upwards!
      const direction = (spaceBelow < 220 && spaceAbove > spaceBelow) ? 'up' : 'down';
      setOpenDirection(direction);

      setCoords({
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        width: rect.width
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      // Focus input
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 60);

      window.addEventListener('resize', updateCoords);
      window.addEventListener('scroll', updateCoords);
    } else {
      setSearchTerm('');
    }

    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking inside trigger or the portaled menu
      const portaledMenu = document.getElementById('custom-dropdown-portal-menu');
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        portaledMenu && !portaledMenu.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionName) => {
    onChange(optionName);
    setIsOpen(false);
  };

  const filteredOptions = options.filter(opt =>
    opt.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={dropdownRef} style={{ width: '100%' }}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => !isLoading && setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.875rem 1.25rem',
          background: 'var(--card)',
          border: isOpen ? '1px solid var(--primary)' : '1px solid var(--border)',
          borderRadius: '14px',
          color: value ? 'var(--foreground)' : 'var(--muted-foreground)',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-primary)',
          fontSize: '0.95rem',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isOpen ? '0 0 0 3px var(--ring)' : 'none',
          textAlign: 'left'
        }}
        className="glass-hover"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {LeftIcon && <LeftIcon size={18} style={{ color: 'var(--text-secondary)' }} />}
          <span style={{ fontWeight: value ? 500 : 400 }}>
            {isLoading ? 'Loading...' : (value || placeholder)}
          </span>
        </div>

        <div>
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" style={{ color: 'var(--text-secondary)' }} />
          ) : (
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.25, type: 'spring', stiffness: 200 }}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <ChevronDown size={18} style={{ color: 'var(--text-secondary)' }} />
            </motion.div>
          )}
        </div>
      </button>

      {/* Portaled Options Menu */}
      {createPortal(
        <AnimatePresence>
          {isOpen && !isLoading && (
            <motion.div
              id="custom-dropdown-portal-menu"
              initial={{ opacity: 0, y: openDirection === 'up' ? -8 : 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: openDirection === 'up' ? -6 : 6, scale: 0.95 }}
              transition={{ duration: 0.15, type: 'spring', damping: 15 }}
              style={{
                position: 'fixed',
                top: openDirection === 'up' 
                  ? `${coords.top - 6}px` 
                  : `${coords.bottom + 6}px`,
                transform: openDirection === 'up' ? 'translateY(-100%)' : 'none',
                left: `${coords.left}px`,
                width: `${coords.width}px`,
                borderRadius: '16px',
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid var(--glass-border)',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.2)',
                padding: '6px',
                zIndex: 999999, // Float on top of everything
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                pointerEvents: 'auto'
              }}
            >
              {/* Search Input Bar */}
              <div style={{
                padding: '4px 6px 8px 6px',
                borderBottom: '1px solid var(--glass-border)',
                marginBottom: '2px'
              }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Search
                    size={15}
                    style={{
                      position: 'absolute',
                      left: '10px',
                      color: 'var(--text-secondary)',
                      pointerEvents: 'none'
                    }}
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search region..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px 8px 32px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                      color: 'var(--foreground)',
                      fontSize: '0.85rem',
                      fontFamily: 'var(--font-primary)',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--primary)';
                      e.target.style.boxShadow = '0 0 0 2px var(--ring)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Options List */}
              {filteredOptions.length === 0 ? (
                <div style={{
                  padding: '1.25rem 1rem',
                  textAlign: 'center',
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem'
                }}>
                  No regions match your search.
                </div>
              ) : (
                <div style={{
                  maxHeight: '180px',
                  overflowY: 'auto',
                  scrollbarWidth: 'thin',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}>
                  {filteredOptions.map((opt) => {
                    const isSelected = opt.name === value;
                    return (
                      <button
                        key={opt._id || opt.name}
                        type="button"
                        onClick={() => handleSelect(opt.name)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.75rem 1rem',
                          borderRadius: '10px',
                          border: 'none',
                          background: isSelected ? 'var(--primary)' : 'transparent',
                          color: isSelected ? 'var(--primary-foreground)' : 'var(--text-primary)',
                          cursor: 'pointer',
                          fontWeight: isSelected ? 600 : 400,
                          fontSize: '0.925rem',
                          fontFamily: 'var(--font-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                            e.currentTarget.style.paddingLeft = '1.25rem';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.paddingLeft = '1rem';
                          }
                        }}
                      >
                        <span>{opt.name}</span>
                        {isSelected && (
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: 'var(--primary-foreground)'
                          }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default CustomDropdown;
