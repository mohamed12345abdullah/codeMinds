'use client'

import Link from 'next/link';
import styles from './page.module.css';
import Navbar from './components/Navbar';
import NotificationPage from './notification/page'; 
import Footer from './components/Footer';
import Slider from './components/Slider';
import { useState, useEffect } from 'react';
import Courses from './courses/page';
import { sendIpApi } from './apis/auth';

const sliderSlides = [
    {
        title: 'Learn Without Limits',
        description: 'Start, switch, or advance your career with thousands of courses from expert instructors.',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQE31gWvZSwCc8zgb5576G0MhUbWqabUB8qIQ&s'
    },
    {
        title: 'Master New Skills',
        description: 'Explore our comprehensive courses in technology, business, and creative arts.',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQE31gWvZSwCc8zgb5576G0MhUbWqabUB8qIQ&s'
    },
    {
        title: 'Join Our Community',
        description: 'Learn from expert instructors and connect with fellow students worldwide.',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQE31gWvZSwCc8zgb5576G0MhUbWqabUB8qIQ&s'
    }
];

export default function HomePage() {
    const featuredCourses = [
        {
            id: 1,
            title: 'Web Development Bootcamp',
            description: 'Learn full-stack web development from scratch',
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQE31gWvZSwCc8zgb5576G0MhUbWqabUB8qIQ&s',
            instructor: 'John Doe',
            students: 1234,
            rating: 4.8
        },
        {
            id: 2,
            title: 'Data Science Fundamentals',
            description: 'Master data analysis and machine learning',
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQE31gWvZSwCc8zgb5576G0MhUbWqabUB8qIQ&s',
            instructor: 'Jane Smith',
            students: 856,
            rating: 4.9
        },
        {
            id: 3,
            title: 'Mobile App Development',
            description: 'Build iOS and Android apps with React Native',
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQE31gWvZSwCc8zgb5576G0MhUbWqabUB8qIQ&s',
            instructor: 'Mike Johnson',
            students: 567,
            rating: 4.7
        }
    ];

    useEffect(() => {
        //  send the ip of the  gusets to the server to calculate the views
        sendIpApi("home");
    },[]);
    

    const videoId = "6BHrCLCnj8A";
    return (
        <div className={styles.container}>
            <Navbar />
            <Slider slides={sliderSlides} />
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>Learn Without Limits</h1>
                    <p className={styles.heroSubtitle}>Start, switch, or advance your career with thousands of courses from expert instructors.</p>
                    <Link href="/courses" className={styles.ctaButton}>
                        <span className={styles.ctaText}>Explore Courses</span>
                        <svg className={styles.ctaIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </section>

            {/* Call to Action */}
            <section className={styles.cta}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            Get Started
                        </h2>
                        <p className="mt-4 max-w-md mx-auto text-base text-gray-500">
                            Explore our courses or create an account
                        </p>
                    </div>
                    <div className="mt-8">
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                            <Link
                                href="/courses"
                                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
                            >
                                <h3 className="text-xl font-semibold text-gray-900">Browse Courses</h3>
                                <p className="mt-2 text-gray-500">Discover our selection of robotics courses</p>
                            </Link>
                            <Link
                                href="/signup"
                                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
                            >
                                <h3 className="text-xl font-semibold text-gray-900">Sign Up</h3>
                                <p className="mt-2 text-gray-500">Create your account to start learning</p>
                            </Link>
                        </div>
                    </div>
                </div>
                {/* import courses */}
                <Courses />
         
            </section>

            <section className={styles.youtube}>
                <iframe
                    width="560"
                    height="315"
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen>
                </iframe>

            </section>

            {/* Features Section */}
            <section className={styles.features}>
                <h2>Why Choose Us</h2>
                <div className={styles.featureGrid}>
                    <div className={styles.featureCard}>
                        <h3>Expert Instructors</h3>
                        <p>Learn from industry experts with years of experience</p>
                    </div>
                    <div className={styles.featureCard}>
                        <h3>Flexible Learning</h3>
                        <p>Study at your own pace, anywhere and anytime</p>
                    </div>
                    <div className={styles.featureCard}>
                        <h3>Certificate of Completion</h3>
                        <p>Get certified and showcase your skills</p>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className={styles.cta}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2>Ready to Start Learning?</h2>
                        <p>Join thousands of students worldwide and start your learning journey today.</p>
                        <Link href="/signup" className={styles.ctaButton}>
                            Get Started
                        </Link>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
}
