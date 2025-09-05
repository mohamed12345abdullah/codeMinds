"use client";
import { useEffect, useMemo, useState, Suspense } from "react";
import type React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./courseProgress.module.css";


const baseUrl = "https://code-minds-website.vercel.app/api";
// const baseUrl = "http://localhost:4000/api";

interface UserInfo {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profileModel?: string;
  profileRef?: string;
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
  student: string; // student id
  lecture: string | LectureInfo; // lecture id or populated object
  engagement: number; // 0-100
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

function CourseProgressContent({ params }: { params?: { id?: string } }) {
  const router = useRouter();
  const search = useSearchParams();
  const idFromParams = params?.id;
  const idFromQuery = search.get("id") || undefined;
  const id = idFromParams || idFromQuery || "";
  const student_Name = search.get("studentName") || undefined;

  const [progress, setProgress] = useState<CourseProgressData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{
    attendance: string;
    engagement: number | string;
    notes: string;
    taskStatus: string;
    submittedAt: string; // datetime-local string
    score: number | string;
    taskNotes: string;
  }>({ attendance: "", engagement: 0, notes: "", taskStatus: "", submittedAt: "", score: 0, taskNotes: "" });

  useEffect(() => {
    if (!id) return;
    const fetchCourseProgress = async (pid: string) => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${baseUrl}/courseProgress/get/${pid}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${window.localStorage.getItem("token")}`,
          },
        });
        const json: ApiResponse<CourseProgressData> = await response.json();
        if (response.ok && json?.success) {
          setProgress(json.data);
        } else {
          if (response.status === 401) {
            alert("⚠️ You are not authorized to view this page");
            router.push("/login");
          } else {
            setError(json?.message || "❌ Failed to fetch course progress");
          }
        }
      } catch (e) {
        console.error(e);
        setError("❌ Something went wrong while fetching course progress");
      } finally {
        setLoading(false);
      }
    };
    fetchCourseProgress(id);
  }, [id, router]);

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

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitEdit = async (lp: LectureProgressItem) => {
    if (!progress?._id) return;
    try {
      setSaving(true);
      const token = window.localStorage.getItem("token");
      const endpoint = `${baseUrl}/courseProgress/update/${progress._id}`;
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
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message || "Failed to update lecture progress");
      }
      // Optimistically update UI
      setProgress((prev) => {
        if (!prev) return prev;
        const updated = prev.lectureProgress.map((item) =>
          item._id === lp._id
            ? {
                ...item,
                attendance: payload.attendance,
                engagement: payload.engagement,
                notes: payload.notes || item.notes,
                lectureScore: item.lectureScore, // unchanged here
                task: {
                  ...item.task,
                  taskStatus: payload.taskStatus,
                  submittedAt: payload.submittedAt,
                  score: payload.score,
                  notes: payload.taskNotes,
                },
                updatedAt: new Date().toISOString(),
              }
            : item
        );
        return { ...prev, lectureProgress: updated };
      });
      setEditingId(null);
    } catch (e: any) {
      console.error(e);
      alert(`❌ ${e.message || "Update failed"}`);
    } finally {
      setSaving(false);
    }
  };

  const studentName = progress?.student?.user?.name || "—";
  const updatedAt = useMemo(
    () => (progress?.updatedAt ? new Date(progress.updatedAt).toLocaleString() : "—"),
    [progress?.updatedAt]
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Course Progress</h1>
          <p className={styles.subtitle}>Track student engagement, attendance, and tasks per lecture.</p>
        </div>
      </div>

      {!id && <div className={styles.warn}>⚠️ Missing id. Open with ?id=COURSE_PROGRESS_ID</div>}

      {error && <div className={styles.error}>{error}</div>}

      {loading && <div className={styles.loading}>Loading...</div>}

      {!loading && progress && (
        <div className={styles.grid}>
          <section className={styles.card}>
            <div className={styles.cardTitle}>Student</div>
            <div className={styles.item}>
              <span className={styles.label}>Name:</span> {student_Name}
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardTitle}>Course</div>
            <div className={styles.item}>
              <span className={styles.label}>Title:</span> {progress.course?.title || "—"}
            </div>
            <div className={styles.item}>
              <span className={styles.label}>Course ID:</span> {progress.course?._id || "—"}
            </div>
            <div className={styles.item}>
              <span className={styles.label}>Last Updated:</span> {updatedAt}
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardTitle}>Lecture Progress ({progress.lectureProgress?.length || 0})</div>
            {progress.lectureProgress && progress.lectureProgress.length > 0 ? (
              <ul className={styles.list}>
                {progress.lectureProgress.map((lp) => (
                  <li key={lp._id} className={styles.listItem}>
                    <div className={styles.rowBetween}>
                      <div className={styles.lectureId}>
                        Lecture: {typeof lp.lecture === "string" ? lp.lecture : lp.lecture?.title || lp.lecture?._id}
                      </div>
                      <div className={styles.metaDate}>{new Date(lp.createdAt).toLocaleDateString()}</div>
                    </div>
                    {false && <div className={styles.kv}><span className={styles.label}>Progress ID:</span> {lp._id}</div>}
                    {false && <div className={styles.kv}><span className={styles.label}>Student ID:</span> {lp.student}</div>}
                    <div className={styles.kv}><span className={styles.label}>Attendance:</span> {lp.attendance}</div>
                    <div className={styles.kv}><span className={styles.label}>Engagement:</span> {lp.engagement}%</div>
                    <div className={styles.kv}><span className={styles.label}>Lecture Score:</span> {lp.lectureScore}</div>
                    <div className={styles.kv}><span className={styles.label}>Created At:</span> {new Date(lp.createdAt).toLocaleString()}</div>
                    <div className={styles.kv}><span className={styles.label}>Updated At:</span> {new Date(lp.updatedAt).toLocaleString()}</div>
                    <div className={styles.kv}><span className={styles.label}>Task Status:</span> {lp.task?.taskStatus || "—"}</div>
                    <div className={styles.kv}><span className={styles.label}>Task Score:</span> {lp.task?.score ?? "—"}</div>
                    {lp.task?.submittedAt && (
                      <div className={styles.kv}><span className={styles.label}>Submitted At:</span> {new Date(lp.task.submittedAt).toLocaleString()}</div>
                    )}
                    {lp.task?.file && (
                      <div className={styles.kv}><span className={styles.label}>File:</span>{" "}
                        <a href={lp.task.file} target="_blank" rel="noreferrer" className={styles.link}>{lp.task.file}</a>
                      </div>
                    )}
                    {lp.task?.notes && (
                      <div className={styles.kv}><span className={styles.label}>Task Notes:</span> {lp.task.notes}</div>
                    )}
                    {lp.notes && (
                      <div className={styles.notes}><span className={styles.label}>Notes:</span> {lp.notes}</div>
                    )}
                    <div className={styles.actions}>
                      {editingId === lp._id ? (
                        <>
                          <div className={styles.inlineForm}>
                            <div className={styles.fieldsGrid}>
                              <label className={styles.fieldLabel}>
                                Attendance
                                <select name="attendance" value={form.attendance} onChange={handleChange} className={styles.select}>
                                  <option value="">—</option>
                                  <option value="present">present</option>
                                  <option value="absent">absent</option>
                                  <option value="late">late</option>
                                </select>
                              </label>
                              <label className={styles.fieldLabel}>
                                Engagement (%)
                                <input type="number" name="engagement" value={form.engagement} onChange={handleChange} className={styles.input} min={0} max={100} />
                              </label>
                              <label className={styles.fieldLabel}>
                                Task Status
                                <select name="taskStatus" value={form.taskStatus} onChange={handleChange} className={styles.select}>
                                  <option value="">—</option>
                                  <option value="pending">pending</option>
                                  <option value="submitted">submitted</option>
                                  <option value="graded">graded</option>
                                </select>
                              </label>
                              <label className={styles.fieldLabel}>
                                Score
                                <input type="number" name="score" value={form.score} onChange={handleChange} className={styles.input} min={0} />
                              </label>
                              <label className={styles.fieldLabel}>
                                Submitted At
                                <input type="datetime-local" name="submittedAt" value={form.submittedAt} onChange={handleChange} className={styles.input} />
                              </label>
                              <label className={styles.fieldLabel}>
                                Notes
                                <textarea name="notes" value={form.notes} onChange={handleChange} className={styles.input} rows={2} />
                              </label>
                              <label className={styles.fieldLabel}>
                                Task Notes
                                <textarea name="taskNotes" value={form.taskNotes} onChange={handleChange} className={styles.input} rows={2} />
                              </label>
                            </div>
                          </div>
                          <div className={styles.actionButtons}>
                            <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={cancelEdit} disabled={saving}>Cancel</button>
                            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => submitEdit(lp)} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                          </div>
                        </>
                      ) : (
                        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => openEdit(lp)}>Edit</button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.muted}>No lecture progress yet.</div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default function CourseProgress({ params }: { params?: { id?: string } }) {
  return (
    <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
      <CourseProgressContent params={params} />
    </Suspense>
  );
}