'use client';

import { useState, useEffect } from 'react';
import NotificationPage from '../notification/page';
import Navbar from '../components/Navbar';
import styles from './courses.module.css';
import CourseDetailModal from './CourseDetailModal';
interface Course {
    id: number;
    title: string;
    description: string;
    price: number;
    imageUrl: string ;
    instructor: string;
    students: number;
    rating: number;
}

const initialCourses: Course[] = [
    {
        id: 1,
        title: 'Introduction to Robotics',
        description: 'Learn the basics of robotics and automation',
        price: 99.99,
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQE31gWvZSwCc8zgb5576G0MhUbWqabUB8qIQ&s',
        instructor: 'John Smith',
        students: 1500,
        rating: 4.8
    },
    {
        id: 2,
        title: 'Advanced Robotics',
        description: 'Deep dive into advanced robotics concepts',
        price: 149.99,
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQE31gWvZSwCc8zgb5576G0MhUbWqabUB8qIQ&s',
        instructor: 'Jane Doe',
        students: 850,
        rating: 4.9
    },
    {
        id: 3,
        title: 'AI and Robotics',
        description: 'Explore the intersection of AI and Robotics',
        price: 199.99,
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQE31gWvZSwCc8zgb5576G0MhUbWqabUB8qIQ&s',
        instructor: 'Bob Johnson',
        students: 200,
        rating: 4.9
    }
];

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>(initialCourses);
    const [notifi, setNotifi] = useState('');
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleEnroll = (courseId: number) => {
        const course = courses.find(c => c.id === courseId);
        if (course) {
            setNotifi(`Enrolled in ${course.title}!`);
            // Here you would typically make an API call to enroll the user
        }
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
                    {courses.map((course) => (
                        <div key={course.id} className={styles.courseCard}>
                            <div className={styles.courseImage}>
                                <img
                                    src={course.imageUrl}
                                    alt={course.title}
                                    className={styles.courseImage}
                                />
                            </div>
                            <div className={styles.courseContent}>
                                <h3>{course.title}</h3>
                                <p>{course.description}</p>
                                <div className={styles.courseMeta}>
                                    <span>Instructor: {course.instructor}</span>
                                    <span>{course.students} students</span>
                                    <span>Rating: {course.rating}/5</span>
                                </div>
                                <button 
                                    className={styles.courseButton}
                                    onClick={() => {
                                        setSelectedCourse(course);
                                        setIsModalOpen(true);
                                    }}
                                >
                                    Learn More
                                </button>
                                <div className={styles.coursePrice}>
                                    <span className={styles.price}>${course.price}</span>
                                    <button
                                        onClick={() => handleEnroll(course.id)}
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
                    course={selectedCourse}
                    isOpen={isModalOpen}
                    onClose={() => {
                        setSelectedCourse(null);
                        setIsModalOpen(false);
                    }}
                />
            )}
            {notifi && <NotificationPage text={notifi} />}
        </div>
    );
}
