export default function AuthModal({ open, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,13,11,0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 800
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          padding: '2rem',
          margin: '1.5rem'
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--ink-mid)',
            marginBottom: '1rem'
          }}
        >
          Save your books
        </p>

        <h3
          style={{
            fontSize: '1.5rem',
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 1.2,
            marginBottom: '1rem'
          }}
        >
          Create an account to save books and build your shelf.
        </h3>

        <div className="step-actions" style={{ marginTop: '2rem' }}>
          <button id="hero-btn" onClick={onConfirm}>
            Sign in with Google
          </button>

          <button className="btn-start-over" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}