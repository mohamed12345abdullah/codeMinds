'use client'

import { useState, useEffect } from 'react';
import styles from './profile.module.css';
import Navbar from '../components/Navbar';
import { FiUser, FiBook, FiVideo, FiCalendar, FiChevronDown } from 'react-icons/fi';
import { verifyTokenApi } from '../apis/auth';
import { useRouter } from 'next/navigation';

interface VerifyTokenResponse {
    success: boolean;
    message?: string;
}

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
    const [isLoading, setIsLoading] = useState(true);
    const [openVideo, setOpenVideo] = useState<{ [lectureId: string]: number | null }>({});
    const router = useRouter();

    useEffect(() => {
        // التقاط التوكن وبيانات المستخدم من الرابط وتخزينهم في localStorage
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const userParam = params.get('user');
        if (token) {
            localStorage.setItem('token', token);
            if (userParam) {
                try {
                    const user = JSON.parse(decodeURIComponent(userParam));
                    localStorage.setItem('user', JSON.stringify(user));
                } catch (e) {}
            }
            // تحقق من التوكن وجلب بيانات المستخدم من السيرفر
            (async () => {
                await verifyTokenApi();
                // إعادة تحميل الصفحة لإزالة التوكن من الرابط وتحديث الحالة
                window.location.replace('/profile');
            })();
        }
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setIsLoading(true);
                const verified = await verifyTokenApi();
                if (!verified) {
                    router.push('/login');
                    return;
                }
                const user = JSON.parse(localStorage.getItem("user") || '{}');
                setUserInfo(user);
            } catch (error) {
                console.error('Error verifying token:', error);
                router.push('/login');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [router]);

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

    // Helper to get embeddable URL
    const getEmbedUrl = (url: string) => {
        // YouTube
        const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
        if (ytMatch) {
            return `https://www.youtube.com/embed/${ytMatch[1]}`;
        }
        // Google Drive
        const gdMatch = url.match(/drive\.google\.com\/file\/d\/([\w-]+)\/?.*/);
        if (gdMatch) {
            return `https://drive.google.com/file/d/${gdMatch[1]}/preview`;
        }
        // Default fallback
        return url;
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
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <FiUser />
                            معلومات المستخدم
                          </h2>
                          {userInfo?.role === 'instructor' && (
                            <button
                              className={styles.dashboardBtn}
                              onClick={() => router.push('/instructors/dashboard')}
                              style={{ marginRight: 0 }}
                            >
                              لوحة تحكم المحاضر
                            </button>
                          )}
                          {(userInfo?.role === 'admin' || userInfo?.role === 'manager') && (
                            <button
                              className={styles.dashboardBtn}
                              onClick={() => router.push('/dashboard')}
                              style={{ marginRight: 0 }}
                            >
                              لوحة تحكم المدير
                            </button>
                          )}
                        </div>
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
                                                                        <div key={index}>
                                                                            <button
                                                                                type="button"
                                                                                className={styles.videoLink}
                                                                                onClick={() => setOpenVideo((prev) => ({ ...prev, [lecture._id]: prev[lecture._id] === index ? null : index }))}
                                                                                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                                                                            >
                                                                                <FiVideo />
                                                                                فيديو {index + 1}
                                                                            </button>
                                                                            {openVideo[lecture._id] === index && (
                                                                                <div className={styles.responsiveIframeWrapper}>
                                                                                    <iframe
                                                                                        src={getEmbedUrl(video)}
                                                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                                        allowFullScreen
                                                                                        title={`lecture-video-${index}`}
                                                                                        style={{ border: 0 }}
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        </div>
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