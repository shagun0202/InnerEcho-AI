import React, { useCallback, useEffect, useRef, useState } from 'react';

const SOUNDS = [
  { id: 'rain', name: 'Gentle Rain', icon: '🌧️', color: '#5d87de' },
  { id: 'ocean', name: 'Ocean Waves', icon: '🌊', color: '#54ae91' },
  { id: 'fire', name: 'Fireplace', icon: '🔥', color: '#e56467' },
  { id: 'forest', name: 'Forest Birds', icon: '🌲', color: '#6ab04c' },
  { id: 'cafe', name: 'Coffee Shop', icon: '☕', color: '#bf8a30' },
  { id: 'night', name: 'Night Crickets', icon: '🌙', color: '#856ee2' },
  { id: 'piano', name: 'Soft Piano', icon: '🎹', color: '#96a0b3' },
  { id: 'bowls', name: 'Singing Bowls', icon: '🔔', color: '#efaa42' },
];

export default function AmbientPlayer() {
  const [expanded, setExpanded] = useState(false);
  const [activeSound, setActiveSound] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioCtxRef = useRef(null);
  const nodesRef = useRef([]);

  const stopSound = useCallback(() => {
    if (nodesRef.current.length > 0) {
      nodesRef.current.forEach(node => {
        try {
          if (node.stop) node.stop();
          if (node.disconnect) node.disconnect();
        } catch (e) {}
      });
      nodesRef.current = [];
    }
  }, []);

  let lastOut = 0;
  const createNoise = (ctx, type) => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      if (type === 'white') data[i] = Math.random() * 2 - 1;
      else if (type === 'pink') {
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        data[i] *= 0.11;
        b6 = white * 0.115926;
      }
      else {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    return noise;
  };

  const playSound = useCallback((soundId) => {
    stopSound();
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const masterGain = ctx.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(ctx.destination);
    nodesRef.current.push(masterGain);

    switch (soundId) {
      case 'rain': {
        const noise = createNoise(ctx, 'brown');
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        filter.Q.value = 1;
        noise.connect(filter);
        filter.connect(masterGain);
        noise.start();
        nodesRef.current.push(noise, filter);
        break;
      }
      case 'ocean': {
        const noise = createNoise(ctx, 'pink');
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.1;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.5;
        lfo.connect(lfoGain);
        const waveGain = ctx.createGain();
        waveGain.gain.value = 0.5;
        lfoGain.connect(waveGain.gain);
        noise.connect(filter);
        filter.connect(waveGain);
        waveGain.connect(masterGain);
        noise.start();
        lfo.start();
        nodesRef.current.push(noise, filter, lfo, lfoGain, waveGain);
        break;
      }
      case 'fire': {
        const noise = createNoise(ctx, 'brown');
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        noise.connect(filter);
        filter.connect(masterGain);
        noise.start();
        nodesRef.current.push(noise, filter);
        break;
      }
      case 'forest': {
        const noise = createNoise(ctx, 'pink');
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 2000;
        noise.connect(filter);
        filter.connect(masterGain);
        noise.start();
        nodesRef.current.push(noise, filter);
        break;
      }
      case 'cafe': {
        const noise = createNoise(ctx, 'white');
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 400;
        filter.Q.value = 0.5;
        noise.connect(filter);
        filter.connect(masterGain);
        noise.start();
        nodesRef.current.push(noise, filter);
        break;
      }
      case 'night': {
        const noise = createNoise(ctx, 'brown');
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 200;
        noise.connect(filter);
        filter.connect(masterGain);
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = 4000;
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 2;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 1;
        lfo.connect(lfoGain);
        const oscGain = ctx.createGain();
        oscGain.gain.value = 0.05;
        lfoGain.connect(oscGain.gain);
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        noise.start();
        osc.start();
        lfo.start();
        nodesRef.current.push(noise, filter, osc, lfo, lfoGain, oscGain);
        break;
      }
      case 'piano': {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 261.63;
        const gain = ctx.createGain();
        gain.gain.value = 0.5;
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        nodesRef.current.push(osc, gain);
        break;
      }
      case 'bowls': {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 396;
        const gain = ctx.createGain();
        gain.gain.value = 0.3;
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        nodesRef.current.push(osc, gain);
        break;
      }
      default:
        break;
    }
  }, [stopSound, volume]);

  useEffect(() => {
    if (nodesRef.current.length > 0) {
      const masterGain = nodesRef.current[0];
      if (masterGain && masterGain.gain) {
        masterGain.gain.value = volume;
      }
    }
  }, [volume]);

  useEffect(() => {
    if (playing && activeSound) {
      playSound(activeSound);
    } else {
      stopSound();
    }
  }, [playing, activeSound, playSound, stopSound]);

  useEffect(() => {
    return () => stopSound();
  }, [stopSound]);

  const toggleExpanded = () => setExpanded(!expanded);

  const handleSoundClick = (id) => {
    if (activeSound === id && playing) {
      setPlaying(false);
    } else {
      setActiveSound(id);
      setPlaying(true);
    }
  };

  return (
    <div className={`ambient-player ${expanded ? 'ambient-expanded' : ''}`} style={{ position: 'fixed', bottom: '20px', right: '20px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: expanded ? '15px' : '10px', zIndex: 1000, transition: 'all 0.3s' }}>
      {!expanded ? (
        <div className="ambient-pill" onClick={toggleExpanded} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{activeSound && playing ? SOUNDS.find(s => s.id === activeSound)?.icon : '🎵'}</span>
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{activeSound && playing ? 'Playing' : 'Ambient'}</span>
        </div>
      ) : (
        <div className="ambient-content" style={{ width: '250px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>Ambient Sounds</h3>
            <button onClick={toggleExpanded} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px' }}>✕</button>
          </div>
          <div className="ambient-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '15px' }}>
            {SOUNDS.map(sound => (
              <button
                key={sound.id}
                className={`ambient-sound-btn ${activeSound === sound.id && playing ? 'active' : ''}`}
                onClick={() => handleSoundClick(sound.id)}
                style={{
                  border: `2px solid ${activeSound === sound.id && playing ? sound.color : 'transparent'}`,
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  padding: '10px 5px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                }}
                title={sound.name}
              >
                <span style={{ fontSize: '20px' }}>{sound.icon}</span>
              </button>
            ))}
          </div>
          <div className="ambient-controls" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              onClick={() => setPlaying(!playing)}
              disabled={!activeSound}
              style={{ padding: '5px 15px', borderRadius: '20px', border: 'none', backgroundColor: activeSound ? '#4CAF50' : '#ddd', color: '#fff', cursor: activeSound ? 'pointer' : 'not-allowed' }}
            >
              {playing ? 'Pause' : 'Play'}
            </button>
            <input 
              type="range" 
              className="volume-slider"
              min="0" 
              max="1" 
              step="0.01" 
              value={volume} 
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              style={{ flex: 1 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
