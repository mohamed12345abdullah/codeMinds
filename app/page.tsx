'use client'

import "./globals.css";
import Navbar from "./components/Navbar";
import Slider from "./components/Slider";
import CourseCard from "./components/CourseCard";
import { useEffect, useState } from "react";
import { getCoursesApi } from "./api";

export default function Home() {
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
    const [courses, setCourses] = useState<Course[]>([]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await getCoursesApi();
                setCourses(data);
            } catch (error) {
                console.error('Failed to fetch courses:', error);
            }
        };

        fetchCourses();
    }, []);

    return (
        <>
            <Navbar />
            <Slider slides={courses.map(course => ({
                image: course.imageUrl,
                title: course.title,
                description: course.description,
                price: course.price,
                instructor: course.instructor,
                students: course.students,
                rating: course.rating
            }))} />
            <div className="container">
                <h1>Featured Courses</h1>
                <div className="courses-grid">
                    {courses.map((course) => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
            </div>
        </>
    );
}
