'use client'

import { useState } from 'react';
import styles from './dashboard.module.css';
import Navbar from '../components/Navbar';

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState('overview');

    const stats = {
        totalStudents: 1234,
        activeCourses: 15,
        totalRevenue: '$45,678',
        completionRate: '78%'
    };

    const recentActivities = [
        { id: 1, type: 'enrollment', course: 'Web Development', student: 'John Doe', date: '2024-03-15' },
        { id: 2, type: 'completion', course: 'Data Science', student: 'Jane Smith', date: '2024-03-14' },
        { id: 3, type: 'payment', course: 'Mobile Development', student: 'Mike Johnson', date: '2024-03-13' }
    ];

    return (
        <>
        <Navbar />
            <div className={styles.container}>
            <div className={styles.sidebar}>
                <nav className={styles.navigation}>
                    <button 
                        className={`${styles.navButton} ${activeTab === 'overview' ? styles.active : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button 
                        className={`${styles.navButton} ${activeTab === 'courses' ? styles.active : ''}`}
                        onClick={() => setActiveTab('courses')}
                    >
                        Courses
                    </button>
                    <button 
                        className={`${styles.navButton} ${activeTab === 'students' ? styles.active : ''}`}
                        onClick={() => setActiveTab('students')}
                    >
                        Students
                    </button>
                    <button 
                        className={`${styles.navButton} ${activeTab === 'revenue' ? styles.active : ''}`}
                        onClick={() => setActiveTab('revenue')}
                    >
                        Revenue
                    </button>
                </nav>
            </div>

            <main className={styles.mainContent}>
                {activeTab === 'overview' && (
                    <div className={styles.overview}>
                        <h1>Dashboard Overview</h1>
                        
                        <div className={styles.statsGrid}>
                            <div className={styles.statCard}>
                                <h3>Total Students</h3>
                                <p>{stats.totalStudents}</p>
                            </div>
                            <div className={styles.statCard}>
                                <h3>Active Courses</h3>
                                <p>{stats.activeCourses}</p>
                            </div>
                            <div className={styles.statCard}>
                                <h3>Total Revenue</h3>
                                <p>{stats.totalRevenue}</p>
                            </div>
                            <div className={styles.statCard}>
                                <h3>Completion Rate</h3>
                                <p>{stats.completionRate}</p>
                            </div>
                        </div>

                        <div className={styles.recentActivity}>
                            <h2>Recent Activity</h2>
                            <div className={styles.activityList}>
                                {recentActivities.map(activity => (
                                    <div key={activity.id} className={styles.activityItem}>
                                        <div className={styles.activityInfo}>
                                            <span className={styles.activityType}>{activity.type}</span>
                                            <span className={styles.activityCourse}>{activity.course}</span>
                                            <span className={styles.activityStudent}>{activity.student}</span>
                                        </div>
                                        <span className={styles.activityDate}>{activity.date}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'courses' && (
                    <div className={styles.courses}>
                        <h1>Course Management</h1>
                        <button className={styles.addButton}>Add New Course</button>
                        {/* Course management content */}
                    </div>
                )}

                {activeTab === 'students' && (
                    <div className={styles.students}>
                        <h1>Student Management</h1>
                        <div className={styles.searchBar}>
                            <input type="text" placeholder="Search students..." />
                        </div>
                        {/* Student management content */}
                    </div>
                )}

                {activeTab === 'revenue' && (
                    <div className={styles.revenue}>
                        <h1>Revenue Analytics</h1>
                        <div className={styles.revenueChart}>
                            {/* Revenue chart will go here */}
                        </div>
                        {/* Revenue management content */}
                    </div>
                )}
            </main>
        </div>  
        </>
    );
} 