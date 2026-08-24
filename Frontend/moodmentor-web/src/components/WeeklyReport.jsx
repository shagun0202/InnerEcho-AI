import React, { useState, useEffect } from 'react';
import { request } from '../api';

export default function WeeklyReport({ token }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        setReport(await request('/report/weekly', { token }));
      } catch (error) {
        console.error('Failed to fetch weekly report:', error);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchReport();
  }, [token]);

  if (loading) {
    return (
      <div className="report-page" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ animation: 'pulse 1.5s infinite', background: '#eee', height: '400px', borderRadius: '12px' }}></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="report-page" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h2>Weekly Wellness Report</h2>
        <p>No data available for this week yet. Keep logging your moods!</p>
      </div>
    );
  }

  return (
    <div className="report-page" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="report-card" style={{ background: '#fff', borderRadius: '16px', padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div className="report-header" style={{ borderBottom: '1px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
          <h2 style={{ margin: '0 0 10px 0' }}>Weekly Insights</h2>
          <p style={{ margin: 0, color: '#666' }}>{report.week_start} — {report.week_end}</p>
        </div>
        
        <div className="report-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '30px' }}>
          <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{report.total_entries || 0}</div>
            <div style={{ fontSize: '13px', color: '#666' }}>Entries</div>
          </div>
          <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{report.avg_valence?.toFixed(1) || '-'}</div>
            <div style={{ fontSize: '13px', color: '#666' }}>Avg Valence</div>
          </div>
          <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', textTransform: 'capitalize' }}>{report.dominant_emotion || '-'}</div>
            <div style={{ fontSize: '13px', color: '#666' }}>Dominant Emotion</div>
          </div>
        </div>

        <div className="report-narrative" style={{ marginBottom: '30px', lineHeight: '1.6', color: '#444' }}>
          <h3>AI Summary</h3>
          <p>{report.narrative || 'Not enough data to generate narrative.'}</p>
        </div>

        {report.highlights && report.highlights.length > 0 && (
          <div className="report-highlights" style={{ marginBottom: '30px' }}>
            <h3>Key Highlights</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {report.highlights.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '10px', display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ color: '#4CAF50', marginRight: '10px' }}>✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {report.suggestion && (
          <div className="report-suggestion" style={{ background: '#eef2fa', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #5d87de' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#5d87de' }}>Focus for Next Week</h4>
            <p style={{ margin: 0, color: '#444' }}>{report.suggestion}</p>
          </div>
        )}
      </div>
    </div>
  );
}
