'use client'

import "./login.css";
import { loginApi } from "../apis/auth";
import { useRef, useState } from "react";
import NotificationPage from "../notification/page";
import Navbar from "../components/Navbar";

export default function LoginPage() {
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const rememberMeRef = useRef<HTMLInputElement>(null);
    enum notificationStatus { success = "success", error = "error", warning = "warning" };
    const [notifi, setNotifi] = useState({
        text: '',
        status: notificationStatus.success,
        key: Date.now()
    });
    const [responseMsg, setResponseMsg] = useState('');

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
            <div className="container">
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

                    <div>
                        <label htmlFor="password">Password</label>
                        <input 
                            className="input" 
                            type="password" 
                            id="password"
                            placeholder="Enter your password"
                            ref={passwordRef} 
                        />
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
                
                    <button type="submit">Login</button>

                    {responseMsg && <p className="importantMsg">{responseMsg}</p>}
                </form>
                {notifi && <NotificationPage text={notifi.text} status={notifi.status} k={notifi.key} />}
            </div>
        </>
    )
}
