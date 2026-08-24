import React, { useEffect, useState } from 'react';
import { request } from '../api';

export default function WorkLifeBalance({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await request('/team/work-life-score', { token });
      setData(res);
    } catch (error) {
      console.error('Error fetching WLB score', error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="wlb-page">Loading...</div>;

  const score = data?.score || 0;
  const category = data?.category?.toLowerCase() || 'balanced';
  
  let color = '#3b82f6'; // balanced
  if (category === 'thriving') color = '#10b981';
  else if (category === 'needs_attention') color = '#f97316';
  else if (category === 'at_risk') color = '#ef4444';

  const radius = 80;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="wlb-page">
      <div className="wlb-gauge" style={{ position: 'relative', width: '200px', height: '100px', margin: '0 auto', overflow: 'hidden' }}>
        <svg width="200" height="100">
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#eee" strokeWidth="20" />
          <path 
            d="M 20 100 A 80 80 0 0 1 180 100" 
            fill="none" 
            stroke={color} 
            strokeWidth="20" 
            style={{ 
              strokeDasharray: circumference, 
              strokeDashoffset,
              transition: 'stroke-dashoffset 1s ease-out'
            }} 
          />
        </svg>
        <div className="wlb-score-text" style={{ position: 'absolute', bottom: '0', width: '100%', textAlign: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
          {score}
        </div>
      </div>
      
      <div className="wlb-category" style={{ textAlign: 'center', marginTop: '10px', color, fontWeight: 'bold', textTransform: 'capitalize' }}>
        {category.replace('_', ' ')}
      </div>

      <div className="wlb-tip" style={{ padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '8px', margin: '20px 0' }}>
        <strong>AI Tip:</strong> {data?.tip}
      </div>

      <div className="wlb-metrics" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="wlb-metric-card">
          <h5>Journal Regularity</h5>
          <p>{data?.journal_regularity ?? 0}%</p>
        </div>
        <div className="wlb-metric-card">
          <h5>Avg Mood Valence</h5>
          <p>{data?.avg_valence ?? 0}</p>
        </div>
        <div className="wlb-metric-card">
          <h5>Evening Entries</h5>
          <p>
            {data?.evening_entries_pct ?? 0}%
            {data?.evening_entries_pct > 50 && <span style={{color: 'red', fontSize: '0.8rem', display: 'block'}}>High evening usage</span>}
          </p>
        </div>
        <div className="wlb-metric-card">
          <h5>Current Streak</h5>
          <p>{data?.streak_days ?? 0} days</p>
        </div>
      </div>
    </div>
  );
}
