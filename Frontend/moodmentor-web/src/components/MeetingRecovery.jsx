import React, { useEffect, useState, useRef } from 'react';
import { request } from '../api';

export default function MeetingRecovery({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState(120); // default 2 min
  const [timeLeft, setTimeLeft] = useState(120);
  const [isActive, setIsActive] = useState(false);
  const [checkedActivities, setCheckedActivities] = useState({});
  const timerRef = useRef(null);

  useEffect(() => {
    fetchRecoveryPlan();
    return () => clearInterval(timerRef.current);
  }, [token]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  const fetchRecoveryPlan = async () => {
    try {
      setLoading(true);
      const result = await request('/team/meeting-recovery', { token });
      setData(result);
      setCheckedActivities({});
    } catch (error) {
      console.error('Error fetching recovery plan', error);
      // Dummy data fallback
      setData({
        affirmation: "Take a deep breath. You've got this.",
        activities: ['Stand up and stretch', 'Drink a glass of water', 'Close your eyes for 30 seconds']
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleActivity = (id) => {
    setCheckedActivities(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const startTimer = () => setIsActive(true);
  const pauseTimer = () => setIsActive(false);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(duration);
  };

  const handleDurationChange = (d) => {
    setDuration(d);
    setTimeLeft(d);
    setIsActive(false);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const percentage = (timeLeft / duration) * 100;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  if (loading) return <div className="recovery-page">Loading...</div>;

  return (
    <div className="recovery-page">
      <div className="recovery-affirmation">
        <h3>{data?.affirmation}</h3>
      </div>
      
      <div className="recovery-controls">
        <button onClick={() => handleDurationChange(120)}>2 Min</button>
        <button onClick={() => handleDurationChange(180)}>3 Min</button>
        <button onClick={() => handleDurationChange(300)}>5 Min</button>
      </div>

      <div className="recovery-timer" style={{ position: 'relative', width: '120px', height: '120px', margin: '20px auto' }}>
        <svg className="recovery-ring" width="120" height="120">
          <circle stroke="#eee" strokeWidth="8" fill="transparent" r="50" cx="60" cy="60" />
          <circle 
            stroke="#6956e8" 
            strokeWidth="8" 
            fill="transparent" 
            r="50" 
            cx="60" 
            cy="60"
            style={{ 
              strokeDasharray: circumference, 
              strokeDashoffset,
              transition: 'stroke-dashoffset 1s linear',
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%'
            }}
          />
        </svg>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="recovery-controls">
        {!isActive && timeLeft > 0 && <button onClick={startTimer}>Start</button>}
        {isActive && <button onClick={pauseTimer}>Pause</button>}
        <button onClick={resetTimer}>Reset</button>
      </div>

      {timeLeft === 0 && (
        <div className="recovery-complete">
          <h2>You earned a break!</h2>
        </div>
      )}

      <div className="recovery-activities">
        <h4>Suggested Activities:</h4>
        {data?.activities?.slice(0,3).map((activity, index) => (
          <div 
            key={index} 
            className={`recovery-activity ${checkedActivities[index] ? 'checked' : ''}`}
            onClick={() => toggleActivity(index)}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}
          >
            <input type="checkbox" checked={!!checkedActivities[index]} readOnly />
            <span>{activity}</span>
          </div>
        ))}
      </div>

      <button onClick={fetchRecoveryPlan} style={{ marginTop: '20px' }}>New recovery plan</button>
    </div>
  );
}
