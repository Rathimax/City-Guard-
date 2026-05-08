import React, { useState, useRef } from 'react';
import { Camera, MapPin, Send, X, Loader2, Lock, MousePointer2, Shield, AlertTriangle, Lightbulb, Trash2, Droplets, Zap, Activity, AlertCircle, MoreHorizontal, LayoutGrid, Check, Mic, Square, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import LocationPickerModal from './LocationPickerModal';

const CATEGORIES = [
  { value: 'pothole', label: 'Pothole', icon: AlertTriangle },
  { value: 'streetlight', label: 'Street Light', icon: Lightbulb },
  { value: 'waste', label: 'Waste Management', icon: Trash2 },
  { value: 'water', label: 'Water Leakage', icon: Droplets },
  { value: 'power', label: 'Power/Electrical Issue', icon: Zap },
  { value: 'road', label: 'Road/Sidewalk Damage', icon: Activity },
  { value: 'vandalism', label: 'Vandalism/Graffiti', icon: AlertCircle },
  { value: 'other', label: 'Other', icon: MoreHorizontal },
];

const IssueForm = () => {
  const [userName, setUserName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [urgency, setUrgency] = useState('Normal');
  const [isUrgencyOpen, setIsUrgencyOpen] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const audioPlayerRef = useRef(null);

  const { currentUser } = useAuth();

  // Update userName when user logs in
  React.useEffect(() => {
    if (currentUser) {
      setUserName(currentUser.displayName || currentUser.email);
    } else {
      setUserName('');
    }
  }, [currentUser]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchLocation = () => {
    setIsFetchingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsFetchingLocation(false);
        },
        (error) => {
          console.error("Error fetching location:", error);
          alert("Could not fetch location. Please ensure GPS is enabled.");
          setIsFetchingLocation(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setIsFetchingLocation(false);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  // Audio recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Microphone access is required to record audio. Please allow microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const removeAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingDuration(0);
    setIsPlayingAudio(false);
  };

  const toggleAudioPlayback = () => {
    if (!audioPlayerRef.current) return;
    if (isPlayingAudio) {
      audioPlayerRef.current.pause();
    } else {
      audioPlayerRef.current.play();
    }
    setIsPlayingAudio(!isPlayingAudio);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userName || !description || !image || !location) {
      alert('Please fill all required fields including photo and location.');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('userId', currentUser?.uid || 'anonymous');
    formData.append('userName', userName);
    formData.append('isAnonymous', isAnonymous);
    formData.append('issueDescription', `${title}: ${description}`);
    formData.append('urgency', urgency);
    formData.append('latitude', location.lat);
    formData.append('longitude', location.lng);
    formData.append('image', image);
    if (audioBlob) {
      formData.append('audio', audioBlob, 'recording.webm');
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://city-guard-backend.onrender.com'}/api/issues`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setIsSuccess(true);
        // Reset form
        setUserName('');
        setTitle('');
        setDescription('');
        setCategory('');
        setUrgency('Normal');
        setImage(null);
        setImagePreview(null);
        setLocation(null);
        setIsAnonymous(false);
        removeAudio();
        setTimeout(() => setIsSuccess(false), 5000);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Failed to connect to the server. Is the backend running?');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="container" id="report-issue">
      <div className="glass" style={{
        padding: '2.5rem',
        border: '1px solid var(--glass-border)',
        height: '100%'
      }}>
        <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>
          {isSuccess ? '✅ Issue Reported Successfully!' : 'Report an Urban Issue'}
        </h2>

        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Thank you for contributing to your city's improvement. Your report is now live in the feed.</p>
            <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => setIsSuccess(false)}>
              Report Another Issue
            </button>
          </div>
        ) : !currentUser ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            background: 'var(--bg-secondary)',
            borderRadius: '16px',
            border: '1px solid var(--glass-border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem'
          }}>
            <div style={{
              background: 'var(--primary)',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px var(--ring)'
            }}>
               <Lock size={28} color="var(--primary-foreground)" />
             </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Login Required</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
                To maintain the integrity of our city reporting system, only verified residents can report issues.
              </p>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="btn btn-primary"
              style={{ padding: '0.75rem 2rem' }}
            >
              Sign In to Report
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem' }}>
              {/* Left Column: Form Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'none' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Your Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                </div>

                <div style={{
                  padding: '1.25rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  boxShadow: 'inset 0 0 20px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    width: '100%'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ 
                        width: '10px', 
                        height: '10px', 
                        borderRadius: '50%', 
                        background: isAnonymous ? '#94a3b8' : '#22c55e',
                        boxShadow: isAnonymous ? 'none' : '0 0 10px rgba(34, 197, 94, 0.4)'
                      }}></div>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Privacy Mode:</span>
                    </div>

                    <div 
                      onClick={() => setIsAnonymous(!isAnonymous)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        cursor: 'pointer',
                        padding: '0.5rem 1rem',
                        borderRadius: '10px',
                        background: isAnonymous ? 'rgba(var(--primary-rgb, 108, 92, 231), 0.15)' : 'var(--bg-primary)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: '1px solid',
                        borderColor: isAnonymous ? 'var(--primary)' : 'var(--border)',
                        userSelect: 'none'
                      }}
                      className="glass-hover"
                    >
                      <Shield size={16} color={isAnonymous ? 'var(--primary)' : 'var(--text-secondary)'} />
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        color: isAnonymous ? 'var(--primary)' : 'var(--text-primary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {isAnonymous ? 'Anonymous' : 'Public'}
                      </span>
                    </div>
                  </div>

                  <div style={{ 
                    padding: '1rem',
                    background: 'var(--bg-primary)',
                    borderRadius: '12px',
                    border: '1px solid var(--glass-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.15rem'
                  }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Reporting as</span>
                    <span style={{ 
                      fontSize: '1rem', 
                      fontWeight: 700, 
                      color: 'var(--text-primary)',
                      display: 'block',
                      wordBreak: 'break-word'
                    }}>
                      {isAnonymous ? 'Anonymous Citizen' : (userName || 'Community Member')}
                    </span>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Issue Title</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Broken Street Light"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Category</label>
                  <div
                    className="input-field"
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'var(--bg-secondary)',
                      userSelect: 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {(() => {
                        const selected = CATEGORIES.find(c => c.value === category);
                        const Icon = selected ? selected.icon : LayoutGrid;
                        return (
                          <>
                            <Icon size={18} color="var(--text-secondary)" />
                            <span>{selected ? selected.label : 'Select Category'}</span>
                          </>
                        );
                      })()}
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isCategoryOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: 'var(--text-secondary)' }}>
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>

                  {isCategoryOpen && (
                    <div
                      style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                      onClick={() => setIsCategoryOpen(false)}
                    />
                  )}

                  <AnimatePresence>
                    {isCategoryOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          width: '100%',
                          background: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '12px',
                          marginTop: '0.5rem',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                          zIndex: 50,
                          overflow: 'hidden'
                        }}
                      >
                        {[{ value: '', label: 'Select Category', icon: LayoutGrid }, ...CATEGORIES].map((opt) => {
                          const Icon = opt.icon;
                          const isSelected = category === opt.value || (!category && !opt.value);
                          return (
                          <div
                            key={opt.value}
                            onClick={() => {
                              setCategory(opt.value);
                              setIsCategoryOpen(false);
                            }}
                            className="glass-hover"
                            style={{
                              padding: '0.75rem 1rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              background: category === opt.value ? 'var(--bg-secondary)' : 'transparent',
                              color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)'
                            }}
                          >
                            <Icon size={18} />
                            <span style={{ flex: 1 }}>{opt.label}</span>
                            {isSelected && <Check size={16} />}
                          </div>
                        )})}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Urgency Level</label>
                  <div
                    className="input-field"
                    onClick={() => setIsUrgencyOpen(!isUrgencyOpen)}
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'var(--bg-secondary)',
                      userSelect: 'none',
                      border: urgency === 'Critical' ? '1px solid #ef4444' : urgency === 'Urgent' ? '1px solid #f97316' : '1px solid var(--border)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: urgency === 'Critical' ? '#ef4444' : urgency === 'Urgent' ? '#f97316' : '#94a3b8'
                      }}></div>
                      <span>{urgency} Priority</span>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isUrgencyOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>

                  {isUrgencyOpen && (
                    <div
                      style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                      onClick={() => setIsUrgencyOpen(false)}
                    />
                  )}

                  <AnimatePresence>
                    {isUrgencyOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          width: '100%',
                          background: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '12px',
                          marginTop: '0.5rem',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                          zIndex: 50,
                          overflow: 'hidden'
                        }}
                      >
                        {[
                          { value: 'Normal', label: 'Normal Urgency', color: '#94a3b8', desc: 'Standard maintenance issues' },
                          { value: 'Urgent', label: 'Urgent', color: '#f97316', desc: 'Needs prompt attention' },
                          { value: 'Critical', label: 'Critical Urgency', color: '#ef4444', desc: 'Life-threatening or severe failure' },
                        ].map((opt) => (
                          <div
                            key={opt.value}
                            onClick={() => {
                              setUrgency(opt.value);
                              setIsUrgencyOpen(false);
                            }}
                            className="glass-hover"
                            style={{
                              padding: '1rem',
                              cursor: 'pointer',
                              background: urgency === opt.value ? 'var(--bg-secondary)' : 'transparent',
                              borderBottom: '1px solid var(--glass-border)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2px' }}>
                              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: opt.color }}></div>
                              <span style={{ fontWeight: 600 }}>{opt.label}</span>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '1.25rem' }}>{opt.desc}</p>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Description</label>
                  <textarea
                    className="input-field"
                    placeholder="Describe the problem in detail..."
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ resize: 'none' }}
                    required
                  />
                </div>
              </div>

              {/* Right Column: Media & Location */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Upload Photo</label>
                  {!imagePreview ? (
                    <label style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '200px',
                      background: 'var(--bg-secondary)',
                      border: '2px dashed var(--border)',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      transition: 'var(--transition-smooth)'
                    }}
                      className="glass-hover"
                    >
                      <Camera size={32} color="var(--text-secondary)" />
                      <span style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>Click to Upload</span>
                      <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                    </label>
                  ) : (
                    <div style={{ position: 'relative', height: '200px' }}>
                      <img src={imagePreview} alt="Preview" style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '16px',
                        border: '1px solid var(--glass-border)'
                      }} />
                      <button
                        type="button"
                        onClick={removeImage}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'var(--error, #ef4444)',
                          border: 'none',
                          borderRadius: '50%',
                          padding: '5px',
                          color: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Audio Recorder */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Voice Note (Optional)</label>
                  
                  {!audioBlob && !isRecording ? (
                    <div
                      onClick={startRecording}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100px',
                        background: 'var(--bg-secondary)',
                        border: '2px dashed var(--border)',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        transition: 'var(--transition-smooth)',
                        gap: '0.5rem'
                      }}
                      className="glass-hover"
                    >
                      <Mic size={28} color="var(--text-secondary)" />
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Tap to Record Audio</span>
                    </div>
                  ) : isRecording ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem 1.25rem',
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: '16px',
                        height: '100px'
                      }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          background: '#ef4444',
                          boxShadow: '0 0 12px rgba(239, 68, 68, 0.5)',
                          flexShrink: 0
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ef4444', margin: 0 }}>Recording...</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>{formatDuration(recordingDuration)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={stopRecording}
                        style={{
                          background: '#ef4444',
                          border: 'none',
                          borderRadius: '50%',
                          width: '44px',
                          height: '44px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: 'white',
                          boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
                          flexShrink: 0
                        }}
                      >
                        <Square size={18} fill="white" />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '1rem 1.25rem',
                        background: 'rgba(34, 197, 94, 0.08)',
                        border: '1px solid rgba(34, 197, 94, 0.25)',
                        borderRadius: '16px',
                        height: '100px'
                      }}
                    >
                      <button
                        type="button"
                        onClick={toggleAudioPlayback}
                        style={{
                          background: 'var(--primary)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '40px',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: 'white',
                          flexShrink: 0
                        }}
                      >
                        {isPlayingAudio ? <Pause size={18} /> : <Play size={18} />}
                      </button>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Mic size={14} color="#22c55e" />
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Voice Note</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{formatDuration(recordingDuration)}</span>
                        {/* Waveform bars */}
                        <div style={{ display: 'flex', alignItems: 'end', gap: '2px', height: '16px' }}>
                          {Array.from({ length: 20 }).map((_, i) => (
                            <motion.div
                              key={i}
                              animate={isPlayingAudio ? {
                                height: [4, Math.random() * 14 + 4, 4],
                              } : {}}
                              transition={{
                                duration: 0.4 + Math.random() * 0.3,
                                repeat: Infinity,
                                delay: i * 0.05,
                              }}
                              style={{
                                width: '3px',
                                height: `${Math.random() * 10 + 4}px`,
                                borderRadius: '2px',
                                background: isPlayingAudio ? 'var(--primary)' : '#22c55e',
                                opacity: 0.7,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeAudio}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          borderRadius: '50%',
                          width: '36px',
                          height: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: '#ef4444',
                          flexShrink: 0
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                      <audio
                        ref={audioPlayerRef}
                        src={audioUrl}
                        onEnded={() => setIsPlayingAudio(false)}
                        style={{ display: 'none' }}
                      />
                    </motion.div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.875rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Location Settings</label>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={fetchLocation}
                      disabled={isFetchingLocation}
                      className="btn btn-secondary"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      {isFetchingLocation ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <MapPin size={20} />
                      )}
                      {location ? 'Refresh GPS Location' : 'Fetch GPS Location'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsMapPickerOpen(true)}
                      className="btn btn-secondary"
                      style={{
                        width: '100%',
                        justifyContent: 'center',
                        background: 'transparent',
                        border: '1px solid var(--border)'
                      }}
                    >
                      <MousePointer2 size={20} />
                      Select on Map
                    </button>
                  </div>

                  <LocationPickerModal
                    isOpen={isMapPickerOpen}
                    onClose={() => setIsMapPickerOpen(false)}
                    initialLocation={location}
                    onSelect={(loc) => setLocation(loc)}
                  />

                  {location && (
                    <p style={{
                      marginTop: '1rem',
                      padding: '0.75rem',
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.2)',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      color: 'var(--success, #22c55e)',
                      textAlign: 'center'
                    }}>
                      Location Captured ✓ ({location.lat.toFixed(4)}, {location.lng.toFixed(4)})
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '1.25rem', marginTop: '2rem', justifyContent: 'center' }}
            >
              {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        )}
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </section>
  );
};

export default IssueForm;
