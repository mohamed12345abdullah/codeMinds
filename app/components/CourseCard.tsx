'use client'

import Image from 'next/image';
import styles from './CourseCard.module.css';

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

interface CourseCardProps {
    course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
    return (
        <div className={styles.card}>
            <div className={styles.imageContainer}>
                <Image
                    src={course.imageUrl}
                    alt={course.title}
                    fill
                    style={{ objectFit: 'cover' }}
                />
            </div>
            <div className={styles.content}>
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <div className={styles.meta}>
                    <span>Instructor: {course.instructor}</span>
                    <span>{course.students} students</span>
                    <span>Rating: {course.rating}/5</span>
                </div>
                <div className={styles.footer}>
                    <span className={styles.price}>${course.price}</span>
                    <button className={styles.enrollButton}>
                        Enroll Now
                    </button>
                </div>
            </div>
        </div>
    );
} 