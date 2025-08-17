'use client';

import { useRouter } from "next/navigation";
import { FiBook, FiUsers, FiLayers, FiCreditCard } from 'react-icons/fi';
import styles from './dashboard.module.css';
import NavbarPage from "../components/Navbar";

export default function DashboardPage() {
    const router = useRouter();

    const dashboardItems = [
        {
            title: "الدورات",
            description: "إدارة الدورات التعليمية",
            icon: <FiBook />,
            path: '/dashboard/courses',
            color: '#4CAF50'
        },
        {
            title: "الطلاب",
            description: "إدارة الطلاب المسجلين",
            icon: <FiUsers />,
            path: '/dashboard/students',
            color: '#2196F3'
        },
        {
            title: "المجموعات",
            description: "إدارة المجموعات الدراسية",
            icon: <FiLayers />,
            path: '/dashboard/groups',
            color: '#9C27B0'
        },
        {
            title: "الاشتراكات",
            description: "إدارة اشتراكات الطلاب",
            icon: <FiCreditCard />,
            path: '/dashboard/subscriptions',
            color: '#FF9800'
        },
        {
            title: "groups on lovable",
            description: "show all groups",
            icon: <FiCreditCard />,
            path: `https://code-camp-companion.lovable.app/?token=${localStorage.getItem('token')}`,
            color: '#FF9800'
        }
    ];

    return (
        <>

        <NavbarPage/>
        
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>لوحة التحكم</h1>
                <p>مرحباً بك في لوحة تحكم منصة Code Minds</p>
            </div>

            <div className={styles.grid}>
                {dashboardItems.map((item, index) => (
                    <div 
                        key={index} 
                        className={styles.card}
                        onClick={() => router.push(item.path)}
                        style={{ '--card-color': item.color } as React.CSSProperties}
                    >
                        <div className={styles.iconWrapper}>
                            {item.icon}
                        </div>
                        <div className={styles.content}>
                            <h2>{item.title}</h2>
                            <p>{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        </>
    );
}