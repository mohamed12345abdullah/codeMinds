'use client'

import "./login.css";
import { loginApi } from "../apis/auth";
import { useRef, useState } from "react";
import NotificationPage from "../notification/page";
import Navbar from "../components/Navbar";

export default function LoginPage() {
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const [notifi, setNotifi] = useState('');
    const [notificationKey, setNotificationKey] = useState(0);
    const [responseMsg, setResponseMsg] = useState('');
    const showNotification = (message: string) => {
        setNotifi(message);
        setNotificationKey(prev => prev + 1);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const email = emailRef.current?.value;
        const password = passwordRef.current?.value;

        if (!email || !password) {
            showNotification("Email or password is required");
            return;
        }
        if (!email.includes("@")) {
            showNotification("Email must contain @");
            return;
        }
        if (password.length < 8) {
            showNotification("Password must be at least 8 characters");
            return;
        }

        try {
            const data =await loginApi({email, password});
            showNotification(data.message);
            setResponseMsg(data.message);
            if(data.success){
                // here save the token in the local storage
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                // redirect to the home page
                window.location.href = "../profile";
            }
            
        } catch (error) {
            showNotification("Login failed. Please try again.");
        }
    }

    return (
        <>
        <Navbar />

        <div className="container">
            <h1>Login</h1>
            <form className="form" onSubmit={handleLogin}>
                <input 
                    className="input" 
                    type="email" 
                    placeholder="Email" 
                    ref={emailRef} 
                />   
                <input 
                    className="input" 
                    type="password" 
                    placeholder="Password"
                    ref={passwordRef} 
                />   
                <button className="button" type="submit">Login</button>

                {responseMsg && <p className="importantMsg">{responseMsg}</p>}
            </form>
            {notifi && <NotificationPage searchParams={{text:notifi}} />}
        </div>
        </>
    )
}
