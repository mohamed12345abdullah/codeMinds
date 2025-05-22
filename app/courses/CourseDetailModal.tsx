'use client'

import { useEffect } from 'react';
import Image from 'next/image';
import styles from './CourseDetailModal.module.css';

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

interface CourseDetailModalProps {
    course: Course;
    isOpen: boolean;
    onClose: () => void;
    onEnroll: (courseId: number) => void;
}

export default function CourseDetailModal({
    course,
    isOpen,
    onClose,
    onEnroll,
}: CourseDetailModalProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    ×
                </button>
                <div className={styles.modalContent}>
                    <div className={styles.courseImage}>
                        <Image
                            src={course.imageUrl}
                            alt={course.title}
                            fill
                            style={{ objectFit: 'cover' }}
                        />
                    </div>
                    <div className={styles.courseInfo}>
                        <h2>{course.title}</h2>
                        <p>{course.description}</p>
                        <div className={styles.courseMeta}>
                            <span>Instructor: {course.instructor}</span>
                            <span>{course.students} students</span>
                            <span>Rating: {course.rating}/5</span>
                        </div>
                        <div className={styles.coursePrice}>
                            <span className={styles.price}>${course.price}</span>
                            <button
                                onClick={() => onEnroll(course.id)}
                                className={styles.enrollButton}
                            >
                                Enroll Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
