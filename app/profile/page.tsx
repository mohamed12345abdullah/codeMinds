'use client'

import { useState, useEffect } from 'react';
import styles from './profile.module.css';
import Navbar from '../components/Navbar';
import { FiUser, FiBook, FiVideo, FiCalendar, FiChevronDown } from 'react-icons/fi';
import { verifyTokenApi } from '../apis/auth';

interface Lecture {
    _id: string;
    title: string;
    date: string;
    description: string;
    videos: string[];
    objectives: string[];
}

interface Group {
    _id: string;
    title: string;
    startDate: string;
    endDate: string;
    lectures: Lecture[];
}

interface Course {
    _id: string;
    title: string;
}

interface UserInfo {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    profileRef: {
        _id: string;
        age: number;
        gender: string;
        courses: Course[];
        groups: Group[];
    };
}

export default function ProfilePage() {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [expandedLectures, setExpandedLectures] = useState<Set<string>>(new Set());

    useEffect(() => {
        verifyTokenApi();
        const user = JSON.parse(localStorage.getItem("user") || '{}');
        setUserInfo(user);
    }, []);

    const toggleGroup = (groupId: string) => {
        const newExpandedGroups = new Set(expandedGroups);
        if (newExpandedGroups.has(groupId)) {
            newExpandedGroups.delete(groupId);
        } else {
            newExpandedGroups.add(groupId);
        }
        setExpandedGroups(newExpandedGroups);
    };

    const toggleLecture = (lectureId: string) => {
        const newExpandedLectures = new Set(expandedLectures);
        if (newExpandedLectures.has(lectureId)) {
            newExpandedLectures.delete(lectureId);
        } else {
            newExpandedLectures.add(lectureId);
        }
        setExpandedLectures(newExpandedLectures);
    };

    if (!userInfo) {
        return (
            <>
                <Navbar />
                <div className={styles.container}>
                    <div className={styles.loading}>جاري التحميل...</div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className={styles.container}>
                <div className={styles.profileHeader}>
                    <h1>الملف الشخصي</h1>
                </div>

                <div className={styles.profileContent}>
                    {/* User Info Section */}
                    <div className={styles.section}>
                        <h2>
                            <FiUser />
                            معلومات المستخدم
                        </h2>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <label>الاسم</label>
                                <p>{userInfo.name}</p>
                            </div>
                            <div className={styles.infoItem}>
                                <label>البريد الإلكتروني</label>
                                <p>{userInfo.email}</p>
                            </div>
                            <div className={styles.infoItem}>
                                <label>رقم الهاتف</label>
                                <p>{userInfo.phone}</p>
                            </div>
                            <div className={styles.infoItem}>
                                <label>العمر</label>
                                <p>{userInfo.profileRef?.age}</p>
                            </div>
                            <div className={styles.infoItem}>
                                <label>الجنس</label>
                                <p>{userInfo.profileRef?.gender}</p>
                            </div>
                            <div className={styles.infoItem}>
                                <label>نوع الحساب</label>
                                <p>{userInfo.role}</p>
                            </div>
                        </div>
                    </div>

                    {/* Groups Section */}
                    <div className={styles.section}>
                        <h2>
                            <FiBook />
                            المجموعات المسجلة
                        </h2>
                        <div className={styles.groupsList}>
                            {userInfo.profileRef?.groups?.map((group) => (
                                <div key={group._id} className={styles.groupCard}>
                                    <div 
                                        className={styles.groupHeader}
                                        onClick={() => toggleGroup(group._id)}
                                    >
                                        <h3>
                                            <FiBook />
                                            {group.title}
                                        </h3>
                                        <div className={styles.groupDates}>
                                            <span>
                                                <FiCalendar />
                                                تاريخ البدء: {new Date(group.startDate).toLocaleDateString('ar-EG')}
                                            </span>
                                            <span>
                                                <FiCalendar />
                                                تاريخ الانتهاء: {new Date(group.endDate).toLocaleDateString('ar-EG')}
                                            </span>
                                        </div>
                                        <FiChevronDown 
                                            className={`${styles.toggleIcon} ${expandedGroups.has(group._id) ? styles.expanded : ''}`}
                                        />
                                    </div>

                                    <div className={`${styles.groupContent} ${expandedGroups.has(group._id) ? styles.expanded : ''}`}>
                                        <div className={styles.lecturesList}>
                                            <h4>المحاضرات</h4>
                                            {group.lectures.map((lecture) => (
                                                <div key={lecture._id} className={styles.lectureCard}>
                                                    <div 
                                                        className={styles.lectureHeader}
                                                        onClick={() => toggleLecture(lecture._id)}
                                                    >
                                                        <h5>
                                                            <FiVideo />
                                                            {lecture.title}
                                                        </h5>
                                                        <span className={styles.lectureDate}>
                                                            <FiCalendar />
                                                            {new Date(lecture.date).toLocaleDateString('ar-EG')}
                                                        </span>
                                                        <FiChevronDown 
                                                            className={`${styles.toggleIcon} ${expandedLectures.has(lecture._id) ? styles.expanded : ''}`}
                                                        />
                                                    </div>
                                                    
                                                    <div className={`${styles.lectureContent} ${expandedLectures.has(lecture._id) ? styles.expanded : ''}`}>
                                                        <p className={styles.lectureDescription}>{lecture.description}</p>
                                                        
                                                        {lecture.videos.length > 0 && (
                                                            <div className={styles.videosList}>
                                                                <h6>
                                                                    <FiVideo />
                                                                    الفيديوهات
                                                                </h6>
                                                                <div className={styles.videoLinks}>
                                                                    {lecture.videos.map((video, index) => (
                                                                        <a 
                                                                            key={index}
                                                                            href={video}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className={styles.videoLink}
                                                                        >
                                                                            <FiVideo />
                                                                            فيديو {index + 1}
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {lecture.objectives.length > 0 && (
                                                            <div className={styles.objectivesList}>
                                                                <h6>الأهداف</h6>
                                                                <ul>
                                                                    {lecture.objectives.map((objective, index) => (
                                                                        <li key={index}>{objective}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}