import styles from './CourseDetailModal.module.css';

interface CourseDetailModalProps {
    course: {
        id: number;
        title: string;
        description: string;
        price: number;
        imageUrl: string;
    };
    isOpen: boolean;
    onClose: () => void;
}

export default function CourseDetailModal({ course, isOpen, onClose }: CourseDetailModalProps) {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                <div className={styles.courseImage}>
                    <img src={course.imageUrl} alt={course.title} />
                </div>

                <div className={styles.courseDetails}>
                    <h2>{course.title}</h2>
                    <p className={styles.price}>${course.price.toFixed(2)}</p>
                    <p className={styles.description}>{course.description}</p>

                    <div className={styles.features}>
                        <div className={styles.featureItem}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="16" />
                                <line x1="8" y1="12" x2="16" y2="12" />
                            </svg>
                            <span>Interactive Lessons</span>
                        </div>
                        <div className={styles.featureItem}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2M6 5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2M6 5h6m4 0h4" />
                            </svg>
                            <span>24/7 Support</span>
                        </div>
                        <div className={styles.featureItem}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4H6" />
                            </svg>
                            <span>Certification</span>
                        </div>
                    </div>

                    <div className={styles.ctaButtons}>
                        <button className={styles.enrollButton}>
                            Enroll Now
                        </button>
                        <button className={styles.wishlistButton}>
                            Add to Wishlist
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
