'use client';

import { useEffect, useState } from 'react';
import { FiCheck, FiX, FiInfo } from 'react-icons/fi';
import styles from './Toast.module.css';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for fade out animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <FiCheck />;
            case 'error':
                return <FiX />;
            case 'info':
                return <FiInfo />;
            default:
                return null;
        }
    };

    return (
        <div className={`${styles.toast} ${styles[type]} ${isVisible ? styles.visible : ''}`}>
            <div className={styles.icon}>{getIcon()}</div>
            <p className={styles.message}>{message}</p>
            <button className={styles.closeButton} onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
            }}>
                <FiX />
            </button>
        </div>
    );
} 