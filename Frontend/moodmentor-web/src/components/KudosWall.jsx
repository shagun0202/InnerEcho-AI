import React, { useEffect, useState } from 'react';
import { request } from '../api';

const EMOJIS = ['⭐', '🎉', '💪', '🙏', '❤️', '🌟'];

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds/60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds/3600)}h ago`
  return `${Math.floor(seconds/86400)}d ago`
}

export default function KudosWall({ token }) {
  const [kudos, setKudos] = useState([]);
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJIS[0]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    fetchKudos();
  }, [token]);

  const fetchKudos = async () => {
    try {
      setLoading(true);
      const data = await request('/team/kudos', { token });
      setKudos(data || []);
    } catch (error) {
      console.error('Error fetching kudos', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!recipientName || !message || message.length > 300) return;
    try {
      setSubmitting(true);
      await request('/team/kudos', { method: 'POST', token, body: { recipient_name: recipientName, message, emoji: selectedEmoji } });
      setShowConfetti(true);
      setRecipientName('');
      setMessage('');
      setTimeout(() => setShowConfetti(false), 3000);
      fetchKudos();
    } catch (error) {
      console.error('Error sending kudos', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="kudos-page">
      {showConfetti && <div className="confetti">🎉 Confetti! 🎉</div>}
      <form className="kudos-form" onSubmit={handleSend}>
        <h3>Send Kudos</h3>
        <input 
          type="text" 
          placeholder="Recipient Name" 
          value={recipientName} 
          onChange={(e) => setRecipientName(e.target.value)} 
          required 
        />
        <div className="kudos-emoji-picker">
          {EMOJIS.map(e => (
            <span 
              key={e} 
              className={`kudos-emoji-option ${selectedEmoji === e ? 'selected' : ''}`}
              onClick={() => setSelectedEmoji(e)}
            >
              {e}
            </span>
          ))}
        </div>
        <textarea 
          placeholder="Message (max 300 chars)" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          maxLength={300}
          required 
        />
        <button type="submit" disabled={submitting}>Send Kudos</button>
      </form>

      <div className="kudos-feed">
        {loading ? <p>Loading...</p> : kudos.length === 0 ? <p>No kudos yet!</p> : (
          kudos.map((k) => (
            <div key={k.id} className="kudos-card">
              <div style={{ fontSize: '2rem' }}>{k.emoji}</div>
              <div className="kudos-sender">{k.sender_name} &rarr; {k.recipient_name}</div>
              <div className="kudos-message">{k.message}</div>
              <div className="kudos-time">{timeAgo(k.created_at || new Date())}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
