'use client'

import "./login.css";
import { loginApi } from "../apis/auth";
import { useRef, useState, useEffect } from "react";
import NotificationPage from "../notification/page";
import Navbar from "../components/Navbar";
import ForgotPasswordModal from "./forgerPasswordModal";
import { verifyTokenApi } from "../apis/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const rememberMeRef = useRef<HTMLInputElement>(null);
    const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    enum notificationStatus { success = "success", error = "error", warning = "warning" };
    const [notifi, setNotifi] = useState({
        text: '',
        status: notificationStatus.success,
        key: Date.now()
    });
    const [responseMsg, setResponseMsg] = useState('');
    const router = useRouter();

    useEffect(() => {
        // استقبال التوكن من الرابط بعد تسجيل الدخول بجوجل
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (token) {
            localStorage.setItem('token', token);
            // جلب بيانات المستخدم وتخزينها
            (async () => {
                await verifyTokenApi();
                router.push("/profile");
            })();
        }
    }, [router]);

    const showNotification = (message: string, status: notificationStatus) => {
        setNotifi({
            text: message,
            status: status,
            key: Date.now()
        });
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const email = emailRef.current?.value;
        const password = passwordRef.current?.value;
        const rememberMe = rememberMeRef.current?.checked;

        if (!email || !password) {
            showNotification("Email or password is required", notificationStatus.warning);
            setResponseMsg("Email or password is required");
            return;
        }
        if (!email.includes("@")) {
            showNotification("Email must contain @", notificationStatus.warning);
            setResponseMsg("Email must contain @");
            return;
        }
        if (password.length < 8) {
            showNotification("Password must be at least 8 characters", notificationStatus.warning);
            setResponseMsg("Password must be at least 8 characters");
            return;
        }

        try {
            const data = await loginApi({email, password, rememberMe: rememberMe || false});
       
            if(data.success){
                window.location.href = "../profile";
            } else {
                showNotification(data.message, notificationStatus.error);
                setResponseMsg(data.message);
            }
        } catch (error) {
            console.log(error);
            showNotification("Login failed. Please try again.", notificationStatus.error);
            setResponseMsg("Login failed. Please try again.");
        }
    }

    return (
        <>
            <Navbar />
            <div className="login-container">
                <form onSubmit={handleLogin}>
                    <h1>Login</h1>
                    
                    <div>
                        <label htmlFor="email">Email</label>
                        <input 
                            className="input" 
                            type="email" 
                            id="email"
                            placeholder="Enter your email" 
                            ref={emailRef} 
                        />
                    </div>

                    <div className="password-container">
                        <label htmlFor="password">Password</label>
                        <div className="password-input-wrapper">
                            <input 
                                className="input" 
                                type={showPassword ? "text" : "password"}
                                id="password"
                                placeholder="Enter your password"
                                ref={passwordRef} 
                            />
                            <p
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </p>
                        </div>
                    </div>

                    <div className="rememberMe">
                        <input 
                            type="checkbox"
                            id="rememberMe"
                            ref={rememberMeRef} 
                            defaultChecked={false}
                        />
                        <label htmlFor="rememberMe">Remember me</label>
                    </div>
                    <div id="forgetPassword"
                    onClick={() => setIsForgotPasswordModalOpen(true)}
                    >
                            Forgot Password?
                    </div>
                
                    <button type="submit">Login</button>

                    {responseMsg && <p className="importantMsg">{responseMsg}</p>}
                </form>
                <div style={{ textAlign: 'center', margin: '24px 0' }}>
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
                    Continue with Google
                  </button>
                </div>
                <ForgotPasswordModal 
                    isOpen={isForgotPasswordModalOpen}
                    onClose={() => setIsForgotPasswordModalOpen(false)}
                />
                {notifi && <NotificationPage text={notifi.text} status={notifi.status} k={notifi.key} />}
            </div>
        </>
    )
}
