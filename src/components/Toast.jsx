import { useEffect } from 'react';

export default function Toast({ id, title, message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 4000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };

  return (
    <div className={`toast ${type}`}>
      <i className={`fa-solid ${icons[type] || icons.info} toast-icon`}></i>
      <div className="toast-content">
        <div className="toast-title">{title}</div>
        {message && <div className="toast-message">{message}</div>}
      </div>
      <button className="toast-close" onClick={() => onClose(id)}>
        <i className="fa-solid fa-xmark"></i>
      </button>
    </div>
  );
}
