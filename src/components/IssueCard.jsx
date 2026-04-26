import React, { useState } from 'react';
import { MapPin, Clock, CheckCircle, AlertTriangle, Timer, Shield, ArrowBigUp, ArrowBigDown, Lock, User, UserX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const IssueCard = ({ issue, onVoteUpdate, showVotes = true }) => {
  const { currentUser } = useAuth();
  const [isVoting, setIsVoting] = useState(false);

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
  const getUrgencyStyles = (level) => {
    switch (level) {
      case 'Critical': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)', glow: '0 0 15px rgba(239, 68, 68, 0.2)' };
      case 'Urgent': return { bg: 'rgba(249, 115, 22, 0.15)', text: '#f97316', border: 'rgba(249, 115, 22, 0.3)', glow: 'none' };
      default: return { bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)', glow: 'none' };
    }
  };

  const urgencyStyles = getUrgencyStyles(issue.urgency || 'Normal');

  return (
    <div className="glass issue-card" style={{
      borderRadius: '24px',
      overflow: 'hidden',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'var(--transition-smooth)',
      border: '1px solid var(--glass-border)',
      position: 'relative'
    }}>
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
            onClick={() => handleVote('up')}
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
            onClick={() => handleVote('down')}
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
  );
};

export default IssueCard;
