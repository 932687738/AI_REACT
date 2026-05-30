export default function FeedbackModal({
  open,
  title,
  message,
  variant = 'success',
  confirmLabel,
  onClose,
  children,
}) {
  if (!open) {
    return null
  }

  return (
    <div className="feedback-modal" role="dialog" aria-modal="true" aria-labelledby="feedback-modal-title">
      <button type="button" className="feedback-modal__backdrop" aria-label="close" onClick={onClose} />
      <div className={`feedback-modal__panel feedback-modal__panel--${variant}`}>
        <h3 id="feedback-modal-title" className="feedback-modal__title">
          {title}
        </h3>
        {message ? <p className="feedback-modal__message">{message}</p> : null}
        {children ? <div className="feedback-modal__body">{children}</div> : null}
        <div className="feedback-modal__actions">
          <button type="button" className="feedback-modal__confirm" onClick={onClose}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
