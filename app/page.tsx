'use client'

import Link from 'next/link';
import styles from './page.module.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Slider from './components/Slider';
import { useState, useEffect } from 'react';
import Courses from './courses/page';
import { sendIpApi } from './apis/auth';
import NotificationPage from './notification/page';

const sliderSlides = [
    {
        title: 'Learn Without Limits',
        description: 'Start, switch, or advance your career with thousands of courses from expert instructors.',
        image: 'https://scontent-fra3-1.xx.fbcdn.net/v/t39.30808-6/503472462_1092284656287676_2826380328404199033_n.jpg?stp=dst-jpg_s600x600_tt6&_nc_cat=101&ccb=1-7&_nc_sid=127cfc&_nc_ohc=BFIrsDlyJrcQ7kNvwFAnxwq&_nc_oc=AdnQM2CusaBsdKzFlHaeqm5Xjac2fgv1NarylYzRMnmndlmLKEFTF0WfoBf4WdmKsjY&_nc_zt=23&_nc_ht=scontent-fra3-1.xx&_nc_gid=it1tkwZTJ848Sako6EGbIA&oh=00_AfNmSs267fD-buZFvK_QlDfhM-B0ZI1YrRnsfsGaIlFrrQ&oe=684B9258'
    },
    {
        title: 'Master New Skills',
        description: 'Explore our comprehensive courses in technology, business, and creative arts.',
        image: 'https://res.cloudinary.com/dhaj9qyjv/image/upload/v1749405033/codeminds/tntax0rxhmtcndvthdtu.jpg'
    },
    {
        title: 'Join Our Community',
        description: 'Learn from expert instructors and connect with fellow students worldwide.',
        image: 'https://res.cloudinary.com/dhaj9qyjv/image/upload/v1749404648/codeminds/d0r4kyotyiqgn1zruyqs.jpg'
    }
];
enum notificationStatus { success = "success", error = "error", warning = "warning" };
export default function HomePage() {
    const [notifi, setNotifi] = useState({
        text: '',
        status: notificationStatus.success,
        k: Date.now()
    });
    const showNotification = (message: string, status: notificationStatus) => {
        setNotifi({
            text: message,
            status: status,
            k: Date.now()
        });
    };
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
                        <h3>Interactive Learning</h3>
                        <p>Engage with interactive content and real-time feedback</p>
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
            <NotificationPage {...notifi} />
        </div>
    );
}
