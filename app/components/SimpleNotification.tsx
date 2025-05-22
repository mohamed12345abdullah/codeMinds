'use client';

import { useEffect, useState } from 'react';
import styles from './SimpleNotification.module.css';

interface SimpleNotificationProps {
    text: string;
}

export default function SimpleNotification({ text }: SimpleNotificationProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <div className={styles.notification}>
            {text}
        </div>
    );
} 