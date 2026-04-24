"use client";
import { useEffect, useMemo, useState, Suspense, useCallback } from "react";
import type React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  FiArrowLeft, FiUser, FiBook, FiCalendar, 
  FiCheckCircle, FiXCircle, FiClock, FiEdit2, 
  FiSave, FiX, FiExternalLink, FiFileText, FiActivity 
} from 'react-icons/fi';
import NavbarPage from "../../components/Navbar";

const baseUrl = "https://code-minds-website.vercel.app/api";
// const baseUrl = "http://localhost:4000/api";


interface UserInfo {
  _id: string;
  name: string;
  email: string;
}

interface StudentRef {
  _id: string;
  user: UserInfo;
}

interface CourseRef {
  _id: string;
  title: string;
}

interface TaskInfo {
  taskStatus: "pending" | "submitted" | "graded" | string;
  submittedAt: string | null;
  file: string;
  score: number;
  notes: string;
}

interface LectureInfo {
  _id: string;
  title?: string;
}

interface LectureProgressItem {
  _id: string;
  task: TaskInfo;
  student: string;
  lecture: string | LectureInfo;
  engagement: number;
  attendance: "absent" | "present" | "late" | string;
  lectureScore: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface CourseProgressData {
  _id: string;
  student: StudentRef;
  course: CourseRef;
  lectureProgress: LectureProgressItem[];
  updatedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

function CourseProgressContent() {
  const router = useRouter();
  const search = useSearchParams();
  const id = search.get("id") || "";
  const student_Name = search.get("studentName") || "";

  const [progress, setProgress] = useState<CourseProgressData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    attendance: "",
    engagement: 0 as number | string,
    notes: "",
    taskStatus: "",
    submittedAt: "",
    score: 0 as number | string,
    taskNotes: "",
  });

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/courseProgress/get/${id}`, {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${window.localStorage.getItem("token")}`,
        },
      });
      const json: ApiResponse<CourseProgressData> = await response.json();
      if (response.ok && json?.success) {
        setProgress(json.data);
      } else {
        if (response.status === 401) router.push("/login");
        else setError(json?.message || "Failed to fetch data");
      }
    } catch (e) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openEdit = (lp: LectureProgressItem) => {
    setEditingId(lp._id);
    setForm({
      attendance: lp.attendance || "",
      engagement: lp.engagement ?? 0,
      notes: lp.notes || "",
      taskStatus: lp.task?.taskStatus || "",
      submittedAt: lp.task?.submittedAt ? new Date(lp.task.submittedAt).toISOString().slice(0, 16) : "",
      score: lp.task?.score ?? 0,
      taskNotes: lp.task?.notes || "",
    });
  };

  const submitEdit = async (lp: LectureProgressItem) => {
    if (!progress?._id) return;
    try {
      setSaving(true);
      const payload = {
        lectureId: typeof lp.lecture === "string" ? lp.lecture : lp.lecture?._id,
        attendance: form.attendance,
        notes: form.notes,
        engagement: Number(form.engagement),
        taskStatus: form.taskStatus,
        submittedAt: form.submittedAt ? new Date(form.submittedAt).toISOString() : null,
        score: Number(form.score),
        taskNotes: form.taskNotes,
      };
      const res = await fetch(`${baseUrl}/courseProgress/update/${progress._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${window.localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Update failed");
      await fetchData();
      setEditingId(null);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return '#10b981';
      case 'absent': return '#ef4444';
      case 'late': return '#f59e0b';
      default: return '#64748b';
    }
  };

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', color: '#f1f5f9' }}>
      <NavbarPage />
      
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '100px 20px 40px' }}>
        <header style={{ marginBottom: '32px' }}>
          <button 
            onClick={() => router.back()} 
            style={{ background: 'none', border: 'none', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '16px', fontWeight: 500 }}
          >
            <FiArrowLeft /> Back
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Course Progress</h1>
          <p style={{ color: '#94a3b8', marginTop: '4px' }}>Detailed performance tracking for {student_Name || 'Student'}</p>
        </header>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px' }}>
            <div className="spinner"></div>
            <p style={{ color: '#3b82f6', marginTop: '16px' }}>Loading progress data...</p>
          </div>
        ) : progress ? (
          <div style={{ display: 'grid', gap: '32px' }}>
            {/* Overview Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div className="glass-card">
                <h3 className="card-label"><FiUser /> Student Info</h3>
                <p style={{ fontSize: '1.2rem', fontWeight: 600, margin: '8px 0 4px' }}>{student_Name}</p>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>ID: {progress.student?._id}</p>
              </div>
              <div className="glass-card">
                <h3 className="card-label"><FiBook /> Course Details</h3>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: '8px 0 4px' }}>{progress.course?.title}</p>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Last Sync: {new Date(progress.updatedAt || '').toLocaleString()}</p>
              </div>
            </div>

            {/* Timeline */}
            <section>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FiActivity /> Lecture Timeline
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {progress.lectureProgress.map((lp) => (
                  <div key={lp._id} className="lecture-row">
                    {editingId === lp._id ? (
                      <div style={{ padding: '24px', display: 'grid', gap: '20px' }}>
                        <div className="edit-grid">
                          <div className="input-group">
                            <label>Attendance</label>
                            <select value={form.attendance} onChange={e => setForm({...form, attendance: e.target.value})}>
                              <option value="present">Present</option>
                              <option value="absent">Absent</option>
                              <option value="late">Late</option>
                            </select>
                          </div>
                          <div className="input-group">
                            <label>Engagement (%)</label>
                            <input type="number" value={form.engagement} onChange={e => setForm({...form, engagement: e.target.value})} />
                          </div>
                          <div className="input-group">
                            <label>Task Status</label>
                            <select value={form.taskStatus} onChange={e => setForm({...form, taskStatus: e.target.value})}>
                              <option value="pending">Pending</option>
                              <option value="submitted">Submitted</option>
                              <option value="graded">Graded</option>
                            </select>
                          </div>
                          <div className="input-group">
                            <label>Task Score</label>
                            <input type="number" value={form.score} onChange={e => setForm({...form, score: e.target.value})} />
                          </div>
                        </div>
                        <div className="input-group">
                          <label>General Notes</label>
                          <textarea rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                          <button className="btn-secondary" onClick={() => setEditingId(null)}><FiX /> Cancel</button>
                          <button className="btn-primary" onClick={() => submitEdit(lp)} disabled={saving}>
                            {saving ? 'Saving...' : <><FiSave /> Save Changes</>}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <div>
                            <h4 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>
                              {typeof lp.lecture === "string" ? "Lecture" : lp.lecture?.title}
                            </h4>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                              <FiCalendar /> {new Date(lp.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <span className="badge" style={{ background: `${getStatusColor(lp.attendance)}22`, color: getStatusColor(lp.attendance), border: `1px solid ${getStatusColor(lp.attendance)}44` }}>
                              {lp.attendance.toUpperCase()}
                            </span>
                            <button className="icon-btn" onClick={() => openEdit(lp)} aria-label="Edit progress"><FiEdit2 /></button>
                          </div>
                        </div>

                        <div className="stats-grid">
                          <div className="stat-item">
                            <span className="stat-label">Engagement</span>
                            <div className="progress-bar-bg">
                              <div className="progress-bar-fill" style={{ width: `${lp.engagement}%` }}></div>
                            </div>
                            <span className="stat-value">{lp.engagement}%</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Task Status</span>
                            <span className="stat-value" style={{ color: lp.task?.taskStatus === 'graded' ? '#10b981' : '#f59e0b' }}>
                              {lp.task?.taskStatus || 'N/A'}
                            </span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Task Score</span>
                            <span className="stat-value">{lp.task?.score ?? 0}/100</span>
                          </div>
                        </div>

                        {(lp.notes || lp.task?.file) && (
                          <div style={{ marginTop: '16px', padding: '12px', background: '#0f172a', borderRadius: '8px', border: '1px solid #334155' }}>
                            {lp.notes && <p style={{ margin: '0 0 8px', fontSize: '0.9rem', color: '#94a3b8' }}><FiFileText size={14} /> {lp.notes}</p>}
                            {lp.task?.file && (
                              <a href={lp.task.file} target="_blank" rel="noreferrer" className="file-link">
                                <FiExternalLink /> View Submitted File
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="error-box">{error || "No data found"}</div>
        )}
      </main>

      <style jsx global>{`
        .glass-card {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(12px);
          padding: 24px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .card-label { color: #3b82f6; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; margin: 0; display: flex; alignItems: center; gap: 8px; }
        
        .lecture-row {
          background: #1e293b;
          border-radius: 12px;
          border: 1px solid #334155;
          transition: transform 0.2s;
        }
        .lecture-row:hover { border-color: #3b82f655; }

        .badge { padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; }
        
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; }
        .stat-item { display: flex; flex-direction: column; gap: 4px; }
        .stat-label { font-size: 0.75rem; color: #64748b; font-weight: 600; }
        .stat-value { font-size: 0.95rem; color: #f1f5f9; font-weight: 600; }

        .progress-bar-bg { height: 6px; background: #0f172a; border-radius: 3px; overflow: hidden; margin: 4px 0; }
        .progress-bar-fill { height: 100%; background: #3b82f6; border-radius: 3px; }

        .edit-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .input-group { display: flex; flex-direction: column; gap: 6px; }
        .input-group label { font-size: 0.8rem; color: #94a3b8; font-weight: 600; }
        .input-group input, .input-group select, .input-group textarea {
          padding: 10px; background: #0f172a; border: 1px solid #334155; border-radius: 8px; color: #fff;
        }

        .btn-primary { background: #3b82f6; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; }
        .btn-secondary { background: transparent; color: #94a3b8; border: 1px solid #334155; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
        .icon-btn { background: #0f172a; border: 1px solid #334155; color: #3b82f6; padding: 8px; border-radius: 8px; cursor: pointer; display: flex; }
        
        .file-link { color: #3b82f6; text-decoration: none; font-size: 0.85rem; display: flex; align-items: center; gap: 6px; }
        .file-link:hover { text-decoration: underline; }

        .spinner { width: 30px; height: 30px; border: 3px solid #1e293b; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .edit-grid { grid-template-columns: 1fr; }
          header h1 { font-size: 1.5rem; }
        }
      `}</style>
    </div>
  );
}

export default function CourseProgress() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center', color: '#3b82f6' }}>Loading Workspace...</div>}>
      <CourseProgressContent />
    </Suspense>
  );
}
