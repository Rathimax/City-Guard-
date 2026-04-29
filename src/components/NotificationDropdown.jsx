import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Info, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

const NotificationDropdown = ({ isOpen, onClose, onOpenInsights }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchIssues();
    }
  }, [isOpen]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://city-guard-backend.onrender.com/api/issues');
      if (response.ok) {
        const data = await response.json();
        
        // Sort by createdAt descending and take top 5 recent issues
        const recentIssues = data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        
        const formattedNotifications = recentIssues.map(issue => {
          let icon = <Info size={16} color="var(--primary)" />;
          let type = "info";
          
          if (issue.status === 'Resolved') {
            icon = <CheckCircle2 size={16} color="#10b981" />;
            type = "resolved";
          } else if (issue.severity === 'High') {
            icon = <AlertTriangle size={16} color="#ef4444" />;
            type = "alert";
          } else {
            icon = <Clock size={16} color="#f59e0b" />;
            type = "pending";
          }

          // Calculate time ago
          const now = new Date();
          const issueDate = new Date(issue.createdAt);
          const diffInHours = Math.abs(now - issueDate) / 36e5;
          let timeString = '';
          if (diffInHours < 1) {
            const mins = Math.max(1, Math.floor(diffInHours * 60));
            timeString = `${mins} mins ago`;
          } else if (diffInHours < 24) {
            timeString = `${Math.floor(diffInHours)} hours ago`;
          } else {
            timeString = `${Math.floor(diffInHours / 24)} days ago`;
          }

          const desc = issue.issueDescription || "New Report";
          const shortDesc = desc.length > 50 ? desc.substring(0, 50) + '...' : desc;
          const statusStr = issue.status || 'Pending';

          return {
            id: issue._id,
            title: `Report Update`,
            message: `${shortDesc} - Status: ${statusStr}`,
            time: timeString,
            type,
            icon,
            unread: true
          };
        });
        
        setNotifications(formattedNotifications);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="glass"
      style={{
        position: 'absolute',
        top: '100%',
        right: '0',
        marginTop: '0.75rem',
        width: '320px',
        maxHeight: '400px',
        overflowY: 'auto',
        zIndex: 1000,
        padding: '1rem',
        background: 'var(--bg-primary)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--glass-shadow)',
        color: 'var(--foreground)'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Notifications</h3>
        <button
          style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
          onClick={onClose}
        >
          Mark all as read
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="loader" style={{ width: '24px', height: '24px', margin: '0 auto' }}></div>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n.id}
              className="glass-hover"
              style={{
                padding: '0.75rem',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                gap: '0.75rem',
                background: n.unread ? 'rgba(var(--primary-rgb), 0.05)' : 'none',
                position: 'relative'
              }}
            >
              <div style={{
                minWidth: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {n.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600 }}>{n.title}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{n.time}</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: '1.4' }}>
                  {n.message}
                </p>
              </div>
              {n.unread && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--primary)'
                }} />
              )}
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            <Bell size={32} style={{ opacity: 0.2, marginBottom: '0.5rem' }} />
            <p style={{ fontSize: '0.875rem' }}>No new notifications</p>
          </div>
        )}
      </div>

      <button
        onClick={onOpenInsights}
        style={{
          width: '100%',
          marginTop: '1rem',
          padding: '0.5rem',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          background: 'none',
          color: 'var(--text-secondary)',
          fontSize: '0.75rem',
          fontWeight: 600,
          cursor: 'pointer'
        }}
        className="glass-hover"
      >
        View all history
      </button>
    </motion.div>
  );
};

export default NotificationDropdown;
