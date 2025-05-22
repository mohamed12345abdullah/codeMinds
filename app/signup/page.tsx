'use client';

import "./signup.module.css";
import { signupApi } from "../api";
import { useRef, useState } from "react";
import SimpleNotification from "../components/SimpleNotification";
import Navbar from "../components/Navbar";

export default function SignupPage() {
    const nameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const [notifi, setNotifi] = useState('');
    const [notificationKey, setNotificationKey] = useState(0);

    const showNotification = (message: string) => {
        setNotifi(message);
        setNotificationKey(prev => prev + 1);
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        const name = nameRef.current?.value;
        const password = passwordRef.current?.value;
        const email = emailRef.current?.value;

        if (!name || !password) {
            showNotification("Name and password are required");
            return;
        }
        if (password.length < 8) {
            showNotification("Password must be at least 8 characters");
            return;
        }
        if (!email || !email.includes("@")) {
            showNotification("Email must contain @");
            return;
        }
        if (!email) {
            showNotification("Email is required");
            return;
        }
        try {
            const data = await signupApi({name, password, email});
            showNotification(data.message);
            localStorage.setItem("token", data.token);
            window.location.href = "../";
        } catch {
            showNotification("Signup failed. Please try again.");
        }
    }

    return (
        <>
        <Navbar />

        <div className={".container"}>
            <h1>Sign Up</h1>
            <form className="form" onSubmit={handleSignup}>
                <input 
                    className="input" 
                    type="text" 
                    placeholder="Name" 
                    ref={nameRef} 
                />   
                <input 
                    className="input" 
                    type="password" 
                    placeholder="Password"
                    ref={passwordRef} 
                />   
                <input 
                    className="input" 
                    type="email" 
                    placeholder="Email"
                    ref={emailRef} 
                />   
                <button className="button" type="submit">Sign Up</button>
            </form>
            {notifi && <SimpleNotification key={notificationKey} text={notifi} />}
        </div>
        </>
    )
}
