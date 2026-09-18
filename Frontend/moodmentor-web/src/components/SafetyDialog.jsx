import { useResource } from '../lib/hooks'
import { Dialog, Button, Icon, ErrorState, Loading } from './ui'
export default function SafetyDialog({ safety, onClose }) {
  const contact = useResource('/safety/contact')
  const phone = (contact.data?.phone || '').replace(/[^+\d]/g, '')
  return (
    <Dialog title="You deserve support." onClose={onClose}>
      <div className="safety-content">
        <span className="support-icon">
          <Icon name="shield" size={32} />
        </span>
        <p>
          {safety.guidance ||
            'If things feel difficult, reaching out to a trusted person or a professional can be a useful next step.'}
        </p>
        <p className="quiet-note">
          Automated text checks can miss or misread distress. They are not a
          clinical assessment. If you may be in immediate danger, contact local
          emergency services.
        </p>
        <div className="support-links">
          <a href="tel:112">
            <b>Emergency help in India</b>
            <span>Call 112 ↗</span>
          </a>
          <a href="tel:14416">
            <b>Tele-MANAS · India</b>
            <span>Call 14416 ↗</span>
          </a>
          <a href="https://findahelpline.com/" target="_blank" rel="noreferrer">
            <b>Outside India?</b>
            <span>Find local support ↗</span>
          </a>
        </div>
        {contact.loading ? (
          <Loading />
        ) : contact.error ? (
          <ErrorState error={contact.error} retry={contact.reload} />
        ) : contact.data ? (
          <div className="trusted-card">
            <h3>{contact.data.name}</h3>
            <p>Your saved trusted contact</p>
            <a className="btn btn-secondary" href={`tel:${phone}`}>
              Call {phone}
            </a>
            <p className="quiet-note">
              This opens your calling app. MoodMentor has not contacted anyone.
            </p>
          </div>
        ) : (
          <p>No trusted contact is saved. You can add one in Settings.</p>
        )}
        <Button variant="secondary" onClick={onClose}>
          Close support options
        </Button>
      </div>
    </Dialog>
  )
}
