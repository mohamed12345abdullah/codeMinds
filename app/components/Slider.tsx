'use client';
import styles from './Slider.module.css';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Slide {
    title: string;
    description: string;
    image: string;
}

interface SliderProps {
    slides: Slide[];
}

export default function Slider({ slides }: SliderProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

    const goToPrev = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const goToNext = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [slides.length]);

    return (
        <div className={styles.slider}>
            <div className={styles.slides} style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`${styles.slide} ${
                            index === currentSlide ? styles.active : ''
                        }`}
                    >
                        <div className={styles.slideContent}>
                            <h1>{slide.title}</h1>
                            <p>{slide.description}</p>
                            <Link href="/courses" className={styles.ctaButton}>
                                <span>Explore Courses</span>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                        <div className={styles.slideImage}>
                            <Image
                                src={slide.image}
                                alt={slide.title}
                                fill
                                style={{ objectFit: 'cover' }}
                                priority={index === 0}
                            />
                        </div>
                    </div>
                ))}
            </div>
            <div className={styles.navigation}>
                <button 
                    className={styles.arrow} 
                    onClick={goToPrev}
                    aria-label="Previous slide"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 5l-7 7 7 7" />
                    </svg>
                </button>
                <button 
                    className={styles.arrow} 
                    onClick={goToNext}
                    aria-label="Next slide"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
            <div className={styles.indicators}>
                {slides.map((_, index) => (
                    <button
                        key={index}
                        className={`${styles.indicator} ${
                            index === currentSlide ? styles.active : ''
                        }`}
                        onClick={() => setCurrentSlide(index)}
                    />
                ))}
            </div>
        </div>
    );
}
