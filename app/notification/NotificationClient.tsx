'use client'

import { useEffect, useState } from "react";
import { Notification } from '../components/Notification';

type Props = {
    initialText?: string
}

export default function NotificationPage({
    initialText,
}: Props) {
    const [isVisible, setIsVisible] = useState(true);
    const [message, setMessage] = useState(initialText);

    useEffect(() => {
        if (initialText) {
            setMessage(initialText);
            setIsVisible(true);
            
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [initialText]);

    if (!isVisible || !message) return null;

    return (
        <Notification
            message={message}
            type={message.includes('successful') ? 'success' : 'error'}
            duration={3000}
        />
    );
} 