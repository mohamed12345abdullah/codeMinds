'use client';

import { ReactNode } from 'react';
import { NotificationProvider } from '../context/NotificationContext';
import ToastContainer from './ToastContainer';

interface ClientLayoutProps {
    children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
    return (
        <NotificationProvider>
            {children}
            <ToastContainer />
        </NotificationProvider>
    );
} 