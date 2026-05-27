import React, { useState, useRef } from 'react';
import { Camera, MapPin, Send, X, Loader2, Lock, MousePointer2, Shield, AlertTriangle, Lightbulb, Trash2, Droplets, Zap, Activity, AlertCircle, MoreHorizontal, LayoutGrid, Check, Mic, Square, Play, Pause, ClipboardList } from 'lucide-react';
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

  // Stepper Wizard states
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const stepVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    },
    exit: (dir) => ({
      x: dir < 0 ? 50 : -50,
      opacity: 0,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    })
  };

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

  const { currentUser, userRegion } = useAuth();

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
        setRecordingDuration(prev => {
          if (prev >= 179) { // 3 minutes limit (180s)
            stopRecording();
            return 180;
          }
          return prev + 1;
        });
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
    const finalUserName = userName || currentUser?.displayName || currentUser?.email || 'Community Member';
    if (!finalUserName || !description || !image || !location) {
      alert('Please fill all required fields including photo and location.');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('userId', currentUser?.uid || 'anonymous');
    formData.append('userName', finalUserName);
    formData.append('isAnonymous', isAnonymous);
    formData.append('issueDescription', `${title}: ${description}`);
    formData.append('urgency', urgency);
    formData.append('latitude', location.lat);
    formData.append('longitude', location.lng);
    formData.append('region', userRegion || 'Universal');
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
        setUserName(currentUser?.displayName || currentUser?.email || '');
        setTitle('');
        setDescription('');
        setCategory('');
        setUrgency('Normal');
        setImage(null);
        setImagePreview(null);
        setLocation(null);
        setIsAnonymous(false);
        removeAudio();
        setStep(1);
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
        padding: isMobile ? '1.25rem' : '2.5rem',
        border: '1px solid var(--glass-border)',
        height: '100%'
      }}>
        {!isSuccess && (
          <h2 style={{ marginBottom: isMobile ? '1rem' : '1.5rem', fontSize: isMobile ? '1.4rem' : '1.8rem', fontFamily: 'var(--font-heading)' }}>
            Report an Urban Issue
          </h2>
        )}

        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              height: '100%',
              minHeight: '400px',
              gap: '1.75rem',
              padding: '2rem 1rem'
            }}
          >
            {/* Pulsing check icon inside glowing glass ring */}
            <motion.div
              animate={{ 
                boxShadow: [
                  '0 0 0 0px rgba(34, 197, 94, 0.2)',
                  '0 0 0 16px rgba(34, 197, 94, 0)',
                  '0 0 0 0px rgba(34, 197, 94, 0.2)'
                ]
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              style={{
                background: 'rgba(34, 197, 94, 0.08)',
                border: '2px solid rgba(34, 197, 94, 0.8)',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#22c55e',
                boxShadow: '0 0 20px rgba(34, 197, 94, 0.15)'
              }}
            >
              <Check size={40} strokeWidth={3} />
            </motion.div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h2 style={{ 
                fontSize: '1.85rem', 
                fontWeight: 800, 
                fontFamily: 'var(--font-heading)',
                background: 'linear-gradient(135deg, #22c55e 30%, #10b981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
                margin: 0
              }}>
                Issue Submitted Successfully!
              </h2>
              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '1rem', 
                lineHeight: '1.6', 
                maxWidth: '400px', 
                margin: '0 auto' 
              }}>
                Thank you for contributing to your city's improvement. Your report is now live in the community feed.
              </p>
            </div>

            {/* Glowing route badge */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--glass-border)',
              borderRadius: '99px',
              padding: '0.6rem 1.25rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: 'inset 0 0 12px rgba(255, 255, 255, 0.02)'
            }}>
              <span style={{ 
                display: 'inline-block', 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                background: '#22c55e',
                boxShadow: '0 0 8px #22c55e'
              }}></span>
              <span>Routed to Public Council Queue</span>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ 
                padding: '0.9rem 2.25rem', 
                fontWeight: 700,
                fontSize: '0.95rem',
                justifyContent: 'center',
                boxShadow: '0 10px 25px -5px var(--ring)',
                marginTop: '0.5rem'
              }} 
              onClick={() => setIsSuccess(false)}
            >
              Report Another Issue
            </button>
          </motion.div>
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
            {/* Stepper Progress Indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: isMobile ? '1.5rem' : '2.5rem',
              position: 'relative'
            }}>
              {/* Progress Line */}
              <div style={{
                position: 'absolute',
                top: isMobile ? '17px' : '21px',
                left: isMobile ? '17px' : '20px',
                right: isMobile ? '17px' : '20px',
                height: '3px',
                background: 'var(--border)',
                zIndex: 1,
                transform: 'translateY(-50%)'
              }} />
              {/* Filled Progress Line */}
              <div style={{
                position: 'absolute',
                top: isMobile ? '17px' : '21px',
                left: isMobile ? '17px' : '20px',
                width: step === 1 ? '0%'
                  : step === 2 ? (isMobile ? 'calc(33.33% - 12px)' : 'calc(33.33% - 14px)')
                  : step === 3 ? (isMobile ? 'calc(66.66% - 12px)' : 'calc(66.66% - 14px)')
                  : (isMobile ? 'calc(100% - 34px)' : 'calc(100% - 40px)'),
                height: '3px',
                background: 'var(--primary)',
                boxShadow: '0 0 10px var(--ring)',
                zIndex: 1,
                transform: 'translateY(-50%)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }} />

              {/* Step Items */}
              {[
                { num: 1, label: 'Details', icon: Lightbulb },
                { num: 2, label: 'Evidence', icon: Camera },
                { num: 3, label: 'Location', icon: MapPin },
                { num: 4, label: 'Review', icon: ClipboardList }
              ].map((s) => {
                const StepIcon = s.icon;
                const isActive = step >= s.num;
                const isCurrent = step === s.num;
                
                // Allow backward jumps to completed steps
                const isClickable = step > s.num;

                return (
                  <div 
                    key={s.num} 
                    style={{ 
                      zIndex: 2, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      gap: isMobile ? '0.35rem' : '0.5rem',
                      cursor: isClickable ? 'pointer' : 'default'
                    }}
                    onClick={() => {
                      if (isClickable) {
                        setDirection(s.num - step);
                        setStep(s.num);
                      }
                    }}
                  >
                    <div style={{
                      width: isMobile ? '34px' : '42px',
                      height: isMobile ? '34px' : '42px',
                      borderRadius: '50%',
                      background: isCurrent ? 'var(--primary)' : isActive ? 'var(--primary)' : 'var(--bg-secondary)',
                      border: `2px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                      color: isActive ? 'white' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isCurrent ? '0 0 15px var(--ring)' : 'none',
                      transition: 'all 0.3s ease'
                    }}>
                      <StepIcon size={isMobile ? 15 : 18} color={isActive ? 'white' : 'var(--text-secondary)'} />
                    </div>
                    <span style={{ 
                      fontSize: isMobile ? '0.65rem' : '0.75rem', 
                      fontWeight: isActive ? 700 : 500, 
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>{s.label}</span>
                  </div>
                );
              })}
            </div>

            <AnimatePresence mode="wait" custom={direction}>
              {/* Step 1: Issue Details */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '1rem' : '1.5rem' }}
                >
                  <div>
                    <h3 style={{ fontSize: isMobile ? '1.05rem' : '1.25rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>1. Tell Us What's Wrong</h3>
                    <p style={{ fontSize: isMobile ? '0.78rem' : '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      Categorize the issue and describe what requires fixing so our teams are correctly prepared.
                    </p>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Issue Title <span style={{ color: '#ef4444' }}>*</span></label>
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
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Category <span style={{ color: '#ef4444' }}>*</span></label>
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
                              <Icon size={18} color="var(--primary)" />
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
                            overflowY: 'auto',
                            maxHeight: isMobile ? '200px' : '300px'
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

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: isMobile ? '0.8rem' : '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Description <span style={{ color: '#ef4444' }}>*</span></label>
                    <textarea
                      className="input-field"
                      placeholder="Describe the problem in detail (e.g., location reference points, severity)..."
                      rows={isMobile ? 3 : 4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      style={{ resize: 'none', height: isMobile ? '90px' : 'auto' }}
                      required
                    />
                  </div>

                  <button
                    type="button"
                    disabled={!title.trim() || !category || !description.trim()}
                    onClick={() => {
                      setDirection(1);
                      setStep(2);
                    }}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: isMobile ? '0.75rem' : '1rem', marginTop: isMobile ? '0.5rem' : '1rem', justifyContent: 'center', fontWeight: 700, fontSize: isMobile ? '0.9rem' : '1rem' }}
                  >
                    Continue to Evidence →
                  </button>
                </motion.div>
              )}

              {/* Step 2: Media Evidence */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '1rem' : '1.5rem' }}
                >
                  <div>
                    <h3 style={{ fontSize: isMobile ? '1.05rem' : '1.25rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>2. Capture the Evidence</h3>
                    <p style={{ fontSize: isMobile ? '0.78rem' : '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      Upload a clear photo showing the infrastructure issue. An optional voice note can be recorded to explain the physical details.
                    </p>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: isMobile ? '0.8rem' : '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Upload Photo <span style={{ color: '#ef4444' }}>*</span></label>
                    {!imagePreview ? (
                      <label style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: isMobile ? '120px' : '200px',
                        background: 'var(--bg-secondary)',
                        border: '2px dashed var(--border)',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        transition: 'var(--transition-smooth)'
                      }}
                        className="glass-hover"
                      >
                        <Camera size={isMobile ? 24 : 32} color="var(--text-secondary)" />
                        <span style={{ marginTop: isMobile ? '0.25rem' : '0.5rem', color: 'var(--text-primary)', fontWeight: 600, fontSize: isMobile ? '0.85rem' : '1rem' }}>Click to Upload</span>
                        <span style={{ marginTop: '2px', color: 'var(--text-secondary)', fontSize: '0.65rem' }}>PNG, JPG (Max 5MB)</span>
                        <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                      </label>
                    ) : (
                      <div style={{ position: 'relative', height: isMobile ? '120px' : '200px' }}>
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
                            background: '#ef4444',
                            border: 'none',
                            borderRadius: '50%',
                            padding: '5px',
                            color: 'white',
                            cursor: 'pointer',
                            boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)'
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Audio Recorder */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: isMobile ? '0.8rem' : '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Voice Note <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-secondary)' }}>(Optional)</span></label>
                    
                    {!audioBlob && !isRecording ? (
                      <div
                        onClick={startRecording}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: isMobile ? '72px' : '100px',
                          background: 'var(--bg-secondary)',
                          border: '2px dashed var(--border)',
                          borderRadius: '16px',
                          cursor: 'pointer',
                          transition: 'var(--transition-smooth)',
                          gap: isMobile ? '0.25rem' : '0.5rem'
                        }}
                        className="glass-hover"
                      >
                        <Mic size={isMobile ? 20 : 28} color="var(--text-secondary)" />
                        <span style={{ color: 'var(--text-secondary)', fontSize: isMobile ? '0.75rem' : '0.85rem', fontWeight: 600 }}>Tap to Record Audio</span>
                      </div>
                    ) : isRecording ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: isMobile ? '0.5rem 1rem' : '1rem 1.25rem',
                          background: 'rgba(239, 68, 68, 0.08)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          borderRadius: '16px',
                          height: isMobile ? '72px' : '100px'
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
                          <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ef4444', margin: 0 }}>
                            {recordingDuration >= 170 ? 'Limit approaching...' : 'Recording...'}
                          </p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                            {formatDuration ? formatDuration(recordingDuration) : `${Math.floor(recordingDuration / 60)}:${((recordingDuration % 60) < 10 ? '0' : '') + (recordingDuration % 60)}`}
                            <span style={{ opacity: 0.5, marginLeft: '4px' }}>/ 3:00</span>
                          </p>
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
                          padding: isMobile ? '0.5rem 1rem' : '1rem 1.25rem',
                          background: 'rgba(34, 197, 94, 0.08)',
                          border: '1px solid rgba(34, 197, 94, 0.25)',
                          borderRadius: '16px',
                          height: isMobile ? '72px' : '100px'
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

                  <div style={{ display: 'flex', gap: isMobile ? '0.5rem' : '1rem', marginTop: isMobile ? '0.75rem' : '1rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setDirection(-1);
                        setStep(1);
                      }}
                      className="btn btn-secondary"
                      style={{ flex: 1, justifyContent: 'center', padding: isMobile ? '0.75rem' : '1rem', fontWeight: 600, fontSize: isMobile ? '0.85rem' : '1rem' }}
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      disabled={!image}
                      onClick={() => {
                        setDirection(1);
                        setStep(3);
                      }}
                      className="btn btn-primary"
                      style={{ flex: 2, justifyContent: 'center', padding: isMobile ? '0.75rem' : '1rem', fontWeight: 700, fontSize: isMobile ? '0.85rem' : '1rem' }}
                    >
                      Continue to Location →
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Location & Privacy */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '1rem' : '1.5rem' }}
                >
                  <div>
                    <h3 style={{ fontSize: isMobile ? '1.05rem' : '1.25rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>3. Location & Privacy</h3>
                    <p style={{ fontSize: isMobile ? '0.78rem' : '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      Specify the geographic coordinates and confirm your privacy preferences.
                    </p>
                  </div>

                  {/* Privacy Mode card */}
                  <div style={{
                    padding: isMobile ? '0.85rem' : '1.25rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: '16px',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: isMobile ? '0.75rem' : '1rem',
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      width: '100%'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ 
                            width: '10px', 
                            height: '10px', 
                            borderRadius: '50%', 
                            background: isAnonymous ? '#94a3b8' : '#22c55e',
                            boxShadow: isAnonymous ? 'none' : '0 0 10px rgba(34, 197, 94, 0.4)'
                          }}></div>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>Privacy Mode:</span>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', opacity: 0.8, marginLeft: '22px', fontStyle: 'italic' }}>
                          (The mayor can still see your name)
                        </span>
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

                  {/* Urgency selection */}
                  <div style={{ position: 'relative' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Urgency Level</label>
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
                            overflowY: 'auto',
                            maxHeight: isMobile ? '200px' : '300px'
                          }}
                        >
                          {[
                            { value: 'Normal', label: 'Normal Urgency', color: '#94a3b8', desc: 'Standard maintenance issues' },
                            { value: 'Urgent', label: 'Urgent', color: '#f97316', desc: 'Needs prompt attention' },
                            { value: 'Critical', label: 'Critical Urgency', color: '#ef4444', desc: 'Severe failure or safety risk' },
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

                  {/* Location selection */}
                  <div>
                    <label style={{ display: 'block', marginBottom: isMobile ? '0.5rem' : '0.875rem', fontSize: isMobile ? '0.8rem' : '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Location Settings <span style={{ color: '#ef4444' }}>*</span></label>

                    <div style={{ display: 'flex', gap: isMobile ? '0.5rem' : '0.75rem' }}>
                      <button
                        type="button"
                        onClick={fetchLocation}
                        disabled={isFetchingLocation}
                        className="btn btn-secondary"
                        style={{ flex: 1, justifyContent: 'center', gap: '0.5rem', padding: isMobile ? '0.6rem' : '0.8rem', fontSize: isMobile ? '0.85rem' : '1rem' }}
                      >
                        {isFetchingLocation ? (
                          <Loader2 size={isMobile ? 15 : 18} className="animate-spin" />
                        ) : (
                          <MapPin size={isMobile ? 15 : 18} color="var(--primary)" />
                        )}
                        <span>GPS Search</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsMapPickerOpen(true)}
                        className="btn btn-secondary"
                        style={{
                          flex: 1,
                          justifyContent: 'center',
                          background: 'transparent',
                          border: '1px solid var(--border)',
                          gap: '0.5rem',
                          padding: isMobile ? '0.6rem' : '0.8rem',
                          fontSize: isMobile ? '0.85rem' : '1rem'
                        }}
                      >
                        <MousePointer2 size={isMobile ? 15 : 18} color="var(--primary)" />
                        <span>Select on Map</span>
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
                        textAlign: 'center',
                        fontWeight: 600
                      }}>
                        Location Captured ✓ ({location.lat.toFixed(4)}, {location.lng.toFixed(4)})
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: isMobile ? '0.5rem' : '1rem', marginTop: isMobile ? '0.75rem' : '1rem' }}>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => {
                        setDirection(-1);
                        setStep(2);
                      }}
                      className="btn btn-secondary"
                      style={{ flex: 1, justifyContent: 'center', padding: isMobile ? '0.75rem' : '1rem', fontWeight: 600, fontSize: isMobile ? '0.85rem' : '1rem' }}
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      disabled={!location}
                      onClick={() => {
                        setDirection(1);
                        setStep(4);
                      }}
                      className="btn btn-primary"
                      style={{ flex: 2, justifyContent: 'center', padding: isMobile ? '0.85rem' : '1.25rem', fontWeight: 700, fontSize: isMobile ? '0.9rem' : '1rem' }}
                    >
                      <ClipboardList size={isMobile ? 18 : 20} />
                      <span>Review & Submit →</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Review & Submit */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '1rem' : '1.5rem' }}
                >
                  <div>
                    <h3 style={{ fontSize: isMobile ? '1.05rem' : '1.25rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>4. Review & Submit</h3>
                    <p style={{ fontSize: isMobile ? '0.78rem' : '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      Double-check everything before sending your report to the city.
                    </p>
                  </div>

                  {/* Review Card */}
                  <div style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    overflow: 'hidden'
                  }}>

                    {/* ── DETAILS ── */}
                    <div style={{
                      padding: isMobile ? '0.85rem' : '1.25rem',
                      borderBottom: '1px solid var(--border)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: isMobile ? '0.65rem' : '0.85rem' }}>
                        <Lightbulb size={isMobile ? 13 : 14} color="var(--primary)" />
                        <span style={{ fontSize: isMobile ? '0.65rem' : '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary)' }}>Details</span>
                      </div>

                      {/* Title + Category */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: isMobile ? '0.6rem' : '1rem', marginBottom: isMobile ? '0.6rem' : '0.85rem' }}>
                        <div>
                          <span style={{ fontSize: isMobile ? '0.65rem' : '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px', fontWeight: 500 }}>Issue Title</span>
                          <span style={{ fontSize: isMobile ? '0.82rem' : '0.95rem', fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                            {title || <em style={{ opacity: 0.4 }}>—</em>}
                          </span>
                        </div>
                        <div>
                          <span style={{ fontSize: isMobile ? '0.65rem' : '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px', fontWeight: 500 }}>Category</span>
                          <span style={{ fontSize: isMobile ? '0.82rem' : '0.95rem', fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                            {CATEGORIES.find(c => c.value === category)?.label || <em style={{ opacity: 0.4 }}>—</em>}
                          </span>
                        </div>
                      </div>

                      {/* Urgency + Reporting As */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: isMobile ? '0.6rem' : '1rem', marginBottom: description ? (isMobile ? '0.6rem' : '0.85rem') : 0 }}>
                        <div>
                          <span style={{ fontSize: isMobile ? '0.65rem' : '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px', fontWeight: 500 }}>Urgency</span>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            fontSize: isMobile ? '0.78rem' : '0.88rem', fontWeight: 700,
                            color: urgency === 'Critical' ? '#ef4444' : urgency === 'Urgent' ? '#f97316' : '#94a3b8'
                          }}>
                            <span style={{
                              width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                              background: urgency === 'Critical' ? '#ef4444' : urgency === 'Urgent' ? '#f97316' : '#94a3b8',
                              display: 'inline-block'
                            }} />
                            {urgency}
                          </span>
                        </div>
                        <div>
                          <span style={{ fontSize: isMobile ? '0.65rem' : '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px', fontWeight: 500 }}>Reporting As</span>
                          <span style={{ fontSize: isMobile ? '0.82rem' : '0.95rem', fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                            {isAnonymous ? 'Anonymous' : (userName || 'Community Member')}
                          </span>
                        </div>
                      </div>

                      {/* Description — full width */}
                      {description && (
                        <div>
                          <span style={{ fontSize: isMobile ? '0.65rem' : '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>Description</span>
                          <p style={{
                            fontSize: isMobile ? '0.8rem' : '0.9rem',
                            color: 'var(--text-primary)',
                            lineHeight: '1.5',
                            margin: 0,
                            padding: isMobile ? '0.5rem 0.65rem' : '0.6rem 0.75rem',
                            background: 'var(--bg-primary)',
                            borderRadius: '8px',
                            border: '1px solid var(--glass-border)',
                            wordBreak: 'break-word'
                          }}>{description}</p>
                        </div>
                      )}
                    </div>

                    {/* ── EVIDENCE ── */}
                    <div style={{
                      padding: isMobile ? '0.85rem' : '1.25rem',
                      borderBottom: '1px solid var(--border)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: isMobile ? '0.65rem' : '0.85rem' }}>
                        <Camera size={isMobile ? 13 : 14} color="var(--primary)" />
                        <span style={{ fontSize: isMobile ? '0.65rem' : '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary)' }}>Evidence</span>
                      </div>

                      {/* Photo full-width on mobile, inline on desktop */}
                      <div style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: isMobile ? '0.65rem' : '1rem',
                        alignItems: isMobile ? 'stretch' : 'flex-start'
                      }}>
                        {imagePreview ? (
                          <div style={{ position: 'relative', flexShrink: 0 }}>
                            <img
                              src={imagePreview}
                              alt="Evidence"
                              style={{
                                width: isMobile ? '100%' : '130px',
                                height: isMobile ? '120px' : '100px',
                                objectFit: 'cover',
                                borderRadius: '10px',
                                border: '2px solid var(--primary)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                display: 'block'
                              }}
                            />
                            <div style={{
                              position: 'absolute', bottom: '8px', right: '8px',
                              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
                              borderRadius: '6px', padding: '2px 7px',
                              fontSize: '0.6rem', color: 'white', fontWeight: 700,
                              letterSpacing: '0.5px'
                            }}>PHOTO</div>
                          </div>
                        ) : (
                          <div style={{
                            width: isMobile ? '100%' : '130px',
                            height: isMobile ? '72px' : '100px',
                            borderRadius: '10px',
                            border: '2px dashed var(--border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--text-secondary)',
                            fontSize: isMobile ? '0.75rem' : '0.7rem',
                            background: 'var(--bg-primary)'
                          }}>No photo</div>
                        )}

                        {/* Status badges */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: isMobile ? '20px' : '22px', height: isMobile ? '20px' : '22px',
                              borderRadius: '50%', flexShrink: 0,
                              background: imagePreview ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.1)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              {imagePreview ? <Check size={11} color="#22c55e" /> : <X size={11} color="#ef4444" />}
                            </div>
                            <span style={{ fontSize: isMobile ? '0.78rem' : '0.82rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                              {imagePreview ? '1 photo attached' : 'No photo uploaded'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: isMobile ? '20px' : '22px', height: isMobile ? '20px' : '22px',
                              borderRadius: '50%', flexShrink: 0,
                              background: audioBlob ? 'rgba(34,197,94,0.15)' : 'rgba(148,163,184,0.1)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              {audioBlob ? <Check size={11} color="#22c55e" /> : <Mic size={11} color="#94a3b8" />}
                            </div>
                            <span style={{ fontSize: isMobile ? '0.78rem' : '0.82rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                              {audioBlob ? `Voice note · ${formatDuration(recordingDuration)}` : 'No voice note'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── LOCATION ── */}
                    <div style={{ padding: isMobile ? '0.85rem' : '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: isMobile ? '0.65rem' : '0.85rem' }}>
                        <MapPin size={isMobile ? 13 : 14} color="var(--primary)" />
                        <span style={{ fontSize: isMobile ? '0.65rem' : '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary)' }}>Location</span>
                      </div>

                      {location ? (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '0.65rem',
                          padding: isMobile ? '0.6rem 0.75rem' : '0.65rem 0.85rem',
                          background: 'rgba(34,197,94,0.08)',
                          border: '1px solid rgba(34,197,94,0.2)',
                          borderRadius: '10px'
                        }}>
                          <div style={{
                            width: isMobile ? '28px' : '32px', height: isMobile ? '28px' : '32px',
                            borderRadius: '50%', flexShrink: 0,
                            background: 'rgba(34,197,94,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            <MapPin size={isMobile ? 13 : 16} color="#22c55e" />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <span style={{ fontSize: isMobile ? '0.65rem' : '0.72rem', color: '#22c55e', fontWeight: 600, display: 'block' }}>Coordinates Captured ✓</span>
                            <span style={{
                              fontSize: isMobile ? '0.78rem' : '0.88rem',
                              color: 'var(--text-primary)', fontWeight: 700,
                              wordBreak: 'break-all', display: 'block'
                            }}>
                              {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          padding: isMobile ? '0.5rem 0.75rem' : '0.6rem 0.85rem',
                          background: 'rgba(239,68,68,0.06)',
                          border: '1px solid rgba(239,68,68,0.2)',
                          borderRadius: '10px',
                          fontSize: isMobile ? '0.8rem' : '0.85rem', color: '#ef4444', fontWeight: 600
                        }}>No location set</div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons — same pattern as steps 1–3 */}
                  <div style={{ display: 'flex', gap: isMobile ? '0.5rem' : '1rem', marginTop: isMobile ? '0.5rem' : '1rem' }}>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => {
                        setDirection(-1);
                        setStep(3);
                      }}
                      className="btn btn-secondary"
                      style={{ flex: 1, justifyContent: 'center', padding: isMobile ? '0.75rem' : '1rem', fontWeight: 600, fontSize: isMobile ? '0.85rem' : '1rem' }}
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={!location || isSubmitting}
                      className="btn btn-primary"
                      style={{ flex: 2, justifyContent: 'center', padding: isMobile ? '0.85rem' : '1.25rem', fontWeight: 700, fontSize: isMobile ? '0.9rem' : '1rem' }}
                    >
                      {isSubmitting ? <Loader2 size={isMobile ? 18 : 24} className="animate-spin" /> : <Send size={isMobile ? 18 : 20} />}
                      <span>{isSubmitting ? 'Submitting...' : 'Submit Report'}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        )}
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </section>
  );
};

export default IssueForm;
