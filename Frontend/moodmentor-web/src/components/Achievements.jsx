import React, { useState, useEffect } from 'react';
import { request } from '../api';

export default function Achievements({ token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        setStats(await request('/gamification/stats', { token }));
      } catch (error) {
        console.error('Failed to fetch gamification stats:', error);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="achievements-page" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ animation: 'pulse 1.5s infinite', background: '#eee', height: '400px', borderRadius: '12px' }}></div>
      </div>
    );
  }

  if (!stats) return null;

  const score = stats.wellness_score || 0;
  const circumference = 2 * Math.PI * 60;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="achievements-page" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: '30px', marginBottom: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center', width: '250px' }}>
          <h3>Wellness Score</h3>
          <div className="wellness-gauge" style={{ position: 'relative', width: '150px', height: '150px', margin: '20px auto 0' }}>
            <svg viewBox="0 0 150 150" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="75" cy="75" r="60" fill="none" stroke="#f0f0f0" strokeWidth="12" />
              <circle 
                className="gauge-ring"
                cx="75" 
                cy="75" 
                r="60" 
                fill="none" 
                stroke="#5d87de" 
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
              />
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>
              {score}
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center', width: '250px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3>Current Streak</h3>
          <div className="streak-counter" style={{ fontSize: '48px', margin: '20px 0' }}>
            {stats.streak_days || 0} <span style={{ display: 'inline-block', animation: 'bounce 2s infinite' }}>🔥</span>
          </div>
          <p style={{ color: '#666', margin: 0 }}>Days in a row</p>
        </div>
      </div>

      <h3 style={{ marginBottom: '20px' }}>Your Badges</h3>
      <div className="badge-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '20px' }}>
        {stats.badges && stats.badges.map(badge => (
          <div 
            key={badge.id} 
            className={`badge-card ${badge.unlocked ? 'badge-unlocked' : 'badge-locked'}`}
            style={{ 
              background: '#fff', 
              padding: '20px 15px', 
              borderRadius: '12px', 
              textAlign: 'center',
              border: '1px solid #eee',
              opacity: badge.unlocked ? 1 : 0.6,
              filter: badge.unlocked ? 'none' : 'grayscale(100%)',
              position: 'relative'
            }}
          >
            {!badge.unlocked && <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '14px' }}>🔒</div>}
            <div className="badge-icon" style={{ fontSize: '40px', marginBottom: '10px' }}>{badge.icon}</div>
            <div className="badge-info">
              <h4 style={{ margin: '0 0 5px 0', fontSize: '14px' }}>{badge.name}</h4>
              <p style={{ margin: 0, fontSize: '11px', color: '#666' }}>{badge.description}</p>
              {badge.unlocked && badge.unlocked_at && (
                <div style={{ fontSize: '10px', color: '#999', marginTop: '10px' }}>
                  Earned {new Date(badge.unlocked_at).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
