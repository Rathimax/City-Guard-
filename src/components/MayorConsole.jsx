import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Search,
  Filter,
  MessageSquare,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Send,
  ChevronRight,
  Loader2,
  User,
  UserX,
  Wrench,
  Trash2,
  Droplets,
  Car,
  Zap,
  Home,
  Truck,
  LayoutGrid,
  Check,
  Activity,
  ChevronDown,
  ChevronUp,
  Lock,
  Unlock,
  AlertTriangle
} from 'lucide-react';
import './MayorConsole.css';

const COUNCILS = [
  { value: 'Public Works Dept', label: 'Public Works Dept', icon: Wrench },
  { value: 'Sanitation Board', label: 'Sanitation Board', icon: Trash2 },
  { value: 'Water Authority', label: 'Water Authority', icon: Droplets },
  { value: 'Traffic Police', label: 'Traffic Police', icon: Car },
  { value: 'Electrical Board', label: 'Electrical Board', icon: Zap },
  { value: 'Housing Authority', label: 'Housing Authority', icon: Home },
  { value: 'Parks & Rec', label: 'Parks & Rec', icon: Activity },
  { value: 'Transit Dept', label: 'Transit Dept', icon: Truck },
];

const MayorConsole = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isCouncilOpen, setIsCouncilOpen] = useState(false);
  const [isResolvedExpanded, setIsResolvedExpanded] = useState(false);
  const [isModifyingResolved, setIsModifyingResolved] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Filter issues
  const activeIssues = issues.filter(i => i.status !== 'Resolved');
  const resolvedIssues = issues.filter(i => i.status === 'Resolved');

  // Form State for updates
  const [status, setStatus] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [mayorCommands, setMayorCommands] = useState('');

  const fetchIssues = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/issues');
      if (response.ok) {
        const data = await response.json();
        setIssues(data);
      }
    } catch (err) {
      console.error('Failed to fetch issues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleSelectIssue = (issue) => {
    setSelectedIssue(issue);
    setStatus(issue.status);
    setAssignedTo(issue.assignedTo || 'Not Assigned');
    setMayorCommands(issue.mayorCommands || '');
    setIsModifyingResolved(false);
  };

  const handleUpdateIssue = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/api/issues/${selectedIssue._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          assignedTo,
          mayorCommands
        })
      });

      if (response.ok) {
        await fetchIssues();
        setSelectedIssue(null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update issue.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const getStatusColor = (s) => {
    switch (s) {
      case 'Resolved': return 'var(--success, #10b981)';
      case 'In Progress': return 'var(--secondary, #87ceeb)';
      default: return 'var(--warning, #ffff00)';
    }
  };

  const getUrgencyStyles = (level) => {
    switch (level) {
      case 'Critical': return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: <AlertCircle size={14} /> };
      case 'Urgent': return { color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)', icon: <AlertCircle size={14} /> };
      default: return { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', icon: <Clock size={14} /> };
    }
  };

  return (
    <div className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ background: 'var(--primary)', padding: '10px', borderRadius: '12px' }}>
            <Shield size={32} color="var(--primary-foreground)" />
          </div>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)' }}>Mayor's Command Console</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Strategic oversight and resource allocation for urban infrastructure.</p>
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem', alignItems: 'start' }}>
        {/* Left Side: Issue List */}
        <div className="glass" style={{ padding: '1.5rem', minHeight: '600px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Live Reports ({issues.length})</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                <input type="text" placeholder="Search report ID..." style={{
                  padding: '8px 10px 8px 32px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-secondary)',
                  fontSize: '0.875rem'
                }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem' }}><Loader2 className="animate-spin" size={32} color="var(--primary)" /></div>
            ) : (
              <>
                {/* Active Issues */}
                {activeIssues.map((issue, index) => (
                  <div
                    key={issue._id}
                    onClick={() => handleSelectIssue(issue)}
                    style={{
                      padding: '1.25rem',
                      borderRadius: '16px',
                      background: selectedIssue?._id === issue._id ? 'var(--bg-secondary)' : 'var(--card)',
                      border: `1px solid ${selectedIssue?._id === issue._id ? 'var(--primary)' : 'var(--border)'}`,
                      cursor: 'pointer',
                      transition: 'var(--transition-smooth)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      boxShadow: selectedIssue?._id === issue._id ? '0 8px 16px rgba(0,0,0,0.1)' : 'none'
                    }}
                    className="glass-hover"
                  >
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{
                        minWidth: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'var(--bg-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border)'
                      }}>
                        {(index + 1).toString().padStart(2, '0')}
                      </div>
                      <img src={issue.photoUrl} alt="Report" style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover' }} />
                      <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>
                          {issue.issueDescription?.includes(':') ? issue.issueDescription.split(':')[0] : (issue.title || 'Issue Report')}
                        </h4>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {new Date(issue.createdAt).toLocaleDateString()}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> View Map</span>
                        </div>
                        <div style={{
                          marginTop: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: getUrgencyStyles(issue.urgency || 'Normal').color,
                          background: getUrgencyStyles(issue.urgency || 'Normal').bg,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          width: 'fit-content',
                          textTransform: 'uppercase'
                        }}>
                          {getUrgencyStyles(issue.urgency || 'Normal').icon}
                          {issue.urgency || 'Normal'}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: getStatusColor(issue.status),
                        background: `${getStatusColor(issue.status)}20`,
                        padding: '4px 10px',
                        borderRadius: '20px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '6px',
                        display: 'inline-block'
                      }}>{issue.status}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{issue.assignedTo}</div>
                    </div>
                  </div>
                ))}

                {/* Resolved Issues Collapsible */}
                {resolvedIssues.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <button
                      onClick={() => setIsResolvedExpanded(!isResolvedExpanded)}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <CheckCircle size={18} color="var(--success)" />
                        <span style={{ fontWeight: 600 }}>Resolved Archives ({resolvedIssues.length})</span>
                      </div>
                      {isResolvedExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>

                    <AnimatePresence>
                      {isResolvedExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
                            {resolvedIssues.map((issue, index) => (
                              <div
                                key={issue._id}
                                onClick={() => handleSelectIssue(issue)}
                                style={{
                                  padding: '1rem',
                                  borderRadius: '12px',
                                  background: selectedIssue?._id === issue._id ? 'var(--bg-secondary)' : 'var(--card)',
                                  border: `1px solid ${selectedIssue?._id === issue._id ? 'var(--primary)' : 'var(--border)'}`,
                                  cursor: 'pointer',
                                  opacity: 0.8,
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}
                              >
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                  <img src={issue.photoUrl} alt="Report" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                                  <div>
                                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{issue.issueDescription?.includes(':') ? issue.issueDescription.split(':')[0] : (issue.title || 'Issue Report')}</h4>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Resolved on {new Date(issue.createdAt).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                <div style={{
                                  fontSize: '0.65rem',
                                  fontWeight: 800,
                                  color: 'var(--success)',
                                  background: 'rgba(16, 185, 129, 0.1)',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  textTransform: 'uppercase'
                                }}>Archive</div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Side: Command Panel */}
        <AnimatePresence mode="wait">
          {selectedIssue ? (
            <motion.div
              key="panel"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="command-panel"
            >
              <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <MessageSquare size={24} color="var(--primary)" />
                Direct Order: Case #{(issues.findIndex(i => i._id === selectedIssue._id) + 1).toString().padStart(2, '0')}
              </h2>
 
              <div className="report-details-box">
                <p className="field-label" style={{ opacity: 0.7, marginBottom: '0.8rem' }}>Report Details</p>
                <div className="report-tag-row">
                  <div className="urgency-tag" style={{ 
                    color: getUrgencyStyles(selectedIssue.urgency || 'Normal').color,
                    background: getUrgencyStyles(selectedIssue.urgency || 'Normal').bg,
                    border: `1px solid ${getUrgencyStyles(selectedIssue.urgency || 'Normal').color}40`
                  }}>
                    {getUrgencyStyles(selectedIssue.urgency || 'Normal').icon}
                    {selectedIssue.urgency || 'Normal'}
                  </div>
                  
                  {selectedIssue.isAnonymous && (
                    <div className="confidential-tag">
                      <Shield size={12} />
                      Confidential
                    </div>
                  )}
                </div>
                <p style={{ fontWeight: 500, lineHeight: 1.6, fontSize: '1.05rem' }}>{selectedIssue.issueDescription}</p>
                <div className="report-meta">
                  {selectedIssue.isAnonymous ? <UserX size={14} /> : <User size={14} />}
                  <span>Reported by: <strong>{selectedIssue.userName}</strong></span>
                  {selectedIssue.isAnonymous && <span style={{ fontSize: '0.7rem', fontStyle: 'italic' }}>(Identity hidden)</span>}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {selectedIssue.status === 'Resolved' && !isModifyingResolved ? (
                  <motion.div
                    key="security-wall"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="security-wall"
                  >
                    <div className="security-icon-outer">
                      <Lock size={28} color="white" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', fontWeight: 700 }}>Case Resolved & Locked</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '320px', lineHeight: 1.5 }}>
                        This report has been officially closed and archived. Executive override is required for modifications.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsModifyingResolved(true)}
                      className="btn btn-secondary glass-hover"
                      style={{
                        marginTop: '0.5rem',
                        fontSize: '0.9rem',
                        padding: '0.8rem 1.5rem',
                        borderRadius: '12px'
                      }}
                    >
                      <Unlock size={18} />
                      Executive Override
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="command-form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={handleUpdateIssue}
                    className="console-field-group"
                  >
                    {isModifyingResolved && (
                      <div className="override-warning">
                        <AlertTriangle size={18} />
                        <span><strong>Caution:</strong> You are performing an executive override on a closed case.</span>
                      </div>
                    )}
                    <div style={{ position: 'relative' }}>
                      <label className="field-label">Change Status</label>
                      <div
                        className="input-field"
                        onClick={() => setIsStatusOpen(!isStatusOpen)}
                        style={{
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: 'var(--bg-secondary)',
                          userSelect: 'none'
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getStatusColor(status) }}></div>
                          {status || 'Select Status'}
                        </span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isStatusOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </div>

                      {isStatusOpen && (
                        <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setIsStatusOpen(false)} />
                      )}

                      <AnimatePresence>
                        {isStatusOpen && (
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
                            {['Pending', 'In Progress', 'Resolved'].map((opt) => (
                              <div
                                key={opt}
                                onClick={() => {
                                  setStatus(opt);
                                  setIsStatusOpen(false);
                                }}
                                className="glass-hover"
                                style={{
                                  padding: '0.75rem 1rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  background: status === opt ? 'var(--bg-secondary)' : 'transparent',
                                  color: status === opt ? 'var(--text-primary)' : 'var(--text-secondary)'
                                }}
                              >
                                {status === opt && <CheckCircle size={16} color="var(--primary)" />}
                                <span style={{ marginLeft: status === opt ? '0' : '24px' }}>{opt}</span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div style={{ position: 'relative' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Assign Council/Dept</label>
                      <div
                        className="input-field"
                        onClick={() => setIsCouncilOpen(!isCouncilOpen)}
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
                            const selected = COUNCILS.find(c => c.value === assignedTo);
                            const Icon = selected ? selected.icon : LayoutGrid;
                            return (
                              <>
                                <Icon size={18} color="var(--text-secondary)" />
                                <span>{selected ? selected.label : (assignedTo === 'Not Assigned' ? 'Select Council' : assignedTo || 'Select Council')}</span>
                              </>
                            );
                          })()}
                        </div>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isCouncilOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: 'var(--text-secondary)' }}>
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </div>

                      {isCouncilOpen && (
                        <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setIsCouncilOpen(false)} />
                      )}

                      <AnimatePresence>
                        {isCouncilOpen && (
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
                            {[{ value: 'Not Assigned', label: 'Select Council', icon: LayoutGrid }, ...COUNCILS].map((opt) => {
                              const Icon = opt.icon;
                              const isSelected = assignedTo === opt.value || (!assignedTo && opt.value === 'Not Assigned');
                              return (
                              <div
                                key={opt.value}
                                onClick={() => {
                                  setAssignedTo(opt.value);
                                  setIsCouncilOpen(false);
                                }}
                                className="glass-hover"
                                style={{
                                  padding: '0.75rem 1rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.75rem',
                                  background: isSelected ? 'var(--bg-secondary)' : 'transparent',
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
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Mayor's Command</label>
                      <textarea
                        className="input-field"
                        placeholder="Provide specific instructions for the council..."
                        rows="4"
                        value={mayorCommands}
                        onChange={(e) => setMayorCommands(e.target.value)}
                        style={{ resize: 'none' }}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary dispatch-btn"
                      disabled={updateLoading}
                    >
                      {updateLoading ? <Loader2 className="animate-spin" size={22} /> : <Send size={22} />}
                      {isModifyingResolved ? 'Confirm Override' : 'Dispatch Command'}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass"
              style={{
                height: '400px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.6,
                textAlign: 'center',
                padding: '2rem'
              }}
            >
              <AlertCircle size={48} style={{ marginBottom: '1rem' }} />
              <h3>No Case Selected</h3>
              <p>Select a report from the list to issue commands or assign councils.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <div className="modal-overlay">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-backdrop"
              onClick={() => setShowSuccess(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="success-popup"
            >
              <div className="success-icon-wrapper">
                <CheckCircle size={40} color="white" />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Update Successful</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                The command has been dispatched and the case status has been updated in the central database.
              </p>
              <button 
                onClick={() => setShowSuccess(false)}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem' }}
              >
                Continue Overview
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MayorConsole;
