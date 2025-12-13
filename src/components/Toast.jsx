import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          wrapper: 'bg-green-50 border-green-200 text-green-800',
          iconBg: 'bg-green-100 text-green-600',
          icon: <CheckCircle size={20} />
        };
      case 'error':
        return {
          wrapper: 'bg-red-50 border-red-200 text-red-800',
          iconBg: 'bg-red-100 text-red-600',
          icon: <AlertCircle size={20} />
        };
      case 'warning':
        return {
          wrapper: 'bg-orange-50 border-orange-200 text-orange-800',
          iconBg: 'bg-orange-100 text-orange-600',
          icon: <AlertTriangle size={20} />
        };
      default:
        return {
          wrapper: 'bg-blue-50 border-blue-200 text-blue-800',
          iconBg: 'bg-blue-100 text-blue-600',
          icon: <Info size={20} />
        };
    }
  };

  const config = getToastConfig();

  return createPortal(
    <div className={`fixed bottom-24 md:bottom-6 right-6 z-[9999] max-w-[90vw] md:max-w-md w-full animate-fade-in-up flex items-center gap-3 p-4 rounded-2xl shadow-2xl border ${config.wrapper}`}>
       <div className={`p-2 rounded-full flex-shrink-0 ${config.iconBg}`}>
           {config.icon}
       </div>
       <p className="flex-1 font-medium text-sm md:text-base leading-snug">
           {message}
       </p>
       <button 
         onClick={onClose}
         className="p-1 opacity-60 hover:opacity-100 transition-opacity"
       >
         <X size={18} />
       </button>
    </div>,
    document.body
  );
};

export default Toast;
