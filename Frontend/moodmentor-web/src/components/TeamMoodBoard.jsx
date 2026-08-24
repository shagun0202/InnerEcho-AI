import React, { useEffect, useState } from 'react';
import { request } from '../api';

const MOODS = [
  { id: 'great', emoji: '🤩', label: 'Great', color: '#10b981' },
  { id: 'good', emoji: '😊', label: 'Good', color: '#6956e8' },
  { id: 'okay', emoji: '😐', label: 'Okay', color: '#efaa42' },
  { id: 'rough', emoji: '😔', label: 'Rough', color: '#e56467' },
  { id: 'struggling', emoji: '😰', label: 'Struggling', color: '#856ee2' },
];

export default function TeamMoodBoard({ token }) {
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    fetchSummary();
  }, [token]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const data = await request('/team/mood/summary', { token });
      setSummary(data);
      if (data?.submitted_today) {
        setHasSubmittedToday(true);
      }
    } catch (error) {
      console.error('Error fetching mood summary', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMood) return;
    setSubmitting(true);
    try {
      await request('/team/mood', { method: 'POST', token, body: { mood: selectedMood, note } });
      setHasSubmittedToday(true);
      fetchSummary();
    } catch (error) {
      console.error('Error submitting mood', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="team-mood-page">Loading...</div>;
  }

  const renderSubmitSection = () => {
    if (hasSubmittedToday) {
      return (
        <div className="submitted-card">
          <h3>Thank you!</h3>
          <p>Your mood has been recorded for today.</p>
        </div>
      );
    }
    return (
      <div className="mood-submit">
        <h3>How are you feeling today?</h3>
        <div className="mood-emoji-row">
          {MOODS.map(m => (
            <button
              key={m.id}
              className={`mood-emoji-btn ${selectedMood === m.id ? 'selected' : ''}`}
              style={{ borderColor: selectedMood === m.id ? m.color : 'transparent' }}
              onClick={() => setSelectedMood(m.id)}
            >
              <span style={{ fontSize: '2rem' }}>{m.emoji}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
        <textarea
          className="mood-note-input"
          placeholder="Optional note (anonymous)..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button onClick={handleSubmit} disabled={!selectedMood || submitting}>
          Submit Mood
        </button>
      </div>
    );
  };

  return (
    <div className="team-mood-page">
      {renderSubmitSection()}
      {summary && (
        <div className="mood-summary">
          <h3>Team Mood Summary</h3>
          <div className="sentiment-badge" style={{
            backgroundColor: summary.average_sentiment === 'positive' ? 'green' : summary.average_sentiment === 'needs_attention' ? 'red' : 'yellow'
          }}>
            Average Sentiment: {summary.average_sentiment || 'neutral'}
          </div>
          <div className="mood-bar">
            {summary.mood_counts && Object.entries(summary.mood_counts).map(([moodId, count]) => {
              const m = MOODS.find(x => x.id === moodId);
              const total = summary.total_submissions || 1;
              const percentage = (count / total) * 100;
              return m ? (
                <div key={moodId} className="mood-bar-segment" style={{ width: `${percentage}%`, backgroundColor: m.color }} title={`${m.label}: ${count}`}></div>
              ) : null;
            })}
          </div>
          <div className="mood-count-row">
            {summary.mood_counts && Object.entries(summary.mood_counts).map(([moodId, count]) => {
              const m = MOODS.find(x => x.id === moodId);
              return m ? <span key={moodId}>{m.emoji} {count}</span> : null;
            })}
            <span>Total: {summary.total_submissions || 0}</span>
          </div>
          <div className="anon-notes">
            {summary.recent_notes && summary.recent_notes.map((n, i) => (
              <div key={i} className="anon-note-card">
                <p>{n}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
