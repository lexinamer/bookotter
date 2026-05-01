export default function AuthModal({ open, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <p className="label">Save your books</p>

        <h3>
          Create an account to save books.
        </h3>

        <div className="step-actions auth-actions">
          <button className="primary-action" onClick={onConfirm}>
            Sign in with Google
          </button>

          <button className="action" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}