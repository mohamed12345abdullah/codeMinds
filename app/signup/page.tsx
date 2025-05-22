'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import NotificationPage from '../notification/page';
import Navbar from '../components/Navbar';
import styles from './signup.module.css';
import Link from 'next/link';

export default function SignUpPage() {
    const router = useRouter();
    const emailRef = useRef<HTMLInputElement>(null);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [notifi, setNotifi] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setNotifi('');

        if (!username || !email || !password) {
            setNotifi('All fields are required');
            return;
        }

        if (!email.includes('@')) {
            setNotifi('Please enter a valid email');
            return;
        }

        if (password.length < 8) {
            setNotifi('Password must be at least 8 characters');
            return;
        }

        try {
            setIsLoading(true);
            // Here you would typically make an API call to sign up the user
            // For now, we'll just simulate success
            setNotifi('Sign up successful! Redirecting...');
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (error) {
            setNotifi('Sign up failed. Please try again.');
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
                    <button
                        type="submit"
                        disabled={isLoading}    
                        className={styles.submitButton}
                    >
                        {isLoading ? 'Signing up...' : 'Sign up'}
                    </button>
                </form>
                <p className={styles.link}>
                    Already have an account?{' '}
                    <Link href="/login">Sign in</Link>
                </p>
            </div>
            {notifi && <NotificationPage text={notifi} />}
        </div>
    );
}
