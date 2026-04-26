import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, CheckCircle, Users, Activity, ArrowRight, Loader2 } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div style={{
    padding: '1.25rem',
    background: 'var(--bg-secondary)',
    borderRadius: '12px',
    border: '1px solid var(--glass-border)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ 
        padding: '0.5rem', 
        borderRadius: '8px', 
        background: `rgba(${color}, 0.1)`, 
        color: `rgb(${color})` 
      }}>
        <Icon size={18} />
      </div>
      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
    </div>
    <span style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{value}</span>
  </div>
);

const ActivityItem = ({ title, time, type }) => {
  const getIcon = () => {
    switch (type) {
      case 'report': return <Activity size={14} />;
      case 'resolve': return <CheckCircle size={14} />;
      default: return <ArrowRight size={14} />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'report': return 'var(--primary)';
      case 'resolve': return 'var(--success)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        gap: '1rem',
        padding: '0.75rem 0',
        borderBottom: '1px solid var(--glass-border)'
      }}
    >
      <div style={{
        marginTop: '0.25rem',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-secondary)',
        color: getColor(),
        flexShrink: 0
      }}>
        {getIcon()}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.4 }}>{title}</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{time}</p>
      </div>
    </motion.div>
  );
};

const LiveInsights = () => {
  const [stats, setStats] = useState({
    active: 0,
    resolved: 0,
    contributors: 0,
    efficiency: '0%'
  });
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRealData = async () => {
    try {
      const response = await fetch('https://city-guard-backend.onrender.com/api/issues');
      if (response.ok) {
        const data = await response.json();
        
        // Calculate Stats
        const active = data.filter(i => i.status !== 'resolved').length;
        const resolved = data.filter(i => i.status === 'resolved').length;
        const contributors = new Set(data.map(i => i.userId || i.userName)).size;
        const efficiency = data.length > 0 
          ? `${Math.round((resolved / data.length) * 100)}%` 
          : '0%';

        setStats({ active, resolved, contributors, efficiency });

        // Format Activities (Top 4 most recent)
        const recentIssues = [...data]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 4)
          .map(issue => {
            const isResolved = issue.status === 'resolved';
            const desc = issue.issueDescription || '';
            const title = desc.includes(': ') ? desc.split(': ')[0] : desc || 'Urban Issue';
            
            return {
              title: isResolved ? `Resolved: ${title}` : `New Report: ${title}`,
              time: formatTimeAgo(issue.createdAt),
              type: isResolved ? 'resolve' : 'report'
            };
          });
        
        setActivities(recentIssues);
      }
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const then = new Date(dateString);
    const diffInSeconds = Math.floor((now - then) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return then.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  useEffect(() => {
    fetchRealData();
    const interval = setInterval(fetchRealData, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="liquid-glass" 
      style={{
        padding: '2rem',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        minHeight: '500px'
      }}
    >
      <div>
        <h3 style={{ 
          fontSize: '1.25rem', 
          fontFamily: 'var(--font-heading)', 
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <TrendingUp size={24} color="var(--primary)" />
          City Impact Today
        </h3>
        
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <Loader2 className="animate-spin" size={32} color="var(--primary)" />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <StatCard icon={Activity} label="Active" value={stats.active} color="255, 192, 203" />
            <StatCard icon={CheckCircle} label="Resolved" value={stats.resolved} color="34, 197, 94" />
            <StatCard icon={Users} label="Contributors" value={stats.contributors} color="135, 206, 235" />
            <StatCard icon={TrendingUp} label="Resolution" value={stats.efficiency} color="255, 255, 0" />
          </div>
        )}
      </div>

      <div style={{ flex: 1 }}>
        <h3 style={{ 
          fontSize: '1.125rem', 
          fontFamily: 'var(--font-heading)', 
          marginBottom: '1rem',
          color: 'var(--text-primary)'
        }}>
          Live Activity
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <AnimatePresence mode="popLayout">
            {isLoading ? (
               <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <Loader2 className="animate-spin" size={24} color="var(--primary)" />
              </div>
            ) : activities.length > 0 ? (
              activities.map((activity, index) => (
                <ActivityItem key={`${index}-${activity.title}`} {...activity} />
              ))
            ) : (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>No recent activity</p>
            )}
          </AnimatePresence>
        </div>
        
        <button style={{
          marginTop: '1.5rem',
          width: '100%',
          padding: '0.75rem',
          background: 'transparent',
          border: '1px dashed var(--glass-border)',
          borderRadius: '10px',
          color: 'var(--text-secondary)',
          fontSize: '0.875rem',
          cursor: 'pointer',
          transition: 'var(--transition-smooth)'
        }} className="glass-hover">
          View All Community Insights
        </button>
      </div>
    </motion.div>
  );
};

export default LiveInsights;
