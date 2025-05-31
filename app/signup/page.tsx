'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import NotificationPage from '../notification/page';
import Navbar from '../components/Navbar';
import styles from './signup.module.css';
import Link from 'next/link';
import { registerApi } from '../apis/auth';
import { sendIpApi } from '../apis/auth';

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
    const [isLoading, setIsLoading] = useState(false);
    const [responseMsg, setResponseMsg] = useState('');

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
            setIsLoading(true);
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
            setIsLoading(false);
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
                        disabled={isLoading}
                        className={styles.submitButton}
                    >
                        {isLoading ? 'Signing up...' : 'Sign up'}
                    </button>
                    {responseMsg && <p className={styles.importantMsg}>{responseMsg}</p>}

                </form>
                <p className={styles.link}>
                    Already have an account?{' '}
                    <Link href="/login">Sign in</Link>
                </p>
            </div>
            {notifi.text!= '' && <NotificationPage text={notifi.text} status={notifi.status} k={notifi.key} />}
        </div>
    );
}
