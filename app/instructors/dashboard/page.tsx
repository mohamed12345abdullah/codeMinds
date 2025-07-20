'use client'

// local url
// const baseUrl = "http://localhost:4000/api";

// production url
const baseUrl = "https://code-minds-website.vercel.app/api";

import { useState, useEffect, useRef } from 'react';
import styles from './dashboardInstructor.module.css';
import { FiUsers, FiBook, FiPlus, FiEdit2, FiTrash2, FiX, FiVideo } from 'react-icons/fi';
import Navbar from '../../components/Navbar';
import NotificationPage from '../../notification/page';


enum notificationStatus { success = "success", error = "error", warning = "warning" };

interface Student {
    _id: string;
    name: string;
}

interface Group {
    _id: string;
    title: string;
    startDate: string;
    endDate: string;
    availableSeats: number;
    totalSeats: number;
    instructor: string;
    students: Student[];
    course: {
        _id: string;
        title: string;
    };
    lectures: Lecture[];
    tasks: any[];
}

interface Lecture {
    _id: string;
    title: string;
    date: string;
    description: string;
    videos: string[];
    course: string;
    group: string;
    objectives: string;
    createdAt: string;
    updatedAt: string;
}

export default function InstructorDashboard() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingLecture, setIsAddingLecture] = useState(false);
    const [newLecture, setNewLecture] = useState<Lecture>({
        _id: '',
        title: '',
        description: '',
        date: '',
        objectives: '',
        videos: [''],
        course: '',
        group: '',
        createdAt: '',
        updatedAt: ''
    });
    const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);
    const [notification, setNotification] = useState<{ message: string; state:notificationStatus; k: number } | null>(null);
    const showNotification = (message: string, state: notificationStatus) => {
        setNotification({ message, state ,k: Date.now()  });
    };
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                if (!user._id) {
                    console.error('No user ID found');
                    return;
                }

                const response = await fetch(`${baseUrl}/groups/instructorGroups/${user._id}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );
                console.log("response", response);
                if(!response.ok) {
                    if(response.status === 401) {
                        showNotification(" logged in from another device", notificationStatus.error);
                        setTimeout(() => {
                            window.location.href = '/login';
                        }, 3000);
                    }else{
                        showNotification("Failed to fetch groups refresh page", notificationStatus.error);
                    }
                }
                const result = await response.json();
                console.log("result message", result.message);
   
                
                if (result.success) {
                    setGroups(result.data);
                }
                else if(response.status === 401) {
                    showNotification(" logged in from another device", notificationStatus.error);
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 3000);
                }
                 else {

                    console.error('Failed to fetch groups:', result.message);
                }
            } catch (error) {
                console.error('Error fetching groups:', error);
                showNotification("Failed to fetch groups refresh page", notificationStatus.error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGroups();
    }, []);

    const handleAddLecture = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGroup) return;

        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const response = await fetch(`${baseUrl}/groups/addLecToGroup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    groupId: selectedGroup._id,
                    ...newLecture
                })
            });

            if (!response.ok) {
                if(response.status === 401) {
                    showNotification(" logged in from another device", notificationStatus.error);
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 3000);
                }
                throw new Error('Failed to add lecture');
            }

            const result = await response.json();
            if (result.success) {
                showNotification("Lecture added successfully!", notificationStatus.success);
                // Refresh groups data
                const updatedResponse = await fetch(`${baseUrl}/groups/instructorGroups/${user._id}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );
                const updatedResult = await updatedResponse.json();
                if (updatedResult.success) {
                    setGroups(updatedResult.data);
                    setSelectedGroup(updatedResult.data.find((g: Group) => g._id === selectedGroup._id) || null);
                }
                setIsAddingLecture(false);
                setNewLecture({
                    _id: '',
                    title: '',
                    description: '',
                    date: '',
                    objectives: '',
                    videos: [''],
                    course: '',
                    group: '',
                    createdAt: '',
                    updatedAt: ''
                });
            }
        } catch (error) {
            console.error('Error adding lecture:', error);
        }
    };

    const addVideoField = () => {
        setNewLecture(prev => ({
            ...prev,
            videos: [...prev.videos, '']
        }));
    };

    const removeVideoField = (index: number) => {
        setNewLecture(prev => ({
            ...prev,
            videos: prev.videos.filter((_, i) => i !== index)
        }));
    };

    const updateVideoUrl = (index: number, value: string) => {
        setNewLecture(prev => ({
            ...prev,
            videos: prev.videos.map((url, i) => i === index ? value : url)
        }));
    };

    const handleEditLecture = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLecture) return;
        try {
            const response = await fetch(`${baseUrl}/groups/editLecToGroup/${selectedGroup?._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({...editingLecture, lectureId: editingLecture._id})
            });
            const result = await response.json();
            if (result.success) {
                showNotification("تم تعديل المحاضرة بنجاح!", notificationStatus.success);

                // إعادة جلب بيانات المجموعات (rerender)
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const updatedResponse = await fetch(`${baseUrl}/groups/instructorGroups/${user._id}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );
                const updatedResult = await updatedResponse.json();
                if (updatedResult.success) {
                    setGroups(updatedResult.data);
                    setSelectedGroup(updatedResult.data.find((g: Group) => g._id === selectedGroup?._id) || null);
                }

                setEditingLecture(null); // إغلاق المودال
            } else {
                showNotification("فشل في تعديل المحاضرة", notificationStatus.error);
            }
        } catch (error) {
            showNotification("حدث خطأ أثناء التعديل", notificationStatus.error);
        }
    };

    const editModalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editingLecture && editModalRef.current) {
            editModalRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [editingLecture]);

    return (
        <>
            <Navbar />
            <div className={styles.container}>
                {isLoading ? (
                    <div className={styles.loading}>جاري التحميل...</div>
                ) : (
                    <div className={styles.content}>
                        <div className={styles.groupsList}>
                            <h2>المجموعات</h2>
                            {groups.map((group) => (
                                <div
                                    key={group._id}
                                    className={`${styles.groupCard} ${selectedGroup?._id === group._id ? styles.selected : ''}`}
                                    onClick={() => setSelectedGroup(group)}
                                >
                                    <div className={styles.groupHeader}>
                                        <h3>{group.title}</h3>
                                        <span className={styles.courseTitle}>{group.course.title}</span>
                                    </div>
                                    <div className={styles.groupDetails}>
                                        <p>عدد الطلاب: {group.students.length}/{group.totalSeats}</p>
                                        <p>تاريخ البدء: {new Date(group.startDate).toLocaleDateString('ar-EG')}</p>
                                        <p>تاريخ الانتهاء: {new Date(group.endDate).toLocaleDateString('ar-EG')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {selectedGroup && (
                            <div className={styles.groupDetails}>
                                <div className={styles.groupHeader}>
                                    <div>
                                        <h2>{selectedGroup.title}</h2>
                                        <span className={styles.courseTitle}>{selectedGroup.course.title}</span>
                                    </div>
                                    <button
                                        className={styles.addLectureButton}
                                        onClick={() => setIsAddingLecture(true)}
                                    >
                                        <FiPlus />
                                        إضافة محاضرة
                                    </button>
                                </div>

                                <div className={styles.groupInfo}>
                                    <div className={styles.infoItem}>
                                        <span className={styles.label}>عدد الطلاب:</span>
                                        <span className={styles.value}>{selectedGroup.students.length}/{selectedGroup.totalSeats}</span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.label}>تاريخ البدء:</span>
                                        <span className={styles.value}>{new Date(selectedGroup.startDate).toLocaleDateString('ar-EG')}</span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.label}>تاريخ الانتهاء:</span>
                                        <span className={styles.value}>{new Date(selectedGroup.endDate).toLocaleDateString('ar-EG')}</span>
                                    </div>
                                </div>

                                {isAddingLecture ? (
                                    <div className={styles.lectureForm}>
                                        <h3>إضافة محاضرة جديدة</h3>
                                        <form onSubmit={handleAddLecture}>
                                            <div className={styles.formGroup}>
                                                <label>عنوان المحاضرة</label>
                                                <input
                                                    type="text"
                                                    value={newLecture.title}
                                                    onChange={(e) => setNewLecture(prev => ({ ...prev, title: e.target.value }))}
                                                    required
                                                />
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label>تاريخ المحاضرة</label>
                                                <input
                                                    type="date"
                                                    value={newLecture.date}
                                                    onChange={(e) => setNewLecture(prev => ({ ...prev, date: e.target.value }))}
                                                    required
                                                />
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label>وصف المحاضرة</label>
                                                <textarea
                                                    value={newLecture.description}
                                                    onChange={(e) => setNewLecture(prev => ({ ...prev, description: e.target.value }))}
                                                    required
                                                />
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label>أهداف المحاضرة</label>
                                                <textarea
                                                    value={newLecture.objectives}
                                                    onChange={(e) => setNewLecture(prev => ({ ...prev, objectives: e.target.value }))}
                                                    required
                                                />
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label>فيديوهات المحاضرة</label>
                                                {newLecture.videos.map((video, index) => (
                                                    <div key={index} className={styles.videoInput}>
                                                        <input
                                                            type="url"
                                                            value={video}
                                                            onChange={(e) => updateVideoUrl(index, e.target.value)}
                                                            placeholder="رابط الفيديو"
                                                            required
                                                        />
                                                        {index > 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeVideoField(index)}
                                                                className={styles.removeButton}
                                                            >
                                                                <FiX />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={addVideoField}
                                                    className={styles.addButton}
                                                >
                                                    <FiPlus />
                                                    إضافة فيديو
                                                </button>
                                            </div>

                                            <div className={styles.formActions}>
                                                <button type="submit" className={styles.submitButton}>
                                                    إضافة المحاضرة
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsAddingLecture(false)}
                                                    className={styles.cancelButton}
                                                >
                                                    إلغاء
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                ) : (
                                    <div className={styles.lecturesList}>
                                        <h3>المحاضرات</h3>
                                        {selectedGroup.lectures.length === 0 ? (
                                            <p className={styles.noData}>لا توجد محاضرات متاحة</p>
                                        ) : (
                                            selectedGroup.lectures.map((lecture) => (
                                                <div key={lecture._id} className={styles.lectureCard}>
                                                    <div className={styles.lectureHeader}>
                                                        <h4>{lecture.title}</h4>
                                                        <span className={styles.lectureDate}>
                                                            {new Date(lecture.date).toLocaleDateString('ar-EG')}
                                                        </span>
                                                    </div>
                                                    <p>{lecture.description}</p>
                                                    <div className={styles.lectureObjectives}>
                                                        <h5>الأهداف:</h5>
                                                        <ul>
                                                            {lecture.objectives}
                                                        </ul>
                                                    </div>
                                                    {lecture.videos.length > 0 && (
                                                        <div className={styles.videosList}>
                                                            <h6>
                                                                <FiVideo />
                                                                الفيديوهات
                                                            </h6>
                                                            <div className={styles.videoLinks}>
                                                                {lecture.videos.map((video, index) => (
                                                                    <div key={index} className={styles.responsiveIframeWrapper}>
                                                                        <iframe
                                                                            src={getEmbedUrl(video)}
                                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                            allowFullScreen
                                                                            title={`lecture-video-${index}`}
                                                                            style={{ border: 0 }}
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <button
                                                        className={styles.editButton}
                                                        onClick={() => setEditingLecture(lecture)}
                                                    >
                                                        <FiEdit2 /> تعديل
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
            {editingLecture && (
                <div ref={editModalRef} className={styles.lectureForm}>
                    <h3>تعديل المحاضرة</h3>
                    <form onSubmit={handleEditLecture}>
                        <div className={styles.formGroup}>
                            <label>عنوان المحاضرة</label>
                            <input
                                type="text"
                                value={editingLecture.title}
                                onChange={e => setEditingLecture(prev => prev ? { ...prev, title: e.target.value } : prev)}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>تاريخ المحاضرة</label>
                            <input
                                type="date"
                                value={editingLecture.date}
                                onChange={e => setEditingLecture(prev => prev ? { ...prev, date: e.target.value } : prev)}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>وصف المحاضرة</label>
                            <textarea
                                value={editingLecture.description}
                                onChange={e => setEditingLecture(prev => prev ? { ...prev, description: e.target.value } : prev)}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>أهداف المحاضرة</label>
                            <textarea
                                value={editingLecture.objectives}
                                onChange={e => setEditingLecture(prev => prev ? { ...prev, objectives: e.target.value } : prev)}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>فيديوهات المحاضرة</label>
                            {editingLecture.videos.map((video, index) => (
                                <div key={index} className={styles.videoInput}>
                                    <input
                                        type="url"
                                        value={video}
                                        onChange={e => setEditingLecture(prev => prev ? { ...prev, videos: prev.videos.map((url, i) => i === index ? e.target.value : url) } : prev)}
                                        placeholder="رابط الفيديو"
                                        required
                                    />
                                    {index > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setEditingLecture(prev => prev ? { ...prev, videos: prev.videos.filter((_, i) => i !== index) } : prev)}
                                            className={styles.removeButton}
                                        >
                                            <FiX />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => setEditingLecture(prev => prev ? { ...prev, videos: [...prev.videos, ''] } : prev)}
                                className={styles.addButton}
                            >
                                <FiPlus />
                                إضافة فيديو
                            </button>
                        </div>

                        <div className={styles.formActions}>
                            <button type="submit" className={styles.submitButton}>حفظ التعديلات</button>
                            <button type="button" onClick={() => setEditingLecture(null)} className={styles.cancelButton}>إلغاء</button>
                        </div>
                    </form>
                </div>
            )}
            {notification && (
                <NotificationPage key={notification.k} text={notification.message} status={notification.state} k={notification.k} />
            )}
        </>
    );
}

function getEmbedUrl(url: string) {
    // YouTube
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
    if (ytMatch) {
        return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }
    // Google Drive
    const gdMatch = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
    if (gdMatch) {
        return `https://drive.google.com/file/d/${gdMatch[1]}/preview`;
    }
    // Default fallback
    return url;
}
