import React from 'react';
import { icon, emotions } from '../App';

const PLAYLISTS = {
  sadness: [
    { name: 'Mood Lift', description: 'Gradually uplifting songs to brighten your day', url: 'https://open.spotify.com/search/mood%20lift%20playlist', icon: '🌤️' },
    { name: 'Comfort Acoustic', description: 'Warm acoustic tracks for gentle moments', url: 'https://www.youtube.com/results?search_query=comfort+acoustic+playlist', icon: '🎸' },
    { name: 'Feel Good Classics', description: 'Timeless songs that always bring a smile', url: 'https://open.spotify.com/search/feel%20good%20classics', icon: '🎵' },
  ],
  anger: [
    { name: 'Release & Reset', description: 'Cathartic then calming progression', url: 'https://open.spotify.com/search/release%20reset%20playlist', icon: '🌪️' },
    { name: 'Calm Instrumentals', description: 'Instrumental pieces to ease tension', url: 'https://www.youtube.com/results?search_query=calm+instrumental+playlist', icon: '🎹' },
  ],
  fear: [
    { name: 'Safe & Sound', description: 'Ambient tracks for anxiety relief', url: 'https://open.spotify.com/search/anxiety%20relief%20ambient', icon: '🛡️' },
    { name: 'Grounding Beats', description: 'Steady rhythms to anchor you', url: 'https://www.youtube.com/results?search_query=grounding+meditation+music', icon: '🥁' },
  ],
  joy: [
    { name: 'Celebration', description: 'Keep the good vibes going', url: 'https://open.spotify.com/search/celebration%20playlist', icon: '🎉' },
    { name: 'Dance Energy', description: 'Move your body, feel alive', url: 'https://open.spotify.com/search/dance%20energy%20playlist', icon: '💃' },
  ],
  neutral: [
    { name: 'Focus Flow', description: 'Lo-fi beats for productive calm', url: 'https://open.spotify.com/search/lofi%20focus%20playlist', icon: '🎧' },
    { name: 'Discover New', description: 'Explore fresh sounds', url: 'https://open.spotify.com/search/discover%20new%20music', icon: '🔍' },
  ],
};

export default function MoodPlaylist({ data }) {
  const emotion = data?.summary?.most_frequent_emotion?.toLowerCase() || 'neutral';
  const activePlaylists = PLAYLISTS[emotion] || PLAYLISTS['neutral'];

  return (
    <div className="playlist-page" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <img
        src="/images/playlist-bg.png"
        alt=""
        className="playlist-background-illustration"
      />
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '10px' }}>Soundtrack Your Mood</h2>
        <p style={{ color: '#666', margin: 0 }}>
          Based on your recent emotion (<strong>{emotion}</strong>), here are some playlists that might resonate with you right now.
        </p>
      </div>

      <div className="playlist-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {activePlaylists.map((playlist, idx) => (
          <div 
            key={idx} 
            className="playlist-card"
            style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '20px',
              border: '1px solid #dcebfa',
              boxShadow: '0 8px 24px rgba(36, 52, 71, 0.07)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{
              width: '58px',
              height: '58px',
              borderRadius: '50%',
              background: '#eaf3fc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '30px',
              marginBottom: '15px'
              }}
           >
              {playlist.icon}
            </div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{playlist.name}</h3>
            <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '14px', flex: 1 }}>{playlist.description}</p>
            
            <a 
              href={playlist.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="playlist-link"
              style={{
                display: 'inline-block',
                background: '#5b8def',
                color: '#fff',
                textDecoration: 'none',
                padding: '10px 15px',
                borderRadius: '20px',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                boxShadow: '0 6px 14px rgba(91, 141, 239, 0.20)'
              }}
            >
              Listen Now
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
