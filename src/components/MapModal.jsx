import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Loader2, Navigation } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '16px',
};

const defaultCenter = {
  lat: 19.0760, // Default to Mumbai/London/Pune depending on context, using user's GPS soon
  lng: 72.8777
};

const MapModal = ({ isOpen, onClose }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const [center, setCenter] = useState(defaultCenter);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      handleGetLocation();
    }
  }, [isOpen]);

  const handleGetLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLocating(false);
        },
        (error) => {
          console.error("Error fetching location:", error);
          setIsLocating(false);
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  return (
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
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            zIndex: 1000,
            padding: 'clamp(0.5rem, 4vw, 2rem)'
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="glass map-modal-content"
            style={{
              width: '100%',
              maxWidth: '900px',
              height: '85vh',
              background: 'var(--bg-primary)',
              padding: 'clamp(1rem, 4vw, 1.5rem)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="map-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  background: 'var(--primary)',
                  padding: '8px',
                  borderRadius: '10px'
                }}>
                  <MapPin size={20} color="var(--primary-foreground)" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }} className="map-title">Interactive City Map</h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }} className="map-subtitle">View your current location</p>
                </div>
              </div>

              <div className="map-controls" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  onClick={handleGetLocation}
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 1rem' }}
                  disabled={isLocating}
                >
                  {isLocating ? <Loader2 size={18} className="animate-spin" /> : <Navigation size={18} />}
                  Locate Me
                </button>
                <button
                  onClick={onClose}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--text-primary)'
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Map Container */}
            <div style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={center}
                  zoom={15}
                  options={{
                    styles: [
                      {
                        "featureType": "poi",
                        "stylers": [{ "visibility": "off" }]
                      }
                    ],
                    disableDefaultUI: false,
                    zoomControl: true,
                  }}
                >
                  <Marker
                    position={center}
                    animation={window.google?.maps?.Animation?.DROP}
                  />
                </GoogleMap>
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--bg-secondary)',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  <Loader2 size={40} className="animate-spin" color="var(--primary)" />
                  <p style={{ color: 'var(--text-secondary)' }}>Loading interactive map...</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MapModal;
