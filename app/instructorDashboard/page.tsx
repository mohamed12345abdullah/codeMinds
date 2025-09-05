"use client";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";


import Link from "next/link";
import styles from "./dashboard.module.css";


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

  const fetchGroups = async (id: string) => {
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
  };

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
  }, []);

  const stats = useMemo(() => {
    const totalGroups = groups.length;
    const uniqueCourses = new Set(groups.map((g) => g.course?._id)).size;
    return { totalGroups, uniqueCourses };
  }, [groups]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <span className={styles.titleEmoji}>📚</span>
            Instructor Groups
          </h1>
          <p className={styles.subtitle}>
            Manage your assigned groups and courses.
          </p>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Stats */}
      {!loading && !error && (
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Total Groups</div>
            <div className={styles.statValue}>{stats.totalGroups}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Courses Covered</div>
            <div className={styles.statValue}>{stats.uniqueCourses}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Status</div>
            <div className={styles.statValue}>
              {stats.totalGroups > 0 ? "Active" : "—"}
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className={styles.loadingGrid}>
          <div className={styles.skeletonCard}></div>
          <div className={styles.skeletonCard}></div>
          <div className={styles.skeletonCard}></div>
          <div className={styles.skeletonCard}></div>
          <div className={styles.skeletonCard}></div>
          <div className={styles.skeletonCard}></div>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && groups.length === 0 && (
        <div className={styles.empty}>ℹ️ No groups assigned to you yet.</div>
      )}

      {/* Groups */}
      {!loading && !error && groups.length > 0 && (
        <ul className={styles.grid}>
          {groups.map((group) => (
            <li key={group._id}>
              <Link
                href={`/instructorDashboard/groupDetails?id=${group._id}`}
                className={styles.card}
              >
                <div className={styles.cardTitle}>{group.title}</div>
                <div className={styles.cardMeta}>
                  Course: {group.course?.title || "—"}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}