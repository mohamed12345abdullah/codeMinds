'use client';

import { useState, useEffect } from 'react';
import NotificationPage from '../notification/page';
import Navbar from '../components/Navbar';
import styles from './courses.module.css';
import CourseDetailModal from './CourseDetailModal';
import { sendIpApi } from '../apis/auth';
import { getCourses } from '../apis/course';

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




const groupA: Group = {
    _id: '1',
    name: 'Group A',
    startDate: '2025-06-01',
    endDate: '2025-06-30',
    availableSeats: 5,
    totalSeats: 5,
    instructor: 'asmaa ',
    students: null
}

const groupB: Group={
    _id:'2',
    name:'Group B',
    startDate: '2025-06-01',
    endDate: '2025-06-30',
    availableSeats: 5,
    totalSeats: 5,
    instructor: 'abdullah',
    students: null
}

// const pythonCourse: CourseDetails = {
//     course: {
//     _id: '1',
//     title: 'Python Programming',
//     description: 'Learn the fundamentals of Python programming',
//     price: 99.99,
//     imageUrl: 'https://www.livewireindia.com/blog/wp-content/uploads/2019/03/Python-Programming-training-1024x537.jpg',
//     },
//     isOpen: true,
//     onClose: () => {},
//     avilableGroups: [groupA,groupB]
// }


// const CppCourse: CourseDetails = {
//     course: {
//     _id: '2',
//     title: 'C++ Programming',
//     description: 'Learn the fundamentals of C++ programming',
//     price: 99.99,
//     imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSGePKrQcfI6LjsSHTtm240HjN590eh6K9YQ&s',
//     },
//     isOpen: true,
//     onClose: () => {},
//     avilableGroups: [groupA,groupB]
// }


// const initialCourses: CourseDetails[] = [
//     pythonCourse,
//     CppCourse
// ]


export default function CoursesPage() {
    useEffect(() => {
        sendIpApi("courses");
    }, []);
    const [courses, setCourses] = useState<Course[]>([]);
    enum notificationStatus { success = "success", error = "error", warning = "warning" };
    const [notifi, setNotifi] = useState({
        text: '',
        status: notificationStatus.success,
        key: Date.now()
    });
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchCourses = async () => {
        try {
            const response = await getCourses();
            if(response instanceof Error){
                showNotification("Error fetching courses!", notificationStatus.error);
                return;
            }
            setCourses(response.data);
            showNotification("Courses fetched successfully!", notificationStatus.success);
            console.log("Courses fetched successfull================:", response);
        } catch (error) {
            console.error("Error fetching courses:", error);
            showNotification("Error fetching courses!", notificationStatus.error);
        }
    };
    useEffect(() => {
        fetchCourses(); 
    }, []);


    const handleEnroll = (courseId: string|null) => {
        const course = courses.find(c => c._id === courseId);
        if (course) {
            console.log("Enrolled in", course.title);
            showNotification(`Enrolled in ${course.title}!`, notificationStatus.success);
            // Here you would typically make an API call to enroll the user
        }
    };

    const showNotification = (message: string, status: notificationStatus) => {
        setNotifi({
            text: message,
            status: status,
            key: Date.now()
        });
    };

    return (
        <div className={styles.courses}>
            <Navbar />
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2>Our Courses</h2>
                    <p>Explore our selection of robotics courses</p>
                </div>

                <div className={styles.grid}>
                    {courses.map((courseDetails:Course) => (
                        <div key={courseDetails._id} className={styles.courseCard}>
                            <div className={styles.courseImage}>
                                <img 
                                    src={courseDetails.imageUrl}
                                    alt={courseDetails.title}
                                    className={styles.courseImage}
                                />
                            </div>
                            <div className={styles.courseContent}>
                                <h3>{courseDetails.title}</h3>
                                <p>{courseDetails.description}</p>
                                <div className={styles.courseMeta}>
                                    <div> {courseDetails.isOpen ? 'Open' : 'Closed'}</div>
                                    {(courseDetails.avilableGroups && courseDetails.avilableGroups.length > 0) && <div> next group start in {courseDetails.avilableGroups?.[0].startDate}</div>}
                                </div>
                                <button 
                                    className={styles.courseButton}
                                    onClick={() => {
                                        setSelectedCourse(courseDetails );
                                        setIsModalOpen(true);
                                    }}
                                >
                                    Learn More
                                </button>
                                <div className={styles.coursePrice}>
                                    <span className={styles.price}>${courseDetails.price}</span>
                                    <button
                                        onClick={() => handleEnroll(courseDetails._id || null)}
                                        className={styles.enrollButton}
                                    >
                                        Enroll Now
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedCourse && (
                <CourseDetailModal 
                courseDetails={selectedCourse}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                />
            )}
            {notifi && <NotificationPage text={notifi.text} status={notifi.status} k={notifi.key} />}
        </div>
    );
}
