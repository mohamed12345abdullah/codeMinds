"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiBook, FiLayers, FiActivity, FiArrowRight, FiMonitor } from 'react-icons/fi';
import NavbarPage from "../components/Navbar";

const baseUrl = "https://code-minds-website.vercel.app/api";
// const baseUrl = "http://localhost:4000/api";


interface Group {
  _id: string;
  title: string;
  course: {
    _id: string;
    title: string;
  };
}

export default function InstructorDashboard() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");

      const response = await fetch(`${baseUrl}/groups/instructorGroups/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        if (Array.isArray(data.data)) {
          setGroups(data.data);
        } else {
          setGroups([]);
        }
      } else {
        if (response.status === 401) {
          alert("⚠️ You are not authorized to view this page");
          window.location.href = "/login";
        } else {
          setError("❌ Failed to fetch groups");
        }
      }
    } catch (err) {
      console.error("Error fetching groups:", err);
      setError("❌ Something went wrong while fetching groups");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user?._id) {
        fetchGroups(user._id);
      } else {
        setError("⚠️ No user found in localStorage");
        setLoading(false);
      }
    }
  }, [fetchGroups]);

  const stats = useMemo(() => {
    const totalGroups = groups.length;
    const uniqueCourses = new Set(groups.map((g) => g.course?._id)).size;
    return { totalGroups, uniqueCourses };
  }, [groups]);

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', color: '#f1f5f9' }}>
      <NavbarPage />
      
      <main style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '120px 24px 40px', // Top padding accounts for fixed navbar
      }}>
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 800, 
            color: '#fff', 
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <FiMonitor style={{ color: '#3b82f6' }} /> Instructor Workspace
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginTop: '8px' }}>
            Manage your active learning groups and track student performance.
          </p>
        </header>

        {error && (
          <div style={{ 
            padding: '16px', 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid #ef4444', 
            borderRadius: '12px', 
            color: '#fca5a5', 
            marginBottom: '32px' 
          }}>
            {error}
          </div>
        )}

        {/* Stats Overview */}
        {!loading && !error && (
          <section style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: '20px', 
            marginBottom: '48px' 
          }}>
            <div className="stat-card">
              <FiLayers size={24} color="#3b82f6" />
              <div>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Groups</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>{stats.totalGroups}</div>
              </div>
            </div>
            <div className="stat-card">
              <FiBook size={24} color="#10b981" />
              <div>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Courses</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>{stats.uniqueCourses}</div>
              </div>
            </div>
            <div className="stat-card">
              <FiActivity size={24} color="#f59e0b" />
              <div>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Status</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>{stats.totalGroups > 0 ? "Active" : "Idle"}</div>
              </div>
            </div>
          </section>
        )}

        {/* Groups Grid */}
        <section style={{
          background: 'rgba(30, 41, 59, 0.3)',
          border: '1px solid #96bef6ff',
          padding: '32px',
          borderRadius: '24px',
          backdropFilter: 'blur(8px)'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px', color: '#fff' }}>Your Groups</h2>
          
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ height: '160px', background: '#1e293b', borderRadius: '16px', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', background: '#1e293b', borderRadius: '20px', border: '2px dashed #334155' }}>
              <p style={{ color: '#94a3b8', fontSize: '1.2rem' }}>No groups assigned to your account yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {groups.map((group, index) => (
                <Link
                  key={group._id}
                  href={`/instructorDashboard/groupDetails?id=${group._id}`}
                  aria-label={`View details for ${group.title}`}
                  className="group-card"
                 style={{
                    background: 'rgba(30, 41, 59, 0.7)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    padding: '20px',
                    animation: `fadeInUp 1.5s ease-in-out infinite alternate ${index * 0.15}s`,
                    cursor: 'pointer',
                    transition: 'transform 0.2s, border-color 0.2s',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                 }}
                >
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff', fontWeight: 700 }}>{group.title}</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#3b82f6', fontWeight: 500 }}>
                      {group.course?.title || "General Course"}
                    </p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'monospace' }}>ID: {group._id.slice(-8)}</span>
                    <span style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', fontWeight: 600 }}>
                      Details <FiArrowRight />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <style jsx global>{`
        .stat-card {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(10px);
          padding: 24px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .group-card {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(10px);
          padding: 24px;
          border-radius: 16px;
          border: 1px solid rgba(244, 248, 251, 0.85);
          text-decoration: none;
          display: flex;
          flex-direction: column;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .group-card:hover {
          transform: translateY(-5px);
          border-color: #3b82f6;
          background: rgba(30, 41, 59, 0.9);
          box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.2);
        }
        @keyframes fadeInUp {
          from {
            opacity: 0.6;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        @media (max-width: 768px) {
          main { padding-top: 100px; }
          h1 { font-size: 1.8rem; }
        }
      `}</style>
    </div>
  );
}