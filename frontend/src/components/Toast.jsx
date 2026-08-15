import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const Toast = ({ id, message, type = 'info', duration = 5000, onClose, position = 'top-right' }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration === 0) return;
    
    const startTime = Date.now();
    const endTime = startTime + duration;
    
    const updateProgress = () => {
      const now = Date.now();
      const remaining = endTime - now;
      const newProgress = (remaining / duration) * 100;
      
      if (newProgress <= 0) {
        onClose(id);
      } else {
        setProgress(newProgress);
        requestAnimationFrame(updateProgress);
      }
    };
    
    const animationFrame = requestAnimationFrame(updateProgress);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [duration, id, onClose]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info
  };

  const styles = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-800 dark:text-green-200',
      icon: 'text-green-500',
      progress: 'bg-green-500'
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-200',
      icon: 'text-red-500',
      progress: 'bg-red-500'
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-800 dark:text-yellow-200',
      icon: 'text-yellow-500',
      progress: 'bg-yellow-500'
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-800 dark:text-blue-200',
      icon: 'text-blue-500',
      progress: 'bg-blue-500'
    }
  };

  const Icon = icons[type];
  const style = styles[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`relative overflow-hidden rounded-lg border shadow-lg ${style.bg} ${style.border} min-w-[320px] max-w-[480px]`}
    >
      <div className="flex items-start gap-3 p-4">
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${style.icon}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${style.text}`}>
            {message}
          </p>
        </div>
        <button
          onClick={() => onClose(id)}
          className={`flex-shrink-0 rounded-lg p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10 ${style.text}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Progress bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 dark:bg-white/5">
          <motion.div
            className={`h-full ${style.progress}`}
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />
        </div>
      )}
    </motion.div>
  );
};

export default Toast;
