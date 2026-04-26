import React, { useEffect, useState } from 'react';
import IssueCard from './IssueCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronDown } from 'lucide-react';

const IssueFeed = () => {
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllActive, setShowAllActive] = useState(false);
  const [showAllResolved, setShowAllResolved] = useState(false);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/issues');
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
              voters: issue.voters || [],
              urgency: issue.urgency || 'Normal',
              isAnonymous: issue.isAnonymous || false,
              userName: issue.userName || 'Anonymous citizen',
              location: issue.location?.coordinates?.length >= 2
                ? `${issue.location.coordinates[1].toFixed(4)}, ${issue.location.coordinates[0].toFixed(4)}`
                : 'Location Pending',
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
          voters: updatedIssue.voters
        }
        : issue
    ));
  };

  const renderGrid = (title, description, issueList, isExpanded, setIsExpanded, showVotes = true) => {
    const displayedIssues = isExpanded ? issueList : issueList.slice(0, 3);
    const hasMore = issueList.length > 3;

    return (
      <div style={{ marginBottom: '4rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', color: 'var(--foreground)' }}>{title}</h3>
          <p style={{ color: 'var(--text-secondary)' }}>{description}</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '2rem'
        }}>
          <AnimatePresence mode="popLayout">
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
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
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
          <h2 style={{ fontSize: '3rem', fontFamily: 'var(--font-heading)', marginBottom: '0.5rem' }}>Community Board</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Prioritizing city issues through crowdsourced community feedback.</p>
        </div>
        {isLoading && <Loader2 className="animate-spin" size={24} color="var(--primary)" />}
      </div>

      {isLoading && issues.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
          <Loader2 className="animate-spin" size={64} color="var(--primary)" />
        </div>
      ) : (
        <>
          {renderGrid("Active Reports", "Ongoing and pending issues sorted by community priority.", activeIssues, showAllActive, setShowAllActive)}
          {renderGrid("Resolved Cases", "Successfully addressed city problems from the archive.", resolvedIssues, showAllResolved, setShowAllResolved, false)}
        </>
      )}
    </section>
  );
};

export default IssueFeed;
