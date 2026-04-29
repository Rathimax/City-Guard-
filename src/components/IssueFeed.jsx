import React, { useEffect, useState } from 'react';
import IssueCard from './IssueCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronDown } from 'lucide-react';

const IssueFeed = () => {
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllActive, setShowAllActive] = useState(false);
  const [showAllResolved, setShowAllResolved] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await fetch('https://city-guard-backend.onrender.com/api/issues');
        if (response.ok) {
          const data = await response.json();
          const transformedIssues = data.map(issue => {
            const desc = issue.issueDescription || '';
            const parts = desc.includes(': ') ? desc.split(': ') : [desc];
            const title = parts[0] || 'Reported Issue';
            const description = parts.slice(1).join(': ') || desc;

            return {
              id: issue._id,
              title: title,
              description: description,
              issueDescription: issue.issueDescription, // Pass original for components relying on it
              image: issue.photoUrl,
              status: (issue.status || 'pending').toLowerCase(),
              assignedTo: issue.assignedTo,
              mayorCommands: issue.mayorCommands,
              voteScore: issue.voteScore || 0,
              upvotes: issue.upvotes || 0,
              downvotes: issue.downvotes || 0,
              voters: issue.voters || [],
              urgency: issue.urgency || 'Normal',
              isAnonymous: issue.isAnonymous || false,
              userName: issue.userName || 'Anonymous citizen',
              location: issue.location?.coordinates?.length >= 2
                ? `${issue.location.coordinates[1].toFixed(4)}, ${issue.location.coordinates[0].toFixed(4)}`
                : 'Location Pending',
              comments: issue.comments || [],
              time: issue.createdAt
                ? new Date(issue.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
                : 'Recently'
            };
          });
          setIssues(transformedIssues);
        }
      } catch (error) {
        console.error('Failed to fetch issues:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIssues();
    const interval = setInterval(fetchIssues, 30000);
    return () => clearInterval(interval);
  }, []);

  const activeIssues = issues.filter(i => i.status !== 'resolved');
  const resolvedIssues = issues.filter(i => i.status === 'resolved');

  const onVoteUpdate = (updatedIssue) => {
    setIssues(prev => prev.map(issue =>
      issue.id === updatedIssue._id
        ? {
          ...issue,
          voteScore: updatedIssue.voteScore,
          upvotes: updatedIssue.upvotes,
          downvotes: updatedIssue.downvotes,
          voters: updatedIssue.voters
        }
        : issue
    ));
  };

  const renderGrid = (title, description, issueList, isExpanded, setIsExpanded, showVotes = true) => {
    const displayedIssues = isExpanded ? issueList : issueList.slice(0, 3);
    const hasMore = issueList.length > 3;

    return (
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 className="grid-title" style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', color: 'var(--foreground)' }}>{title}</h3>
          <p className="grid-subtitle" style={{ color: 'var(--text-secondary)' }}>{description}</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '2rem'
        }}>
          <AnimatePresence initial={false} mode="popLayout">
            {displayedIssues.map((issue, index) => (
              <motion.div
                key={issue.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <IssueCard issue={issue} onVoteUpdate={onVoteUpdate} showVotes={showVotes} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {hasMore && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '1rem',
                opacity: 0.7,
                transition: 'opacity 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
            >
              <span>{isExpanded ? 'Show Less' : `View All ${issueList.length} Cases`}</span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '4px'
                }}
              >
                <ChevronDown size={28} strokeWidth={3} />
              </motion.div>
            </motion.button>
          </div>
        )}

        {issueList.length === 0 && !isLoading && (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-secondary)', borderRadius: '24px', opacity: 0.5 }}>
            <p>No reports in this category yet.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="container" id="community-feed" style={{ paddingTop: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
        <div>
          <h2 className="feed-title" style={{ fontSize: '3rem', fontFamily: 'var(--font-heading)', marginBottom: '0.5rem' }}>Community Board</h2>
          <p className="feed-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Prioritizing city issues through crowdsourced community feedback.</p>
        </div>
        {isLoading && <Loader2 className="animate-spin" size={24} color="var(--primary)" />}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.03)', 
          backdropFilter: 'blur(10px)',
          padding: '6px', 
          borderRadius: '16px', 
          border: '1px solid var(--glass-border)',
          display: 'flex',
          gap: '4px'
        }}>
          {[
            { id: 'active', label: 'Active Reports', count: activeIssues.length },
            { id: 'resolved', label: 'Resolved Cases', count: resolvedIssues.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 24px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === tab.id ? '#f9f9f9' : 'transparent',
                color: activeTab === tab.id ? '#000000' : 'var(--text-secondary)',
                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: 600,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {tab.label}
              <span style={{ 
                fontSize: '0.75rem', 
                opacity: activeTab === tab.id ? 0.8 : 0.6, 
                background: activeTab === tab.id ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.05)',
                color: activeTab === tab.id ? '#000000' : 'inherit',
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {isLoading && issues.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
          <Loader2 className="animate-spin" size={64} color="var(--primary)" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'active' 
              ? renderGrid("Active Reports", "Ongoing and pending issues sorted by community priority.", activeIssues, showAllActive, setShowAllActive)
              : renderGrid("Resolved Cases", "Successfully addressed city problems from the archive.", resolvedIssues, showAllResolved, setShowAllResolved, false)
            }
          </motion.div>
        </AnimatePresence>
      )}
    </section>
  );
};

export default IssueFeed;
