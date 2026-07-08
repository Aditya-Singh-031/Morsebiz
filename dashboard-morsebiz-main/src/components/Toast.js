'use client';

import { useToast } from '@/contexts/ToastContext';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useCallback } from 'react';

const Toast = () => {
  const { toasts, removeToast } = useToast();
  const [visibleToasts, setVisibleToasts] = useState([]);

  useEffect(() => {
    setVisibleToasts(prev => {
      // First, remove toasts that are no longer in the main list
      const filteredToasts = prev.filter(toast => toasts.find(t => t.id === toast.id));
      
      // Then, add new toasts
      const newToasts = toasts.filter(toast => !filteredToasts.find(t => t.id === toast.id));
      const updatedToasts = [...filteredToasts, ...newToasts.map(toast => ({ ...toast, isVisible: false }))];
      
      // Trigger animation for new toasts
      newToasts.forEach(toast => {
        setTimeout(() => {
          setVisibleToasts(current => 
            current.map(t => t.id === toast.id ? { ...t, isVisible: true } : t)
          );
        }, 50);
      });
      
      return updatedToasts;
    });
  }, [toasts]);

  const handleRemove = (toastId) => {
    // First animate out
    setVisibleToasts(prev => 
      prev.map(t => t.id === toastId ? { ...t, isVisible: false } : t)
    );
    // Then remove after animation
    setTimeout(() => {
      removeToast(toastId);
    }, 300);
  };

  if (visibleToasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {visibleToasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg border-2 backdrop-blur-sm transition-all duration-300 ease-in-out transform",
            toast.isVisible 
              ? "translate-x-0 opacity-100 scale-100" 
              : "translate-x-full opacity-0 scale-95",
            toast.type === 'success' 
              ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-100" 
              : "bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-100"
          )}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          )}
          
          <span className="flex-1 text-sm font-medium">{toast.message}</span>
          
          <button
            onClick={() => handleRemove(toast.id)}
            className={cn(
              "p-1 rounded-full hover:bg-opacity-20 transition-colors",
              toast.type === 'success' 
                ? "hover:bg-green-600 hover:bg-opacity-20 dark:hover:bg-green-400 dark:hover:bg-opacity-20" 
                : "hover:bg-red-600 hover:bg-opacity-20 dark:hover:bg-red-400 dark:hover:bg-opacity-20"
            )}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;