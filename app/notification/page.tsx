'use client'

import { useState } from 'react';
import styles from './notification.module.css';
import { FiBell, FiCheck, FiTrash2 } from 'react-icons/fi';

interface Notification {
    id: number;
    title: string;
    message: string;
    time: string;
    read: boolean;
}

export default function NotificationPage() {
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: 1,
            title: 'تم تحديث الدورة التدريبية',
            message: 'تم إضافة درس جديد في دورة تطوير الويب المتقدمة',
            time: 'منذ ساعتين',
            read: false
        },
        {
            id: 2,
            title: 'رسالة جديدة',
            message: 'لديك رسالة جديدة من المدرب',
            time: 'منذ 3 ساعات',
            read: true
        },
        {
            id: 3,
            title: 'تذكير',
            message: 'موعد الدرس القادم غداً الساعة 10 صباحاً',
            time: 'منذ يوم',
            read: false
        }
    ]);

    const markAsRead = (id: number) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === id
                    ? { ...notification, read: true }
                    : notification
            )
        );
    };

    const deleteNotification = (id: number) => {
        setNotifications(prev =>
            prev.filter(notification => notification.id !== id)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notification => ({ ...notification, read: true }))
        );
    };

    const clearAll = () => {
        setNotifications([]);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>الإشعارات</h1>
                <div className={styles.actions}>
                    <button onClick={markAllAsRead} className={styles.actionButton}>
                        <FiCheck />
                        تحديد الكل كمقروء
                    </button>
                    <button onClick={clearAll} className={styles.actionButton}>
                        <FiTrash2 />
                        مسح الكل
                    </button>
                </div>
            </div>

            <div className={styles.notificationList}>
                {notifications.length === 0 ? (
                    <div className={styles.emptyState}>
                        <FiBell />
                        <p>لا توجد إشعارات</p>
                    </div>
                ) : (
                    notifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`${styles.notificationItem} ${
                                notification.read ? styles.read : ''
                            }`}
                        >
                            <div className={styles.notificationContent}>
                                <h3>{notification.title}</h3>
                                <p>{notification.message}</p>
                                <span className={styles.time}>{notification.time}</span>
                            </div>
                            <div className={styles.notificationActions}>
                                {!notification.read && (
                                    <button
                                        onClick={() => markAsRead(notification.id)}
                                        className={styles.markAsReadButton}
                                    >
                                        <FiCheck />
                                        تحديد كمقروء
                                    </button>
                                )}
                                <button
                                    onClick={() => deleteNotification(notification.id)}
                                    className={styles.deleteButton}
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
} 