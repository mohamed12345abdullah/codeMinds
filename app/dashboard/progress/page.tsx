'use client';
import { useEffect, useState } from "react";
import Link from 'next/link';

// fetch groups

const baseUrl = "https://code-minds-website.vercel.app/api";
// const baseUrl = "http://localhost:4000/api";
// const baseInstructorUrl = "http://localhost:4000/api/instructor";

interface Group {
    _id: string;
    title: string;
    course: string | { _id: string; title?: string };
}

type GroupStatus = 'inProgress' | 'pending' | 'ended';

export default function ProgressPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [status, setStatus] = useState<GroupStatus>('inProgress');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchGroups = async (nextStatus: GroupStatus) => {
        try {
            setLoading(true);
            setError(null);
            setStatus(nextStatus);
            const response = await fetch(`${baseUrl}/groups/status/${nextStatus}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            const result = await response.json();
            if (response.ok) {
                setGroups(Array.isArray(result?.data) ? result.data : []);
            } else {
                if (response.status === 401) {
                    window.location.href = "/login";
                    return;
                }
                setError(result?.message || 'Failed to fetch groups');
                setGroups([]);
            }
        } catch (e: any) {
            console.error(e);
            setError(e?.message || 'Something went wrong');
            setGroups([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial load
        fetchGroups('inProgress');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Groups Progress</h1>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <button onClick={() => fetchGroups('inProgress')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #334155', background: status === 'inProgress' ? '#3b82f6' : '#0f172a', color: '#f1f5f9' }}>In Progress</button>
                <button onClick={() => fetchGroups('pending')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #334155', background: status === 'pending' ? '#3b82f6' : '#0f172a', color: '#f1f5f9' }}>Pending</button>
                <button onClick={() => fetchGroups('ended')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #334155', background: status === 'ended' ? '#3b82f6' : '#0f172a', color: '#f1f5f9' }}>Ended</button>
            </div>

            {error && (
                <div style={{ padding: 10, border: '1px solid #92400e', borderRadius: 8, color: '#fed7aa', background: '#451a03', marginBottom: 12 }}>{error}</div>
            )}

            {loading ? (
                <div style={{ color: '#94a3b8' }}>Loading...</div>
            ) : (
                <div>
                    <div style={{ color: '#94a3b8', marginBottom: 8 }}>Total: {groups.length}</div>
                    {groups.length === 0 ? (
                        <div style={{ color: '#94a3b8' }}>No groups found.</div>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
                            {groups.map((g) => (
                                <li key={g._id}>
                                    <Link href={`/instructorDashboard/groupDetails?id=${g._id}`} style={{ textDecoration: 'none' }}>
                                        <div style={{ border: '1px solid #334155', borderRadius: 10, padding: 12, background: '#0b1220', display: 'grid', gap: 4, cursor: 'pointer' }}>
                                            <div style={{ fontWeight: 700, color: '#f1f5f9' }}>{g.title}</div>
                                            <div style={{ color: '#94a3b8', fontSize: 12 }}>ID: {g._id}</div>
                                            <div style={{ color: '#94a3b8', fontSize: 12 }}>Course: {typeof g.course === 'string' ? g.course : (g.course?.title || g.course?._id)}</div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}