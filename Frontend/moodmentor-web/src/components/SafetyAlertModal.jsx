import React, { useState } from 'react'
import { request } from '../api'

export default function SafetyAlertModal({ safetyData, token, onDismiss }) {
  const [notifying, setNotifying] = useState(false)
  const [notified, setNotified] = useState(false)
  const [notifyError, setNotifyError] = useState('')

  const handleNotifyContact = async () => {
    setNotifying(true)
    setNotifyError('')
    try {
      await request('/safety/notify', {
        method: 'POST',
        token,
        body: { reason: 'User requested safety support' },
      })
      setNotified(true)
    } catch (err) {
      setNotifyError(err.message || 'Could not send notification. Please call directly.')
    } finally {
      setNotifying(false)
    }
  }

  return (
    <div className="safety-modal-overlay" role="alertdialog" aria-modal="true" aria-labelledby="safety-title">
      <div className="safety-modal-card">
        <div className="safety-icon-header">🛡️💚</div>
        <h2 id="safety-title">We're concerned about your immediate safety.</h2>
        <p className="safety-subtitle">
          What you're going through sounds difficult. Please consider reaching out to someone you trust or contacting a 24/7 crisis support service right now.
        </p>

        <div className="safety-emergency-grid">
          {/* National Helpline */}
          <a href="tel:18005990019" className="safety-action-card helpline">
            <span className="safety-card-icon">📞</span>
            <div className="safety-card-text">
              <b>KIRAN Mental Health Helpline</b>
              <span>1800-599-0019 · Free, 24/7, 13 Languages</span>
            </div>
            <span className="safety-call-btn">Call Now →</span>
          </a>

          {/* Emergency Services */}
          <a href="tel:112" className="safety-action-card emergency">
            <span className="safety-card-icon">🚨</span>
            <div className="safety-card-text">
              <b>National Emergency Services</b>
              <span>112 · Immediate Police / Medical</span>
            </div>
            <span className="safety-call-btn">Call 112 →</span>
          </a>

          {/* Trusted Contact Option if available */}
          {safetyData?.contact_available && (
            <div className="safety-contact-box">
              <div className="safety-contact-info">
                <span className="safety-card-icon">👥</span>
                <div>
                  <b>Trusted Contact: {safetyData.contact_name}</b>
                  <span>A designated person you trust to support you.</span>
                </div>
              </div>

              {!notified ? (
                <button
                  className="safety-notify-btn"
                  onClick={handleNotifyContact}
                  disabled={notifying}
                >
                  {notifying ? 'Sending check-in notice…' : `Send Check-in Alert to ${safetyData.contact_name}`}
                </button>
              ) : (
                <div className="safety-notified-banner">
                  ✓ Privacy-preserving check-in notice sent to {safetyData.contact_name}. (No private notes were shared).
                </div>
              )}
              {notifyError && <small className="safety-error">{notifyError}</small>}
            </div>
          )}
        </div>

        <div className="safety-disclaimer">
          <small>
            ℹ️ <b>Important Safety Principle:</b> MoodMentor is an emotional wellness companion and not a medical or emergency diagnostic service. If you are in immediate danger, please contact 112 or local emergency services.
          </small>
        </div>

        <div className="safety-footer-actions">
          <button className="med-btn-ghost" onClick={onDismiss}>
            I'm safe right now (Close)
          </button>
        </div>
      </div>
    </div>
  )
}
