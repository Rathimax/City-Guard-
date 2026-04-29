import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Clock, CheckCircle, AlertTriangle, Timer, Shield, ArrowBigUp, ArrowBigDown, Lock, User, UserX, MessageSquare, Trash2, X, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const IssueCard = ({ issue, onVoteUpdate, showVotes = true }) => {
  const { currentUser } = useAuth();
  const [isVoting, setIsVoting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [comments, setComments] = useState(issue.comments || []);
  const [newComment, setNewComment] = useState('');

  // Sync comments when prop changes
  useEffect(() => {
    if (issue.comments) {
      setComments(issue.comments);
    }
  }, [issue.comments]);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isExpanded]);
  // Check if user has already voted
  const userVote = issue.voters?.find(v => v.userId === currentUser?.uid)?.voteType;

  const getStatusColor = (s) => {
    switch (s?.toLowerCase()) {
      case 'resolved': return '#10b981';
      case 'in progress': return '#87ceeb';
      default: return '#fbbf24';
    }
  };

  const handleVote = async (type) => {
    if (!currentUser) {
      alert('Please sign in to vote on city issues.');
      return;
    }
    if (isVoting) return;

    setIsVoting(true);
    try {
      const response = await fetch(`https://city-guard-backend.onrender.com/api/issues/${issue.id}/vote`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.uid, type })
      });

      if (response.ok) {
        const updatedIssue = await response.json();
        if (onVoteUpdate) onVoteUpdate(updatedIssue);
      }
    } catch (err) {
      console.error('Vote failed:', err);
    } finally {
      setIsVoting(false);
    }
  };
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please sign in to comment.');
      return;
    }
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const response = await fetch(`https://city-guard-backend.onrender.com/api/issues/${issue.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.uid,
          userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
          text: newComment,
          isAnonymous: issue.isAnonymous
        })
      });

      if (response.ok) {
        const updatedIssue = await response.json();
        setComments(updatedIssue.comments || []);
        setNewComment('');
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    
    try {
      const response = await fetch(`https://city-guard-backend.onrender.com/api/issues/${issue.id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.uid })
      });

      if (response.ok) {
        const updatedIssue = await response.json();
        setComments(updatedIssue.comments || []);
      }
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const getUrgencyStyles = (level) => {
    switch (level) {
      case 'Critical': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)', glow: '0 0 15px rgba(239, 68, 68, 0.2)' };
      case 'Urgent': return { bg: 'rgba(249, 115, 22, 0.15)', text: '#f97316', border: 'rgba(249, 115, 22, 0.3)', glow: 'none' };
      default: return { bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)', glow: 'none' };
    }
  };

  const urgencyStyles = getUrgencyStyles(issue.urgency || 'Normal');

  return (
    <>
    {createPortal(
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(false);
            }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(8px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass modal-split-layout"
              style={{
                width: '100%',
                maxWidth: '1000px',
                height: '85vh', // Fixed height to allow inner scrolling
                borderRadius: '24px',
                display: 'flex',
                flexDirection: 'row',
                overflow: 'hidden',
                background: 'var(--bg-primary)',
                border: '1px solid var(--glass-border)'
              }}
            >
              <style>
                {`
                  @media (max-width: 768px) {
                    .modal-split-layout {
                      flex-direction: column !important;
                      height: 95vh !important;
                    }
                    .modal-left-pane {
                      border-right: none !important;
                      border-bottom: 1px solid var(--glass-border);
                      max-height: 50vh;
                    }
                    .modal-right-pane {
                      padding-top: 1rem !important;
                    }
                    .modal-close-btn {
                      background: rgba(0,0,0,0.5) !important;
                      color: white !important;
                      backdrop-filter: blur(4px);
                    }
                  }
                `}
              </style>

              {/* Left Column: Details */}
              <div className="modal-left-pane" style={{ flex: '1.2', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                <div style={{ position: 'relative', height: '300px', flexShrink: 0 }}>
                  <img src={issue.image || issue.photoUrl} alt="Issue" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {/* Mobile close button (visible only on mobile due to absolute positioning stacking) */}
                  <button 
                    onClick={() => setIsExpanded(false)}
                    className="modal-close-btn hidden md:flex"
                    style={{
                      position: 'absolute', top: '16px', right: '16px', zIndex: 10,
                      background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%',
                      width: '36px', height: '36px', display: 'none', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: 'white'
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* 1. Visual Status Timeline */}
                <div style={{ padding: '1.5rem 2rem 0', flexShrink: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '0 10px' }}>
                    {/* Background Line */}
                    <div style={{ position: 'absolute', top: '12px', left: '40px', right: '40px', height: '2px', background: 'var(--glass-border)', zIndex: 1 }}></div>
                    
                    {['Reported', 'Review', 'Assigned', 'Started', 'Resolved'].map((step, idx) => {
                      const currentStep = issue.status === 'resolved' ? 4 : (issue.status === 'in progress' ? 3 : (issue.assignedTo && issue.assignedTo !== 'Not Assigned' ? 2 : 1));
                      const isCompleted = idx <= currentStep;
                      return (
                        <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 2, flex: 1 }}>
                          <div style={{ 
                            width: '24px', height: '24px', borderRadius: '50%', 
                            background: isCompleted ? 'var(--primary)' : 'var(--bg-secondary)',
                            border: `2px solid ${isCompleted ? 'var(--primary)' : 'var(--glass-border)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: isCompleted ? '0 0 10px rgba(var(--primary-rgb), 0.4)' : 'none',
                            transition: 'all 0.3s ease'
                          }}>
                            {isCompleted && <CheckCircle size={14} color="white" />}
                          </div>
                          <span style={{ fontSize: '0.65rem', fontWeight: isCompleted ? 700 : 500, color: isCompleted ? 'var(--text-primary)' : 'var(--text-secondary)', textAlign: 'center' }}>{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-heading)', marginBottom: '0.5rem' }}>
                      {issue.title || (issue.issueDescription?.includes(':') ? issue.issueDescription.split(':')[0] : 'City Issue')}
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                         <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={16} /> {issue.time}</span>
                         <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={16} color="var(--primary)" /> {issue.location}</span>
                      </div>

                      {/* 2. Interactive Mini-Map */}
                      {issue.location && issue.location !== 'Location Pending' && (
                        <div style={{ width: '100%', height: '150px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                          <iframe 
                            width="100%" 
                            height="100%" 
                            frameBorder="0" 
                            scrolling="no" 
                            marginHeight="0" 
                            marginWidth="0" 
                            src={`https://maps.google.com/maps?q=${issue.location.split(',')[0]},${issue.location.split(',')[1]}&z=15&output=embed`}
                          ></iframe>
                        </div>
                      )}
                    </div>

                    {showVotes && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', background: 'var(--bg-secondary)', padding: '0.75rem 1.25rem', borderRadius: '12px', width: 'fit-content', border: '1px solid var(--glass-border)' }}>
                        <button 
                          onClick={() => handleVote('up')}
                          style={{ background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                        >
                          <ArrowBigUp size={22} fill={userVote === 'up' ? 'var(--primary)' : 'none'} color={userVote === 'up' ? 'var(--primary)' : 'var(--text-secondary)'} />
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{issue.upvotes || 0} Upvotes</span>
                        </button>
                        <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)' }}></div>
                        <button 
                          onClick={() => handleVote('down')}
                          style={{ background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                        >
                          <ArrowBigDown size={22} fill={userVote === 'down' ? '#ef4444' : 'none'} color={userVote === 'down' ? '#ef4444' : 'var(--text-secondary)'} />
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{issue.downvotes || 0} Downvotes</span>
                        </button>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <p style={{ color: 'var(--text-primary)', lineHeight: '1.6', fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>
                        {issue.description || (issue.issueDescription?.includes(':') ? issue.issueDescription.split(':').slice(1).join(':').trim() : issue.issueDescription)}
                      </p>

                      {/* 3. Official Mayor's Note */}
                      <div style={{ 
                        background: 'rgba(var(--primary-rgb), 0.05)', 
                        borderLeft: '4px solid var(--primary)', 
                        padding: '1.25rem', 
                        borderRadius: '12px',
                        marginTop: '1rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <Shield size={18} color="var(--primary)" />
                          <span style={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)' }}>Official Response</span>
                        </div>
                        <p style={{ fontStyle: 'italic', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                          {issue.mayorCommands ? `"${issue.mayorCommands}"` : "Official review is currently underway. The Mayor's office will provide instructions shortly."}
                        </p>
                        {issue.assignedTo && issue.assignedTo !== 'Not Assigned' && (
                          <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CheckCircle size={14} color="#10b981" />
                            <span>Action assigned to: <strong>{issue.assignedTo}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Comments */}
              <div className="modal-right-pane" style={{ flex: '1', display: 'flex', flexDirection: 'column', position: 'relative', background: 'var(--bg-primary)' }}>
                {/* Desktop close button */}
                <button 
                  onClick={() => setIsExpanded(false)}
                  style={{
                    position: 'absolute', top: '16px', right: '16px', zIndex: 10,
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '50%',
                    width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'var(--text-primary)'
                  }}
                  className="glass-hover modal-close-btn-desktop"
                >
                  <X size={20} />
                </button>
                <style>
                  {`
                    @media (max-width: 768px) {
                      .modal-close-btn-desktop { display: none !important; }
                      .modal-close-btn.hidden { display: flex !important; }
                    }
                  `}
                </style>

                <div style={{ padding: '2rem', paddingTop: '3.5rem', flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'hidden' }}>
                  <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <MessageSquare size={20} /> Comments ({comments.length})
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                    {comments.map(comment => (
                      <div key={comment._id} style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: comment.isAnonymous ? 'var(--text-secondary)' : 'var(--primary)' }}>
                            {comment.userName}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                            {currentUser?.uid === comment.userId && (
                              <button 
                                onClick={() => handleDeleteComment(comment._id)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}
                                title="Delete Comment"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', margin: 0 }}>{comment.text}</p>
                      </div>
                    ))}
                    {comments.length === 0 && <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9rem' }}>No comments yet. Be the first to comment!</p>}
                  </div>

                  <div style={{ flexShrink: 0, marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                    {currentUser ? (
                      <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '12px' }}>
                        <input 
                          type="text" 
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..." 
                          style={{
                            flex: 1, padding: '12px 16px', borderRadius: '24px', border: '1px solid var(--glass-border)',
                            background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none'
                          }}
                        />
                        <button 
                          type="submit" 
                          disabled={isSubmittingComment || !newComment.trim()}
                          style={{
                            background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '50%',
                            width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: newComment.trim() ? 'pointer' : 'not-allowed', opacity: newComment.trim() ? 1 : 0.5
                          }}
                        >
                          <Send size={18} />
                        </button>
                      </form>
                    ) : (
                      <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '12px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Please log in to add a comment.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}
    <div 
      className="glass issue-card" 
      onClick={() => setIsExpanded(true)}
      style={{
        borderRadius: '24px',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'var(--transition-smooth)',
        border: '1px solid var(--glass-border)',
        position: 'relative',
        cursor: 'pointer'
      }}
    >
      {/* Voting Sidebar */}
      {showVotes && (
        <div style={{
          position: 'absolute',
          left: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(10px)',
          padding: '6px 3px',
          borderRadius: '30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          border: '1px solid var(--glass-border)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleVote('up');
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: userVote === 'up' ? 'var(--primary)' : 'var(--text-secondary)',
              transition: 'var(--transition-smooth)',
              padding: 0
            }}
          >
            <ArrowBigUp size={24} fill={userVote === 'up' ? 'var(--primary)' : 'none'} />
          </button>

          <span style={{ fontWeight: 800, fontSize: '0.8rem', color: issue.voteScore > 0 ? 'var(--primary)' : issue.voteScore < 0 ? 'var(--destructive)' : 'var(--text-secondary)' }}>
            {issue.voteScore > 0 ? `+${issue.voteScore}` : issue.voteScore}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleVote('down');
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: userVote === 'down' ? '#ef4444' : 'var(--text-secondary)',
              transition: 'var(--transition-smooth)',
              padding: 0
            }}
          >
            <ArrowBigDown size={24} fill={userVote === 'down' ? '#ef4444' : 'none'} />
          </button>
        </div>
      )}

      <div className="issue-card-image-content" style={{ position: 'relative', height: '160px' }}>
        <img
          src={issue.image || issue.photoUrl}
          alt={issue.title || 'City Issue'}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Category & Status Badge */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{
            padding: '4px 10px',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            fontSize: '0.65rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'inline-block',
            width: 'fit-content'
          }}>
            {issue.status}
          </div>

          <motion.div
            animate={issue.urgency === 'Critical' ? {
              scale: [1, 1.05, 1],
              boxShadow: [
                '0 0 0px rgba(239, 68, 68, 0)',
                '0 0 12px rgba(239, 68, 68, 0.5)',
                '0 0 0px rgba(239, 68, 68, 0)'
              ]
            } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              padding: '4px 10px',
              background: urgencyStyles.bg,
              color: urgencyStyles.text,
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              fontSize: '0.65rem',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              border: `1px solid ${urgencyStyles.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              width: 'fit-content',
              boxShadow: urgencyStyles.glow
            }}
          >
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: urgencyStyles.text,
              boxShadow: `0 0 6px ${urgencyStyles.text}`
            }} />
            {issue.urgency || 'Normal'}
          </motion.div>
        </div>
      </div>

      <div className="issue-card-body" style={{ padding: '1.25rem', paddingLeft: showVotes ? '3.25rem' : '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <h3 className="issue-card-title" style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)', lineHeight: 1.2 }}>
            {issue.title || (issue.issueDescription?.includes(':') ? issue.issueDescription.split(':')[0] : 'City Issue')}
          </h3>
        </div>

        <p className="issue-card-description" style={{
          color: 'var(--text-secondary)',
          fontSize: '0.85rem',
          lineHeight: '1.5',
          marginBottom: '1rem',
          display: '-webkit-box',
          WebkitLineClamp: '2',
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          flex: 1
        }}>
          {issue.description || (issue.issueDescription?.includes(':') ? issue.issueDescription.split(':').slice(1).join(':').trim() : issue.issueDescription)}
        </p>

        {issue.mayorCommands && (
          <div className="issue-card-instruction" style={{
            background: 'rgba(var(--primary-rgb), 0.05)',
            borderLeft: '3px solid var(--primary)',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            fontSize: '0.8rem'
          }}>
            <p style={{ fontWeight: 700, marginBottom: '2px', color: 'var(--primary)', fontSize: '0.65rem', textTransform: 'uppercase' }}>Mayor's Instruction</p>
            <p style={{ fontStyle: 'italic', color: 'var(--foreground)' }}>"{issue.mayorCommands}"</p>
          </div>
        )}

        <div className="issue-card-footer" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          paddingTop: '1rem',
          borderTop: '1px solid var(--glass-border)',
          fontSize: '0.75rem'
        }}>
          <div className="issue-card-reporter" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginBottom: '4px',
            color: issue.isAnonymous ? 'var(--text-secondary)' : 'var(--primary)',
            background: issue.isAnonymous ? 'rgba(148, 163, 184, 0.1)' : 'rgba(var(--primary-rgb), 0.1)',
            padding: '4px 10px',
            borderRadius: '20px',
            width: 'fit-content'
          }}>
            {issue.isAnonymous ? <UserX size={12} /> : <User size={12} />}
            <span style={{ fontWeight: 700, letterSpacing: '0.02em' }}>
              {issue.isAnonymous ? 'Anonymous Reporter' : issue.userName}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <MapPin size={14} color="var(--primary)" />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{issue.location}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <Clock size={14} />
            <span>{issue.time}</span>
          </div>
        </div>

        {issue.assignedTo && issue.assignedTo !== 'Not Assigned' && (
          <div style={{
            marginTop: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            background: 'var(--bg-secondary)',
            borderRadius: '10px',
            fontSize: '0.8125rem'
          }}>
            <Shield size={14} color="var(--primary)" />
            <span style={{ color: 'var(--text-secondary)' }}>Handled by:</span>
            <span style={{ fontWeight: 600 }}>{issue.assignedTo}</span>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default IssueCard;
