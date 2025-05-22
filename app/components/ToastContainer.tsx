'use client';

import { useNotification } from '../context/NotificationContext';
import Toast from './Toast';
import styles from './ToastContainer.module.css';

export default function ToastContainer() {
    const { notifications, removeNotification } = useNotification();

    return (
        <div className={styles.container}>
            {notifications.map((notification) => (
                <Toast
                    key={notification.id}
                    message={notification.message}
                    type={notification.type}
                    duration={notification.duration}
                    onClose={() => removeNotification(notification.id)}
                />
            ))}
        </div>
    );
} 