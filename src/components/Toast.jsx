import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Toast = ({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose 
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'var(--success-light)',
          border: 'var(--success)',
          icon: <CheckCircle size={20} color="var(--success-dark)" />
        };
      case 'error':
        return {
          bg: 'var(--error-light)',
          border: 'var(--error)',
          icon: <AlertCircle size={20} color="var(--error-dark)" />
        };
      case 'warning':
        return {
          bg: 'var(--warning-light)',
          border: 'var(--warning)',
          icon: <AlertTriangle size={20} color="var(--warning-dark)" />
        };
      default:
        return {
          bg: 'var(--info-light)',
          border: 'var(--info)',
          icon: <Info size={20} color="var(--info-dark)" />
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div
      className="animate-fade-in-up"
      style={{
        position: 'fixed',
        bottom: 'var(--space-6)',
        right: 'var(--space-6)',
        zIndex: 9999,
        background: styles.bg,
        border: `2px solid ${styles.border}`,
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        minWidth: '300px',
        maxWidth: '500px',
      }}
    >
      {styles.icon}
      <p style={{ flex: 1, margin: 0, fontWeight: 'var(--font-medium)' }}>
        {message}
      </p>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 'var(--space-1)',
          display: 'flex',
          alignItems: 'center',
          opacity: 0.6,
          transition: 'var(--transition-opacity)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.6)}
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default Toast;
