'use client';

import { useEffect, useState } from 'react';
import { getCoursesApi } from '../api';
import Navbar from '../components/Navbar';
import CourseCard from '../components/CourseCard';
import styles from './courses.module.css';
import CourseDetailModal from './CourseDetailModal';
import { useNotification } from '../context/NotificationContext';

interface Course {
    id: number;
    title: string;
    description: string;
    price: number;
    imageUrl: string;
    instructor: string;
    students: number;
    rating: number;
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { addNotification } = useNotification();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await getCoursesApi();
                setCourses(data);
            } catch {
                console.error('Failed to fetch courses');
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const handleEnroll = async (courseId: number) => {
        try {
            const course = courses.find(c => c.id === courseId);
            if (course) {
                addNotification(`Successfully enrolled in ${course.title}!`, 'success');
            }
        } catch {
            addNotification('Failed to enroll in the course. Please try again.', 'error');
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className={styles.container}>
                    <div className={styles.loading}>Loading courses...</div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className={styles.container}>
                <h1>All Courses</h1>
                <div className={styles.coursesGrid}>
                    {courses.map((course) => (
                        <CourseCard key={course.id} course={course} />
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
                    onEnroll={handleEnroll}
                />
            )}
        </>
    );
}
