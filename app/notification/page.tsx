'use client'

import { useEffect, useState } from "react";
import { Notification } from '../components/Notification';

export default function NotificationPage({text}: {text?: string}) {
    const [isVisible, setIsVisible] = useState(true);
    const [message, setMessage] = useState(text);

    useEffect(() => {
        if (text) {
            setMessage(text);
            setIsVisible(true);
            
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [text]);

    if (!isVisible || !message) return null;

    return (
        <Notification
            message={message}
            type={message.includes('successful') ? 'success' : 'error'}
            duration={3000}
        />
    );
} 