
'use client'

import Navbar from "../components/Navbar";
import NotificationPage from "../notification/page";
import { useState, useEffect } from "react";
import styles from "./question.module.css";
// const baseUrl = "https://code-minds-website.vercel.app/api";
const baseUrl = "http://localhost:4000/api";



const getQuestions = async (category:string) => {
    const response = await fetch(`${baseUrl}/questions/${category}`);
    const data = await response.json();
    if(!response.ok) {
        if(response.status === 401) {
            window.location.href = '/login';
            return;
        }else{
            console.log("Failed to fetch questions:", data);
            return;
        }
    }
    return data.data;   
}


const addQuestion = async (question: string) => {
    const response = await fetch(`${baseUrl}/questions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
            question
        })
    });
    const data = await response.json();
    if(!response.ok) {
        if(response.status === 401) {
            window.location.href = '/login';
            return;
        }else{
            console.log("Failed to add question:", data);
            return;
        }
    }
    return data.data;
}


const deleteQuestion = async (id: string) => {
    const response = await fetch(`${baseUrl}/questions/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    const data = await response.json();
    if(!response.ok) {
        if(response.status === 401) {
            window.location.href = '/login';
            return;
        }else{
            console.log("Failed to delete question:", data);
            return;
        }
    }
    return data.data;
}





export default function Questions() {
    const [questions, setQuestions] = useState<any>([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const questions = await getQuestions('feedBack');
                setQuestions(questions);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching questions:', error);
                setIsLoading(false);
            }
        };
        fetchQuestions();
    }, []);
    return (
        <div className={styles.container}>
            <Navbar />
            <h1 className={styles.title}>Questions</h1>
            
            {isLoading ? (
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                </div>
            ) : (
                <div className={styles.questionsGrid}>
                    {questions.map((question: any) => (
                        <div key={question._id} className={styles.questionCard}>
                            <p className={styles.questionText}>{question.question}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
