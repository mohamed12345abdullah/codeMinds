'use client';

import { useEffect, useState } from 'react';
import styles from './Notification.module.css';

interface NotificationProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

export const Notification = ({ 
  message, 
  type = 'success', 
  duration = 3000,
  onClose 
}: NotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`${styles.notification} ${styles[type]} ${styles.slideIn}`}>
      {message}
    </div>
  );
}; 