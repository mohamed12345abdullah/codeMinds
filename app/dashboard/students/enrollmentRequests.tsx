'use client';

import { useState, useEffect } from 'react';
import styles from './enrollmentRequests.module.css';
import NotificationPage from '../../notification/page';



const baseUrl = "https://code-minds-website.vercel.app/api";
// const baseUrl = "http://localhost:4000/api/auth";
console.log("baseUrl", baseUrl)


enum notificationStatus {
    success = 'success',
    error = 'error',
    warning = 'warning',
}

interface Student {
    _id: string;
    name: string;
    email: string;
    phone: string;
    profileRef: {
        age: number;
    };
}

interface Course {
    _id: string;
    title: string;
}

interface EnrollmentRequest {
    _id: string;
    student: Student;
    course: Course;
    status: 'pending' | 'accepted' | 'rejected';
}

export default function EnrollmentRequests() {
    const [requests, setRequests] = useState<EnrollmentRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'rejected'>('pending');
    const [searchQuery, setSearchQuery] = useState('');

    const [notification, setNotification] = useState({
        text: '',
        status: notificationStatus.success,
        k: 0
    });

    const showNotification = (message: string, status: notificationStatus) => {
        setNotification({
            text: message,
            status: status,
            k: Math.random()
        });
    };
    const fetchRequests = async () => {
        try {
            const response = await fetch(`${baseUrl}/requests`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if(!response.ok){
                if(response.status === 401){
                    showNotification("Unauthorized", notificationStatus.error);
                    window.location.href = '/login';
                }else if(response.status === 403){
                    showNotification("Forbidden", notificationStatus.error);
                    // window.location.href = '/login';
                }
                const res=await response.json();  
                console.log("res", res)
                return;
            }
            
            const data = await response.json();
            if (data.success) {
                setRequests(data.data);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to fetch requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleRequest = async (requestId: string, action: 'accept' | 'reject') => {
        try {
            const response = await fetch(`${baseUrl}/requests/${action}`, {
                method: 'PUT',
                body: JSON.stringify({ requestId }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if(!response.ok){
                if(response.status === 401){
                    showNotification("Unauthorized", notificationStatus.error);
                    window.location.href = '/login';
                }else if(response.status === 403){
                    showNotification("Forbidden", notificationStatus.error);
                    window.location.href = '/login';
                }
                return;
            }
            const data = await response.json();
            if (data.success) {
                fetchRequests();
                showNotification(data.message, notificationStatus.success);
            } else {
                // setError(data.message);
                showNotification(data.message, notificationStatus.error);
            }
        } catch (err) {
            // setError('Failed to process request');
            showNotification('Failed to process request', notificationStatus.error);
        }
    };

    // Filter requests based on active tab and search query
    const filteredRequests = requests.filter(request => {
        const matchesStatus = request.status === activeTab;
        const matchesSearch = searchQuery === '' || 
            request.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            request.student.email.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.enrollmentDashboard}>
            <h2>Enrollment Requests</h2>
            
            <div className={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Search by student name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            <div className={styles.tabs}>
                <button 
                    className={`${styles.tab} ${activeTab === 'pending' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Pending ({requests.filter(r => r.status === 'pending').length})
                </button>
                <button 
                    className={`${styles.tab} ${activeTab === 'accepted' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('accepted')}
                >
                    Accepted ({requests.filter(r => r.status === 'accepted').length})
                </button>
                <button 
                    className={`${styles.tab} ${activeTab === 'rejected' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('rejected')}
                >
                    Rejected ({requests.filter(r => r.status === 'rejected').length})
                </button>
            </div>

            <div className={styles.requestsList}>
                {filteredRequests.length === 0 ? (
                    <p className={styles.noRequests}>
                        {searchQuery 
                            ? `No ${activeTab} requests found for "${searchQuery}"`
                            : `No ${activeTab} requests found`}
                    </p>
                ) : (
                    filteredRequests.map(request => (
                        <div key={request._id} className={styles.requestCard}>
                            <div className={styles.requestInfo}>
                                <h3>{request.course.title}</h3>
                                <p>Student: {request.student.name}</p>
                                <p>Email: {request.student.email}</p>
                                <p>Phone: {request.student.phone}</p>
                                <p>age: {request.student.profileRef.age}</p>

                                <p>Status: <span className={styles[request.status]}>{request.status}</span></p>
                            </div>
                            {request.status === 'pending' && (
                                <div className={styles.requestActions}>
                                    <button
                                        className={styles.acceptButton}
                                        onClick={() => handleRequest(request._id, 'accept')}
                                    >
                                        Accept
                                    </button>
                                    <button
                                        className={styles.rejectButton}
                                        onClick={() => handleRequest(request._id, 'reject')}
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
            <NotificationPage key={notification.k} text={notification.text} status={notification.status} k={notification.k} />
        </div>
    );
} 