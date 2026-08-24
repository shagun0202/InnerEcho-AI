import React, { useState } from 'react';

const STEPS = [
  {
    icon: '✨',
    title: 'Welcome to MoodMentor',
    text: 'Your personal emotional wellness companion. Everything here is private, supportive, and built for you.',
  },
  {
    icon: '✎',
    title: 'Journal your feelings',
    text: 'Write about your day and our AI will detect 28 different emotions, then offer personalized support.',
  },
  {
    icon: '◉',
    title: 'Mood Studio',
    text: '15 visual filters, particle effects, photo booth, and breathing exercises — your space to reset.',
  },
  {
    icon: '🏆',
    title: 'Earn achievements',
    text: 'Build your wellness streak, unlock badges, and track your growth over time.',
  },
  {
    icon: '👥',
    title: 'Team wellness',
    text: 'Share your mood anonymously, send kudos to colleagues, and recover after meetings together.',
  },
];

export default function Onboarding({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('moodmentor-onboarded', 'true');
    if (onComplete) onComplete();
  };

  return (
    <div className="onboarding-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="onboarding-card" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
        <div className="onboarding-icon" style={{ fontSize: '4rem', marginBottom: '1rem' }}>
          {STEPS[currentStep].icon}
        </div>
        <h2>{STEPS[currentStep].title}</h2>
        <p style={{ margin: '1rem 0 2rem', lineHeight: 1.5 }}>
          {STEPS[currentStep].text}
        </p>

        <div className="onboarding-dots" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '2rem' }}>
          {STEPS.map((_, i) => (
            <span 
              key={i} 
              className={`onboarding-dot ${i === currentStep ? 'active' : ''}`}
              style={{
                width: '10px', height: '10px', borderRadius: '50%',
                backgroundColor: i === currentStep ? '#6956e8' : '#e5e7eb'
              }}
            />
          ))}
        </div>

        <div className="onboarding-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {currentStep > 0 ? (
            <button onClick={handlePrev} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>Previous</button>
          ) : (
            <button onClick={handleComplete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>Skip</button>
          )}
          
          {currentStep < STEPS.length - 1 ? (
            <button onClick={handleNext} style={{ padding: '8px 16px', backgroundColor: '#6956e8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Next</button>
          ) : (
            <button onClick={handleComplete} style={{ padding: '8px 16px', backgroundColor: '#6956e8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Get Started</button>
          )}
        </div>
      </div>
    </div>
  );
}
