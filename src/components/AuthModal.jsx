export default function AuthModal({ open, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <p className="meta-label">Save your books</p>

        <h3 className="display-title">
          Create an account to save books and build your shelf.
        </h3>

        <div className="step-actions auth-actions">
          <button className="primary-action" onClick={onConfirm}>
            Sign in with Google
          </button>

          <button className="text-action" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}