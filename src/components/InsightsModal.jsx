import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  PieChart,
  LayoutGrid
} from 'lucide-react';

const InsightsModal = ({ isOpen, onClose }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    topDepartments: []
  });

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
        setIssues(data);
        calculateStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch issues for insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const pending = data.filter(i => i.status === 'Pending').length;
    const inProgress = data.filter(i => i.status === 'In Progress').length;
    const resolved = data.filter(i => i.status === 'Resolved').length;

    // Calculate top departments
    const deptCount = {};
    data.forEach(i => {
      const dept = i.assignedTo || 'Unassigned';
      if (dept !== 'Not Assigned') {
        deptCount[dept] = (deptCount[dept] || 0) + 1;
      }
    });

    const topDepartments = Object.entries(deptCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([name, count]) => ({ name, count }));

    setStats({ total, pending, inProgress, resolved, topDepartments });
  };

  const MetricCard = ({ icon: Icon, label, value, color, delay }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass"
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        border: `1px solid var(--border)`,
        background: 'rgba(var(--bg-secondary-rgb), 0.5)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{
          background: `${color}20`,
          padding: '8px',
          borderRadius: '10px',
          color: color
        }}>
          <Icon size={20} />
        </div>
        <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{value}</span>
      </div>
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{label}</span>
      <div style={{
        width: '100%',
        height: '4px',
        background: 'var(--border)',
        borderRadius: '2px',
        marginTop: '0.75rem',
        overflow: 'hidden'
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(value / (stats.total || 1)) * 100}%` }}
          style={{ height: '100%', background: color }}
        />
      </div>
    </motion.div>
  );

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
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="glass"
            style={{
              width: '100%',
              maxWidth: '850px',
              maxHeight: '90vh',
              background: 'var(--bg-primary)',
              padding: '2rem',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem',
              overflowY: 'auto',
              border: '1px solid var(--primary)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  background: 'var(--primary)',
                  padding: '10px',
                  borderRadius: '12px'
                }}>
                  <BarChart3 size={24} color="var(--primary-foreground)" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>City Insights Dashboard</h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Analytical overview of reported infrastructure issues</p>
                </div>
              </div>

              <button
                onClick={onClose}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  transition: 'background 0.2s'
                }}
                className="glass-hover"
              >
                <X size={20} />
              </button>
            </div>

            {loading ? (
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loader"></div>
              </div>
            ) : (
              <>
                {/* Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
                  <MetricCard
                    icon={TrendingUp}
                    label="Total Reports"
                    value={stats.total}
                    color="var(--primary)"
                    delay={0.1}
                  />
                  <MetricCard
                    icon={Clock}
                    label="Pending Review"
                    value={stats.pending}
                    color="#f59e0b"
                    delay={0.2}
                  />
                  <MetricCard
                    icon={AlertCircle}
                    label="In Progress"
                    value={stats.inProgress}
                    color="#0ea5e9"
                    delay={0.3}
                  />
                  <MetricCard
                    icon={CheckCircle2}
                    label="Resolved Cases"
                    value={stats.resolved}
                    color="#10b981"
                    delay={0.4}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem' }}>
                  {/* Departments */}
                  <div className="glass" style={{ padding: '1.5rem', background: 'rgba(var(--bg-secondary-rgb), 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      <Users size={20} color="var(--primary)" />
                      <h3 style={{ fontSize: '1.1rem' }}>Top Departments</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {stats.topDepartments.length > 0 ? stats.topDepartments.map((dept, i) => (
                        <div key={dept.name} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                            <span>{dept.name}</span>
                            <span style={{ fontWeight: 600 }}>{dept.count}</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '3px' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(dept.count / stats.topDepartments[0].count) * 100}%` }}
                              style={{ height: '100%', background: 'var(--primary)', borderRadius: '3px', opacity: 0.8 - (i * 0.15) }}
                            />
                          </div>
                        </div>
                      )) : (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>
                          No departmental data available yet.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Category Breakdown Placeholder (using random variation since we don't have explicit categories in model yet, or we use descriptions) */}
                  <div className="glass" style={{ padding: '1.5rem', background: 'rgba(var(--bg-secondary-rgb), 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      <PieChart size={20} color="var(--primary)" />
                      <h3 style={{ fontSize: '1.1rem' }}>Resolution Rate</h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '150px', position: 'relative' }}>
                      <svg width="150" height="150" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--border)" strokeWidth="10" />
                        <motion.circle
                          cx="50" cy="50" r="40" fill="transparent"
                          stroke="var(--primary)" strokeWidth="10"
                          strokeDasharray="251.2"
                          initial={{ strokeDashoffset: 251.2 }}
                          animate={{ strokeDashoffset: 251.2 - (251.2 * (stats.resolved / (stats.total || 1))) }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div style={{ position: 'absolute', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                          {Math.round((stats.resolved / (stats.total || 1)) * 100)}%
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Solved</div>
                      </div>
                    </div>

                    <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Completion</div>
                        <div style={{ fontWeight: 600 }}>{stats.resolved}/{stats.total}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Status</div>
                        <div style={{ fontWeight: 600, color: 'var(--primary)' }}>Scaling Up</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footnote */}
                <div style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  background: 'rgba(var(--primary-rgb), 0.05)',
                  border: '1px dashed var(--primary)',
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'center'
                }}>
                  <LayoutGrid size={18} color="var(--primary)" />
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Data is aggregated from all live reports across the CityGuard network. Metrics are updated every time the dashboard is accessed.
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InsightsModal;
