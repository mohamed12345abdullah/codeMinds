"use client";

const baseUrl = "https://code-minds-website.vercel.app/api";
// const baseUrl = "http://localhost:4000/api";
// search params


import CompleteDateOfInstructor from "./completeDateOfInstructor";

interface Group {
    _id: string;
    title: string;
    course: {
        _id: string;
        title: string;
    };
}

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

function JoinContent() {
    const [group, setGroup] = useState<Group | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState<string>('');
    const [isStudentModalOpen, setIsStudentModalOpen] = useState<boolean>(false);
    const searchParams = useSearchParams();
    const groupId = searchParams.get("code");
    const router = useRouter();

    useEffect(() => {
        // Only access localStorage on the client side
        if (typeof window !== 'undefined') {
            setToken(localStorage.getItem('token') || '');
        }
    }, []);
    const fetchGroup = async () => {
        if (!token) return; // Don't fetch if no token
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${baseUrl}/groups/${groupId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        authorization: `Bearer ${token}`,
                    },
                }
            )
            const result = await response.json();
            if (response.ok && result.success) {
                setGroup(result.data);
            } else if (response.status === 401) {
                window.location.href = `/login`;
            } else if (response.status === 404) {
                setError("Invalid or expired code");
            } else {
                setError(result?.message || "Invalid or expired code");
            }
        } catch (error) {
            console.log(error);
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    const joinCourse = async () => {
        if (!token) {
            // go to log in page
            window.location.href = `/login`;
            return;
        }; // Don't join if no token
        try {
            const response = await fetch(`${baseUrl}/groups/join/${groupId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        authorization: `Bearer ${token}`,
                    },
                }
            )
            const result = await response.json();
            if (response.ok && result.success) {
                window.location.href = `/profile`;
            } else if (response.status === 401) {
                window.location.href = `/login`;
            } else if (response.status === 404 && result?.message === "student not found") {
                // Open the student info modal instead of redirecting
                setIsStudentModalOpen(true);
                return;
            } else {
                alert(result?.message || "Failed to join");
            }
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        if (token) {
            fetchGroup();
        }
    }, [token]);
    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--background)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
        }}>
            <div style={{
                width: '100%',
                maxWidth: 520,
                border: '1px solid var(--border)',
                background: 'var(--card-bg)',
                borderRadius: 12,
                boxShadow: '0 10px 22px rgba(0,0,0,0.2)',
                padding: 20,
                color: 'var(--text)'
            }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, marginBottom: 6 }}>Join Group</h1>
                <p style={{ color: 'var(--text-light)', marginTop: 0, marginBottom: 16 }}>Use the button below to join this group.</p>

                {loading ? (
                    <div style={{ color: 'var(--text-light)' }}>Loading...</div>
                ) : error ? (
                    <div style={{ padding: 10, border: '1px solid #92400e', borderRadius: 8, color: '#fed7aa', background: '#451a03', marginBottom: 12 }}>{error}</div>
                ) : group ? (
                    <div style={{ display: 'grid', gap: 8 }}>
                        <div>
                            <div style={{ color: 'var(--text-light)', fontSize: 12 }}>Group</div>
                            <div style={{ fontWeight: 700 }}>{group.title}</div>
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-light)', fontSize: 12 }}>Course</div>
                            <div style={{ color: 'var(--text)' }}>{group.course.title}</div>
                        </div>
                        <button onClick={joinCourse} style={{
                            marginTop: 10,
                            padding: '10px 14px',
                            borderRadius: 8,
                            background: 'var(--primary)',
                            border: '1px solid transparent',
                            color: '#fff',
                            cursor: 'pointer'
                        }}>Join</button>
                    </div>
                ) : (
                    <div style={{ color: 'var(--text-light)' }}>No group found for this code.</div>
                )}
            </div>
            <CompleteDateOfInstructor
                isOpen={isStudentModalOpen}
                onClose={() => setIsStudentModalOpen(false)}
                onSubmit={(data) => {
                    // You can forward data to a dedicated endpoint here if needed
                    // For now, proceed to the dedicated student form page
                    setIsStudentModalOpen(false);
                }}
            />
        </div>
    );
}

export default function Join() {
    return (
        <Suspense fallback={
            <div style={{
                minHeight: '100vh',
                background: 'var(--background)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16,
            }}>
                <div style={{ color: 'var(--text-light)' }}>Loading...</div>
            </div>
        }>
            <JoinContent />
        </Suspense>
    );
}