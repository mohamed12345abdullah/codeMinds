import styles from './CourseDetailModal.module.css';
import NotificationPage from '../notification/page';
import { useState } from 'react';

enum notificationStatus{
    success = 'success',
    error = 'error',
    warning = 'warning'
}
enum Gender {
    MALE = 'Male',
    FEMALE = 'Female',
}

type Student = {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    age: number;
    gender: Gender;
    courses?: [] | null;

}

type Group = {
    _id: string;
    name: string;
    startDate: string;
    endDate: string;
    availableSeats: number;
    totalSeats: number;
    instructor?: string;
    students?: [] | null;
}

type Course = {
    _id: string;
    title: string;
    description: string;
    price: number|null;
    imageUrl: string;
    isOpen: boolean;
    avilableGroups?: Group[] | null;
}








export default function CourseDetailModal({courseDetails,onClose,isOpen}: {courseDetails: Course,onClose: () => void,isOpen: boolean}) {

    
    if (!isOpen) return null;
    const handleEnroll = (groupId: string | undefined) => {
        const group = courseDetails.avilableGroups?.find(g => g._id === groupId);
        console.log("ENROLL IN COURSE",courseDetails._id);
        showNotification("Enrolled in course!", notificationStatus.success);
        if (group) {
            console.log(`Enrolled in ${group.name}!`);
            // Here you would typically make an API call to enroll the user
        }
    }; 
    const [notifi, setNotifi] = useState({
        text: '',
        status: notificationStatus.success,
        key: Date.now()
    });
    const showNotification = (message: string, status: notificationStatus) => {
        setNotifi({
            text: message,
            status: status,
            key: Date.now()
        });
    };
    return (
        <div className={styles.modalOverlay} onClick={onClose}> 
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                <div className={styles.courseImage}>
                    <img src={courseDetails.imageUrl} alt={courseDetails.title} />
                </div>

                <div className={styles.courseDetails}>
                    <h2>{courseDetails.title}</h2>
                    <p className={styles.price}>${courseDetails.price?.toFixed(2)}</p>
                    <p className={styles.description}>{courseDetails.description}</p>
                    {courseDetails.avilableGroups && (
                        <div className={styles.groups}>
                            <h3>Available Groups</h3>
                            <ul>
                                {courseDetails.avilableGroups.map((group) => (
                                <>
                                
                                    <li key={group._id}>
                                        <h4>{group.name}</h4>
                                        <p>Start Date: {group.startDate}</p>
                                        <p>End Date: {group.endDate}</p>
                                        <p>Available Seats: {group.availableSeats}</p>
                                        <p>Total Seats: {group.totalSeats}</p>
                                        <p>Instructor: {group.instructor}</p>
                                        <button onClick={() => handleEnroll(group._id)} className={styles.enrollButton}>join {group.name}</button>

                                    </li>
                                    
                                </>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div className={styles.features}>
                        <div className={styles.featureItem}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="16" />
                                <line x1="8" y1="12" x2="16" y2="12" />
                            </svg>
                            <span>Interactive Lessons</span>
                        </div>
                        <div className={styles.featureItem}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2M6 5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2M6 5h6m4 0h4" />
                            </svg>
                            <span>24/7 Support</span>
                        </div>
                        <div className={styles.featureItem}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4H6" />
                            </svg>
                            <span>Certification</span>
                        </div>
                    </div>

                    <div className={styles.ctaButtons}>
                        <button onClick={() => handleEnroll(courseDetails._id)} className={styles.enrollButton}>
                            Enroll Now
                        </button>
                        <button className={styles.wishlistButton}>
                            Add to Wishlist
                        </button>
                    </div>
                </div>
            </div>
            {notifi && <NotificationPage key={notifi.key} text={notifi.text} status={notifi.status} k={notifi.key} />}
        </div>
    );
}
