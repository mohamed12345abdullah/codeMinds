"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./groubDetails.module.css";


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

export default function GroupDetails() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id") || "";

  const [group, setGroup] = useState<GroupDetailsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchGroupDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = window.localStorage.getItem("token");
        const response = await fetch(`${baseUrl}/groups/${id}`, {
          method: "GET",
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
            alert("⚠️ You are not authorized to view this page");
            router.push("/login");
          } else {
            setError("❌ Failed to fetch group details");
          }
        }
      } catch (err) {
        console.error("Error fetching group details:", err);
        setError("❌ Something went wrong while fetching group details");
      } finally {
        setLoading(false);
      }
    };
    fetchGroupDetails();
  }, [id, router]);

  const dateRange = useMemo(() => {
    if (!group?.startDate && !group?.endDate) return "—";
    const fmt = (iso?: string) =>
      iso ? new Date(iso).toLocaleDateString() : "—";
    return `${fmt(group?.startDate)} → ${fmt(group?.endDate)}`;
  }, [group]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Group Details</h1>
        <p className={styles.subtitle}>View group information, students, and lectures.</p>
      </header>

      {!id && (
        <div className={styles.warn}>
          ⚠️ Missing group id. Please open this page with ?id=GROUP_ID
        </div>
      )}

      {error && <div className={styles.error}>{error}</div>}

      {loading && (
        <div className={styles.loadingGrid}>
          <div className={styles.skeletonCard} />
          <div className={styles.skeletonCard} />
          <div className={`${styles.skeletonCard} ${styles.tall}`} />
        </div>
      )}

      {!loading && group && (
        <div className={styles.pageGrid}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{group.title}</h2>
            <div className={styles.kv}>
              <div>
                <span className={styles.label}>Course:</span> {group.course?.title ?? "—"}
              </div>
              <div>
                <span className={styles.label}>Date:</span> {dateRange}
              </div>
              <div>
                <span className={styles.label}>Seats:</span>{" "}
                {group.availableSeats ?? "—"} / {group.totalSeats ?? "—"}
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Instructor</h3>
            {group.instructor ? (
              <div>
                <div>
                  <span className={styles.label}>Name:</span> {group.instructor.name}
                </div>
                <div>
                  <span className={styles.label}>Email:</span> {group.instructor.email}
                </div>
              </div>
            ) : (
              <div className={styles.muted}>—</div>
            )}
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              Students ({group.students?.length ?? 0})
            </h3>
            {group.students && group.students.length > 0 ? (
              <ul className={styles.list}>
                {group.students.map((s) => (
                  <li key={s.studentId} className={styles.listItem}>
                    {s.courseProgress ? (
                      <Link
                        href={`/instructorDashboard/courseProgress?id=${s.courseProgress}&studentName=${s.name}`}
                        className={styles.linkCard}
                      >
                        <div className={styles.itemTitle}>{s.name}</div>
                        <div className={styles.itemMeta}>User ID: {s.userId}</div>
                        <div className={styles.link}>View Course Progress</div>
                      </Link>
                    ) : (
                      <div className={styles.card}>
                        <div className={styles.itemTitle}>{s.name}</div>
                        <div className={styles.itemMeta}>User ID: {s.userId}</div>
                        <div className={styles.muted}>No course progress available</div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.muted}>No students yet.</div>
            )}
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              Lectures ({group.lectures?.length ?? 0})
            </h3>
            <Link href={`/instructorDashboard/manageLectures?groupId=${group._id}&groupTitle=${group.title}`} className={styles.link}>
              manage lectures
            </Link>
            {group.lectures && group.lectures.length > 0 ? (
              <ul className={styles.list}>
                {group.lectures.map((lec) => (
                  <li key={lec._id} className={styles.lectureItem}>
                    <div className={styles.lectureHeader}>
                      <div className={styles.lectureTitle}>{lec.title}</div>
                      <div className={styles.lectureDate}>
                        {new Date(lec.date).toLocaleDateString()}
                      </div>
                    </div>

                    {lec.description && <div className={styles.muted}>{lec.description}</div>}

                    {lec.objectives && lec.objectives.length > 0 && (
                      <div className={styles.objectives}>
                        <div className={styles.objectivesTitle}>Objectives:</div>
                        <ul className={styles.objectivesList}>
                          {lec.objectives.map((obj, idx) => (
                            <li key={idx}>{obj}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {lec.videos && lec.videos.length > 0 && (
                      <div>
                        <div className={styles.videosTitle}>Videos:</div>
                        <ul className={styles.videosList}>
                          {lec.videos.map((v, idx) => (
                            <li key={idx}>
                              <a href={v} target="_blank" rel="noreferrer" className={styles.link}>
                                {v}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.muted}>No lectures yet.</div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}