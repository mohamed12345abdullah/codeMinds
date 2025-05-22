'use client'

import { useState } from 'react';
import styles from './profile.module.css';

import Navbar from '../components/Navbar';
import { FiUser, FiSettings, FiBook, FiBell, FiEdit2, FiSave, FiChevronRight } from 'react-icons/fi';   

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        name: 'أحمد محمد',
        email: 'ahmed@example.com',
        bio: 'مطور ويب متخصص في React و Next.js',
        location: 'القاهرة، مصر',
        phone: '+20 123 456 7890',
        language: 'العربية',
        notifications: {
            email: true,
            push: true,
            marketing: false
        },
        privacy: {
            showEmail: true,
            showPhone: false,
            showLocation: true,
            showBio: true
        },
        security: {
            twoFactor: false,
            loginNotifications: true,
            sessionTimeout: '30'
        }
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNotificationChange = (type: string) => {
        setProfileData(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [type]: !prev.notifications[type as keyof typeof prev.notifications]
            }
        }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePrivacyChange = (setting: string) => {
        setProfileData(prev => ({
            ...prev,
            privacy: {
                ...prev.privacy,
                [setting]: !prev.privacy[setting as keyof typeof prev.privacy]
            }
        }));
    };

    const handleSecurityChange = (setting: string, value: string | boolean) => {
        setProfileData(prev => ({
            ...prev,
            security: {
                ...prev.security,
                [setting]: value
            }
        }));
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // هنا يمكن إضافة منطق تغيير كلمة المرور
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('كلمات المرور غير متطابقة');
            return;
        }
        // إعادة تعيين حقول كلمة المرور
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
    };

    const handleSave = () => {
        // هنا يمكن إضافة منطق حفظ البيانات
        setIsEditing(false);
    };

    const renderProfileSection = () => (
        <div className={styles.section}>
            <h2>
                <FiUser />
                الملف الشخصي
            </h2>
            <div className={styles.formGroup}>
                <label htmlFor="name">الاسم</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={profileData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="email">البريد الإلكتروني</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="bio">نبذة شخصية</label>
                <textarea
                    id="bio"
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="location">الموقع</label>
                <input
                    type="text"
                    id="location"
                    name="location"
                    value={profileData.location}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="phone">رقم الهاتف</label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="language">اللغة المفضلة</label>
                <select
                    id="language"
                    name="language"
                    value={profileData.language}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                >
                    <option value="العربية">العربية</option>
                    <option value="English">English</option>
                </select>
            </div>
            {isEditing ? (
                <button className={styles.saveButton} onClick={handleSave}>
                    <FiSave />
                    حفظ التغييرات
                </button>
            ) : (
                <button className={styles.saveButton} onClick={() => setIsEditing(true)}>
                    <FiEdit2 />
                    تعديل الملف الشخصي
                </button>
            )}
        </div>
    );

    const renderSettingsSection = () => (
        <div className={styles.section}>
            <h2>
                <FiSettings />
                الإعدادات
            </h2>

            {/* إعدادات الخصوصية */}
            <div className={styles.formGroup}>
                <h3>إعدادات الخصوصية</h3>
                <div className={styles.notificationSettings}>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={profileData.privacy.showEmail}
                            onChange={() => handlePrivacyChange('showEmail')}
                        />
                        إظهار البريد الإلكتروني
                    </label>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={profileData.privacy.showPhone}
                            onChange={() => handlePrivacyChange('showPhone')}
                        />
                        إظهار رقم الهاتف
                    </label>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={profileData.privacy.showLocation}
                            onChange={() => handlePrivacyChange('showLocation')}
                        />
                        إظهار الموقع
                    </label>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={profileData.privacy.showBio}
                            onChange={() => handlePrivacyChange('showBio')}
                        />
                        إظهار النبذة الشخصية
                    </label>
                </div>
            </div>

            {/* إعدادات الأمان */}
            <div className={styles.formGroup}>
                <h3>إعدادات الأمان</h3>
                <div className={styles.notificationSettings}>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={profileData.security.twoFactor}
                            onChange={() => handleSecurityChange('twoFactor', !profileData.security.twoFactor)}
                        />
                        تفعيل المصادقة الثنائية
                    </label>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={profileData.security.loginNotifications}
                            onChange={() => handleSecurityChange('loginNotifications', !profileData.security.loginNotifications)}
                        />
                        إشعارات تسجيل الدخول
                    </label>
                    <div className={styles.formGroup}>
                        <label htmlFor="sessionTimeout">مدة انتهاء الجلسة (بالدقائق)</label>
                        <select
                            id="sessionTimeout"
                            value={profileData.security.sessionTimeout}
                            onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
                        >
                            <option value="15">15 دقيقة</option>
                            <option value="30">30 دقيقة</option>
                            <option value="60">ساعة</option>
                            <option value="120">ساعتين</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* تغيير كلمة المرور */}
            <div className={styles.formGroup}>
                <h3>تغيير كلمة المرور</h3>
                <form onSubmit={handlePasswordSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="currentPassword">كلمة المرور الحالية</label>
                        <input
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="newPassword">كلمة المرور الجديدة</label>
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            required
                        />
                    </div>
                    <button type="submit" className={styles.saveButton}>
                        <FiSave />
                        تغيير كلمة المرور
                    </button>
                </form>
            </div>

            {/* إعدادات الإشعارات */}
            <div className={styles.formGroup}>
                <h3>إعدادات الإشعارات</h3>
                <div className={styles.notificationSettings}>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={profileData.notifications.email}
                            onChange={() => handleNotificationChange('email')}
                        />
                        إشعارات البريد الإلكتروني
                    </label>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={profileData.notifications.push}
                            onChange={() => handleNotificationChange('push')}
                        />
                        إشعارات التطبيق
                    </label>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={profileData.notifications.marketing}
                            onChange={() => handleNotificationChange('marketing')}
                        />
                        إشعارات التسويق
                    </label>
                </div>
            </div>
        </div>
    );

    const renderCoursesSection = () => (
        <div className={styles.section}>
            <h2>
                <FiBook />
                الدورات التدريبية
            </h2>
            <div className={styles.courseList}>
                {[1, 2, 3].map((course) => (
                    <div key={course} className={styles.courseCard}>
                        <div className={styles.courseImage}>
                            <img src={`/course-${course}.jpg`} alt={`Course ${course}`} />
                        </div>
                        <div className={styles.courseContent}>
                            <h3>دورة تطوير الويب المتقدمة</h3>
                            <p>تعلم تطوير تطبيقات الويب الحديثة باستخدام React و Next.js</p>
                            <div className={styles.courseProgress}>
                                <div className={styles.progressBar}>
                                    <div className={styles.progressFill} style={{ width: '75%' }} />
                                </div>
                                <div className={styles.progressText}>
                                    <span>75% مكتمل</span>
                                    <span>3/4 دروس</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderNotificationsSection = () => (
        <div className={styles.section}>
            <h2>
                <FiBell />
                الإشعارات
            </h2>
            <div className={styles.notificationList}>
                {[1, 2, 3].map((notification) => (
                    <div key={notification} className={styles.notificationItem}>
                        <div className={styles.notificationContent}>
                            <h3>تم تحديث الدورة التدريبية</h3>
                            <p>تم إضافة درس جديد في دورة تطوير الويب المتقدمة</p>
                            <span className={styles.notificationTime}>منذ ساعتين</span>
                        </div>
                        <FiChevronRight className={styles.notificationIcon} />
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <>
        <Navbar />
        <div className={styles.container}>
            <div className={styles.profileHeader}>
                <h1>الملف الشخصي</h1>
                <p>إدارة معلومات حسابك وإعداداتك الشخصية</p>
            </div>

            <div className={styles.profileContent}>
                <aside className={styles.sidebar}>
                    <div className={styles.profileImage}>
                        <img src="/profile.jpg" alt="Profile" />
                        <button className={styles.editImageButton}>
                            <FiEdit2 />
                            تغيير الصورة
                        </button>
                    </div>
                    <div className={styles.userInfo}>
                        <h2>{profileData.name}</h2>
                        <p>{profileData.email}</p>
                    </div>
                    <nav className={styles.sidebarNav}>
                        <button
                            className={`${styles.navButton} ${activeTab === 'profile' ? styles.active : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <FiUser />
                            الملف الشخصي
                        </button>
                        <button
                            className={`${styles.navButton} ${activeTab === 'settings' ? styles.active : ''}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            <FiSettings />
                            الإعدادات
                        </button>
                        <button
                            className={`${styles.navButton} ${activeTab === 'courses' ? styles.active : ''}`}
                            onClick={() => setActiveTab('courses')}
                        >
                            <FiBook />
                            الدورات التدريبية
                        </button>
                        <button
                            className={`${styles.navButton} ${activeTab === 'notifications' ? styles.active : ''}`}
                            onClick={() => setActiveTab('notifications')}
                        >
                            <FiBell />
                            الإشعارات
                        </button>
                    </nav>
                </aside>

                <main className={styles.mainContent}>
                    {activeTab === 'profile' && renderProfileSection()}
                    {activeTab === 'settings' && renderSettingsSection()}
                    {activeTab === 'courses' && renderCoursesSection()}
                    {activeTab === 'notifications' && renderNotificationsSection()}
                </main>
            </div>
        </div>
        </>
    );
}