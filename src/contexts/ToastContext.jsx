import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <div className="toast-icon">
              {toast.type === 'success' && <CheckCircle size={20} />}
              {toast.type === 'error' && <AlertCircle size={20} />}
              {toast.type === 'info' && <Info size={20} />}
            </div>
            <span className="toast-message">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="toast-close">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      <style>{`
        .toast-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 99999;
          pointer-events: none; /* Allow clicks through container */
        }
        
        .toast {
          pointer-events: auto;
          min-width: 300px;
          background: rgba(20, 20, 20, 0.95);
          backdrop-filter: blur(10px);
          color: #fff;
          padding: 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1), fadeOut 0.3s ease-in forwards;
          animation-delay: 0s, var(--duration); /* We can't easily do CSS-only exit animation with simple React unmount without framer-motion, so just slideIn for now */
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .toast-success { border-left: 4px solid #0fb59a; }
        .toast-error { border-left: 4px solid #ff6b6b; }
        .toast-info { border-left: 4px solid #3b82f6; }

        .toast-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .toast-success .toast-icon { color: #0fb59a; }
        .toast-error .toast-icon { color: #ff6b6b; }
        .toast-info .toast-icon { color: #3b82f6; }

        .toast-message {
          flex: 1;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .toast-close {
          background: transparent;
          border: none;
          color: #888;
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .toast-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
