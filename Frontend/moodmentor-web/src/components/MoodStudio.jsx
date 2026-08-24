import React, { useEffect, useRef, useState } from 'react'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

const FILTER_CATEGORIES = [
  {
    category: 'Color Lenses',
    icon: '🎨',
    filters: [
      { id: 'natural', name: 'Natural', icon: '☼', note: 'Just you, as you are.', css: 'none' },
      { id: 'calm', name: 'Calm Tide', icon: '🌊', note: 'Cool ocean tones for a softer pause.', css: 'saturate(.78) hue-rotate(155deg)' },
      { id: 'glow', name: 'Golden Hour', icon: '🌅', note: 'Warm sunset light for a little lift.', css: 'sepia(.28) saturate(1.16) brightness(1.07)' },
      { id: 'focus', name: 'Focus', icon: '🎯', note: 'A clear, quiet frame for clarity.', css: 'contrast(1.12) saturate(.72)' },
      { id: 'joy', name: 'Joy Spark', icon: '✨', note: 'Vibrant and playful energy.', css: 'saturate(1.25) brightness(1.07)' },
      { id: 'midnight', name: 'Midnight Blue', icon: '🌙', note: 'Deep, calming night tones.', css: 'saturate(.6) hue-rotate(200deg) brightness(.85)' },
      { id: 'sunset', name: 'Sunset Blush', icon: '🌸', note: 'Soft pink-gold warmth.', css: 'sepia(.2) saturate(1.3) hue-rotate(-15deg) brightness(1.05)' },
      { id: 'forest', name: 'Forest Calm', icon: '🌲', note: 'Earthy greens for grounding.', css: 'saturate(.85) hue-rotate(70deg) brightness(.95)' },
      { id: 'lavender', name: 'Lavender Dream', icon: '💜', note: 'Gentle purple serenity.', css: 'saturate(.8) hue-rotate(260deg) brightness(1.05)' },
      { id: 'ocean', name: 'Ocean Mist', icon: '🐚', note: 'Soft teal, like a sea breeze.', css: 'saturate(.7) hue-rotate(140deg) brightness(1.08)' },
      { id: 'retro', name: 'Retro Warm', icon: '📸', note: 'Vintage film nostalgia.', css: 'sepia(.45) contrast(1.1) brightness(.95) saturate(1.1)' },
    ]
  },
  {
    category: 'Particle Effects',
    icon: '✨',
    filters: [
      { id: 'bubbles', name: 'Floating Bubbles', icon: '🫧', note: 'Gentle bubbles drifting up.', css: 'none', particle: 'bubbles' },
      { id: 'fireflies', name: 'Fireflies', icon: '✨', note: 'Warm glowing lights around you.', css: 'sepia(.15) brightness(1.05)', particle: 'fireflies' },
      { id: 'petals', name: 'Cherry Blossoms', icon: '🌸', note: 'Soft petals falling gently.', css: 'saturate(1.1) brightness(1.05)', particle: 'petals' },
      { id: 'snow', name: 'Gentle Snow', icon: '❄️', note: 'Quiet snowfall for calm.', css: 'saturate(.7) brightness(1.1)', particle: 'snow' },
    ]
  },
  {
    category: 'Face Effects',
    icon: '🐾',
    filters: [
      { id: 'bunny', name: 'Bunny Bloom', icon: '🐰', note: 'Soft ears, pink nose, and whiskers that follow you.', css: 'brightness(1.04) saturate(1.08)', ar: 'bunny' },
      { id: 'puppy', name: 'Puppy Play', icon: '🐶', note: 'Floppy ears, playful snout, and interactive tongue.', css: 'brightness(1.03) saturate(1.12)', ar: 'puppy' },
      { id: 'celebrate', name: 'Royal Crown', icon: '👑', note: 'Gilded crown with jewels and celestial sparkles.', css: 'brightness(1.08) saturate(1.18)', ar: 'celebrate' },
      { id: 'cat', name: 'Kitty Glam', icon: '🐱', note: 'Cute cat ears, rosy cheeks, and whiskers.', css: 'brightness(1.05) saturate(1.1)', ar: 'cat' },
      { id: 'shades', name: 'Cool Aviators', icon: '🕶️', note: 'Glossy dark sunglasses locked to your eyes.', css: 'contrast(1.1) brightness(1.02)', ar: 'shades' },
      { id: 'halo', name: 'Angel Halo', icon: '😇', note: 'Glowing golden halo and angelic sparkle aura.', css: 'brightness(1.1) saturate(1.1)', ar: 'halo' },
      { id: 'heart_eyes', name: 'Heart Eyes', icon: '😍', note: 'Pulsing anime heart eyes with floating love sparks.', css: 'brightness(1.05) saturate(1.2)', ar: 'heart_eyes' },
      { id: 'devil', name: 'Neon Devil', icon: '😈', note: 'Glowing cyberpunk horns with a mysterious vibe.', css: 'contrast(1.15) brightness(0.95)', ar: 'devil' },
      { id: 'star_freckles', name: 'Star Freckles', icon: '✨', note: 'Twinkling golden star freckles and cosmic dust.', css: 'brightness(1.08) saturate(1.15)', ar: 'star_freckles' },
    ]
  }
]

const AFFIRMATIONS = [
  'You are doing your best.',
  'This moment is yours.',
  'You are worthy of rest.',
  'Your feelings are valid.',
  'One step at a time.',
  'You are enough, right now.',
  'Breathe. You are here.',
  'Your calm is your strength.',
  'Today, you choose kindness for yourself.',
  'You deserve this pause.',
]

const BREATH_PATTERNS = [
  { name: 'Calm (4-4-6)', inhale: 4, hold: 4, exhale: 6, holdOut: 0, label: 'Classic calming breath' },
  { name: 'Box (4-4-4-4)', inhale: 4, hold: 4, exhale: 4, holdOut: 4, label: 'Focus and control' },
  { name: 'Energize (2-0-4)', inhale: 2, hold: 0, exhale: 4, holdOut: 0, label: 'Quick energy reset' },
]

class ParticleSystem {
  constructor(canvas, type) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.particles = []
    this.type = type
    this.running = false
  }

  init(count = 30) {
    this.particles = Array.from({ length: count }, () => this.createParticle())
  }

  createParticle() {
    const w = this.canvas.width || 640
    const h = this.canvas.height || 480
    switch (this.type) {
      case 'bubbles': return {
        x: Math.random() * w, y: h + Math.random() * 50,
        radius: 4 + Math.random() * 12, speed: 0.3 + Math.random() * 0.7,
        opacity: 0.15 + Math.random() * 0.3, wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.02 + Math.random() * 0.03
      }
      case 'fireflies': return {
        x: Math.random() * w, y: Math.random() * h,
        radius: 2 + Math.random() * 4, speed: 0.2 + Math.random() * 0.5,
        opacity: 0.3 + Math.random() * 0.5, angle: Math.random() * Math.PI * 2,
        pulse: Math.random() * Math.PI * 2, pulseSpeed: 0.03 + Math.random() * 0.04
      }
      case 'petals': return {
        x: Math.random() * w, y: -20 - Math.random() * 50,
        size: 6 + Math.random() * 10, speed: 0.4 + Math.random() * 0.8,
        drift: Math.random() * 0.5 - 0.25, rotation: Math.random() * 360,
        rotSpeed: Math.random() * 2 - 1, opacity: 0.4 + Math.random() * 0.4
      }
      case 'snow': return {
        x: Math.random() * w, y: -10 - Math.random() * 30,
        radius: 1.5 + Math.random() * 3, speed: 0.3 + Math.random() * 0.6,
        drift: Math.random() * 0.4 - 0.2, opacity: 0.3 + Math.random() * 0.5
      }
      default: return {}
    }
  }

  update() {
    const w = this.canvas.width
    const h = this.canvas.height
    this.particles.forEach(p => {
      switch (this.type) {
        case 'bubbles':
          p.y -= p.speed
          p.wobble += p.wobbleSpeed
          p.x += Math.sin(p.wobble) * 0.5
          if (p.y + p.radius < 0) Object.assign(p, this.createParticle(), { y: h + p.radius })
          break
        case 'fireflies':
          p.x += Math.cos(p.angle) * p.speed
          p.y += Math.sin(p.angle) * p.speed
          p.angle += (Math.random() - 0.5) * 0.1
          p.pulse += p.pulseSpeed
          if (p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
             Object.assign(p, this.createParticle())
          }
          break
        case 'petals':
          p.y += p.speed
          p.x += p.drift
          p.rotation += p.rotSpeed
          if (p.y > h + 20) Object.assign(p, this.createParticle(), { y: -20 })
          break
        case 'snow':
          p.y += p.speed
          p.x += p.drift
          if (p.y > h + 10) Object.assign(p, this.createParticle(), { y: -10 })
          break
      }
    })
  }

  draw() {
    const ctx = this.ctx
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.particles.forEach(p => {
      ctx.save()
      ctx.globalAlpha = p.opacity
      
      switch (this.type) {
        case 'bubbles':
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
          ctx.fill()
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
          ctx.lineWidth = 1
          ctx.stroke()
          ctx.beginPath()
          ctx.arc(p.x - p.radius * 0.3, p.y - p.radius * 0.3, p.radius * 0.2, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
          ctx.fill()
          break
        case 'fireflies':
          const currentOpacity = p.opacity + Math.sin(p.pulse) * 0.3
          ctx.globalAlpha = Math.max(0.1, Math.min(1, currentOpacity))
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2)
          grad.addColorStop(0, 'rgba(255, 255, 200, 1)')
          grad.addColorStop(0.4, 'rgba(255, 200, 50, 0.5)')
          grad.addColorStop(1, 'rgba(255, 200, 50, 0)')
          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2)
          ctx.fill()
          break
        case 'petals':
          ctx.translate(p.x, p.y)
          ctx.rotate((p.rotation * Math.PI) / 180)
          ctx.fillStyle = '#ffb7c5'
          ctx.beginPath()
          ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2)
          ctx.fill()
          break
        case 'snow':
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
          ctx.fillStyle = 'white'
          ctx.fill()
          break
      }
      ctx.restore()
    })
  }

  start() {
    if (this.running) return
    this.running = true
    this.loop()
  }

  stop() {
    this.running = false
  }

  loop() {
    if (!this.running) return
    this.update()
    this.draw()
    requestAnimationFrame(() => this.loop())
  }
}

const point = (landmarks, index, width, height) => ({
  x: landmarks[index].x * width,
  y: landmarks[index].y * height,
})

function getFaceMetrics(landmarks, width, height) {
  const leftEye = point(landmarks, 33, width, height)
  const rightEye = point(landmarks, 263, width, height)
  const leftEyeCenter = point(landmarks, 159, width, height)
  const rightEyeCenter = point(landmarks, 386, width, height)
  const nose = point(landmarks, 1, width, height)
  const forehead = point(landmarks, 10, width, height)
  const chin = point(landmarks, 152, width, height)
  const leftCheek = point(landmarks, 234, width, height)
  const rightCheek = point(landmarks, 454, width, height)
  const upperLip = point(landmarks, 13, width, height)
  const lowerLip = point(landmarks, 14, width, height)

  const eyeMid = { x: (leftEye.x + rightEye.x) / 2, y: (leftEye.y + rightEye.y) / 2 }
  const faceWidth = Math.hypot(rightCheek.x - leftCheek.x, rightCheek.y - leftCheek.y)
  const faceHeight = Math.hypot(chin.x - forehead.x, chin.y - forehead.y)
  const angle = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x)
  const mouthGap = Math.hypot(lowerLip.x - upperLip.x, lowerLip.y - upperLip.y)
  const mouthOpen = (mouthGap / faceHeight) > 0.055

  return {
    leftEye, rightEye, leftEyeCenter, rightEyeCenter, eyeMid,
    nose, forehead, chin, leftCheek, rightCheek,
    upperLip, lowerLip, faceWidth, faceHeight, angle, mouthOpen
  }
}

function drawHeart(ctx, x, y, size, color) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(size / 28, size / 28)
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(0, 8)
  ctx.bezierCurveTo(-22, -6, -12, -24, 0, -10)
  ctx.bezierCurveTo(12, -24, 22, -6, 0, 8)
  ctx.fill()
  ctx.restore()
}

function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, color) {
  let rot = (Math.PI / 2) * 3
  let x = cx
  let y = cy
  const step = Math.PI / spikes

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(cx, cy - outerRadius)
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius
    y = cy + Math.sin(rot) * outerRadius
    ctx.lineTo(x, y)
    rot += step

    x = cx + Math.cos(rot) * innerRadius
    y = cy + Math.sin(rot) * innerRadius
    ctx.lineTo(x, y)
    rot += step
  }
  ctx.lineTo(cx, cy - outerRadius)
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
  ctx.restore()
}

// 1. Bunny Filter 🐰
function drawBunny(ctx, landmarks, width, height) {
  const m = getFaceMetrics(landmarks, width, height)
  const earW = m.faceWidth * 0.22
  const earH = m.faceWidth * 0.75

  ctx.save()
  ctx.translate(m.forehead.x, m.forehead.y)
  ctx.rotate(m.angle)

  ;[-m.faceWidth * 0.28, m.faceWidth * 0.28].forEach((ox, idx) => {
    const tilt = idx === 0 ? -0.15 : 0.15
    ctx.save()
    ctx.translate(ox, -earH * 0.5)
    ctx.rotate(tilt)

    ctx.fillStyle = '#ffffff'
    ctx.strokeStyle = '#e2c5cd'
    ctx.lineWidth = Math.max(2, m.faceWidth * 0.016)
    ctx.beginPath()
    ctx.ellipse(0, 0, earW, earH, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#ff9ebb'
    ctx.beginPath()
    ctx.ellipse(0, 0, earW * 0.48, earH * 0.72, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  })
  ctx.restore()

  ctx.save()
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.ellipse(m.nose.x, m.nose.y + m.faceWidth * 0.04, m.faceWidth * 0.16, m.faceWidth * 0.1, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#ff6b8b'
  ctx.beginPath()
  ctx.ellipse(m.nose.x, m.nose.y, m.faceWidth * 0.06, m.faceWidth * 0.045, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = '#f8f4ec'
  ctx.lineWidth = Math.max(1.8, m.faceWidth * 0.012)
  ctx.lineCap = 'round'
  ;[-1, 1].forEach(dir => {
    for (const rise of [-0.04, 0.01, 0.06]) {
      ctx.beginPath()
      ctx.moveTo(m.nose.x + dir * m.faceWidth * 0.08, m.nose.y + rise * m.faceWidth)
      ctx.lineTo(m.nose.x + dir * m.faceWidth * 0.45, m.nose.y + rise * m.faceWidth * 1.5)
      ctx.stroke()
    }
  })
  ctx.restore()
}

// 2. Puppy Filter 🐶
function drawPuppy(ctx, landmarks, width, height) {
  const m = getFaceMetrics(landmarks, width, height)

  ctx.save()
  ctx.translate(m.forehead.x, m.forehead.y)
  ctx.rotate(m.angle)
  ;[-1, 1].forEach(dir => {
    ctx.save()
    ctx.translate(dir * m.faceWidth * 0.52, m.faceWidth * 0.05)
    ctx.rotate(dir * 0.38)
    ctx.fillStyle = '#9e623b'
    ctx.strokeStyle = '#6d3c1e'
    ctx.lineWidth = Math.max(2, m.faceWidth * 0.018)
    ctx.beginPath()
    ctx.ellipse(0, 0, m.faceWidth * 0.22, m.faceWidth * 0.48, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#7a4524'
    ctx.beginPath()
    ctx.ellipse(0, 0, m.faceWidth * 0.12, m.faceWidth * 0.34, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  })
  ctx.restore()

  ctx.save()
  ctx.fillStyle = '#c78d5e'
  ctx.beginPath()
  ctx.ellipse(m.nose.x, m.nose.y + m.faceWidth * 0.07, m.faceWidth * 0.22, m.faceWidth * 0.16, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#221611'
  ctx.beginPath()
  ctx.ellipse(m.nose.x, m.nose.y - m.faceWidth * 0.01, m.faceWidth * 0.08, m.faceWidth * 0.055, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'
  ctx.beginPath()
  ctx.ellipse(m.nose.x - m.faceWidth * 0.025, m.nose.y - m.faceWidth * 0.02, m.faceWidth * 0.02, m.faceWidth * 0.012, 0, 0, Math.PI * 2)
  ctx.fill()

  const tongueLength = m.mouthOpen ? m.faceWidth * 0.35 : m.faceWidth * 0.22
  ctx.fillStyle = '#ff7597'
  ctx.beginPath()
  ctx.ellipse(m.upperLip.x, m.upperLip.y + tongueLength * 0.55, m.faceWidth * 0.11, tongueLength * 0.55, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#e05377'
  ctx.lineWidth = Math.max(1.5, m.faceWidth * 0.012)
  ctx.beginPath()
  ctx.moveTo(m.upperLip.x, m.upperLip.y + m.faceWidth * 0.02)
  ctx.lineTo(m.upperLip.x, m.upperLip.y + tongueLength * 0.9)
  ctx.stroke()
  ctx.restore()
}

// 3. Royal Crown Filter 👑
function drawCelebrate(ctx, landmarks, width, height, timestamp) {
  const m = getFaceMetrics(landmarks, width, height)
  const crownW = m.faceWidth * 0.72
  const crownH = m.faceWidth * 0.38

  ctx.save()
  ctx.translate(m.forehead.x, m.forehead.y - m.faceWidth * 0.08)
  ctx.rotate(m.angle)

  const grad = ctx.createLinearGradient(-crownW / 2, -crownH, crownW / 2, 0)
  grad.addColorStop(0, '#ffe066')
  grad.addColorStop(0.5, '#ffd13b')
  grad.addColorStop(1, '#f59e0b')

  ctx.fillStyle = grad
  ctx.strokeStyle = '#b45309'
  ctx.lineWidth = Math.max(2.5, m.faceWidth * 0.018)

  ctx.beginPath()
  ctx.moveTo(-crownW * 0.5, 0)
  ctx.lineTo(-crownW * 0.45, -crownH * 0.75)
  ctx.lineTo(-crownW * 0.22, -crownH * 0.25)
  ctx.lineTo(0, -crownH)
  ctx.lineTo(crownW * 0.22, -crownH * 0.25)
  ctx.lineTo(crownW * 0.45, -crownH * 0.75)
  ctx.lineTo(crownW * 0.5, 0)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#991b1b'
  ctx.fillRect(-crownW * 0.5, -m.faceWidth * 0.05, crownW, m.faceWidth * 0.05)

  const peaks = [
    { x: -crownW * 0.45, y: -crownH * 0.75, c: '#06b6d4' },
    { x: 0, y: -crownH, c: '#ef4444' },
    { x: crownW * 0.45, y: -crownH * 0.75, c: '#10b981' }
  ]
  peaks.forEach(p => {
    ctx.beginPath()
    ctx.arc(p.x, p.y, m.faceWidth * 0.038, 0, Math.PI * 2)
    ctx.fillStyle = p.c
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1.5
    ctx.stroke()
  })

  for (let i = 0; i < 6; i++) {
    const angle = (timestamp || performance.now()) / 800 + (i * (Math.PI * 2)) / 6
    const sx = Math.cos(angle) * m.faceWidth * 0.65
    const sy = Math.sin(angle) * m.faceWidth * 0.4 - crownH * 0.5
    drawStar(ctx, sx, sy, 5, m.faceWidth * 0.045, m.faceWidth * 0.02, i % 2 === 0 ? '#ffd700' : '#ffffff')
  }
  ctx.restore()
}

// 4. Kitty Glam Filter 🐱
function drawCat(ctx, landmarks, width, height) {
  const m = getFaceMetrics(landmarks, width, height)
  const earSize = m.faceWidth * 0.38

  ctx.save()
  ctx.translate(m.forehead.x, m.forehead.y)
  ctx.rotate(m.angle)

  ;[-m.faceWidth * 0.35, m.faceWidth * 0.35].forEach((ox, idx) => {
    const dir = idx === 0 ? -1 : 1
    ctx.save()
    ctx.translate(ox, -m.faceWidth * 0.2)
    ctx.beginPath()
    ctx.moveTo(-earSize * 0.5, earSize * 0.4)
    ctx.lineTo(dir * earSize * 0.1, -earSize * 0.6)
    ctx.lineTo(earSize * 0.5, earSize * 0.4)
    ctx.closePath()
    ctx.fillStyle = '#222222'
    ctx.strokeStyle = '#ffb3c6'
    ctx.lineWidth = Math.max(2, m.faceWidth * 0.015)
    ctx.fill()
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(-earSize * 0.28, earSize * 0.3)
    ctx.lineTo(dir * earSize * 0.08, -earSize * 0.35)
    ctx.lineTo(earSize * 0.28, earSize * 0.3)
    ctx.closePath()
    ctx.fillStyle = '#ff8fa3'
    ctx.fill()
    ctx.restore()
  })
  ctx.restore()

  ctx.save()
  ctx.fillStyle = 'rgba(255, 105, 180, 0.28)'
  ;[m.leftCheek, m.rightCheek].forEach(chk => {
    ctx.beginPath()
    ctx.arc(chk.x, chk.y, m.faceWidth * 0.14, 0, Math.PI * 2)
    ctx.fill()
  })

  ctx.fillStyle = '#ff4d6d'
  ctx.beginPath()
  ctx.moveTo(m.nose.x - m.faceWidth * 0.045, m.nose.y - m.faceWidth * 0.02)
  ctx.lineTo(m.nose.x + m.faceWidth * 0.045, m.nose.y - m.faceWidth * 0.02)
  ctx.lineTo(m.nose.x, m.nose.y + m.faceWidth * 0.035)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = Math.max(1.8, m.faceWidth * 0.012)
  ;[-1, 1].forEach(dir => {
    for (const rise of [-0.03, 0.02, 0.07]) {
      ctx.beginPath()
      ctx.moveTo(m.nose.x + dir * m.faceWidth * 0.07, m.nose.y + rise * m.faceWidth)
      ctx.lineTo(m.nose.x + dir * m.faceWidth * 0.42, m.nose.y + rise * m.faceWidth * 1.6)
      ctx.stroke()
    }
  })
  ctx.restore()
}

// 5. Cool Aviators Sunglasses 🕶️
function drawShades(ctx, landmarks, width, height) {
  const m = getFaceMetrics(landmarks, width, height)
  const glassW = m.faceWidth * 0.38
  const glassH = m.faceWidth * 0.24

  ctx.save()
  ctx.translate(m.eyeMid.x, m.eyeMid.y)
  ctx.rotate(m.angle)

  ctx.strokeStyle = '#f59e0b'
  ctx.lineWidth = Math.max(3, m.faceWidth * 0.02)
  ctx.beginPath()
  ctx.moveTo(-m.faceWidth * 0.1, -glassH * 0.1)
  ctx.quadraticCurveTo(0, -glassH * 0.35, m.faceWidth * 0.1, -glassH * 0.1)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(-m.faceWidth * 0.42, -glassH * 0.42)
  ctx.lineTo(m.faceWidth * 0.42, -glassH * 0.42)
  ctx.stroke()

  ;[-m.faceWidth * 0.24, m.faceWidth * 0.24].forEach(lx => {
    ctx.save()
    ctx.translate(lx, 0)

    const grad = ctx.createLinearGradient(0, -glassH * 0.5, 0, glassH * 0.5)
    grad.addColorStop(0, '#111827')
    grad.addColorStop(0.7, '#1f2937')
    grad.addColorStop(1, '#374151')

    ctx.fillStyle = grad
    ctx.strokeStyle = '#f59e0b'
    ctx.lineWidth = Math.max(2.5, m.faceWidth * 0.016)

    ctx.beginPath()
    ctx.roundRect(-glassW * 0.5, -glassH * 0.45, glassW, glassH, [8, 8, 24, 24])
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'
    ctx.beginPath()
    ctx.moveTo(-glassW * 0.3, -glassH * 0.35)
    ctx.lineTo(-glassW * 0.1, -glassH * 0.35)
    ctx.lineTo(-glassW * 0.25, glassH * 0.25)
    ctx.lineTo(-glassW * 0.45, glassH * 0.25)
    ctx.closePath()
    ctx.fill()

    ctx.restore()
  })
  ctx.restore()
}

// 6. Angel Halo & Aura 😇
function drawHalo(ctx, landmarks, width, height, timestamp) {
  const m = getFaceMetrics(landmarks, width, height)
  const haloW = m.faceWidth * 0.45
  const haloH = m.faceWidth * 0.14
  const bob = Math.sin((timestamp || performance.now()) / 400) * (m.faceWidth * 0.03)

  ctx.save()
  ctx.translate(m.forehead.x, m.forehead.y - m.faceWidth * 0.38 + bob)
  ctx.rotate(m.angle)

  ctx.shadowColor = '#ffd700'
  ctx.shadowBlur = 18
  ctx.strokeStyle = '#fffbeb'
  ctx.lineWidth = Math.max(4, m.faceWidth * 0.03)

  ctx.beginPath()
  ctx.ellipse(0, 0, haloW, haloH, 0, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = '#f59e0b'
  ctx.lineWidth = Math.max(2, m.faceWidth * 0.015)
  ctx.stroke()
  ctx.restore()

  ctx.save()
  ctx.fillStyle = '#ffedd5'
  for (let i = 0; i < 5; i++) {
    const angle = (timestamp || performance.now()) / 600 + (i * Math.PI * 2) / 5
    const sx = m.forehead.x + Math.cos(angle) * m.faceWidth * 0.42
    const sy = m.forehead.y - m.faceWidth * 0.35 + Math.sin(angle) * m.faceWidth * 0.15
    drawStar(ctx, sx, sy, 4, m.faceWidth * 0.03, m.faceWidth * 0.012, '#fef08a')
  }

  ctx.fillStyle = 'rgba(251, 146, 60, 0.22)'
  ;[m.leftCheek, m.rightCheek].forEach(chk => {
    ctx.beginPath()
    ctx.arc(chk.x, chk.y, m.faceWidth * 0.13, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.restore()
}

// 7. Heart Eyes & Love Sparkles 😍
function drawHeartEyes(ctx, landmarks, width, height, timestamp) {
  const m = getFaceMetrics(landmarks, width, height)
  const pulse = 1 + 0.15 * Math.sin((timestamp || performance.now()) / 200)
  const heartSize = m.faceWidth * 0.2 * pulse

  ctx.save()
  ;[m.leftEyeCenter, m.rightEyeCenter].forEach(eye => {
    drawHeart(ctx, eye.x, eye.y, heartSize, '#ef4444')
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(eye.x - heartSize * 0.22, eye.y - heartSize * 0.25, heartSize * 0.1, 0, Math.PI * 2)
    ctx.fill()
  })

  for (let i = 0; i < 4; i++) {
    const t = ((timestamp || performance.now()) / 800 + i * 0.25) % 1
    const hx = m.forehead.x + (i % 2 === 0 ? -1 : 1) * (m.faceWidth * 0.38 + i * 15)
    const hy = m.chin.y - t * m.faceHeight * 1.2
    ctx.globalAlpha = 1 - t
    drawHeart(ctx, hx, hy, m.faceWidth * 0.08, '#f43f5e')
  }
  ctx.restore()
}

// 8. Neon Cyber Devil Horns 😈
function drawDevil(ctx, landmarks, width, height) {
  const m = getFaceMetrics(landmarks, width, height)
  const hornH = m.faceWidth * 0.42
  const hornW = m.faceWidth * 0.16

  ctx.save()
  ctx.translate(m.forehead.x, m.forehead.y - m.faceWidth * 0.04)
  ctx.rotate(m.angle)

  ctx.shadowColor = '#ff0055'
  ctx.shadowBlur = 20

  ;[-m.faceWidth * 0.28, m.faceWidth * 0.28].forEach((ox, idx) => {
    const dir = idx === 0 ? -1 : 1
    ctx.save()
    ctx.translate(ox, 0)
    ctx.beginPath()
    ctx.moveTo(-dir * hornW * 0.5, 0)
    ctx.quadraticCurveTo(dir * hornW * 0.2, -hornH * 0.5, dir * hornW * 1.2, -hornH)
    ctx.quadraticCurveTo(0, -hornH * 0.4, dir * hornW * 0.5, 0)
    ctx.closePath()

    const grad = ctx.createLinearGradient(0, 0, dir * hornW, -hornH)
    grad.addColorStop(0, '#9333ea')
    grad.addColorStop(0.5, '#ec4899')
    grad.addColorStop(1, '#ff0055')

    ctx.fillStyle = grad
    ctx.fill()
    ctx.strokeStyle = '#ffbad6'
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.restore()
  })
  ctx.restore()
}

// 9. Starlight Sparkle Freckles ✨
function drawStarFreckles(ctx, landmarks, width, height, timestamp) {
  const m = getFaceMetrics(landmarks, width, height)

  ctx.save()
  const frecklePositions = [
    { x: m.nose.x, y: m.nose.y - m.faceWidth * 0.05 },
    { x: m.nose.x - m.faceWidth * 0.08, y: m.nose.y - m.faceWidth * 0.02 },
    { x: m.nose.x + m.faceWidth * 0.08, y: m.nose.y - m.faceWidth * 0.02 },
    { x: m.leftCheek.x + m.faceWidth * 0.12, y: m.leftCheek.y - m.faceWidth * 0.05 },
    { x: m.leftCheek.x + m.faceWidth * 0.2, y: m.leftCheek.y },
    { x: m.rightCheek.x - m.faceWidth * 0.12, y: m.rightCheek.y - m.faceWidth * 0.05 },
    { x: m.rightCheek.x - m.faceWidth * 0.2, y: m.rightCheek.y },
  ]

  frecklePositions.forEach((pos, idx) => {
    const twinkle = 0.5 + 0.5 * Math.sin((timestamp || performance.now()) / 250 + idx)
    drawStar(ctx, pos.x, pos.y, 4, m.faceWidth * 0.025 * twinkle, m.faceWidth * 0.008 * twinkle, '#fde047')
  })

  for (let i = 0; i < 5; i++) {
    const angle = (timestamp || performance.now()) / 900 + (i * Math.PI * 2) / 5
    const sx = m.forehead.x + Math.cos(angle) * m.faceWidth * 0.65
    const sy = m.forehead.y + Math.sin(angle) * m.faceHeight * 0.5
    drawStar(ctx, sx, sy, 5, m.faceWidth * 0.05, m.faceWidth * 0.02, i % 2 === 0 ? '#fde047' : '#ffffff')
  }
  ctx.restore()
}

export default function MoodStudio() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const particleCanvasRef = useRef(null)
  const arCanvasRef = useRef(null)
  const particleSystemRef = useRef(null)
  const faceLandmarkerRef = useRef(null)
  const faceAnimationRef = useRef(null)
  const lastVideoTimeRef = useRef(-1)
  const breathingStateRef = useRef(false)
  const affirmationTimerRef = useRef(null)
  
  const [cameraState, setCameraState] = useState('idle')
  const [selected, setSelected] = useState('natural')
  const [activeTab, setActiveTab] = useState(0)
  
  const [breathing, setBreathing] = useState(false)
  const [breathText, setBreathText] = useState('Take a small pause')
  const [selectedBreathPattern, setSelectedBreathPattern] = useState(0)
  
  const [showAffirmation, setShowAffirmation] = useState(false)
  const [currentAffirmation, setCurrentAffirmation] = useState(0)
  
  const [photoBoothActive, setPhotoBoothActive] = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [trackingState, setTrackingState] = useState('idle')

  const currentFilter = FILTER_CATEGORIES.flatMap(c => c.filters).find(f => f.id === selected) || FILTER_CATEGORIES[0].filters[0]

  useEffect(() => {
    return () => {
       streamRef.current?.getTracks().forEach(track => track.stop())
       breathingStateRef.current = false
       if (particleSystemRef.current) particleSystemRef.current.stop()
       cancelAnimationFrame(faceAnimationRef.current)
       faceLandmarkerRef.current?.close?.()
    }
  }, [])

  useEffect(() => {
    if (showAffirmation) {
      affirmationTimerRef.current = setInterval(() => {
        setCurrentAffirmation(prev => (prev + 1) % AFFIRMATIONS.length)
      }, 5000)
    } else {
      clearInterval(affirmationTimerRef.current)
    }
    return () => clearInterval(affirmationTimerRef.current)
  }, [showAffirmation])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !particleCanvasRef.current) return
    const resizeCanvas = () => {
      ;[particleCanvasRef.current, arCanvasRef.current].forEach(canvas => {
        if (canvas) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
        }
      })
    }
    video.addEventListener('loadedmetadata', resizeCanvas)
    return () => video.removeEventListener('loadedmetadata', resizeCanvas)
  }, [])

  useEffect(() => {
     const canvas = particleCanvasRef.current
     if (!canvas) return
     
     if (particleSystemRef.current) {
        particleSystemRef.current.stop()
        particleSystemRef.current = null
     }
     
     if (currentFilter.particle) {
         particleSystemRef.current = new ParticleSystem(canvas, currentFilter.particle)
         particleSystemRef.current.init(currentFilter.particle === 'snow' ? 100 : 40)
         particleSystemRef.current.start()
     } else {
         const ctx = canvas.getContext('2d')
         ctx.clearRect(0, 0, canvas.width, canvas.height)
     }
  }, [currentFilter])

  useEffect(() => {
    const canvas = arCanvasRef.current
    const video = videoRef.current
    cancelAnimationFrame(faceAnimationRef.current)
    if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

    if (!currentFilter.ar || cameraState !== 'ready' || !video) {
      setTrackingState('idle')
      return undefined
    }

    let cancelled = false
    async function beginTracking() {
      setTrackingState('loading')
      try {
        if (!faceLandmarkerRef.current) {
          const vision = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm'
          )
          faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            },
            runningMode: 'VIDEO',
            numFaces: 1,
          })
        }
        if (cancelled) return
        setTrackingState('ready')

        const render = (time) => {
          if (cancelled || !video.videoWidth || !canvas) return
          const context = canvas.getContext('2d')
          context.clearRect(0, 0, canvas.width, canvas.height)
          if (video.currentTime !== lastVideoTimeRef.current) {
            lastVideoTimeRef.current = video.currentTime
            const result = faceLandmarkerRef.current.detectForVideo(video, performance.now())
            const landmarks = result.faceLandmarks?.[0]
            if (landmarks) {
              switch (currentFilter.ar) {
                case 'bunny': drawBunny(context, landmarks, canvas.width, canvas.height); break
                case 'puppy': drawPuppy(context, landmarks, canvas.width, canvas.height); break
                case 'celebrate': drawCelebrate(context, landmarks, canvas.width, canvas.height, time); break
                case 'cat': drawCat(context, landmarks, canvas.width, canvas.height); break
                case 'shades': drawShades(context, landmarks, canvas.width, canvas.height); break
                case 'halo': drawHalo(context, landmarks, canvas.width, canvas.height, time); break
                case 'heart_eyes': drawHeartEyes(context, landmarks, canvas.width, canvas.height, time); break
                case 'devil': drawDevil(context, landmarks, canvas.width, canvas.height); break
                case 'star_freckles': drawStarFreckles(context, landmarks, canvas.width, canvas.height, time); break
                default: break
              }
            }
          }
          faceAnimationRef.current = requestAnimationFrame(render)
        }
        faceAnimationRef.current = requestAnimationFrame(render)
      } catch (error) {
        console.error('Face tracking could not start:', error)
        if (!cancelled) setTrackingState('unavailable')
      }
    }
    beginTracking()
    return () => { cancelled = true; cancelAnimationFrame(faceAnimationRef.current) }
  }, [cameraState, currentFilter])

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) { 
      setCameraState('unsupported')
      return 
    }
    setCameraState('loading')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      streamRef.current = stream
      videoRef.current.srcObject = stream
      setCameraState('ready')
    } catch { 
      setCameraState('denied') 
    }
  }

  function stopCamera() { 
    streamRef.current?.getTracks().forEach(track => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    cancelAnimationFrame(faceAnimationRef.current)
    arCanvasRef.current?.getContext('2d').clearRect(0, 0, arCanvasRef.current.width, arCanvasRef.current.height)
    setTrackingState('idle')
    setCameraState('idle') 
  }

  function captureFrame() {
    const video = videoRef.current
    if (!video?.videoWidth) return null
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')
    
    if (currentFilter.css && currentFilter.css !== 'none') {
      context.filter = currentFilter.css
    }
    
    context.drawImage(video, 0, 0)
    
    if (particleCanvasRef.current && currentFilter.particle) {
        context.drawImage(particleCanvasRef.current, 0, 0)
    }
    if (arCanvasRef.current && currentFilter.ar) {
        context.drawImage(arCanvasRef.current, 0, 0)
    }
    
    return canvas.toDataURL('image/png')
  }

  function captureMoment() {
    const dataUrl = captureFrame();
    if (!dataUrl) return;
    const link = document.createElement('a')
    link.download = `moodmentor-${currentFilter.id}-moment.png`
    link.href = dataUrl
    link.click()
  }

  const sleep = ms => new Promise(r => setTimeout(r, ms))

  async function startPhotoBooth() {
    setPhotoBoothActive(true)
    for (let i = 3; i >= 1; i--) {
      setCountdown(i)
      await sleep(1000)
    }
    setCountdown('📸')
    
    const photos = []
    for (let i = 0; i < 4; i++) {
      photos.push(captureFrame())
      if (i < 3) await sleep(800)
    }
    
    createCollage(photos)
    setCountdown(null)
    setPhotoBoothActive(false)
  }

  async function createCollage(dataUrls) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const imgs = await Promise.all(dataUrls.map(url => {
      return new Promise(resolve => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.src = url
      })
    }))
    
    const w = imgs[0].width
    const h = imgs[0].height
    const padding = 20
    const bottomBar = 60
    
    canvas.width = w * 2 + padding * 3
    canvas.height = h * 2 + padding * 3 + bottomBar
    
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    ctx.drawImage(imgs[0], padding, padding, w, h)
    ctx.drawImage(imgs[1], w + padding * 2, padding, w, h)
    ctx.drawImage(imgs[2], padding, h + padding * 2, w, h)
    ctx.drawImage(imgs[3], w + padding * 2, h + padding * 2, w, h)
    
    ctx.fillStyle = '#333'
    ctx.font = 'bold 30px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('MoodMentor', canvas.width / 2, canvas.height - 20)
    
    const link = document.createElement('a')
    link.download = 'moodmentor-photobooth.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  async function beginBreathing() {
     setBreathing(true)
     breathingStateRef.current = true
     const pattern = BREATH_PATTERNS[selectedBreathPattern]
     const totalRounds = 3
     
     for (let round = 1; round <= totalRounds; round++) {
         if (!breathingStateRef.current) break
         
         setBreathText(`Breathe in · ${pattern.inhale} (Round ${round}/${totalRounds})`)
         await sleep(pattern.inhale * 1000)
         if (!breathingStateRef.current) break
         
         if (pattern.hold) {
            setBreathText(`Hold · ${pattern.hold}`)
            await sleep(pattern.hold * 1000)
            if (!breathingStateRef.current) break
         }
         
         setBreathText(`Breathe out · ${pattern.exhale}`)
         await sleep(pattern.exhale * 1000)
         if (!breathingStateRef.current) break
         
         if (pattern.holdOut) {
            setBreathText(`Hold · ${pattern.holdOut}`)
            await sleep(pattern.holdOut * 1000)
            if (!breathingStateRef.current) break
         }
     }
     
     if (breathingStateRef.current) {
        setBreathText('You gave yourself a pause.')
        setBreathing(false)
     }
  }

  return (
    <section className="studio-layout">
      <article className="studio-stage">
        <div className={`camera-frame filter-${selected}`}>
          <video 
             ref={videoRef} 
             autoPlay 
             muted 
             playsInline 
             className={cameraState === 'ready' ? 'camera-on' : ''} 
             style={{ filter: currentFilter.css !== 'none' ? currentFilter.css : undefined }}
          />
          <canvas 
             ref={particleCanvasRef} 
             className="particle-canvas"
             style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 3, pointerEvents: 'none' }}
          />
          <canvas
             ref={arCanvasRef}
             className="ar-canvas"
             aria-hidden="true"
          />
          
          {showAffirmation && cameraState === 'ready' && (
             <div className="affirmation-overlay" style={{ position: 'absolute', bottom: '10%', left: '50%', transform: 'translateX(-50%)', zIndex: 4, color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.8)', fontSize: '1.25rem', textAlign: 'center', transition: 'opacity 0.5s', width: '90%', fontWeight: '500' }}>
                {AFFIRMATIONS[currentAffirmation]}
             </div>
          )}

          {photoBoothActive && countdown && (
             <div className="countdown-overlay" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 5, fontSize: '6rem', color: 'white', textShadow: '0 4px 12px rgba(0,0,0,0.5)', fontWeight: 'bold' }}>
                {countdown}
             </div>
          )}
          
          <div className="camera-placeholder">
            <span>{cameraState === 'loading' ? '◌' : '✦'}</span>
            <h2>
              {cameraState === 'idle' ? 'A moment for you.' : 
               cameraState === 'loading' ? 'Opening your camera…' : 
               cameraState === 'denied' ? 'Camera permission is needed.' : 
               cameraState === 'unsupported' ? 'Camera is not supported here.' : ''}
            </h2>
            {cameraState !== 'ready' && (
              <p>
                {cameraState === 'denied' ? 'Allow camera access in your browser settings, then try again.' : 
                 'Mood Studio is private: your camera stays on this device.'}
              </p>
            )}
          </div>
          
          {cameraState === 'ready' && (
            <>
              <div className="live-pill"><i /> Private live view</div>
              {currentFilter.ar && <div className={`tracking-pill tracking-${trackingState}`}>{trackingState === 'ready' ? '✦ Face tracking on' : trackingState === 'loading' ? '◌ Loading face effect…' : '⚠ Face effect unavailable'}</div>}
              <div className="filter-label">
                <span>{currentFilter.icon}</span>
                <div>
                  <small>YOUR MOOD LENS</small>
                  <b>{currentFilter.name}</b>
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="studio-controls">
          {cameraState === 'ready' ? (
            <>
              <button className="camera-action secondary" onClick={stopCamera} disabled={photoBoothActive}>Turn off</button>
              <button className="photobooth-btn camera-action" onClick={startPhotoBooth} disabled={photoBoothActive}>📸 Photo Booth</button>
              <button className="camera-shutter" onClick={captureMoment} disabled={photoBoothActive} aria-label="Save a private snapshot"><i /></button>
              <button className="camera-action" onClick={captureMoment} disabled={photoBoothActive}>Save</button>
            </>
          ) : (
            <button className="studio-start" onClick={startCamera} disabled={cameraState === 'loading'}>
              {cameraState === 'loading' ? 'Opening camera…' : 'Enable my camera'} <b>→</b>
            </button>
          )}
        </div>
      </article>
      
      <aside className="studio-panel">
        <div>
          <p className="eyebrow">CHOOSE YOUR LENS</p>
          <h2>Set the tone for this moment.</h2>
          <p className="muted">These filters are visual only. They do not read, store, or diagnose your emotions.</p>
        </div>

        <div className="filter-tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {FILTER_CATEGORIES.map((cat, idx) => (
            <button 
              key={idx} 
              className={`filter-tab ${activeTab === idx ? 'active' : ''}`}
              onClick={() => setActiveTab(idx)}
              style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: activeTab === idx ? '2px solid #333' : '1px solid #ccc', background: activeTab === idx ? '#333' : 'transparent', color: activeTab === idx ? 'white' : 'inherit', cursor: 'pointer', flex: 1, fontWeight: '500' }}
            >
              {cat.icon} {cat.category}
            </button>
          ))}
        </div>
        
        <div className="lens-list" style={{ maxHeight: '280px', overflowY: 'auto' }}>
          {FILTER_CATEGORIES[activeTab].filters.map(filter => (
            <button 
              key={filter.id} 
              className={selected === filter.id ? 'lens-selected' : ''} 
              onClick={() => setSelected(filter.id)}
            >
              <span>{filter.icon}</span>
              <div>
                <b>{filter.name}</b>
                <small>{filter.note}</small>
              </div>
              <i>{selected === filter.id ? '✓' : ''}</i>
            </button>
          ))}
        </div>
        
        <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
           <input 
              type="checkbox" 
              id="affirmation-toggle" 
              className="affirmation-toggle" 
              checked={showAffirmation} 
              onChange={(e) => setShowAffirmation(e.target.checked)} 
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
           />
           <label htmlFor="affirmation-toggle" style={{ fontWeight: '600', cursor: 'pointer' }}>✓ Mirror Affirmations</label>
        </div>

        <div className={`breath-card ${breathing ? 'breathing' : ''}`}>
          <div className="breath-orb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             {breathing ? (
                 <div className="breath-timer-ring" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid currentColor', animation: 'pulse 4s infinite' }}></div>
             ) : '⌁'}
          </div>
          <div style={{ flex: 1 }}>
            <small>BREATHING EXERCISE</small>
            <b>{breathText}</b>
            {!breathing && (
               <select 
                  className="breath-pattern-select" 
                  value={selectedBreathPattern} 
                  onChange={(e) => setSelectedBreathPattern(Number(e.target.value))}
                  style={{ display: 'block', marginTop: '0.5rem', width: '100%', padding: '0.35rem', borderRadius: '6px', border: '1px solid #ccc' }}
               >
                  {BREATH_PATTERNS.map((p, idx) => (
                     <option key={idx} value={idx}>{p.name} - {p.label}</option>
                  ))}
               </select>
            )}
          </div>
          <button onClick={beginBreathing} disabled={breathing}>
            {breathing ? 'Breathing…' : 'Begin'}
          </button>
        </div>
        
        <p className="studio-privacy">⌁ Your video never leaves this browser. Saved moments download only to your device.</p>
      </aside>
    </section>
  )
}
