import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Info, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

const mockNotifications = [
  {
    id: 1,
    title: "Pothole Update",
    message: "Report #1042 on MG Road has been marked as 'Under Repair'.",
    time: "2 mins ago",
    type: "update",
    icon: <Clock size={16} color="var(--primary)" />,
    unread: true
  },
  {
    id: 2,
    title: "Major Infrastructure Alert",
    message: "Scheduled water maintenance in Zone 4 this Sunday.",
    time: "1 hour ago",
    type: "alert",
    icon: <AlertTriangle size={16} color="#ef4444" />,
    unread: true
  },
  {
    id: 3,
    title: "Thank You!",
    message: "Your report for 'Broken Street Light' helped the city team.",
    time: "5 hours ago",
    type: "info",
    icon: <CheckCircle2 size={16} color="#10b981" />,
    unread: false
  }
];

const NotificationDropdown = ({ isOpen, onClose }) => {
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
        {mockNotifications.length > 0 ? (
          mockNotifications.map((n) => (
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
      >
        View all history
      </button>
    </motion.div>
  );
};

export default NotificationDropdown;
