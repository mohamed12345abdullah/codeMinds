"use client";

const baseUrl = "https://code-minds-website.vercel.app/api";
// const baseUrl = "http://localhost:4000/api";
// search params

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

export default function Join() {
    const [group, setGroup] = useState<Group | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const groupId = searchParams.get("code");
    const router = useRouter();
    const fetchGroup = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${baseUrl}/groups/${groupId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        authorization: `Bearer ${window.localStorage.getItem("token")}`,
                    },
                }
            )
            const result = await response.json();
            if (response.ok && result.success) {
                setGroup(result.data);
            } else if (response.status === 401) {
                window.location.href = `/login`;
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
        try {
            const response = await fetch(`${baseUrl}/groups/join/${groupId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        authorization: `Bearer ${window.localStorage.getItem("token")}`,
                    },
                }
            )
            const result = await response.json();
            if (response.ok && result.success) {
                window.location.href = `/profile`;
            } else if (response.status === 401) {
                window.location.href = `/login`;
            } else {
                alert(result?.message || "Failed to join");
            }
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        fetchGroup();
    }, []);
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
        </div>
    );
}