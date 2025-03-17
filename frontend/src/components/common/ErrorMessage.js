import React from 'react';

const ErrorMessage = ({ message, onClose }) => {
  if (!message) return null;
  
  return (
    <div className="error-container">
      <div className="error-content">
        <span className="error-icon">⚠️</span>
        <p className="error-text">{message}</p>
        {onClose && (
          <button className="error-close" onClick={onClose}>
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
