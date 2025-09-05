"use client";

import AddLecturePage from "./addlecture";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";


const baseUrl = "https://code-minds-website.vercel.app/api";
// const baseUrl = "http://localhost:4000/api";

interface Lecture {
  _id: string;
  title: string;
  date: string; // ISO
  description?: string;
  videos?: string[];
  objectives?: string[];
}

interface GroupResponse {
  success: boolean;
  data: {
    _id: string;
    title: string;
    lectures?: Lecture[];
  };
  message?: string;
}

function ManageLecturesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const groupId = searchParams.get("groupId") || "";
  const groupTitle = searchParams.get("groupTitle") || "";

  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<{
    title: string;
    date: string; // datetime-local
    description: string;
    objectives: string[];
    videos: string[];
  }>({ title: "", date: "", description: "", objectives: [""], videos: [""] });
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    if (!groupId) return;
    try {
      setLoading(true);
      setError(null);
      const token = window.localStorage.getItem("token");
      const res = await fetch(`${baseUrl}/groups/${groupId}`, {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
      });
      const json: GroupResponse = await res.json();
      if (!res.ok || !json?.success) {
        if (res.status === 401) {
          alert("⚠️ You are not authorized to view this page");
          router.push("/login");
          return;
        }
        throw new Error(json?.message || "Failed to fetch group lectures");
      }
      setLectures(json.data?.lectures || []);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const openEdit = (lec: Lecture) => {
    setEditId(lec._id);
    setForm({
      title: lec.title || "",
      date: lec.date ? new Date(lec.date).toISOString().slice(0, 16) : "",
      description: lec.description || "",
      objectives: (lec.objectives && lec.objectives.length ? lec.objectives : [""]) as string[],
      videos: (lec.videos && lec.videos.length ? lec.videos : [""]) as string[],
    });
  };

  const cancelEdit = () => {
    setEditId(null);
  };

  const updateArrayItem = (key: "objectives" | "videos", index: number, value: string) => {
    setForm((prev) => {
      const next = [...prev[key]];
      next[index] = value;
      return { ...prev, [key]: next };
    });
  };

  const addArrayItem = (key: "objectives" | "videos") => {
    setForm((prev) => ({ ...prev, [key]: [...prev[key], ""] }));
  };

  const removeArrayItem = (key: "objectives" | "videos", index: number) => {
    setForm((prev) => {
      const next = [...prev[key]];
      next.splice(index, 1);
      return { ...prev, [key]: next };
    });
  };

  const saveEdit = async (lectureId: string) => {
    try {
      setSaving(true);
      const token = window.localStorage.getItem("token");
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        date: form.date ? new Date(form.date).toISOString() : null,
        objectives: form.objectives.filter((s) => s.trim().length > 0),
        videos: form.videos.filter((s) => s.trim().length > 0),
      };
      const res = await fetch(`${baseUrl}/lectures/${lectureId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message || "Failed to update lecture");
      }
      await refresh();
      setEditId(null);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 20 }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Manage Lectures</h1>
      <p style={{ color: "#94a3b8", marginBottom: 16 }}>
        Group: <strong>{groupTitle || groupId || "—"}</strong>
      </p>

      {!groupId && (
        <div style={{ padding: 10, border: "1px solid #725", borderRadius: 8, color: "#fca5a5", background: "#450a0a", marginBottom: 12 }}>
          ⚠️ Missing groupId. Open this page with ?groupId=GROUP_ID
        </div>
      )}
      {error && (
        <div style={{ padding: 10, border: "1px solid #92400e", borderRadius: 8, color: "#fed7aa", background: "#451a03", marginBottom: 12 }}>{error}</div>
      )}

      {/* Add Lecture */}
      {groupId && (
        <div style={{ border: "1px solid #334155", borderRadius: 12, padding: 16, background: "#1e293b", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#f1f5f9" }}>Add Lecture</h2>
          <AddLecturePage groupId={groupId} onSuccess={refresh} />
        </div>
      )}

      {/* List Lectures */}
      <div style={{ border: "1px solid #334155", borderRadius: 12, padding: 16, background: "#1e293b" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#f1f5f9" }}>
          Lectures ({lectures.length})
        </h2>
        {loading ? (
          <div style={{ color: "#94a3b8" }}>Loading...</div>
        ) : lectures.length === 0 ? (
          <div style={{ color: "#94a3b8" }}>No lectures yet.</div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
            {lectures.map((lec) => (
              <li key={lec._id} style={{ border: "1px solid #334155", borderRadius: 10, padding: 12, background: "#0b1220" }}>
                {editId === lec._id ? (
                  <div style={{ display: "grid", gap: 10 }}>
                    <label style={{ display: "grid", gap: 6, color: "#f1f5f9" }}>
                      <span>Title</span>
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                        className=""
                        style={{ padding: 10, borderRadius: 8, border: "1px solid #475569", background: "#1e293b", color: "#f1f5f9" }}
                      />
                    </label>
                    <label style={{ display: "grid", gap: 6, color: "#f1f5f9" }}>
                      <span>Date</span>
                      <input
                        type="datetime-local"
                        value={form.date}
                        onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                        style={{ padding: 10, borderRadius: 8, border: "1px solid #475569", background: "#1e293b", color: "#f1f5f9" }}
                      />
                    </label>
                    <label style={{ display: "grid", gap: 6, color: "#f1f5f9" }}>
                      <span>Description</span>
                      <textarea
                        value={form.description}
                        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                        rows={3}
                        style={{ padding: 10, borderRadius: 8, border: "1px solid #475569", background: "#1e293b", color: "#f1f5f9" }}
                      />
                    </label>
                    <div style={{ display: "grid", gap: 8 }}>
                      <div style={{ fontWeight: 700, color: "#f1f5f9" }}>Objectives</div>
                      {form.objectives.map((obj, idx) => (
                        <div key={`obj-${idx}`} style={{ display: "flex", gap: 8 }}>
                          <input
                            type="text"
                            value={obj}
                            onChange={(e) => updateArrayItem("objectives", idx, e.target.value)}
                            placeholder={`Objective #${idx + 1}`}
                            style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #475569", background: "#1e293b", color: "#f1f5f9" }}
                          />
                          <button type="button" onClick={() => removeArrayItem("objectives", idx)} style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #334155", background: "#0f172a", color: "#f1f5f9" }}>
                            Remove
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addArrayItem("objectives")} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #334155", background: "#0f172a", color: "#f1f5f9", width: "fit-content" }}>
                        + Add Objective
                      </button>
                    </div>
                    <div style={{ display: "grid", gap: 8 }}>
                      <div style={{ fontWeight: 700, color: "#f1f5f9" }}>Videos</div>
                      {form.videos.map((v, idx) => (
                        <div key={`vid-${idx}`} style={{ display: "flex", gap: 8 }}>
                          <input
                            type="url"
                            value={v}
                            onChange={(e) => updateArrayItem("videos", idx, e.target.value)}
                            placeholder="https://..."
                            style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #475569", background: "#1e293b", color: "#f1f5f9" }}
                          />
                          <button type="button" onClick={() => removeArrayItem("videos", idx)} style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #334155", background: "#0f172a", color: "#f1f5f9" }}>
                            Remove
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addArrayItem("videos")} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #334155", background: "#0f172a", color: "#f1f5f9", width: "fit-content" }}>
                        + Add Video URL
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => saveEdit(lec._id)} disabled={saving} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid transparent", background: saving ? "#475569" : "#3b82f6", color: "#fff" }}>
                        {saving ? "Saving..." : "Save"}
                      </button>
                      <button onClick={cancelEdit} disabled={saving} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #334155", background: "#0f172a", color: "#f1f5f9" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div style={{ fontWeight: 700, color: "#f1f5f9" }}>{lec.title}</div>
                      <div style={{ color: "#94a3b8", fontSize: 12 }}>{new Date(lec.date).toLocaleDateString()}</div>
                    </div>
                    {lec.description && <div style={{ color: "#94a3b8", marginBottom: 6 }}>{lec.description}</div>}
                    {lec.objectives && lec.objectives.length > 0 && (
                      <div style={{ marginBottom: 6 }}>
                        <div style={{ fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>Objectives:</div>
                        <ul style={{ margin: 0, paddingLeft: 18, color: "#f1f5f9" }}>
                          {lec.objectives.map((o, i) => (
                            <li key={i}>{o}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {lec.videos && lec.videos.length > 0 && (
                      <div>
                        <div style={{ fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>Videos:</div>
                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                          {lec.videos.map((v, i) => (
                            <li key={i}>
                              <a href={v} target="_blank" rel="noreferrer" style={{ color: "#3b82f6", textDecoration: "none" }}>
                                {v}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      <button onClick={() => openEdit(lec)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid transparent", background: "#3b82f6", color: "#fff" }}>Edit</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function ManageLecturesPage() {
  return (
    <Suspense fallback={<div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>}>
      <ManageLecturesContent />
    </Suspense>
  );
}
