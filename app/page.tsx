'use client'

import Link from 'next/link';
import styles from './page.module.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Slider from './components/Slider';
import { useState, useEffect, useRef } from 'react';
import Courses from './courses/page';
import { sendIpApi } from './apis/auth';
import NotificationPage from './notification/page';


const sliderSlides = [
    {
        title: 'Learn Without Limits',
        description: 'Start, switch, or advance your career with thousands of courses from expert instructors.',
        image: 'https://res.cloudinary.com/dhaj9qyjv/image/upload/v1766353652/android-chrome-512x512_hp3dug.png'
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
enum notificationStatus { success = "success", error = "error", warning = "warning" }

// ─── Road Map Data ────────────────────────────────────────────────────────────
const roadmapSteps = [
    {
        age: '5–7',
        label: 'مرحلة الاستكشاف',
        course: 'Scratch Jr.',
        icon: '🧩',
        color: '#00C853',
        benefits: ['يطور التفكير الإبداعي', 'يتعلم الأوامر البسيطة', 'يفهم مفهوم التسلسل'],
        description: 'الطفل يبدأ بالألعاب المرئية وتحريك الشخصيات بدون كتابة كود'
    },
    {
        age: '8–10',
        label: 'مرحلة البناء',
        course: 'Scratch',
        icon: '🎮',
        color: '#00E676',
        benefits: ['يبني ألعاب بسيطة', 'يفهم الشروط والحلقات', 'يحل المشكلات بمنطق'],
        description: 'يصنع ألعاب ومشاريع تفاعلية بلغة بصرية احترافية'
    },
    {
        age: '11–13',
        label: 'مرحلة التطوير',
        course: 'Python Basics',
        icon: '🐍',
        color: '#69F0AE',
        benefits: ['يكتب أكوادًا حقيقية', 'يفهم المتغيرات والدوال', 'يطور تفكيرًا خوارزميًا'],
        description: 'الانتقال للغات البرمجة النصية الحقيقية مع مشاريع ممتعة'
    },
    {
        age: '14–16',
        label: 'مرحلة الاحتراف',
        course: 'Web / Robotics',
        icon: '🤖',
        color: '#64DD17',
        benefits: ['يبني مواقع ويب', 'يبرمج روبوتات', 'يفهم الذكاء الاصطناعي'],
        description: 'مشاريع متكاملة تجمع بين البرمجة والهندسة والإبداع'
    }
];

// ─── Stats Data ───────────────────────────────────────────────────────────────
const stats = [
    { value: '2,500+', label: 'طالب نشط', icon: '👨‍🎓' },
    { value: '40+',    label: 'كورس متخصص', icon: '📚' },
    { value: '95%',    label: 'نسبة رضا الطلاب', icon: '⭐' },
    { value: '15+',    label: 'مدرب خبير', icon: '🏆' },
];

// ─── Testimonials Data ────────────────────────────────────────────────────────
const testimonials = [
    {
        name: 'أحمد محمد',
        role: 'ولي أمر – طفل 9 سنوات',
        text: 'ابني بدأ بـ Scratch وبعد 3 أشهر بيبني ألعاب وبيشرحها لأصحابه. التغيير كان مذهل!',
        avatar: 'أ'
    },
    {
        name: 'سارة علي',
        role: 'طالبة – 14 سنة',
        text: 'تعلمت Python من هنا وعملت أول موقع ويب. المدرسين بيشرحوا بأسلوب سهل جداً.',
        avatar: 'س'
    },
    {
        name: 'محمود حسن',
        role: 'ولي أمر – طفلة 7 سنوات',
        text: 'بنتي كانت خايفة من الكمبيوتر، دلوقتي بتلعب وبتبرمج في نفس الوقت. رائع!',
        avatar: 'م'
    }
];

// ─── Programming Benefits ─────────────────────────────────────────────────────
const benefits = [
    { icon: '🧠', title: 'التفكير المنطقي', desc: 'البرمجة تعلم الطفل تحليل المشكلة وإيجاد حل خطوة بخطوة' },
    { icon: '🎯', title: 'حل المشكلات', desc: 'تطوير مهارة التعامل مع الأخطاء والتفكير الإبداعي' },
    { icon: '🤝', title: 'العمل الجماعي', desc: 'مشاريع مشتركة تنمي مهارات التواصل والتعاون' },
    { icon: '💡', title: 'الإبداع والابتكار', desc: 'تحويل الأفكار إلى منتجات حقيقية من البداية' },
    { icon: '📈', title: 'مهارات المستقبل', desc: 'أكثر من 65% من وظائف المستقبل ستحتاج مهارات تقنية' },
    { icon: '🎮', title: 'التعلم بالمتعة', desc: 'ألعاب وتحديات تجعل التعلم ممتعاً وغير مملّ' },
];

// ─── Counter Hook ─────────────────────────────────────────────────────────────
function useCountUp(target: string, isVisible: boolean) {
    const [display, setDisplay] = useState('0');
    useEffect(() => {
        if (!isVisible) return;
        const numeric = parseInt(target.replace(/\D/g, ''));
        const suffix = target.replace(/[\d,]/g, '');
        let start = 0;
        const step = Math.ceil(numeric / 60);
        const timer = setInterval(() => {
            start += step;
            if (start >= numeric) { setDisplay(target); clearInterval(timer); }
            else setDisplay(start + suffix);
        }, 30);
        return () => clearInterval(timer);
    }, [isVisible, target]);
    return display;
}

export default function HomePage() {
    const [notifi, setNotifi] = useState({ text: '', status: notificationStatus.success, k: Date.now() });
    const [searchQuery, setSearchQuery] = useState('');
    const [activeRoadmap, setActiveRoadmap] = useState(0);
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const [statsVisible, setStatsVisible] = useState(false);
    const statsRef = useRef<HTMLElement>(null);

    const showNotification = (message: string, status: notificationStatus) => {
        setNotifi({ text: message, status, k: Date.now() });
    };

    useEffect(() => {
        sendIpApi("home");
    }, []);

    // Intersection Observer for stats counter
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) setStatsVisible(true);
        }, { threshold: 0.3 });
        if (statsRef.current) observer.observe(statsRef.current);
        return () => observer.disconnect();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/courses?search=${encodeURIComponent(searchQuery)}`;
        }
    };

    const handleNewsletter = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            setSubscribed(true);
            showNotification('تم الاشتراك بنجاح! 🎉', notificationStatus.success);
        }
    };

    const videoId = "6BHrCLCnj8A";

    return (
        <div className={styles.container}>
            <Navbar />
            <Slider slides={sliderSlides} />

            {/* ── Hero Section ───────────────────────────────────────── */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>تعلّم بلا حدود</h1>
                    <p className={styles.heroSubtitle}>
                        ابدأ رحلتك في البرمجة مع آلاف الكورسات من مدربين خبراء —
                        مصممة خصيصاً لتناسب كل الأعمار
                    </p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className={styles.searchBar}>
                        <input
                            type="text"
                            placeholder="ابحث عن كورس..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                        <button type="submit" className={styles.searchBtn}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                            </svg>
                            بحث
                        </button>
                    </form>

                    <Link href="/courses" className={styles.ctaButton}>
                        <span className={styles.ctaText}>استكشف الكورسات</span>
                        <svg className={styles.ctaIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </section>

            {/* ── Stats Section ──────────────────────────────────────── 
                        <section className={styles.statsSection} ref={statsRef}>
                {stats.map((stat, i) => (
                    <StatCard key={i} stat={stat} isVisible={statsVisible} />
                ))}
            </section>
            
            */}


            {/* ── Road Map Section ───────────────────────────────────── */}
            <section className={styles.roadmapSection}>
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionBadge}>خارطة الطريق</span>
                    <h2>رحلة طفلك في البرمجة</h2>
                    <p>كورسات مصممة لكل مرحلة عمرية — من الاستكشاف حتى الاحتراف</p>
                </div>

                {/* Timeline */}
                <div className={styles.roadmapTimeline}>
                    {roadmapSteps.map((step, i) => (
                        <div
                            key={i}
                            className={`${styles.roadmapStep} ${activeRoadmap === i ? styles.roadmapStepActive : ''}`}
                            onClick={() => setActiveRoadmap(i)}
                            style={{ '--step-color': step.color } as React.CSSProperties}
                        >
                            <div className={styles.stepDot}>
                                <span className={styles.stepIcon}>{step.icon}</span>
                            </div>
                            {i < roadmapSteps.length - 1 && <div className={styles.stepLine} />}
                            <div className={styles.stepLabel}>
                                <span className={styles.stepAge}>{step.age} سنة</span>
                                <span className={styles.stepName}>{step.label}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Detail Card */}
                <div className={styles.roadmapDetail} key={activeRoadmap}>
                    <div className={styles.roadmapDetailLeft}>
                        <span className={styles.detailIcon}>{roadmapSteps[activeRoadmap].icon}</span>
                        <h3>{roadmapSteps[activeRoadmap].course}</h3>
                        <p className={styles.detailAge}>{roadmapSteps[activeRoadmap].age} سنة — {roadmapSteps[activeRoadmap].label}</p>
                        <p className={styles.detailDesc}>{roadmapSteps[activeRoadmap].description}</p>
                        <Link href="/courses" className={styles.detailBtn}>ابدأ الآن ←</Link>
                    </div>
                    <div className={styles.roadmapDetailRight}>
                        <h4>ماذا سيتعلم طفلك؟</h4>
                        <ul className={styles.benefitsList}>
                            {roadmapSteps[activeRoadmap].benefits.map((b, j) => (
                                <li key={j} className={styles.benefitItem}>
                                    <span className={styles.checkIcon}>✓</span> {b}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* ── Programming Benefits ───────────────────────────────── */}
            <section className={styles.benefitsSection}>
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionBadge}>لماذا البرمجة؟</span>
                    <h2>فوائد تعليم البرمجة للأطفال</h2>
                    <p>أكثر من مجرد كود — البرمجة تبني شخصية الطفل وتفتح له أبواباً لا تُعدّ</p>
                </div>
                <div className={styles.benefitsGrid}>
                    {benefits.map((b, i) => (
                        <div key={i} className={styles.benefitCard} style={{ animationDelay: `${i * 0.1}s` }}>
                            <span className={styles.benefitIcon}>{b.icon}</span>
                            <h3>{b.title}</h3>
                            <p>{b.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Courses Section ────────────────────────────────────── */}
            <section className={styles.coursesWrapper}>
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionBadge}>الكورسات</span>
                    <h2>اختر الكورس المناسب</h2>
                </div>
                <Courses />
            </section>

            {/* ── YouTube Section ────────────────────────────────────── */}
            <section className={styles.youtube}>
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionBadge}>شاهد وتعلّم</span>
                    <h2>نموذج من محتوانا</h2>
                </div>
                <div className={styles.videoWrapper}>
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                    />
                </div>
            </section>

            {/* ── Features Section ───────────────────────────────────── */}
            <section className={styles.features}>
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionBadge}>مميزاتنا</span>
                    <h2>لماذا تختارنا؟</h2>
                </div>
                <div className={styles.featureGrid}>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIconWrap}>🎓</div>
                        <h3>مدربون خبراء</h3>
                        <p>تعلم من متخصصين بخبرة سنوات في تعليم الأطفال البرمجة</p>
                    </div>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIconWrap}>⏱️</div>
                        <h3>تعلم مرن</h3>
                        <p>ادرس في أي وقت وأي مكان بالسرعة التي تناسب طفلك</p>
                    </div>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIconWrap}>🎯</div>
                        <h3>تعلم تفاعلي</h3>
                        <p>محتوى تفاعلي وتحديات عملية مع تغذية راجعة فورية</p>
                    </div>
                </div>
            </section>

            {/* ── Testimonials Section ─────────────────────────────────
            

                        <section className={styles.testimonialsSection}>
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionBadge}>آراء الطلاب</span>
                    <h2>ماذا يقول طلابنا؟</h2>
                </div>
                <div className={styles.testimonialsGrid}>
                    {testimonials.map((t, i) => (
                        <div key={i} className={styles.testimonialCard}>
                            <div className={styles.testimonialQuote}>"</div>
                            <p className={styles.testimonialText}>{t.text}</p>
                            <div className={styles.testimonialAuthor}>
                                <div className={styles.testimonialAvatar}>{t.avatar}</div>
                                <div>
                                    <strong>{t.name}</strong>
                                    <span>{t.role}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            
            */}


            {/* ── Newsletter Section ─────────────────────────────────── */}
            <section className={styles.newsletterSection}>
                <div className={styles.newsletterContent}>
                    <span className={styles.newsletterIcon}>📬</span>
                    <h2>ابقَ على اطلاع</h2>
                    <p>اشترك في نشرتنا البريدية واحصل على آخر الكورسات والنصائح لتعليم أطفالك البرمجة</p>
                    {subscribed ? (
                        <div className={styles.subscribedMsg}>✅ شكراً! تم اشتراكك بنجاح.</div>
                    ) : (
                        <form onSubmit={handleNewsletter} className={styles.newsletterForm}>
                            <input
                                type="email"
                                placeholder="أدخل بريدك الإلكتروني"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                className={styles.newsletterInput}
                            />
                            <button type="submit" className={styles.newsletterBtn}>اشترك الآن</button>
                        </form>
                    )}
                </div>
            </section>

            {/* ── Final CTA ──────────────────────────────────────────── */}
            <section className={styles.cta}>
                <div className={styles.ctaInner}>
                    <h2>هل أنت مستعد للبدء؟</h2>
                    <p>انضم لآلاف الطلاب حول العالم وابدأ رحلة التعلم اليوم.</p>
                    <Link href="/signup" className={styles.ctaButton}>
                        سجّل الآن مجاناً
                    </Link>
                </div>
            </section>

            <Footer />
            <NotificationPage {...notifi} />
        </div>
    );
}

// ─── Stat Card Component ──────────────────────────────────────────────────────
function StatCard({ stat, isVisible }: { stat: typeof stats[0]; isVisible: boolean }) {
    const display = useCountUp(stat.value, isVisible);
    return (
        <div className={styles.statCard}>
            <span className={styles.statIcon}>{stat.icon}</span>
            <span className={styles.statValue}>{display}</span>
            <span className={styles.statLabel}>{stat.label}</span>
        </div>
    );
}