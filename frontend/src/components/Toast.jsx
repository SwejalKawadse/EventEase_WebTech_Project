import React from 'react';

function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  return (
    <div className="toast-container">
      <div className={`toast toast-${type}`}>
        <span className="material-symbols-outlined" style={{ color: type === 'success' ? 'var(--secondary-sage)' : 'var(--error-red)' }}>
          {type === 'success' ? 'check_circle' : 'error'}
        </span>
        <span style={{ fontWeight: 500 }}>{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: '1rem',
            }}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

export default Toast;
