"use client";

import { useState, useEffect, useMemo, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FiCalendar, FiUsers, FiBookOpen, FiUser, FiArrowLeft, FiExternalLink, FiVideo } from 'react-icons/fi';
import styles from "./groubDetails.module.css";
import NavbarPage from "../../components/Navbar";

const baseUrl = "https://code-minds-website.vercel.app/api";
// const baseUrl = "http://localhost:4000/api";

interface Instructor {
  _id: string;
  name: string;
  email: string;
}

interface Student {
  studentId: string;
  userId: string;
  name: string;
  courseProgress?: string;
}

interface Lecture {
  _id: string;
  title: string;
  date: string; // ISO
  description?: string;
  videos?: string[];
  objectives?: string[];
}

interface CourseRef {
  _id: string;
  title: string;
}

interface GroupDetailsData {
  _id: string;
  title: string;
  startDate?: string;
  endDate?: string;
  availableSeats?: number;
  totalSeats?: number;
  instructor?: Instructor;
  students?: Student[];
  course?: CourseRef;
  lectures?: Lecture[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

function GroupDetailsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id") || "";

  const [group, setGroup] = useState<GroupDetailsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroupDetails = useCallback(async () => {
    if (!id) return;
    
    const controller = new AbortController();
    const signal = controller.signal;

    try {
      setLoading(true);
      setError(null);
      const token = window.localStorage.getItem("token");
      const response = await fetch(`${baseUrl}/groups/${id}`, {
        method: "GET",
        signal,
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
      });
      const result: ApiResponse<GroupDetailsData> = await response.json();
      if (response.ok && result?.success) {
        setGroup(result.data);
      } else {
        if (response.status === 401) {
          router.push("/login");
        } else {
          setError("❌ Failed to fetch group details");
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError("❌ Something went wrong while fetching group details");
      }
    } finally {
      setLoading(false);
    }
    return () => controller.abort();
  }, [id, router]);

  useEffect(() => {
    fetchGroupDetails();
  }, [fetchGroupDetails]);

  const dateRange = useMemo(() => {
    if (!group?.startDate && !group?.endDate) return "—";
    const fmt = (iso?: string) =>
      iso ? new Date(iso).toLocaleDateString() : "—";
    return `${fmt(group?.startDate)} → ${fmt(group?.endDate)}`;
  }, [group]);

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh' }}>
      <NavbarPage />
      <main className={styles.container} style={{ maxWidth: '1200px', margin: '60px auto 0', padding: '40px 20px' }}>
        <header className={styles.header} style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '12px', padding: 0 }}>
              <FiArrowLeft /> Back to Dashboard
            </button>
            <h1 className={styles.title} style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', margin: 0, textShadow: '0 0 20px rgba(59, 130, 246, 0.3)' }}>{group?.title || 'Group Details'}</h1>
            <p className={styles.subtitle} style={{ color: '#94a3b8', marginTop: '8px' }}>Instructor: <span style={{ color: '#60a5fa', fontWeight: 600 }}>{group?.instructor?.name || 'Loading...'}</span></p>
          </div>
          {group && (
            <Link href={`/instructorDashboard/manageLectures?groupId=${group._id}&groupTitle=${group.title}`}>
              <button className={styles.button} style={{ background: '#3b82f6', color: '#fff', padding: '12px 24px', borderRadius: '10px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiBookOpen /> Manage Lectures
              </button>
            </Link>
          )}
        </header>

      {!id && (
        <div className={styles.warn}>
          ⚠️ Missing group id. Please open this page with ?id=GROUP_ID
        </div>
      )}

      {error && <div className={styles.error}>{error}</div>}

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '20px' }}>
            <div className="code-loader">
                <div className="code-line"></div>
                <div className="code-line"></div>
                <div className="code-line"></div>
            </div>
            <p style={{ color: '#3b82f6', fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '2px' }}>INITIALIZING_DATA...</p>
        </div>
      )}

      {!loading && group && (
        <div className={styles.pageGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
          {/* Sidebar: Group Info */}
          <aside style={{ gridColumn: 'span 4' }}>
            <div className="glass-card" style={{ background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(12px)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', position: 'sticky', top: '20px' }}>
              <h3 style={{ color: '#fff', marginBottom: '20px', fontSize: '1.2rem' }}>Overview</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#cbd5e1' }}>
                  <FiBookOpen color="#3b82f6" /> <span>{group.course?.title ?? "—"}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#cbd5e1' }}>
                  <FiCalendar color="#3b82f6" /> <span>{dateRange}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#cbd5e1' }}>
                  <FiUsers color="#3b82f6" /> <span>{group.availableSeats} / {group.totalSeats} Seats</span>
                </div>
                <hr style={{ border: '0', borderTop: '1px solid #334155', margin: '8px 0' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', background: '#334155', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiUser color="#94a3b8" />
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{group.instructor?.name || 'No Instructor'}</div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{group.instructor?.email}</div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content: Students & Lectures */}
          <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <section>
              <h3 style={{ color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FiUsers /> Students ({group.students?.length ?? 0})
              </h3>
              <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                {group.students?.map((s) => (
                  <div key={s.studentId} className="hover-card" style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155', transition: 'all 0.3s ease' }}>
                    <div style={{ color: '#fff', fontWeight: 600, marginBottom: '4px' }}>{s.name}</div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '12px' }}>ID: {s.userId}</div>
                    {s.courseProgress ? (
                      <Link 
                        href={`/instructorDashboard/courseProgress?id=${s.courseProgress}&studentName=${s.name}`}
                        style={{ color: '#3b82f6', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        View Progress <FiExternalLink size={12} />
                      </Link>
                    ) : (
                      <span style={{ color: '#475569', fontSize: '0.85rem' }}>No progress data</span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 style={{ color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FiBookOpen /> Lectures ({group.lectures?.length ?? 0})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {group.lectures?.map((lec, index) => (
                  <div key={lec._id} className="lecture-card" style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', animation: `fadeInUp 0.5s ease forwards ${index * 0.1}s`, opacity: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <h4 style={{ color: '#fff', margin: 0 }}>{lec.title}</h4>
                      <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{new Date(lec.date).toLocaleDateString()}</span>
                    </div>
                    {lec.description && <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '16px' }}>{lec.description}</p>}
                    
                    <div className="lecture-details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      {lec.objectives && lec.objectives.length > 0 && (
                        <div>
                          <div style={{ color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Objectives</div>
                          <ul style={{ margin: 0, paddingLeft: '18px', color: '#94a3b8', fontSize: '0.85rem' }}>
                            {lec.objectives.map((obj, idx) => <li key={idx}>{obj}</li>)}
                          </ul>
                        </div>
                      )}
                      {lec.videos && lec.videos.length > 0 && (
                        <div>
                          <div style={{ color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Resources</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {lec.videos.map((v, idx) => (
                              <a key={idx} href={v} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                                <FiVideo size={14} /> Video Resource {idx + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
      </main>

      <style jsx global>{`
        @media (max-width: 1024px) {
          .pageGrid { grid-template-columns: 1fr !important; }
          aside { grid-column: span 12 !important; position: static !important; }
          div[style*="grid-column: span 8"] { grid-column: span 12 !important; }
          .lecture-details-grid { grid-template-columns: 1fr !important; }
        }

        .hover-card:hover {
          transform: translateY(-5px);
          border-color: #3b82f6 !important;
          box-shadow: 0 10px 20px -10px rgba(59, 130, 246, 0.5);
        }

        .glass-card {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .code-loader {
          width: 60px;
          height: 40px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .code-line {
          height: 4px;
          background: #3b82f6;
          border-radius: 2px;
          animation: code-anim 1.5s infinite ease-in-out;
        }

        .code-line:nth-child(2) { animation-delay: 0.2s; width: 80%; }
        .code-line:nth-child(3) { animation-delay: 0.4s; width: 60%; }

        @keyframes code-anim {
          0%, 100% { transform: scaleX(1); opacity: 0.3; }
          50% { transform: scaleX(1.2); opacity: 1; }
        }

        .lecture-card {
          transition: border-color 0.3s;
        }
        .lecture-card:hover {
          border-color: rgba(59, 130, 246, 0.5) !important;
        }
      `}</style>
    </div>
  );
}

export default function GroupDetails() {
  return (
    <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
      <GroupDetailsContent />
    </Suspense>
  );
}