import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Loader2, Navigation, Check } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '16px',
};

const defaultCenter = {
  lat: 19.0760, // Default to Mumbai
  lng: 72.8777
};

const LocationPickerModal = ({ isOpen, onClose, onSelect, initialLocation }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const [selectedLocation, setSelectedLocation] = useState(initialLocation || defaultCenter);
  const [tempLocation, setTempLocation] = useState(initialLocation || null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (isOpen && initialLocation) {
      setSelectedLocation(initialLocation);
      setTempLocation(initialLocation);
    }
  }, [isOpen, initialLocation]);

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setTempLocation({ lat, lng });
  };

  const handleConfirm = () => {
    if (tempLocation) {
      onSelect(tempLocation);
      onClose();
    }
  };

  const handleGetLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setSelectedLocation(newLoc);
          setTempLocation(newLoc);
          setIsLocating(false);
        },
        (error) => {
          console.error("Error fetching location:", error);
          setIsLocating(false);
          alert("Could not fetch automatic location. Please click on the map manually.");
        }
      );
    } else {
      setIsLocating(false);
      alert("Geolocation is not supported by your browser. Please click on the map manually.");
    }
  };

  return ReactDOM.createPortal(
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
            zIndex: 2000,
            padding: '2rem'
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
              maxWidth: '800px',
              height: '75vh',
              background: 'var(--bg-primary)',
              padding: '1.5rem',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  background: 'var(--primary)',
                  padding: '8px',
                  borderRadius: '10px'
                }}>
                  <MapPin size={20} color="var(--primary-foreground)" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>Select Issue Location</h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Click on the map to pin the exact problem spot</p>
                </div>
              </div>

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
                  cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Map Container */}
            <div style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={selectedLocation}
                  zoom={14}
                  onClick={handleMapClick}
                  options={{
                    disableDefaultUI: false,
                    zoomControl: true,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false
                  }}
                >
                  {tempLocation && (
                    <Marker
                      position={tempLocation}
                      animation={window.google?.maps?.Animation?.DROP}
                    />
                  )}
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
                  <p>Loading Picker Map...</p>
                </div>
              )}

              {/* Float Locate Button */}
              <button
                onClick={handleGetLocation}
                disabled={isLocating}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 10
                }}
              >
                {isLocating ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
                Auto-Detect
              </button>
            </div>

            {/* Footer / Confirm */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.5rem 0'
            }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {tempLocation ? (
                  <span>Selected: {tempLocation.lat.toFixed(6)}, {tempLocation.lng.toFixed(6)}</span>
                ) : (
                  <span>Click map to pick a location</span>
                )}
              </div>
              <button
                onClick={handleConfirm}
                disabled={!tempLocation}
                className="btn btn-primary"
                style={{ padding: '0.75rem 2rem' }}
              >
                <Check size={18} />
                Confirm Location
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default LocationPickerModal;
