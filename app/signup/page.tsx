'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import NotificationPage from '../notification/page';
import Navbar from '../components/Navbar';
import styles from './signup.module.css';
import Link from 'next/link';
import { registerApi } from '../apis/auth';
import { sendIpApi } from '../apis/auth';
import { verifyTokenApi } from "../apis/auth";

export default function SignUpPage() {
    useEffect(() => {
        sendIpApi("signup");
    },[]);
    enum notificationStatus { success = "success", error = "error", warning = "warning" };

    const router = useRouter();
    const emailRef = useRef<HTMLInputElement>(null);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [notifi, setNotifi] = useState({
        text: '',
        status: notificationStatus.success,
        key: Date.now()
    });
    const [loading, setLoading] = useState(false);
    const [responseMsg, setResponseMsg] = useState('');

    useEffect(() => {
        // إذا تم فتح الصفحة وفيها بيانات في window.name (نافذة OAuth مغلقة وأرسلت البيانات)
        try {
            if (window.name && window.name.startsWith('{') && window.name.endsWith('}')) {
                const data = JSON.parse(window.name);
                if (data.token) {
                    localStorage.setItem('token', data.token);
                }
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                }
                window.name = '';
                router.push('/profile');
                return;
            }
        } catch (e) {}
        // الطريقة التقليدية: التقاط التوكن من الرابط
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const userParam = params.get('user');
        if (token) {
            setLoading(true);
            localStorage.setItem('token', token);
            if (userParam) {
                try {
                    const user = JSON.parse(decodeURIComponent(userParam));
                    localStorage.setItem('user', JSON.stringify(user));
                } catch (e) {}
                setLoading(false);
                router.push("/profile");
            } else {
                (async () => {
                    await verifyTokenApi();
                    setLoading(false);
                    router.push("/profile");
                })();
            }
        }
    }, [router]);

    if (loading) return <div>جاري تسجيل الدخول ...</div>;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setNotifi({
            text: '',
            status: notificationStatus.success,
            key: Date.now()
        });

        if (!username || !email || !password) {
            setNotifi({
                text: 'All fields are required',
                status: notificationStatus.error,
                key: Date.now()
            });
            return;
        }

        if (!email.includes('@')) {
            setNotifi({
                text: 'Please enter a valid email',
                status: notificationStatus.warning,
                key: Date.now()
            });
            return;
        }

        if (password.length < 8) {
            setNotifi({
                text: 'Password must be at least 8 characters',
                status: notificationStatus.warning,
                key: Date.now()
            });
            return;
        }

        try {
            setLoading(true);
            const response = await registerApi({
                name: username,
                email: email,
                password: password,
                phone: phone
            });
            setResponseMsg(response.message);
            if (response.success) {
                setNotifi({
                    text: response.message,
                    status: notificationStatus.success,
                    key: Date.now()
                });
            }
            else {
                setNotifi({
                    text: response.message,
                    status: notificationStatus.error,
                    key: Date.now()
                });
            }
            if (responseMsg.includes('Failed to fetch')) {
                setNotifi({
                    text: 'Failed to connect to server',
                    status: notificationStatus.error,
                    key: Date.now()
                });
            }

        } catch (error: any) {
            let errorMessage = 'An error occurred';
            errorMessage = error.message;
            setNotifi({
                text: errorMessage,
                status: notificationStatus.error,
                key: Date.now()
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.signup}>
            <Navbar />
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2>Sign up to your account</h2>
                </div>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <input
                            type="text"
                            required
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <input
                            type="email"
                            required
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <input
                            type="password"
                            required
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <input
                            type="text"
                            required
                            placeholder="Phone number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className={styles.input}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={styles.submitButton}
                    >
                        {loading ? 'Signing up...' : 'Sign up'}
                    </button>
                    {responseMsg && <p className={styles.importantMsg}>{responseMsg}</p>}

                </form>
                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                  <button
                    type="button"
                    onClick={() => window.location.href = 'https://code-minds-website.vercel.app/api/auth/google'}
                    style={{
                      background: '#4285F4',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '12px 24px',
                      fontSize: 16,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      width: '100%', 
                      marginTop: 8
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 48 48" style={{ marginRight: 8 }}><g><path fill="#4285F4" d="M43.611 20.083H42V20H24v8h11.303C34.73 32.091 29.865 35 24 35c-6.627 0-12-5.373-12-12s5.373-12 12-12c2.803 0 5.377.988 7.413 2.626l6.591-6.591C34.583 5.163 29.584 3 24 3 12.954 3 4 11.954 4 23s8.954 20 20 20c11.045 0 19.799-7.954 19.799-19 0-1.27-.138-2.507-.377-3.717z"/><path fill="#34A853" d="M6.306 14.691l6.571 4.819C14.655 16.108 19.001 13 24 13c2.803 0 5.377.988 7.413 2.626l6.591-6.591C34.583 5.163 29.584 3 24 3c-7.732 0-14.41 4.388-17.694 10.691z"/><path fill="#FBBC05" d="M24 43c5.522 0 10.522-1.885 14.413-5.126l-6.799-5.566C29.865 35 24 35 24 35c-5.865 0-10.73-2.909-13.303-7.091l-6.591 6.591C9.59 40.612 16.268 43 24 43z"/><path fill="#EA4335" d="M43.611 20.083H42V20H24v8h11.303c-1.377 3.091-5.303 7-11.303 7-6.627 0-12-5.373-12-12s5.373-12 12-12c2.803 0 5.377.988 7.413 2.626l6.591-6.591C34.583 5.163 29.584 3 24 3c-7.732 0-14.41 4.388-17.694 10.691z"/></g></svg>
                    التسجيل باستخدام جوجل
                  </button>
                </div>
                <p className={styles.link}>
                    Already have an account?{' '}
                    <Link href="/login">Sign in</Link>
                </p>
            </div>
            {notifi.text!= '' && <NotificationPage text={notifi.text} status={notifi.status} k={notifi.key} />}
        </div>
    );
}
